import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { requireMemberSession } from "@/lib/committee/auth";
import { apiError, requireText } from "@/lib/committee/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.consent !== true) throw new Error("전자서명 동의가 필요합니다.");
    const signerName = requireText(body.signerName, "서명자 이름", 80);
    const { admin, member, committee } = await requireMemberSession(request);
    if (signerName !== member.name) throw new Error("등록된 위원 이름과 서명자 이름이 일치해야 합니다.");
    const { data: agendas } = await admin.from("committee_agendas").select("id, agenda_no, title").eq("committee_id", committee.id).eq("is_required", true).eq("status", "open");
    const { data: reviews } = await admin.from("committee_reviews").select("agenda_id, decision, submitted_at").eq("member_id", member.id).eq("status", "submitted");
    if ((agendas?.length ?? 0) === 0 || reviews?.length !== agendas?.length) throw new Error("모든 필수 의안의 심의를 최종 제출한 뒤 서명해 주세요.");
    const digest = (value: string | null) => value ? createHash("sha256").update(value).digest("hex") : null;
    const { data, error } = await admin.from("committee_signatures").insert({
      committee_id: committee.id,
      member_id: member.id,
      signer_name: signerName,
      consent_version: "committee-sign-v1",
      review_snapshot: { agendas, reviews },
      ip_hash: digest(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null),
      user_agent_hash: digest(request.headers.get("user-agent")),
    }).select("id, signed_at").single();
    if (error) throw new Error(error.code === "23505" ? "이미 전자서명을 제출했습니다." : error.message);
    await admin.from("committee_audit_logs").insert({ committee_id: committee.id, actor_type: "member", actor_id: member.id, action: "signature.submit", entity_type: "committee_signature", entity_id: data.id });
    return Response.json({ data });
  } catch (error) {
    return apiError(error, 400);
  }
}
