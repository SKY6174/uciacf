import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/committee/auth";
import { apiError, normalizeCode, requireText } from "@/lib/committee/validation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

type MemberAccessInput = { compositionMemberId?: string; securityCode?: string };
type AgendaInput = { title?: string; description?: string; decisionType?: string };

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdminUser(request);
    const admin = createSupabaseAdmin();
    const { data: committees, error } = await admin.from("committees").select("id, code, name, committee_type, meeting_at, status, created_at").eq("created_by", user.id).order("created_at", { ascending: false });
    if (error) throw error;
    const ids = (committees ?? []).map((item) => item.id);
    if (!ids.length) return Response.json({ data: [] });
    const [{ data: members }, { data: agendas }, { data: reviews }, { data: signatures }] = await Promise.all([
      admin.from("committee_members").select("id, committee_id, status").in("committee_id", ids),
      admin.from("committee_agendas").select("id, committee_id, status").in("committee_id", ids),
      admin.from("committee_reviews").select("id, agenda_id, member_id, status").eq("status", "submitted"),
      admin.from("committee_signatures").select("id, committee_id, member_id").in("committee_id", ids),
    ]);
    return Response.json({ data: committees?.map((committee) => {
      const committeeMembers = members?.filter((item) => item.committee_id === committee.id) ?? [];
      const committeeAgendas = agendas?.filter((item) => item.committee_id === committee.id) ?? [];
      const agendaIds = new Set(committeeAgendas.map((item) => item.id));
      const submitted = reviews?.filter((item) => agendaIds.has(item.agenda_id)).length ?? 0;
      const expected = committeeMembers.length * committeeAgendas.filter((item) => item.status === "open").length;
      return { ...committee, memberCount: committeeMembers.length, agendaCount: committeeAgendas.length, reviewRate: expected ? Math.round(submitted / expected * 100) : 0, signatureCount: signatures?.filter((item) => item.committee_id === committee.id).length ?? 0 };
    }) ?? [] });
  } catch (error) {
    return apiError(error, 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser(request);
    const body = await request.json();
    const memberAccess = Array.isArray(body.memberAccess) ? body.memberAccess as MemberAccessInput[] : [];
    const agendas = Array.isArray(body.agendas) ? body.agendas as AgendaInput[] : [];
    if (!body.compositionId) throw new Error("위원회 구성을 선택해 주세요.");
    if (!agendas.length) throw new Error("의안을 한 건 이상 입력해 주세요.");
    const admin = createSupabaseAdmin();
    const { data: composition } = await admin
      .from("committee_compositions")
      .select("id, name, committee_type, term_start, term_end, status")
      .eq("id", body.compositionId)
      .eq("created_by", user.id)
      .eq("status", "active")
      .single();
    if (!composition) throw new Error("사용할 수 있는 위원회 구성이 아닙니다.");
    const meetingDate = String(body.meetingAt ?? new Date().toISOString()).slice(0, 10);
    if (meetingDate < composition.term_start || meetingDate > composition.term_end) {
      throw new Error("개최일이 선택한 위원회 구성의 임기 범위를 벗어났습니다.");
    }
    const { data: compositionMembers, error: compositionMemberError } = await admin
      .from("committee_composition_members")
      .select("id, member_code, name, email, role, valid_from, valid_to")
      .eq("composition_id", composition.id)
      .lte("valid_from", meetingDate)
      .or(`valid_to.is.null,valid_to.gte.${meetingDate}`)
      .order("created_at");
    if (compositionMemberError) throw compositionMemberError;
    if (!compositionMembers?.length || !compositionMembers.some((member) => member.role === "chair")) {
      throw new Error("개최일 기준 유효한 위원장과 위원 명단이 필요합니다.");
    }
    const accessByMember = new Map(memberAccess.map((item) => [String(item.compositionMemberId), item.securityCode]));
    if (compositionMembers.some((member) => !accessByMember.has(member.id))) {
      throw new Error("불러온 모든 위원의 보안코드를 설정해 주세요.");
    }
    const { data: committee, error } = await admin.from("committees").insert({
      composition_id: composition.id,
      code: normalizeCode(body.code, "위원회 코드"),
      name: requireText(body.name, "위원회명", 160),
      committee_type: composition.committee_type,
      description: String(body.description ?? "").trim() || null,
      meeting_at: body.meetingAt || null,
      status: body.openImmediately ? "open" : "draft",
      security_notice: "위원별 보안코드는 타인과 공유하지 마세요. 5회 실패 시 15분간 잠깁니다.",
      created_by: user.id,
    }).select("id, code, name, status").single();
    if (error || !committee) throw error ?? new Error("위원회를 생성하지 못했습니다.");

    for (const input of compositionMembers) {
      const { data: committeeMemberId, error: memberError } = await admin.rpc("set_committee_member_access_code", {
        p_committee_id: committee.id,
        p_member_code: input.member_code,
        p_name: input.name,
        p_email: String(input.email ?? ""),
        p_role: input.role,
        p_access_code: requireText(accessByMember.get(input.id), `${input.name} 보안코드`, 128),
      });
      if (memberError) throw memberError;
      const { error: sourceError } = await admin
        .from("committee_members")
        .update({ composition_member_id: input.id })
        .eq("id", committeeMemberId);
      if (sourceError) throw sourceError;
    }
    const agendaRows = agendas.map((agenda, index) => ({
      committee_id: committee.id,
      agenda_no: index + 1,
      title: requireText(agenda.title, `제${index + 1}호 의안 제목`, 200),
      description: String(agenda.description ?? "").trim() || null,
      decision_type: ["vote", "review", "report"].includes(String(agenda.decisionType)) ? agenda.decisionType : "vote",
      status: body.openImmediately ? "open" : "draft",
    }));
    const { data: createdAgendas, error: agendaError } = await admin.from("committee_agendas").insert(agendaRows).select("id, agenda_no, title");
    if (agendaError) throw agendaError;
    await admin.from("committee_audit_logs").insert({ committee_id: committee.id, composition_id: composition.id, actor_type: "admin", actor_id: user.id, action: "committee.create", entity_type: "committee", entity_id: committee.id, details: { memberCount: compositionMembers.length, agendaCount: agendas.length, compositionId: composition.id, meetingDate } });
    return Response.json({ data: { ...committee, agendas: createdAgendas, memberCount: compositionMembers.length } }, { status: 201 });
  } catch (error) {
    return apiError(error, 400);
  }
}
