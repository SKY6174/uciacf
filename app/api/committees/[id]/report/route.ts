import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { requireOwnedCommittee } from "@/lib/committee/auth";
import { createCommitteeReport } from "@/lib/committee/report";
import { apiError } from "@/lib/committee/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { user, committee, admin } = await requireOwnedCommittee(request, id);
    const [{ data: members }, { data: agendas }, { data: reviews }, { data: signatures }, { data: analysis }, { count }] = await Promise.all([
      admin.from("committee_members").select("id, name, role").eq("committee_id", id).eq("status", "active").order("created_at"),
      admin.from("committee_agendas").select("id, agenda_no, title").eq("committee_id", id).order("agenda_no"),
      admin.from("committee_reviews").select("agenda_id, decision, status").eq("status", "submitted"),
      admin.from("committee_signatures").select("signer_name, signed_at").eq("committee_id", id).order("signed_at"),
      admin.from("committee_analysis_runs").select("summary").eq("committee_id", id).in("status", ["reviewed", "approved"]).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      admin.from("committee_reports").select("id", { count: "exact", head: true }).eq("committee_id", id),
    ]);
    const agendaIds = new Set((agendas ?? []).map((agenda) => agenda.id));
    const relevantReviews = (reviews ?? []).filter((review) => agendaIds.has(review.agenda_id));
    const results = (agendas ?? []).map((agenda) => {
      const votes = relevantReviews.filter((review) => review.agenda_id === agenda.id);
      return { agendaNo: agenda.agenda_no, title: agenda.title, approve: votes.filter((vote) => vote.decision === "approve").length, reject: votes.filter((vote) => vote.decision === "reject").length, abstain: votes.filter((vote) => vote.decision === "abstain").length, submitted: votes.length };
    });
    const generatedAt = new Date().toISOString();
    const snapshot = { committee, members: members ?? [], agendas: agendas ?? [], results, signatures: signatures ?? [], analysis: analysis?.summary ?? null, generatedAt };
    const bytes = await createCommitteeReport(snapshot);
    const version = (count ?? 0) + 1;
    const documentId = crypto.randomUUID();
    const storagePath = `${id}/reports/result-report-v${version}-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage.from("meeting_docs").upload(storagePath, bytes, { contentType: "application/pdf", upsert: false, cacheControl: "private, max-age=0" });
    if (uploadError) throw uploadError;
    const { data: document, error: documentError } = await admin.from("committee_documents").insert({ id: documentId, committee_id: id, agenda_id: null, title: `${committee.name} 결과보고서 v${version}`, original_name: `committee-result-v${version}.pdf`, document_kind: "report", storage_path: storagePath, mime_type: "application/pdf", size_bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), version, created_by: user.id }).select("id, title, size_bytes").single();
    if (documentError) {
      await admin.storage.from("meeting_docs").remove([storagePath]);
      throw documentError;
    }
    const { data: report, error: reportError } = await admin.from("committee_reports").insert({ committee_id: id, document_id: document.id, version, snapshot, generated_by: user.id }).select("id, version, generated_at").single();
    if (reportError) throw reportError;
    const { data: signed } = await admin.storage.from("meeting_docs").createSignedUrl(storagePath, 300, { download: `committee-result-v${version}.pdf` });
    await admin.from("committee_audit_logs").insert({ committee_id: id, actor_type: "admin", actor_id: user.id, action: "report.generate", entity_type: "committee_report", entity_id: report.id, details: { version, documentId: document.id } });
    return Response.json({ data: { report, document, downloadUrl: signed?.signedUrl, expiresIn: 300 } }, { status: 201 });
  } catch (error) {
    return apiError(error, 400);
  }
}
