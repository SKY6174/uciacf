export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export function normalizeCode(value: unknown, field: string) {
  const code = String(value ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,32}$/.test(code)) throw new Error(`${field} 형식이 올바르지 않습니다.`);
  return code;
}

export function requireText(value: unknown, field: string, max = 200) {
  const text = String(value ?? "").trim();
  if (!text || text.length > max) throw new Error(`${field}을(를) 확인해 주세요.`);
  return text;
}

export async function validatePdf(file: File) {
  if (file.type !== "application/pdf") throw new Error("PDF 파일만 업로드할 수 있습니다.");
  if (!file.name.toLowerCase().endsWith(".pdf")) throw new Error("파일 확장자는 .pdf여야 합니다.");
  if (file.size < 5 || file.size > MAX_PDF_BYTES) throw new Error("PDF는 20MB 이하여야 합니다.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder("ascii").decode(bytes.slice(0, 5));
  if (signature !== "%PDF-") throw new Error("유효한 PDF 파일이 아닙니다.");
  return bytes;
}

export function apiError(error: unknown, status = 400) {
  const traceId = crypto.randomUUID();
  const message = error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
  return Response.json({ error: { code: "COMMITTEE_REQUEST_FAILED", message, traceId } }, { status });
}
