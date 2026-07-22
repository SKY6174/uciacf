"use client";

import { CalendarRange, History, Loader2, Plus, RefreshCw, UserRoundCog, Users, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

export type CompositionMember = {
  id: string;
  composition_id: string;
  member_code: string;
  name: string;
  email: string | null;
  role: "chair" | "member" | "secretary";
  valid_from: string;
  valid_to: string | null;
  status: "active" | "replaced" | "inactive";
  appointment_reference: string | null;
  change_reason?: string | null;
};

export type CommitteeComposition = {
  id: string;
  code: string;
  name: string;
  committee_type: string;
  term_start: string;
  term_end: string;
  status: "draft" | "active" | "closed";
  members: CompositionMember[];
};

type MemberDraft = { memberCode: string; name: string; email: string; role: CompositionMember["role"]; appointmentReference: string };
type Props = {
  authenticated: boolean;
  getAccessToken: () => Promise<string | null>;
  onChange: (items: CommitteeComposition[]) => void;
  onMessage: (message: string) => void;
  onRequestLogin: () => void;
};

const currentYear = new Date().getFullYear();
const newMember = (index: number, role: CompositionMember["role"] = "member"): MemberDraft => ({
  memberCode: role === "chair" ? "CHAIR01" : role === "secretary" ? "SEC01" : `MEMBER${String(index).padStart(2, "0")}`,
  name: "",
  email: "",
  role,
  appointmentReference: "",
});

function roleLabel(role: string) {
  return role === "chair" ? "위원장" : role === "secretary" ? "간사" : "위원";
}

export function CommitteeCompositionManager({ authenticated, getAccessToken, onChange, onMessage, onRequestLogin }: Props) {
  const [items, setItems] = useState<CommitteeComposition[]>([]);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<{ composition: CommitteeComposition; member: CompositionMember } | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [committeeType, setCommitteeType] = useState("운영위원회");
  const [termStart, setTermStart] = useState(`${currentYear}-01-01`);
  const [termEnd, setTermEnd] = useState(`${currentYear + 1}-12-31`);
  const [members, setMembers] = useState<MemberDraft[]>([newMember(1, "chair"), newMember(1), newMember(1, "secretary")]);
  const [replacement, setReplacement] = useState({ memberCode: "", name: "", email: "", role: "member" as CompositionMember["role"], effectiveFrom: new Date().toISOString().slice(0, 10), appointmentReference: "", changeReason: "" });

  const load = useCallback(async () => {
    if (!authenticated) { setItems([]); onChange([]); return; }
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch("/api/committee-compositions", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "위원회 구성을 불러오지 못했습니다.");
    const next = payload.data ?? [];
    setItems(next); onChange(next);
  }, [authenticated, getAccessToken, onChange]);

  useEffect(() => {
    if (!authenticated) return;
    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const response = await fetch("/api/committee-compositions", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "위원회 구성을 불러오지 못했습니다.");
        const next = payload.data ?? [];
        setItems(next); onChange(next);
      } catch (error) { onMessage(error instanceof Error ? error.message : "위원회 구성을 불러오지 못했습니다."); }
    })();
  }, [authenticated, getAccessToken, onChange, onMessage]);

  const updateMember = (index: number, key: keyof MemberDraft, value: string) => setMembers((current) => current.map((member, memberIndex) => memberIndex === index ? { ...member, [key]: value } as MemberDraft : member));

  async function createComposition(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("관리자 로그인이 필요합니다.");
      const response = await fetch("/api/committee-compositions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code, name, committeeType, termStart, termEnd, members }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "위원회 구성을 등록하지 못했습니다.");
      await load(); setShowCreate(false); setCode(""); setName("");
      onMessage("임기와 위원 명단을 위원회 구성으로 등록했습니다.");
    } catch (error) { onMessage(error instanceof Error ? error.message : "위원회 구성을 등록하지 못했습니다."); }
    finally { setBusy(false); }
  }

  function openReplacement(composition: CommitteeComposition, member: CompositionMember) {
    setReplaceTarget({ composition, member });
    setReplacement({ memberCode: member.member_code, name: "", email: "", role: member.role, effectiveFrom: new Date().toISOString().slice(0, 10), appointmentReference: "", changeReason: "" });
  }

  async function replaceMember(event: FormEvent) {
    event.preventDefault(); if (!replaceTarget) return; setBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("관리자 로그인이 필요합니다.");
      const response = await fetch(`/api/committee-compositions/${replaceTarget.composition.id}/members`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "replace", previousMemberId: replaceTarget.member.id, ...replacement }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "위원 변경을 처리하지 못했습니다.");
      await load(); setReplaceTarget(null); onMessage("기존 위원의 임기를 종료하고 후임 위원을 등록했습니다.");
    } catch (error) { onMessage(error instanceof Error ? error.message : "위원 변경을 처리하지 못했습니다."); }
    finally { setBusy(false); }
  }

  return <>
    <article className="composition-panel">
      <div className="committee-panel-head"><div><h2>위원회 구성</h2><p>임기별 명단을 한 번 등록하고 운영 회차에서 불러옵니다.</p></div><button className="panel-primary" onClick={() => authenticated ? setShowCreate(true) : onRequestLogin()}><Plus size={15} />구성 등록</button></div>
      {!authenticated ? <div className="composition-empty"><Users size={22} /><strong>관리자 로그인 후 구성 명단을 관리할 수 있습니다.</strong></div> : items.length === 0 ? <div className="composition-empty"><Users size={22} /><strong>등록된 위원회 구성이 없습니다.</strong><span>먼저 1~2년 임기와 위원 명단을 등록하세요.</span></div> : <div className="composition-grid">{items.map((item) => {
        const activeMembers = item.members.filter((member) => member.status === "active" && !member.valid_to);
        const historyCount = item.members.length - activeMembers.length;
        return <section className="composition-card" key={item.id}><div className="composition-card-head"><div><small>{item.code} · {item.committee_type}</small><strong>{item.name}</strong></div><em>{item.status === "active" ? "임기 중" : item.status === "closed" ? "임기 종료" : "작성 중"}</em></div><div className="composition-term"><CalendarRange size={14} />{item.term_start} ~ {item.term_end}<span>{activeMembers.length}명</span></div><div className="composition-members">{activeMembers.map((member) => <div key={member.id}><span className={`member-role ${member.role}`}>{roleLabel(member.role)}</span><strong>{member.name}</strong><small>{member.member_code}{member.appointment_reference ? ` · ${member.appointment_reference}` : ""}</small><button title={`${member.name} 위원 변경`} onClick={() => openReplacement(item, member)}><UserRoundCog size={14} /></button></div>)}</div>{historyCount > 0 && <div className="composition-history"><History size={13} />인사변경 이력 {historyCount}건 보존</div>}</section>;
      })}</div>}
    </article>

    {showCreate && <div className="committee-modal-backdrop"><div className="committee-modal composition-modal" role="dialog" aria-modal="true" aria-labelledby="composition-create-title"><div className="modal-head"><div><small>COMMITTEE COMPOSITION</small><h2 id="composition-create-title">위원회 구성 등록</h2></div><button aria-label="닫기" onClick={() => setShowCreate(false)}><X size={20} /></button></div><form onSubmit={createComposition}><fieldset><legend>1. 구성과 임기</legend><div className="form-grid"><label><span>구성 코드</span><input required pattern="[A-Za-z0-9_-]{2,32}" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="OPS-2026-27" /></label><label><span>위원회 종류</span><select value={committeeType} onChange={(event) => setCommitteeType(event.target.value)}><option>운영위원회</option><option>심의위원회</option><option>평가위원회</option><option>선정위원회</option><option>기타</option></select></label><label className="wide"><span>구성명</span><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="제12기 산학협력단 운영위원회" /></label><label><span>임기 시작일</span><input required type="date" value={termStart} onChange={(event) => setTermStart(event.target.value)} /></label><label><span>임기 종료일</span><input required type="date" value={termEnd} onChange={(event) => setTermEnd(event.target.value)} /></label></div></fieldset><fieldset><legend>2. 위원 명단</legend><p className="field-help">보안코드는 운영 회차를 만들 때 별도로 설정합니다.</p>{members.map((member, index) => <div className="composition-member-row" key={index}><select aria-label="위원 역할" value={member.role} onChange={(event) => updateMember(index, "role", event.target.value)}><option value="chair">위원장</option><option value="member">위원</option><option value="secretary">간사</option></select><input required aria-label="위원 코드" value={member.memberCode} onChange={(event) => updateMember(index, "memberCode", event.target.value.toUpperCase())} placeholder="위원 코드" /><input required aria-label="위원 이름" value={member.name} onChange={(event) => updateMember(index, "name", event.target.value)} placeholder="성명" /><input aria-label="이메일" type="email" value={member.email} onChange={(event) => updateMember(index, "email", event.target.value)} placeholder="이메일(선택)" /><input aria-label="임명 근거" value={member.appointmentReference} onChange={(event) => updateMember(index, "appointmentReference", event.target.value)} placeholder="인사명령·위촉 근거" />{members.length > 1 && <button type="button" aria-label="위원 삭제" onClick={() => setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))}><X size={15} /></button>}</div>)}<button type="button" className="add-row" onClick={() => setMembers((current) => [...current, newMember(current.length + 1)])}><Plus size={14} />위원 추가</button></fieldset><div className="modal-actions"><button type="button" onClick={() => setShowCreate(false)}>취소</button><button className="primary" disabled={busy}>{busy ? <Loader2 className="spin" size={17} /> : <Users size={17} />}구성 명단 등록</button></div></form></div></div>}

    {replaceTarget && <div className="committee-modal-backdrop"><div className="admin-login-modal replacement-modal" role="dialog" aria-modal="true" aria-labelledby="member-replace-title"><button className="admin-login-close" aria-label="닫기" onClick={() => setReplaceTarget(null)}><X size={19} /></button><span className="login-lock"><RefreshCw size={22} /></span><small>PERSONNEL CHANGE</small><h2 id="member-replace-title">위원 인사변경</h2><p><strong>{replaceTarget.member.name}</strong> 위원의 임기를 종료하고 후임자를 등록합니다.</p><form onSubmit={replaceMember}><label><span>변경 적용일</span><input required type="date" value={replacement.effectiveFrom} onChange={(event) => setReplacement((current) => ({ ...current, effectiveFrom: event.target.value }))} /></label><label><span>후임 위원 성명</span><input required value={replacement.name} onChange={(event) => setReplacement((current) => ({ ...current, name: event.target.value }))} /></label><label><span>위원 코드</span><input required value={replacement.memberCode} onChange={(event) => setReplacement((current) => ({ ...current, memberCode: event.target.value.toUpperCase() }))} /></label><label><span>역할</span><select value={replacement.role} onChange={(event) => setReplacement((current) => ({ ...current, role: event.target.value as CompositionMember["role"] }))}><option value="chair">위원장</option><option value="member">위원</option><option value="secretary">간사</option></select></label><label><span>이메일</span><input type="email" value={replacement.email} onChange={(event) => setReplacement((current) => ({ ...current, email: event.target.value }))} /></label><label><span>인사명령·위촉 근거</span><input value={replacement.appointmentReference} onChange={(event) => setReplacement((current) => ({ ...current, appointmentReference: event.target.value }))} /></label><label><span>변경 사유</span><input required value={replacement.changeReason} onChange={(event) => setReplacement((current) => ({ ...current, changeReason: event.target.value }))} /></label><button disabled={busy}>{busy ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}위원 변경 확정</button></form></div></div>}
  </>;
}
