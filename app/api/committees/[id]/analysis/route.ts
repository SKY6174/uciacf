import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { requireOwnedCommittee } from "@/lib/committee/auth";
import { apiError } from "@/lib/committee/validation";

type AnalysisSummary = { headline: string; participation: string; decisions: string; caution: string };

async function generateAiSummary(evidence: unknown, fallback: AnalysisSummary) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_COMMITTEE_MODEL || "gpt-5.6-terra";
  if (!apiKey) return { summary: fallback, provider: "rules", model: "committee-summary-v1" };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      input: [
        { role: "system", content: "당신은 대학 위원회 운영 분석가다. 제공된 비식별 집계만 근거로 사용하고, 없는 사실을 추정하지 않는다. 반드시 headline, participation, decisions, caution 문자열 필드를 가진 JSON 객체만 출력한다." },
        { role: "user", content: `다음 위원회 집계를 한국어로 분석하라. 각 결론에 집계 수치를 포함하고 개인정보를 추론하지 마라.\n${JSON.stringify(evidence)}` },
      ],
      max_output_tokens: 900,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) return { summary: fallback, provider: "rules-fallback", model: "committee-summary-v1" };
  const payload = await response.json();
  const outputText = payload.output_text ?? payload.output?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? []).find((item: { type?: string }) => item.type === "output_text")?.text;
  try {
    const parsed = JSON.parse(outputText) as Partial<AnalysisSummary>;
    if (![parsed.headline, parsed.participation, parsed.decisions, parsed.caution].every((value) => typeof value === "string" && value.length > 0)) throw new Error("invalid_analysis_shape");
    return { summary: parsed as AnalysisSummary, provider: "openai", model };
  } catch {
    return { summary: fallback, provider: "rules-fallback", model: "committee-summary-v1" };
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { user, admin } = await requireOwnedCommittee(request, id);
    const [{ data: members }, { data: agendas }, { data: reviews }, { data: signatures }, { data: reads }] = await Promise.all([
      admin.from("committee_members").select("id, role").eq("committee_id", id).eq("status", "active"),
      admin.from("committee_agendas").select("id, agenda_no, title").eq("committee_id", id).order("agenda_no"),
      admin.from("committee_reviews").select("agenda_id, member_id, decision, comment, status").eq("status", "submitted"),
      admin.from("committee_signatures").select("member_id").eq("committee_id", id),
      admin.from("committee_document_reads").select("member_id, document_id"),
    ]);
    const memberIds = new Set((members ?? []).map((item) => item.id));
    const relevantReviews = (reviews ?? []).filter((item) => memberIds.has(item.member_id));
    const evidence = (agendas ?? []).map((agenda) => {
      const votes = relevantReviews.filter((review) => review.agenda_id === agenda.id);
      return { agendaNo: agenda.agenda_no, title: agenda.title, approve: votes.filter((vote) => vote.decision === "approve").length, reject: votes.filter((vote) => vote.decision === "reject").length, abstain: votes.filter((vote) => vote.decision === "abstain").length, submitted: votes.length };
    });
    const memberCount = members?.length ?? 0;
    const expected = memberCount * (agendas?.length ?? 0);
    const reviewRate = expected ? Math.round(relevantReviews.length / expected * 100) : 0;
    const signatureRate = memberCount ? Math.round((signatures?.length ?? 0) / memberCount * 100) : 0;
    const fallbackSummary = {
      headline: `심의 제출률 ${reviewRate}%, 전자서명 완료율 ${signatureRate}%입니다.`,
      participation: reviewRate < 100 ? `미제출 심의 ${Math.max(expected - relevantReviews.length, 0)}건을 확인해야 합니다.` : "모든 필수 심의가 제출되었습니다.",
      decisions: evidence.map((item) => `제${item.agendaNo}호: 찬성 ${item.approve}, 반대 ${item.reject}, 기권 ${item.abstain}`).join(" / "),
      caution: "이 요약은 비식별 집계 규칙으로 생성된 초안이며 간사 검토 후 사용해야 합니다.",
    };
    const inputDigest = createHash("sha256").update(JSON.stringify({ memberCount, evidence, signatureCount: signatures?.length ?? 0, readEvents: reads?.filter((item) => memberIds.has(item.member_id)).length ?? 0 })).digest("hex");
    const generated = await generateAiSummary({ memberCount, reviewRate, signatureRate, evidence }, fallbackSummary);
    const { data, error } = await admin.from("committee_analysis_runs").insert({ committee_id: id, provider: generated.provider, model: generated.model, prompt_version: "aggregate-v2", input_digest: inputDigest, summary: generated.summary, evidence, created_by: user.id }).select("id, provider, model, summary, evidence, status, created_at").single();
    if (error) throw error;
    await admin.from("committee_audit_logs").insert({ committee_id: id, actor_type: "admin", actor_id: user.id, action: "analysis.generate", entity_type: "committee_analysis", entity_id: data.id });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return apiError(error, 400);
  }
}
