import { NextRequest } from "next/server";
import { requireMemberSession } from "@/lib/committee/auth";
import { apiError } from "@/lib/committee/validation";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { admin, member, committee } = await requireMemberSession(request);
    const { data: document } = await admin
      .from("committee_documents")
      .select("id, committee_id, bucket_id, storage_path, title")
      .eq("id", id)
      .eq("committee_id", committee.id)
      .single();
    if (!document) throw new Error("열람 권한이 없거나 문서를 찾을 수 없습니다.");
    const { data: existing } = await admin.from("committee_document_reads").select("open_count, first_opened_at").eq("document_id", id).eq("member_id", member.id).maybeSingle();
    await admin.from("committee_document_reads").upsert({
      document_id: id,
      member_id: member.id,
      first_opened_at: existing?.first_opened_at ?? new Date().toISOString(),
      last_opened_at: new Date().toISOString(),
      open_count: (existing?.open_count ?? 0) + 1,
    });
    const { data, error } = await admin.storage.from(document.bucket_id).createSignedUrl(document.storage_path, 300, { download: false });
    if (error || !data) throw new Error("문서 열람 링크를 만들지 못했습니다.");
    await admin.from("committee_audit_logs").insert({ committee_id: committee.id, actor_type: "member", actor_id: member.id, action: "document.open", entity_type: "committee_document", entity_id: id });
    return Response.json({ data: { url: data.signedUrl, expiresIn: 300, title: document.title } });
  } catch (error) {
    return apiError(error, 403);
  }
}

