import { NextRequest } from "next/server";
import { requireOwnedCommittee } from "@/lib/committee/auth";
import { apiError } from "@/lib/committee/validation";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { committee, admin } = await requireOwnedCommittee(request, id);
    const [{ data: members }, { data: agendas }, { data: documents }, { data: reviews }, { data: reads }, { data: signatures }, { data: analysis }, { data: reports }] = await Promise.all([
      admin.from("committee_members").select("id, member_code, name, role, status, last_login_at").eq("committee_id", id).order("created_at"),
      admin.from("committee_agendas").select("id, agenda_no, title, status, is_required").eq("committee_id", id).order("agenda_no"),
      admin.from("committee_documents").select("id, agenda_id, document_kind").eq("committee_id", id),
      admin.from("committee_reviews").select("agenda_id, member_id, decision, status, submitted_at"),
      admin.from("committee_document_reads").select("document_id, member_id, open_count, last_opened_at"),
      admin.from("committee_signatures").select("member_id, signed_at").eq("committee_id", id),
      admin.from("committee_analysis_runs").select("id, provider, model, summary, evidence, status, created_at").eq("committee_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      admin.from("committee_reports").select("id, version, generated_at, document_id").eq("committee_id", id).order("version", { ascending: false }),
    ]);
    const agendaIds = new Set((agendas ?? []).map((agenda) => agenda.id));
    const documentIds = new Set((documents ?? []).filter((document) => document.document_kind !== "report").map((document) => document.id));
    const requiredCount = (agendas ?? []).filter((agenda) => agenda.is_required).length;
    const memberProgress = (members ?? []).map((member) => {
      const memberReviews = (reviews ?? []).filter((review) => review.member_id === member.id && agendaIds.has(review.agenda_id) && review.status === "submitted");
      const memberReads = (reads ?? []).filter((read) => read.member_id === member.id && documentIds.has(read.document_id));
      const signature = signatures?.find((item) => item.member_id === member.id);
      return {
        ...member,
        readCount: new Set(memberReads.map((read) => read.document_id)).size,
        documentCount: documentIds.size,
        submittedCount: memberReviews.length,
        requiredCount,
        signatureAt: signature?.signed_at ?? null,
        stage: signature ? "signed" : memberReviews.length >= requiredCount && requiredCount > 0 ? "reviewed" : memberReads.length > 0 ? "reading" : member.last_login_at ? "visited" : "not_started",
      };
    });
    const agendaResults = (agendas ?? []).map((agenda) => {
      const votes = (reviews ?? []).filter((review) => review.agenda_id === agenda.id && review.status === "submitted");
      return { ...agenda, approve: votes.filter((vote) => vote.decision === "approve").length, reject: votes.filter((vote) => vote.decision === "reject").length, abstain: votes.filter((vote) => vote.decision === "abstain").length, submitted: votes.length };
    });
    return Response.json({ data: { committee, members: memberProgress, agendas: agendaResults, analysis, reports: reports ?? [] } });
  } catch (error) {
    return apiError(error, 403);
  }
}
