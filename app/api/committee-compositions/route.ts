import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/committee/auth";
import { apiError, normalizeCode, requireText } from "@/lib/committee/validation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

type CompositionMemberInput = {
  memberCode?: string;
  name?: string;
  email?: string;
  role?: string;
  appointmentReference?: string;
};

function requireDate(value: unknown, field: string) {
  const date = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error(`${field}을(를) 확인해 주세요.`);
  }
  return date;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdminUser(request);
    const admin = createSupabaseAdmin();
    const { data: compositions, error } = await admin
      .from("committee_compositions")
      .select("id, code, name, committee_type, term_start, term_end, status, created_at")
      .eq("created_by", user.id)
      .order("term_end", { ascending: false });
    if (error) throw error;
    const ids = (compositions ?? []).map((item) => item.id);
    if (!ids.length) return Response.json({ data: [] });
    const { data: members, error: memberError } = await admin
      .from("committee_composition_members")
      .select("id, composition_id, member_code, name, email, role, valid_from, valid_to, status, predecessor_id, appointment_reference, change_reason")
      .in("composition_id", ids)
      .order("valid_from", { ascending: true });
    if (memberError) throw memberError;
    return Response.json({
      data: (compositions ?? []).map((composition) => ({
        ...composition,
        members: (members ?? []).filter((member) => member.composition_id === composition.id),
      })),
    });
  } catch (error) {
    return apiError(error, 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser(request);
    const body = await request.json();
    const members = Array.isArray(body.members) ? body.members as CompositionMemberInput[] : [];
    if (!members.length) throw new Error("위원을 한 명 이상 입력해 주세요.");
    if (!members.some((member) => member.role === "chair")) throw new Error("위원장을 한 명 이상 지정해 주세요.");
    const allowedRoles = new Set(["chair", "member", "secretary"]);
    const termStart = requireDate(body.termStart, "임기 시작일");
    const termEnd = requireDate(body.termEnd, "임기 종료일");
    if (termEnd < termStart) throw new Error("임기 종료일은 시작일 이후여야 합니다.");
    const admin = createSupabaseAdmin();
    const { data: composition, error } = await admin.from("committee_compositions").insert({
      code: normalizeCode(body.code, "구성 코드"),
      name: requireText(body.name, "위원회 구성명", 160),
      committee_type: requireText(body.committeeType, "위원회 종류", 40),
      term_start: termStart,
      term_end: termEnd,
      status: "active",
      created_by: user.id,
    }).select("id, code, name, committee_type, term_start, term_end, status").single();
    if (error || !composition) throw error ?? new Error("위원회 구성을 생성하지 못했습니다.");

    const memberRows = members.map((member) => {
      if (!allowedRoles.has(String(member.role))) throw new Error("위원 역할이 올바르지 않습니다.");
      return {
        composition_id: composition.id,
        member_code: normalizeCode(member.memberCode, "위원 코드"),
        name: requireText(member.name, "위원 이름", 80),
        email: String(member.email ?? "").trim() || null,
        role: member.role,
        valid_from: termStart,
        appointment_reference: String(member.appointmentReference ?? "").trim() || null,
      };
    });
    const { data: createdMembers, error: memberError } = await admin
      .from("committee_composition_members")
      .insert(memberRows)
      .select("id, composition_id, member_code, name, email, role, valid_from, valid_to, status, appointment_reference");
    if (memberError) throw memberError;
    await admin.from("committee_audit_logs").insert({
      composition_id: composition.id,
      actor_type: "admin",
      actor_id: user.id,
      action: "composition.create",
      entity_type: "committee_composition",
      entity_id: composition.id,
      details: { memberCount: createdMembers?.length ?? 0, termStart, termEnd },
    });
    return Response.json({ data: { ...composition, members: createdMembers ?? [] } }, { status: 201 });
  } catch (error) {
    return apiError(error, 400);
  }
}
