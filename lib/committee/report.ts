import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";

export type CommitteeReportSnapshot = {
  committee: { code: string; name: string; committee_type: string; meeting_at: string | null; status: string };
  members: Array<{ name: string; role: string }>;
  agendas: Array<{ agenda_no: number; title: string }>;
  results: Array<{ agendaNo: number; title: string; approve: number; reject: number; abstain: number; submitted: number }>;
  signatures: Array<{ signer_name: string; signed_at: string }>;
  analysis?: { headline?: string; participation?: string; decisions?: string; caution?: string } | null;
  generatedAt: string;
};

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 50;

function isLatinCharacter(character: string) {
  return character.codePointAt(0)! < 0x2e80;
}

function measureMixed(text: string, size: number, latin: PDFFont, korean: PDFFont) {
  return [...text].reduce((width, character) => width + (isLatinCharacter(character) ? latin : korean).widthOfTextAtSize(character, size), 0);
}

function wrapMixed(text: string, maxWidth: number, size: number, latin: PDFFont, korean: PDFFont) {
  const lines: string[] = [];
  let line = "";
  for (const character of [...text]) {
    if (character === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    const candidate = line + character;
    if (line && measureMixed(candidate, size, latin, korean) > maxWidth) {
      lines.push(line);
      line = character;
    } else {
      line = candidate;
    }
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

function drawMixed(page: PDFPage, text: string, x: number, y: number, size: number, latin: PDFFont, korean: PDFFont, color = rgb(0.12, 0.18, 0.27)) {
  let cursor = x;
  let run = "";
  let current = isLatinCharacter(text[0] ?? "A") ? latin : korean;
  const flush = () => {
    if (!run) return;
    page.drawText(run, { x: cursor, y, size, font: current, color });
    cursor += current.widthOfTextAtSize(run, size);
    run = "";
  };
  for (const character of [...text]) {
    const next = isLatinCharacter(character) ? latin : korean;
    if (next !== current) {
      flush();
      current = next;
    }
    run += character;
  }
  flush();
}

export async function createCommitteeReport(snapshot: CommitteeReportSnapshot) {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const fontBytes = await readFile(path.join(process.cwd(), "assets", "fonts", "NotoSansCJKkr-Regular.otf"));
  // pdf-lib/fontkit의 CJK 부분 임베딩은 일부 Hangul glyph를 .notdef로 렌더링한다.
  // 전체 글꼴을 임베딩해 보고서의 한글 가독성을 보장한다(결과 PDF는 약 13MB).
  const korean = await document.embedFont(fontBytes, { subset: false });
  const latin = korean;
  let page = document.addPage([A4.width, A4.height]);
  let y = A4.height - MARGIN;

  const newPage = () => {
    page = document.addPage([A4.width, A4.height]);
    y = A4.height - MARGIN;
    return page;
  };
  const ensure = (height: number) => { if (y - height < MARGIN + 28) newPage(); };
  const line = (text: string, size = 10, gap = 16, color = rgb(0.12, 0.18, 0.27)) => {
    const lines = wrapMixed(text, A4.width - MARGIN * 2, size, latin, korean);
    ensure(lines.length * gap);
    for (const value of lines) {
      drawMixed(page, value, MARGIN, y, size, latin, korean, color);
      y -= gap;
    }
  };
  const section = (title: string) => {
    ensure(34);
    y -= 8;
    page.drawRectangle({ x: MARGIN, y: y - 5, width: 4, height: 18, color: rgb(0.08, 0.39, 0.78) });
    drawMixed(page, title, MARGIN + 12, y, 14, latin, korean, rgb(0.05, 0.18, 0.34));
    y -= 28;
  };

  page.drawRectangle({ x: 0, y: A4.height - 190, width: A4.width, height: 190, color: rgb(0.035, 0.16, 0.32) });
  drawMixed(page, "울산과학대학교 산학협력단", MARGIN, A4.height - 72, 12, latin, korean, rgb(0.7, 0.84, 1));
  drawMixed(page, "위원회 결과보고서", MARGIN, A4.height - 113, 28, latin, korean, rgb(1, 1, 1));
  drawMixed(page, snapshot.committee.name, MARGIN, A4.height - 147, 15, latin, korean, rgb(0.88, 0.94, 1));
  y = A4.height - 230;
  line(`위원회 코드  ${snapshot.committee.code}`);
  line(`위원회 종류  ${snapshot.committee.committee_type}`);
  line(`개최 일시  ${snapshot.committee.meeting_at ? new Date(snapshot.committee.meeting_at).toLocaleString("ko-KR") : "미정"}`);
  line(`보고서 생성  ${new Date(snapshot.generatedAt).toLocaleString("ko-KR")}`);
  y -= 18;
  line("본 보고서는 시스템에 최종 제출된 심의와 일반 전자서명 증적을 기준으로 생성되었습니다. 공인전자서명 인증서가 아닙니다.", 9, 15, rgb(0.42, 0.47, 0.55));

  section("1. 위원 구성");
  snapshot.members.forEach((member, index) => line(`${index + 1}. ${member.name}  ·  ${member.role === "chair" ? "위원장" : member.role === "secretary" ? "간사" : "위원"}`, 10, 17));

  section("2. 의안별 심의 결과");
  snapshot.results.forEach((result) => {
    line(`제${result.agendaNo}호 ${result.title}`, 11, 18, rgb(0.05, 0.25, 0.48));
    line(`찬성 ${result.approve}명  |  반대 ${result.reject}명  |  기권 ${result.abstain}명  |  제출 ${result.submitted}명`, 10, 18);
    y -= 5;
  });

  section("3. 참여 및 전자서명 현황");
  line(`위원 ${snapshot.members.length}명 중 전자서명 ${snapshot.signatures.length}명 완료`, 11, 19);
  snapshot.signatures.forEach((signature, index) => line(`${index + 1}. ${signature.signer_name}  ·  ${new Date(signature.signed_at).toLocaleString("ko-KR")}`, 9, 16));

  if (snapshot.analysis) {
    section("4. 종합분석(검토용)");
    [snapshot.analysis.headline, snapshot.analysis.participation, snapshot.analysis.decisions, snapshot.analysis.caution].filter(Boolean).forEach((value) => {
      line(String(value), 10, 17);
      y -= 4;
    });
  }

  const pages = document.getPages();
  pages.forEach((target, index) => {
    target.drawLine({ start: { x: MARGIN, y: 34 }, end: { x: A4.width - MARGIN, y: 34 }, thickness: 0.6, color: rgb(0.82, 0.85, 0.89) });
    drawMixed(target, `UC-IACF Committee System  ·  ${index + 1} / ${pages.length}`, MARGIN, 20, 8, latin, korean, rgb(0.45, 0.5, 0.58));
  });
  document.setTitle(`${snapshot.committee.name} 결과보고서`);
  document.setAuthor("울산과학대학교 산학협력단 위원회 시스템");
  return document.save();
}
