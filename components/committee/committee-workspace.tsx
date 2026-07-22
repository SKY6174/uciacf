"use client";

import { Check, CheckCircle2, ExternalLink, FileText, Loader2, LogOut, ShieldCheck, Signature, Vote } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Workspace = {
  committee: { id: string; code: string; name: string; committee_type: string; description: string | null; meeting_at: string | null; security_notice: string | null };
  member: { id: string; name: string; role: string; member_code: string };
  agendas: Array<{ id: string; agenda_no: number; title: string; description: string | null; status: string; is_required: boolean }>;
  documents: Array<{ id: string; agenda_id: string; title: string; original_name: string; size_bytes: number }>;
  reviews: Array<{ agenda_id: string; decision: string; comment: string; status: string }>;
  reads: Array<{ document_id: string; open_count: number }>;
  signature: { signer_name: string; signed_at: string } | null;
};

export function CommitteeWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [activeAgenda, setActiveAgenda] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [decision, setDecision] = useState("approve");
  const [comment, setComment] = useState("");
  const [signerName, setSignerName] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const activeAgendaRef = useRef("");

  const load = useCallback(async () => {
    const response = await fetch("/api/committee-member/workspace", { cache: "no-store" });
    if (response.status === 401) return window.location.assign("/committee/login");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "위원회 정보를 불러오지 못했습니다.");
    setWorkspace(payload.data);
    setSignerName(payload.data.member.name);
    if (!activeAgendaRef.current) {
      const firstAgendaId = payload.data.agendas[0]?.id || "";
      const firstReview = payload.data.reviews.find((item: Workspace["reviews"][number]) => item.agenda_id === firstAgendaId);
      activeAgendaRef.current = firstAgendaId;
      setActiveAgenda(firstAgendaId);
      setDecision(firstReview?.decision ?? "approve");
      setComment(firstReview?.comment ?? "");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load().catch((error) => setMessage(error.message)).finally(() => setBusy(false)); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const agenda = workspace?.agendas.find((item) => item.id === activeAgenda);
  const documents = workspace?.documents.filter((item) => item.agenda_id === activeAgenda) ?? [];
  const review = workspace?.reviews.find((item) => item.agenda_id === activeAgenda);
  const submittedCount = workspace?.reviews.filter((item) => item.status === "submitted").length ?? 0;
  const allSubmitted = Boolean(workspace?.agendas.length && submittedCount === workspace.agendas.filter((item) => item.is_required).length);
  const progress = useMemo(() => workspace?.agendas.length ? Math.round(submittedCount / workspace.agendas.length * 100) : 0, [submittedCount, workspace]);

  function selectAgenda(agendaId: string) {
    const selectedReview = workspace?.reviews.find((item) => item.agenda_id === agendaId);
    activeAgendaRef.current = agendaId;
    setActiveAgenda(agendaId);
    setDecision(selectedReview?.decision ?? "approve");
    setComment(selectedReview?.comment ?? "");
    setPdfUrl("");
  }

  async function openDocument(documentId: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/committee-member/documents/${documentId}/open`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "문서를 열 수 없습니다.");
      setPdfUrl(payload.data.url);
      setMessage("권한 확인을 완료했습니다. 열람 링크는 5분 후 만료됩니다.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "오류가 발생했습니다."); }
    finally { setBusy(false); }
  }

  async function saveReview(submit: boolean) {
    if (!activeAgenda) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/committee-member/agendas/${activeAgenda}/review`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, comment, submit }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "심의를 저장하지 못했습니다.");
      await load();
      setMessage(submit ? "심의를 최종 제출했습니다. 제출 후에는 수정할 수 없습니다." : "심의 초안을 저장했습니다.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "오류가 발생했습니다."); }
    finally { setBusy(false); }
  }

  async function sign(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/committee-member/signature", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signerName, consent }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "전자서명을 제출하지 못했습니다.");
      await load();
      setMessage("전자서명 증적이 안전하게 제출되었습니다.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "오류가 발생했습니다."); }
    finally { setBusy(false); }
  }

  async function logout() { await fetch("/api/committee-member/logout", { method: "POST" }); window.location.assign("/committee/login"); }
  if (busy && !workspace) return <div className="member-loading"><Loader2 className="spin" /><span>위원회 자료를 안전하게 불러오는 중입니다.</span></div>;
  if (!workspace) return <div className="member-loading">{message || "위원회 정보를 찾을 수 없습니다."}</div>;

  return <div className="member-shell"><header className="member-topbar"><div className="member-brand"><span>UC</span><div><strong>산학협력단 위원회</strong><small>Secure Review Workspace</small></div></div><div className="member-profile"><div><strong>{workspace.member.name}</strong><span>{workspace.member.role === "chair" ? "위원장" : workspace.member.role === "secretary" ? "간사" : "위원"} · {workspace.member.member_code}</span></div><button onClick={logout}><LogOut size={16} />로그아웃</button></div></header>
    <main className="member-main"><section className="member-hero"><div><span>{workspace.committee.committee_type} · {workspace.committee.code}</span><h1>{workspace.committee.name}</h1><p>{workspace.committee.description || "등록된 의안 자료를 충분히 확인한 뒤 의안별 심의를 제출해 주세요."}</p></div><div className="member-progress"><strong>{progress}%</strong><span>심의 제출</span><i><b style={{ width: `${progress}%` }} /></i></div></section>
      {message && <div className="member-message" role="status"><ShieldCheck size={18} />{message}</div>}
      <div className="member-layout"><aside className="agenda-nav"><h2>심의 의안</h2>{workspace.agendas.map((item) => { const itemReview = workspace.reviews.find((value) => value.agenda_id === item.id); return <button className={activeAgenda === item.id ? "active" : ""} key={item.id} onClick={() => selectAgenda(item.id)}><span>{itemReview?.status === "submitted" ? <Check size={14} /> : item.agenda_no}</span><div><strong>제{item.agenda_no}호</strong><small>{item.title}</small></div></button>; })}<div className="agenda-security"><ShieldCheck size={18} /><span>자료는 권한 확인 후 5분 동안만 열립니다.</span></div></aside>
        <section className="review-area"><div className="agenda-title"><div><span>AGENDA {agenda?.agenda_no}</span><h2>{agenda?.title}</h2><p>{agenda?.description || "의안 설명이 등록되지 않았습니다."}</p></div><em className={review?.status === "submitted" ? "done" : "waiting"}>{review?.status === "submitted" ? "제출 완료" : "심의 중"}</em></div>
          <div className="reader-card"><div className="reader-toolbar"><strong><FileText size={17} />첨부자료</strong><div>{documents.map((document) => <button key={document.id} onClick={() => openDocument(document.id)}><ExternalLink size={14} />{document.title}</button>)}</div></div>{pdfUrl ? <iframe title="위원회 PDF 첨부자료" src={`${pdfUrl}#toolbar=1&navpanes=0`} /> : <div className="reader-empty"><FileText size={36} /><strong>PDF 자료를 선택해 주세요.</strong><span>원문은 Supabase private Storage에서 signed URL로 열립니다.</span></div>}</div>
          <div className="review-card"><div className="review-card-head"><div><Vote size={19} /><h3>의안 심의</h3></div><span>의견은 최종 제출 전까지 저장할 수 있습니다.</span></div><div className="decision-options">{[["approve","찬성"],["reject","반대"],["abstain","기권"]].map(([value,label]) => <label className={decision === value ? "selected" : ""} key={value}><input type="radio" name="decision" value={value} checked={decision === value} disabled={review?.status === "submitted"} onChange={(event) => setDecision(event.target.value)} /><span>{label}</span></label>)}</div><label className="comment-field"><span>심의 의견</span><textarea maxLength={4000} disabled={review?.status === "submitted"} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="검토 의견이나 조건부 요청사항을 입력하세요." /></label><div className="review-actions"><button disabled={busy || review?.status === "submitted"} onClick={() => saveReview(false)}>임시 저장</button><button className="primary" disabled={busy || review?.status === "submitted"} onClick={() => saveReview(true)}><CheckCircle2 size={16} />최종 제출</button></div></div>
          <form className="signature-card" onSubmit={sign}><div><span className="signature-icon"><Signature size={22} /></span><div><h3>전자서명 제출</h3><p>모든 필수 의안 제출 후 결과와 동의문을 확인하고 서명합니다.</p></div></div>{workspace.signature ? <div className="signature-complete"><CheckCircle2 size={20} /><strong>{workspace.signature.signer_name}</strong><span>{new Date(workspace.signature.signed_at).toLocaleString("ko-KR")} 완료</span></div> : <><label><span>서명자 이름</span><input value={signerName} onChange={(event) => setSignerName(event.target.value)} disabled={!allSubmitted} /></label><label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={!allSubmitted} /><span>본인은 의안별 심의 결과를 확인했으며, 본 제출이 일반 전자서명 증적으로 저장되는 것에 동의합니다.</span></label><button className="primary" disabled={!allSubmitted || !consent || busy}>전자서명 제출</button></>}</form>
        </section></div>
    </main></div>;
}
