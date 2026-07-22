import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { requireOwnedCommittee } from "@/lib/committee/auth";
import { apiError, requireText, validatePdf } from "@/lib/committee/validation";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { user, admin } = await requireOwnedCommittee(request, id);
    const form = await request.formData();
    const file = form.get("file");
    const agendaId = requireText(form.get("agendaId"), "의안", 64);
    if (!(file instanceof File)) throw new Error("업로드할 PDF를 선택해 주세요.");
    const { data: agenda } = await admin.from("committee_agendas").select("id").eq("id", agendaId).eq("committee_id", id).single();
    if (!agenda) throw new Error("위원회에 속하지 않은 의안입니다.");
    const bytes = await validatePdf(file);
    const documentId = crypto.randomUUID();
    const storagePath = `${id}/${agendaId}/${documentId}.pdf`;
    const { error: uploadError } = await admin.storage.from("meeting_docs").upload(storagePath, bytes, { contentType: "application/pdf", upsert: false, cacheControl: "private, max-age=0" });
    if (uploadError) throw uploadError;
    const { data: document, error } = await admin.from("committee_documents").insert({
      id: documentId,
      committee_id: id,
      agenda_id: agendaId,
      title: requireText(form.get("title") || file.name.replace(/\.pdf$/i, ""), "문서 제목", 200),
      original_name: file.name,
      storage_path: storagePath,
      mime_type: "application/pdf",
      size_bytes: file.size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      created_by: user.id,
    }).select("id, title, original_name, size_bytes, version").single();
    if (error) {
      await admin.storage.from("meeting_docs").remove([storagePath]);
      throw error;
    }
    await admin.from("committee_audit_logs").insert({ committee_id: id, actor_type: "admin", actor_id: user.id, action: "document.upload", entity_type: "committee_document", entity_id: document.id, details: { sha256: createHash("sha256").update(bytes).digest("hex"), size: file.size } });
    return Response.json({ data: document }, { status: 201 });
  } catch (error) {
    return apiError(error, 400);
  }
}

