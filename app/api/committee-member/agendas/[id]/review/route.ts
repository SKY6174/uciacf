import { NextRequest } from "next/server";
import { requireMemberSession } from "@/lib/committee/auth";
import { apiError } from "@/lib/committee/validation";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { admin, member, committee } = await requireMemberSession(request);
    if (!["approve", "reject", "abstain"].includes(body.decision)) throw new Error("심의 결정을 선택해 주세요.");
    const comment = String(body.comment ?? "").trim();
    if (comment.length > 4000) throw new Error("심의 의견은 4,000자 이하여야 합니다.");
    const { data: agenda } = await admin.from("committee_agendas").select("id, committee_id, status").eq("id", id).eq("committee_id", committee.id).eq("status", "open").single();
    if (!agenda) throw new Error("현재 심의할 수 없는 의안입니다.");
    const { data: existing } = await admin.from("committee_reviews").select("id, status").eq("agenda_id", id).eq("member_id", member.id).maybeSingle();
    if (existing?.status === "submitted") throw new Error("이미 최종 제출된 심의입니다.");
    const status = body.submit === true ? "submitted" : "draft";
    const { data, error } = await admin.from("committee_reviews").upsert({
      agenda_id: id,
      member_id: member.id,
      decision: body.decision,
      comment,
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "agenda_id,member_id" }).select("id, status, submitted_at").single();
    if (error) throw error;
    await admin.from("committee_audit_logs").insert({ committee_id: committee.id, actor_type: "member", actor_id: member.id, action: status === "submitted" ? "review.submit" : "review.save", entity_type: "committee_agenda", entity_id: id });
    return Response.json({ data });
  } catch (error) {
    return apiError(error, 400);
  }
}

