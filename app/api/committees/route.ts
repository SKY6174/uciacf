import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/committee/auth";
import { apiError, normalizeCode, requireText } from "@/lib/committee/validation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

type MemberInput = { memberCode?: string; name?: string; email?: string; role?: string; securityCode?: string };
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
    const members = Array.isArray(body.members) ? body.members as MemberInput[] : [];
    const agendas = Array.isArray(body.agendas) ? body.agendas as AgendaInput[] : [];
    if (!members.length || !agendas.length) throw new Error("위원과 의안을 각각 한 명/한 건 이상 입력해 주세요.");
    const allowedRoles = new Set(["chair", "member", "secretary"]);
    if (!members.some((member) => member.role === "chair")) throw new Error("위원장을 한 명 이상 지정해 주세요.");
    const admin = createSupabaseAdmin();
    const { data: committee, error } = await admin.from("committees").insert({
      code: normalizeCode(body.code, "위원회 코드"),
      name: requireText(body.name, "위원회명", 160),
      committee_type: requireText(body.committeeType, "위원회 종류", 40),
      description: String(body.description ?? "").trim() || null,
      meeting_at: body.meetingAt || null,
      status: body.openImmediately ? "open" : "draft",
      security_notice: "위원별 보안코드는 타인과 공유하지 마세요. 5회 실패 시 15분간 잠깁니다.",
      created_by: user.id,
    }).select("id, code, name, status").single();
    if (error || !committee) throw error ?? new Error("위원회를 생성하지 못했습니다.");

    for (const input of members) {
      if (!allowedRoles.has(String(input.role))) throw new Error("위원 역할이 올바르지 않습니다.");
      const { error: memberError } = await admin.rpc("set_committee_member_access_code", {
        p_committee_id: committee.id,
        p_member_code: normalizeCode(input.memberCode, "위원 코드"),
        p_name: requireText(input.name, "위원 이름", 80),
        p_email: String(input.email ?? ""),
        p_role: input.role,
        p_access_code: requireText(input.securityCode, "보안코드", 128),
      });
      if (memberError) throw memberError;
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
    await admin.from("committee_audit_logs").insert({ committee_id: committee.id, actor_type: "admin", actor_id: user.id, action: "committee.create", entity_type: "committee", entity_id: committee.id, details: { memberCount: members.length, agendaCount: agendas.length } });
    return Response.json({ data: { ...committee, agendas: createdAgendas } }, { status: 201 });
  } catch (error) {
    return apiError(error, 400);
  }
}

