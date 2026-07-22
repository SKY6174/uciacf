import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/committee/auth";
import { apiError, normalizeCode, requireText } from "@/lib/committee/validation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(request);
    const { id } = await context.params;
    const body = await request.json();
    if (body.action !== "replace") throw new Error("지원하지 않는 명단 변경 방식입니다.");
    const admin = createSupabaseAdmin();
    const { data: composition } = await admin
      .from("committee_compositions")
      .select("id")
      .eq("id", id)
      .eq("created_by", user.id)
      .single();
    if (!composition) throw new Error("위원회 구성 관리 권한이 없습니다.");
    const effectiveFrom = String(body.effectiveFrom ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) throw new Error("변경 적용일을 확인해 주세요.");
    const role = String(body.role ?? "");
    if (!["chair", "member", "secretary"].includes(role)) throw new Error("위원 역할이 올바르지 않습니다.");
    const { data: memberId, error } = await admin.rpc("replace_committee_composition_member", {
      p_composition_id: id,
      p_previous_member_id: requireText(body.previousMemberId, "변경 대상", 80),
      p_member_code: normalizeCode(body.memberCode, "위원 코드"),
      p_name: requireText(body.name, "후임 위원 이름", 80),
      p_email: String(body.email ?? ""),
      p_role: role,
      p_effective_from: effectiveFrom,
      p_appointment_reference: String(body.appointmentReference ?? ""),
      p_change_reason: requireText(body.changeReason, "변경 사유", 500),
      p_actor_id: user.id,
    });
    if (error) throw error;
    return Response.json({ data: { id: memberId } }, { status: 201 });
  } catch (error) {
    return apiError(error, 400);
  }
}
