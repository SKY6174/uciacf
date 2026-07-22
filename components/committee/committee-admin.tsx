"use client";

import { createClient } from "@supabase/supabase-js";
import { BarChart3, Check, CheckCircle2, ChevronRight, ClipboardCheck, FileDown, FileText, Loader2, LockKeyhole, Plus, ShieldCheck, Sparkles, Upload, UserCheck, Users, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CommitteeSummary = {
  id: string;
  code: string;
  name: string;
  committee_type: string;
  meeting_at: string | null;
  status: string;
  memberCount: number;
  agendaCount: number;
  reviewRate: number;
  signatureCount: number;
  demo?: boolean;
};

type MemberDraft = { memberCode: string; name: string; email: string; role: "chair" | "member" | "secretary"; securityCode: string };
type AgendaDraft = { title: string; description: string; decisionType: "vote" | "review" | "report" };
type CommitteeOverview = {
  committee: { name: string };
  members: Array<{ id: string; name: string; role: string; last_login_at: string | null; readCount: number; documentCount: number; submittedCount: number; requiredCount: number; signatureAt: string | null; stage: string }>;
  agendas: Array<{ id: string; agenda_no: number; title: string; approve: number; reject: number; abstain: number; submitted: number }>;
  analysis: { provider: string; model: string; summary: { headline?: string; participation?: string }; status: string } | null;
};

const DEMO_COMMITTEES: CommitteeSummary[] = [
  { id: "demo-1", code: "UC-OPS-2026", name: "2026년 제4차 산학협력단 운영위원회", committee_type: "운영위원회", meeting_at: "2026-07-28T14:00:00+09:00", status: "open", memberCount: 9, agendaCount: 3, reviewRate: 78, signatureCount: 6, demo: true },
  { id: "demo-2", code: "UC-RISE-02", name: "RISE 사업계획 변경 심의위원회", committee_type: "심의위원회", meeting_at: "2026-08-03T10:00:00+09:00", status: "draft", memberCount: 7, agendaCount: 2, reviewRate: 0, signatureCount: 0, demo: true },
];

const initialMembers: MemberDraft[] = [
  { memberCode: "CHAIR01", name: "", email: "", role: "chair", securityCode: "" },
  { memberCode: "MEMBER01", name: "", email: "", role: "member", securityCode: "" },
  { memberCode: "SEC01", name: "", email: "", role: "secretary", securityCode: "" },
];

function statusLabel(status: string) {
  return status === "open" ? "심의 진행" : status === "closed" ? "심의 종료" : status === "reported" ? "보고 완료" : "작성 중";
}

async function accessToken() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { data } = await createClient(url, key).auth.getSession();
  return data.session?.access_token ?? null;
}

function browserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export function CommitteeAdmin() {
  const [items, setItems] = useState<CommitteeSummary[]>(DEMO_COMMITTEES);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [committeeType, setCommitteeType] = useState("운영위원회");
  const [meetingAt, setMeetingAt] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>(initialMembers);
  const [agendas, setAgendas] = useState<AgendaDraft[]>([{ title: "", description: "", decisionType: "vote" }]);
  const [pdf, setPdf] = useState<File | null>(null);
  const [overview, setOverview] = useState<CommitteeOverview | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  const stats = useMemo(() => ({
    total: items.length,
    open: items.filter((item) => item.status === "open").length,
    reviewRate: items.length ? Math.round(items.reduce((sum, item) => sum + item.reviewRate, 0) / items.length) : 0,
    signed: items.reduce((sum, item) => sum + item.signatureCount, 0),
  }), [items]);

  useEffect(() => {
    void (async () => {
      const token = await accessToken();
      if (!token) return;
      setAuthenticated(true);
      const response = await fetch("/api/committees", { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload.data?.length) setItems(payload.data);
    })();
  }, []);

  async function loginAdmin(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setAdminLoginError("");
    try {
      const client = browserSupabase();
      if (!client) throw new Error("Supabase 공개 환경변수가 설정되지 않았습니다.");
      const { error } = await client.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
      if (error) throw new Error("이메일 또는 비밀번호를 확인해 주세요.");
      setAuthenticated(true); setShowAdminLogin(false); setAdminPassword("");
      const token = await accessToken();
      if (token) {
        const response = await fetch("/api/committees", { headers: { Authorization: `Bearer ${token}` } });
        const payload = await response.json();
        if (response.ok) setItems(payload.data?.length ? payload.data : []);
      }
      setMessage("Supabase 관리자 인증이 완료되었습니다.");
    } catch (error) { setAdminLoginError(error instanceof Error ? error.message : "로그인하지 못했습니다."); }
    finally { setBusy(false); }
  }

  async function logoutAdmin() {
    await browserSupabase()?.auth.signOut();
    setAuthenticated(false); setItems(DEMO_COMMITTEES); setOverview(null);
    setMessage("관리자 로그아웃을 완료했습니다.");
  }

  const updateMember = (index: number, key: keyof MemberDraft, value: string) => setMembers((current) => current.map((member, itemIndex) => itemIndex === index ? { ...member, [key]: value } as MemberDraft : member));
  const updateAgenda = (index: number, key: keyof AgendaDraft, value: string) => setAgendas((current) => current.map((agenda, itemIndex) => itemIndex === index ? { ...agenda, [key]: value } as AgendaDraft : agenda));

  async function createCommittee(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const token = await accessToken();
      if (!token) throw new Error("Supabase 관리자 로그인이 필요합니다. 운영 연결 전에는 화면만 미리 볼 수 있습니다.");
      const response = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, name, committeeType, meetingAt: meetingAt || null, members, agendas, openImmediately: true }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "위원회 생성에 실패했습니다.");
      if (pdf) {
        const form = new FormData();
        form.set("file", pdf);
        form.set("agendaId", payload.data.agendas[0].id);
        form.set("title", pdf.name.replace(/\.pdf$/i, ""));
        const upload = await fetch(`/api/committees/${payload.data.id}/documents`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
        const uploadPayload = await upload.json();
        if (!upload.ok) throw new Error(`위원회는 생성했지만 PDF 업로드에 실패했습니다: ${uploadPayload.error?.message ?? "오류"}`);
      }
      setItems((current) => [{ ...payload.data, committee_type: committeeType, meeting_at: meetingAt, memberCount: members.length, agendaCount: agendas.length, reviewRate: 0, signatureCount: 0 }, ...current.filter((item) => !item.demo)]);
      setMessage("위원회와 위원별 접근코드, 의안, PDF가 안전하게 등록되었습니다.");
      setShowCreate(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function runAction(item: CommitteeSummary, action: "analysis" | "report") {
    if (item.demo) return setMessage("합성 데이터 항목입니다. Supabase에 생성한 위원회에서 실행해 주세요.");
    setBusy(true);
    try {
      const token = await accessToken();
      if (!token) throw new Error("관리자 로그인이 필요합니다.");
      const response = await fetch(`/api/committees/${item.id}/${action}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "작업을 완료하지 못했습니다.");
      if (action === "report" && payload.data.downloadUrl) window.open(payload.data.downloadUrl, "_blank", "noopener,noreferrer");
      setMessage(action === "analysis" ? "비식별 집계 기반 종합분석 초안을 생성했습니다." : "결과보고서 PDF를 생성해 private Storage에 보관했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function openOverview(item: CommitteeSummary) {
    if (item.demo) return setMessage("합성 데이터 항목입니다. Supabase에 생성한 위원회에서 개인별 참여현황을 확인할 수 있습니다.");
    setBusy(true);
    try {
      const token = await accessToken();
      if (!token) throw new Error("관리자 로그인이 필요합니다.");
      const response = await fetch(`/api/committees/${item.id}/overview`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "참여현황을 불러오지 못했습니다.");
      setOverview(payload.data);
    } catch (error) { setMessage(error instanceof Error ? error.message : "요청을 처리하지 못했습니다."); }
    finally { setBusy(false); }
  }

  return (
    <section className="committee-admin">
      <div className="committee-heading">
        <div><div className="eyebrow"><span>COMMITTEE OPERATIONS</span><span className="demo-chip">개발·스테이징</span></div><h1>위원회 운영</h1><p>위원 구성부터 PDF 자료 열람, 심의, 전자서명, 결과보고서까지 한 흐름으로 관리합니다.</p></div>
        <div className="committee-actions"><a href="/committee/login" target="_blank"><UserCheck size={16} />위원 전용 페이지</a><button className="auth-button" onClick={() => authenticated ? void logoutAdmin() : setShowAdminLogin(true)}><LockKeyhole size={16} />{authenticated ? "관리자 로그아웃" : "관리자 로그인"}</button><button onClick={() => authenticated ? setShowCreate(true) : setShowAdminLogin(true)}><Plus size={17} />위원회 생성</button></div>
      </div>

      <div className="committee-security-note"><ShieldCheck size={21} /><div><strong>비공개 PDF 보관</strong><span>`meeting_docs` 버킷 · PDF only · 20MB 이하 · 위원별 권한 확인 후 5분 signed URL</span></div><LockKeyhole size={19} /></div>
      {message && <div className="committee-message" role="status">{message}<button aria-label="알림 닫기" onClick={() => setMessage("")}><X size={15} /></button></div>}

      <div className="committee-metrics">
        <article><span className="metric-icon blue"><Users size={19} /></span><div><small>전체 위원회</small><strong>{stats.total}<em>개</em></strong></div></article>
        <article><span className="metric-icon green"><ClipboardCheck size={19} /></span><div><small>심의 진행</small><strong>{stats.open}<em>개</em></strong></div></article>
        <article><span className="metric-icon violet"><BarChart3 size={19} /></span><div><small>평균 심의 제출률</small><strong>{stats.reviewRate}<em>%</em></strong></div></article>
        <article><span className="metric-icon coral"><CheckCircle2 size={19} /></span><div><small>전자서명 완료</small><strong>{stats.signed}<em>명</em></strong></div></article>
      </div>

      <article className="committee-list-panel">
        <div className="committee-panel-head"><div><h2>위원회 현황</h2><p>상태와 참여율을 확인하고 분석·보고서를 생성합니다.</p></div><span>기준 {new Date().toLocaleDateString("ko-KR")}</span></div>
        <div className="committee-table-wrap"><table className="committee-table"><thead><tr><th>위원회</th><th>종류</th><th>위원/의안</th><th>심의 제출</th><th>서명</th><th>상태</th><th>작업</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.code} · {item.meeting_at ? new Date(item.meeting_at).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "일정 미정"}{item.demo ? " · 합성 데이터" : ""}</small></td><td>{item.committee_type}</td><td>{item.memberCount}명 / {item.agendaCount}건</td><td><div className="rate-cell"><span><i style={{ width: `${item.reviewRate}%` }} /></span><b>{item.reviewRate}%</b></div></td><td>{item.signatureCount}/{item.memberCount}</td><td><em className={`committee-status ${item.status}`}>{statusLabel(item.status)}</em></td><td><div className="row-actions"><button title="종합분석" disabled={busy} onClick={() => runAction(item, "analysis")}><Sparkles size={15} /></button><button title="PDF 결과보고서" disabled={busy} onClick={() => runAction(item, "report")}><FileDown size={15} /></button><button title="개인별 참여현황" disabled={busy} onClick={() => openOverview(item)}><ChevronRight size={16} /></button></div></td></tr>)}</tbody></table></div>
      </article>

      {overview && <article className="committee-overview-panel"><div className="committee-panel-head"><div><h2>{overview.committee.name} 참여현황</h2><p>접속 → 자료열람 → 심의제출 → 전자서명의 개인별 진행상태</p></div><button aria-label="참여현황 닫기" onClick={() => setOverview(null)}><X size={17} /></button></div><div className="overview-grid"><section><h3>위원별 진행</h3>{overview.members.map((member) => <div className="member-progress-row" key={member.id}><span className={`stage-dot ${member.stage}`}><Check size={13} /></span><div><strong>{member.name}</strong><small>{member.role === "chair" ? "위원장" : member.role === "secretary" ? "간사" : "위원"} · 자료 {member.readCount}/{member.documentCount} · 심의 {member.submittedCount}/{member.requiredCount}</small></div><em>{member.stage === "signed" ? "서명완료" : member.stage === "reviewed" ? "심의완료" : member.stage === "reading" ? "자료열람" : member.stage === "visited" ? "접속" : "미접속"}</em></div>)}</section><section><h3>의안별 집계</h3>{overview.agendas.map((agenda) => <div className="agenda-result-row" key={agenda.id}><div><strong>제{agenda.agenda_no}호 {agenda.title}</strong><small>제출 {agenda.submitted}명</small></div><span><b>찬성 {agenda.approve}</b><b>반대 {agenda.reject}</b><b>기권 {agenda.abstain}</b></span></div>)}{overview.analysis && <div className="analysis-preview"><Sparkles size={17} /><div><strong>{overview.analysis.summary.headline}</strong><span>{overview.analysis.summary.participation}</span><small>{overview.analysis.provider} · {overview.analysis.model} · {overview.analysis.status}</small></div></div>}</section></div></article>}

      {showCreate && <div className="committee-modal-backdrop" role="presentation"><div className="committee-modal" role="dialog" aria-modal="true" aria-labelledby="committee-create-title"><div className="modal-head"><div><small>NEW COMMITTEE</small><h2 id="committee-create-title">위원회 생성</h2></div><button aria-label="닫기" onClick={() => setShowCreate(false)}><X size={20} /></button></div>
        <form onSubmit={createCommittee}>
          <fieldset><legend>1. 기본 정보</legend><div className="form-grid"><label><span>위원회 종류</span><select value={committeeType} onChange={(event) => setCommitteeType(event.target.value)}><option>운영위원회</option><option>심의위원회</option><option>평가위원회</option><option>선정위원회</option><option>기타</option></select></label><label><span>위원회 코드</span><input required pattern="[A-Za-z0-9_-]{4,32}" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="UC-OPS-2026" /></label><label className="wide"><span>위원회명</span><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="2026년 제4차 산학협력단 운영위원회" /></label><label className="wide"><span>개최 일시</span><input type="datetime-local" value={meetingAt} onChange={(event) => setMeetingAt(event.target.value)} /></label></div></fieldset>
          <fieldset><legend>2. 위원 구성</legend><p className="field-help">보안코드는 8자 이상으로 설정하며 DB에는 해시만 저장됩니다.</p>{members.map((member, index) => <div className="member-row" key={index}><select aria-label="위원 역할" value={member.role} onChange={(event) => updateMember(index, "role", event.target.value)}><option value="chair">위원장</option><option value="member">위원</option><option value="secretary">간사</option></select><input required aria-label="위원 코드" value={member.memberCode} onChange={(event) => updateMember(index, "memberCode", event.target.value.toUpperCase())} placeholder="위원 코드" /><input required aria-label="위원 이름" value={member.name} onChange={(event) => updateMember(index, "name", event.target.value)} placeholder="성명" /><input aria-label="이메일" type="email" value={member.email} onChange={(event) => updateMember(index, "email", event.target.value)} placeholder="이메일(선택)" /><input required minLength={8} aria-label="보안코드" type="password" value={member.securityCode} onChange={(event) => updateMember(index, "securityCode", event.target.value)} placeholder="보안코드 8자+" />{members.length > 1 && <button type="button" aria-label="위원 삭제" onClick={() => setMembers((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={15} /></button>}</div>)}<button type="button" className="add-row" onClick={() => setMembers((current) => [...current, { memberCode: `MEMBER${String(current.length + 1).padStart(2, "0")}`, name: "", email: "", role: "member", securityCode: "" }])}><Plus size={14} />위원 추가</button></fieldset>
          <fieldset><legend>3. 의안과 PDF</legend>{agendas.map((agenda, index) => <div className="agenda-editor" key={index}><span>제{index + 1}호</span><input required value={agenda.title} onChange={(event) => updateAgenda(index, "title", event.target.value)} placeholder="의안 제목" /><select value={agenda.decisionType} onChange={(event) => updateAgenda(index, "decisionType", event.target.value)}><option value="vote">의결</option><option value="review">심의</option><option value="report">보고</option></select>{agendas.length > 1 && <button type="button" aria-label="의안 삭제" onClick={() => setAgendas((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={15} /></button>}</div>)}<button type="button" className="add-row" onClick={() => setAgendas((current) => [...current, { title: "", description: "", decisionType: "vote" }])}><Plus size={14} />의안 추가</button><label className="pdf-drop"><Upload size={24} /><strong>{pdf ? pdf.name : "첫 번째 의안 PDF 첨부"}</strong><span>application/pdf · 최대 20MB · 업로드 후 private Storage 보관</span><input type="file" accept="application/pdf,.pdf" onChange={(event) => setPdf(event.target.files?.[0] ?? null)} /></label></fieldset>
          <div className="modal-actions"><button type="button" onClick={() => setShowCreate(false)}>취소</button><button className="primary" disabled={busy}>{busy ? <Loader2 className="spin" size={17} /> : <FileText size={17} />}위원회 생성 및 자료 등록</button></div>
        </form>
      </div></div>}
      {showAdminLogin && <div className="committee-modal-backdrop" role="presentation"><div className="admin-login-modal" role="dialog" aria-modal="true" aria-labelledby="admin-login-title"><button className="admin-login-close" aria-label="닫기" onClick={() => setShowAdminLogin(false)}><X size={19} /></button><span className="login-lock"><LockKeyhole size={22} /></span><small>SUPABASE AUTH</small><h2 id="admin-login-title">위원회 관리자 로그인</h2><p>Supabase Auth에 등록된 교직원 이메일 계정으로 로그인하세요.</p>{adminLoginError && <div className="login-error" role="alert">{adminLoginError}</div>}<form onSubmit={loginAdmin}><label><span>이메일</span><input required type="email" autoComplete="username" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} /></label><label><span>비밀번호</span><input required type="password" autoComplete="current-password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} /></label><button disabled={busy}>{busy ? <Loader2 className="spin" size={16} /> : <ShieldCheck size={16} />}로그인</button></form><div><ShieldCheck size={15} /><span>관리자 API는 access token을 다시 검증하며, 생성한 위원회의 소유자만 관리할 수 있습니다.</span></div></div></div>}
    </section>
  );
}
