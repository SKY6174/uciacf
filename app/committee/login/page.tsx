"use client";

import { ArrowRight, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

export default function CommitteeLoginPage() {
  const [committeeCode, setCommitteeCode] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/committee-member/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ committeeCode, memberCode, securityCode }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "로그인할 수 없습니다.");
      window.location.assign("/committee");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "로그인할 수 없습니다."); }
    finally { setBusy(false); }
  }
  return <main className="committee-login-page"><section className="login-visual"><div className="login-brand"><span>UC</span><div><strong>울산과학대학교</strong><small>산학협력단 위원회 시스템</small></div></div><div className="login-copy"><span>SECURE COMMITTEE</span><h1>자료 검토부터<br />심의와 서명까지</h1><p>위원별 보안코드와 비공개 PDF 열람으로 안전하게 심의에 참여하세요.</p><div><article><FileText size={20} /><strong>PDF 보안 열람</strong><span>권한 확인 후 단기 링크</span></article><article><ShieldCheck size={20} /><strong>심의 증적 보존</strong><span>제출·서명 감사 추적</span></article></div></div><small>운영 정책 승인 전 개발·스테이징 환경입니다.</small></section><section className="login-form-side"><form onSubmit={submit}><div className="login-lock"><LockKeyhole size={24} /></div><span className="login-kicker">MEMBER ACCESS</span><h2>위원 로그인</h2><p>간사에게 전달받은 위원회 코드와 개인 보안코드를 입력해 주세요.</p>{error && <div className="login-error" role="alert">{error}</div>}<label><span>위원회 코드</span><input required autoComplete="organization" value={committeeCode} onChange={(event) => setCommitteeCode(event.target.value.toUpperCase())} placeholder="UC-OPS-2026" /></label><label><span>위원 코드</span><input required autoComplete="username" value={memberCode} onChange={(event) => setMemberCode(event.target.value.toUpperCase())} placeholder="MEMBER01" /></label><label><span>개인 보안코드</span><input required minLength={8} type="password" autoComplete="current-password" value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} placeholder="8자 이상" /></label><button disabled={busy}>{busy ? "권한 확인 중..." : "위원회 입장"}<ArrowRight size={17} /></button><div className="login-help"><ShieldCheck size={15} /><span>5회 연속 실패하면 15분간 로그인이 제한됩니다. 보안코드를 다른 사람과 공유하지 마세요.</span></div></form></section></main>;
}

