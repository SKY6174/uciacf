import { NextRequest } from "next/server";
import { requireMemberSession } from "@/lib/committee/auth";
import { apiError } from "@/lib/committee/validation";

export async function GET(request: NextRequest) {
  try {
    const { admin, member, committee } = await requireMemberSession(request);
    const [{ data: agendas }, { data: documents }, { data: reviews }, { data: reads }, { data: signature }] = await Promise.all([
      admin.from("committee_agendas").select("id, agenda_no, title, description, decision_type, status, is_required").eq("committee_id", committee.id).order("agenda_no"),
      admin.from("committee_documents").select("id, agenda_id, title, original_name, size_bytes, version").eq("committee_id", committee.id).neq("document_kind", "report").order("created_at"),
      admin.from("committee_reviews").select("id, agenda_id, decision, comment, status, submitted_at").eq("member_id", member.id),
      admin.from("committee_document_reads").select("document_id, first_opened_at, last_opened_at, open_count").eq("member_id", member.id),
      admin.from("committee_signatures").select("id, signer_name, signed_at, consent_version").eq("committee_id", committee.id).eq("member_id", member.id).maybeSingle(),
    ]);
    return Response.json({ data: { committee, member, agendas: agendas ?? [], documents: documents ?? [], reviews: reviews ?? [], reads: reads ?? [], signature } });
  } catch (error) {
    return apiError(error, 401);
  }
}

