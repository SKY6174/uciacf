"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Network,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { OrgMap } from "./org-map";

type Icon = typeof LayoutDashboard;

const NAV_ITEMS: Array<{ label: string; icon: Icon; badge?: string }> = [
  { label: "통합 IR 대시보드", icon: LayoutDashboard },
  { label: "조직·사업 맵", icon: Network },
  { label: "성과지표", icon: Target, badge: "3" },
  { label: "예산·재정", icon: CircleDollarSign },
  { label: "연구·산학협력", icon: Building2 },
  { label: "회의·위원회", icon: Users },
  { label: "일정·마감", icon: CalendarDays, badge: "5" },
  { label: "문서·규정", icon: FileText },
];

const ORG_DATA = [
  { name: "국책사업단", budget: 126, spent: 94, rate: 74.6 },
  { name: "기업인재교육본부", budget: 98, spent: 69, rate: 70.4 },
  { name: "산학기획·지원", budget: 83, spent: 54, rate: 65.1 },
  { name: "부속기관", budget: 71, spent: 43, rate: 60.6 },
  { name: "학교기업", budget: 57, spent: 31, rate: 54.4 },
];

const RISK_ITEMS = [
  {
    level: "위험",
    type: "예산",
    title: "AID전환중점전문대학지원사업단",
    detail: "집행률 41.8% · 계획 대비 18.2%p 미달",
    due: "조치기한 D-5",
    tone: "danger",
  },
  {
    level: "주의",
    type: "성과",
    title: "가족회사 신규 협약 KPI",
    detail: "목표 120개사 중 78개사 · 근거 2건 미검증",
    due: "갱신 D-3",
    tone: "warning",
  },
  {
    level: "주의",
    type: "일정",
    title: "RISE사업단 중간실적 보고",
    detail: "필수 첨부문서 4건 중 3건 등록",
    due: "마감 D-8",
    tone: "warning",
  },
];

const UPCOMING = [
  { day: "24", month: "7월", title: "산학협력단 운영위원회", meta: "14:00 · 본관 2층 회의실", tone: "blue" },
  { day: "28", month: "7월", title: "부트캠프 사업비 정산", meta: "첨부 8/9 · 산학지원팀", tone: "orange" },
  { day: "31", month: "7월", title: "월간 KPI 실적 제출", meta: "미제출 3개 조직", tone: "red" },
];

const HEATMAP = [
  { org: "산학기획팀", values: [94, 88, 102, 91] },
  { org: "산학지원팀", values: [87, 76, 93, 84] },
  { org: "기업인재교육본부", values: [96, 91, 82, 89] },
  { org: "국책사업단", values: [78, 86, 91, 74] },
];

const EVIDENCE = [
  { title: "2026년 7월 예산집행 현황", owner: "산학지원팀", time: "오늘 09:42", status: "검증완료" },
  { title: "핵심성과지표 월간 실적표", owner: "산학기획팀", time: "어제 17:10", status: "검증대기" },
  { title: "RISE사업단 협약 변경서", owner: "RISE사업단", time: "7월 19일", status: "검증완료" },
];

const FILTER_FACTORS: Record<string, number> = { "2026": 1, "2025": 0.92, "2024": 0.84 };

function formatMoney(value: number) {
  return `${value.toFixed(1)}억`;
}

function heatClass(value: number) {
  if (value >= 95) return "heat heat-good";
  if (value >= 85) return "heat heat-steady";
  if (value >= 75) return "heat heat-watch";
  return "heat heat-risk";
}

function NavItem({ item, active, onClick }: { item: (typeof NAV_ITEMS)[number]; active: boolean; onClick: () => void }) {
  const ItemIcon = item.icon;
  return (
    <button className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      <ItemIcon size={19} strokeWidth={1.9} aria-hidden="true" />
      <span>{item.label}</span>
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </button>
  );
}

export function DashboardShell() {
  const [activeTab, setActiveTab] = useState("통합 IR 대시보드");
  const [year, setYear] = useState("2026");
  const [organization, setOrganization] = useState("전체 조직");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tableView, setTableView] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const factor = FILTER_FACTORS[year];
  const summary = useMemo(
    () => ({
      budget: 584.2 * factor,
      spent: 399.6 * factor,
      execution: year === "2026" ? 68.4 : year === "2025" ? 71.2 : 66.8,
      kpi: year === "2026" ? 86.2 : year === "2025" ? 83.7 : 79.4,
    }),
    [factor, year],
  );

  function runSync() {
    setSyncing(true);
    window.setTimeout(() => setSyncing(false), 900);
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="scrim" aria-label="메뉴 닫기" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="brand-row">
          <div className="uc-mark" aria-label="UC">UC</div>
          <div className="brand-copy">
            <strong>산학협력단</strong>
            <span>통합 성과관리</span>
          </div>
          <button className="sidebar-close" aria-label="메뉴 닫기" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav aria-label="주요 메뉴">
          <p className="nav-label">OVERVIEW</p>
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavItem
              key={item.label}
              item={item}
              active={item.label === activeTab}
              onClick={() => {
                setActiveTab(item.label);
                setSidebarOpen(false);
              }}
            />
          ))}
          <p className="nav-label nav-section">WORKSPACE</p>
          {NAV_ITEMS.slice(4).map((item) => (
            <NavItem
              key={item.label}
              item={item}
              active={item.label === activeTab}
              onClick={() => {
                setActiveTab(item.label);
                setSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item"><Settings size={19} /><span>데이터 관리</span></button>
          <button className="nav-item"><HelpCircle size={19} /><span>도움말</span></button>
          <div className="environment-note">
            <span className="env-dot" />
            <div><strong>데모 데이터</strong><span>운영자료 미연결</span></div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" aria-label="메뉴 열기" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
            <div className="search-box">
              <Search size={18} aria-hidden="true" />
              <input aria-label="통합 검색" placeholder="조직, 사업, 지표, 문서 검색" />
              <kbd>⌘ K</kbd>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="sync-button" onClick={runSync} disabled={syncing}>
              <RefreshCw size={17} className={syncing ? "spin" : ""} />
              <span>{syncing ? "동기화 중" : "데이터 동기화"}</span>
            </button>
            <button className="icon-button has-dot" aria-label="알림 3개"><Bell size={19} /></button>
            <div className="profile">
              <div className="avatar">김</div>
              <div className="profile-copy"><strong>김산학 단장</strong><span>Executive</span></div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <main>
          {activeTab === "통합 IR 대시보드" && (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow"><span>EXECUTIVE OVERVIEW</span><span className="demo-chip">합성 데이터</span></div>
                  <h1>통합 IR 대시보드</h1>
                  <p>{organization}의 예산·성과·위험 신호를 한눈에 확인하세요.</p>
                </div>
                <div className="filters" aria-label="대시보드 필터">
                  <label><span>회계연도</span><select value={year} onChange={(event) => setYear(event.target.value)}><option>2026</option><option>2025</option><option>2024</option></select></label>
                  <label><span>기준월</span><select defaultValue="7월"><option>7월</option><option>6월</option><option>5월</option></select></label>
                  <label className="org-filter"><span>조직</span><select value={organization} onChange={(event) => setOrganization(event.target.value)}><option>전체 조직</option><option>산학기획팀</option><option>산학지원팀</option><option>국책사업단</option></select></label>
                </div>
              </section>

              <section className="decision-brief" aria-label="오늘의 의사결정 브리핑">
                <div className="brief-icon"><Gauge size={23} /></div>
                <div className="brief-copy">
                  <span>오늘의 의사결정 포인트</span>
                  <strong>집행 지연 2개 사업과 미검증 KPI 3건을 우선 확인하세요.</strong>
                </div>
                <div className="brief-stats"><span><b>4</b> 위험 신호</span><span><b>3</b> 검증 대기</span></div>
                <button>상세 브리핑 <ArrowRight size={16} /></button>
              </section>

              <section className="metric-grid" aria-label="핵심 성과 지표">
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon blue"><CircleDollarSign size={20} /></span><span className="verified"><ShieldCheck size={13} /> 검증완료</span></div>
                  <p>총 조정예산</p><h2>{formatMoney(summary.budget)}</h2>
                  <div className="metric-foot"><span className="positive"><TrendingUp size={14} /> 전년 대비 8.4%</span><span>기준 2026.07.20</span></div>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon violet"><BarChart3 size={20} /></span><span className="verified"><ShieldCheck size={13} /> 검증완료</span></div>
                  <p>누적 집행률</p><h2>{summary.execution.toFixed(1)}<small>%</small></h2>
                  <div className="progress-line"><span style={{ width: `${summary.execution}%` }} /></div>
                  <div className="metric-foot"><span>집행 {formatMoney(summary.spent)}</span><span>계획 대비 -2.1%p</span></div>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon green"><Target size={20} /></span><span className="pending"><Clock3 size={13} /> 3건 대기</span></div>
                  <p>핵심 KPI 종합 달성률</p><h2>{summary.kpi.toFixed(1)}<small>%</small></h2>
                  <div className="metric-foot"><span className="positive"><TrendingUp size={14} /> 전월 대비 3.7%p</span><span>18개 지표</span></div>
                </article>
                <article className="metric-card risk-card">
                  <div className="metric-top"><span className="metric-icon coral"><AlertTriangle size={20} /></span><span className="risk-pill">확인 필요</span></div>
                  <p>개입 필요 사업</p><h2>4<small>건</small></h2>
                  <div className="metric-foot"><span>위험 1 · 주의 3</span><button>목록 보기 <ChevronRight size={14} /></button></div>
                </article>
              </section>

              <section className="content-grid top-grid">
                <article className="panel finance-panel">
                  <div className="panel-head">
                    <div><p className="panel-kicker">FINANCE</p><h3>조직별 예산 집행 현황</h3><span>단위: 억원 · 조정예산 대비 누적 집행</span></div>
                    <div className="view-switch" aria-label="표시 방식"><button className={!tableView ? "active" : ""} onClick={() => setTableView(false)}>차트</button><button className={tableView ? "active" : ""} onClick={() => setTableView(true)}>표</button></div>
                  </div>
                  {tableView ? (
                    <div className="table-wrap"><table><thead><tr><th>조직</th><th>조정예산</th><th>집행액</th><th>집행률</th></tr></thead><tbody>{ORG_DATA.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.budget.toFixed(1)}억</td><td>{item.spent.toFixed(1)}억</td><td><span className={item.rate < 60 ? "rate-risk" : ""}>{item.rate}%</span></td></tr>)}</tbody></table></div>
                  ) : (
                    <div className="bar-chart" role="img" aria-label="조직별 예산과 집행액 비교 막대차트">
                      <div className="chart-legend"><span><i className="legend-budget" /> 조정예산</span><span><i className="legend-spent" /> 집행액</span></div>
                      {ORG_DATA.map((item) => (
                        <div className="bar-row" key={item.name}>
                          <span className="bar-label">{item.name}</span>
                          <div className="bars"><div className="budget-bar" style={{ width: `${(item.budget / 130) * 100}%` }}><span>{item.budget}</span></div><div className="spent-bar" style={{ width: `${(item.spent / 130) * 100}%` }}><span>{item.spent}</span></div></div>
                          <strong className={item.rate < 60 ? "rate-risk" : ""}>{item.rate}%</strong>
                        </div>
                      ))}
                      <div className="axis"><span>0</span><span>30</span><span>60</span><span>90</span><span>120</span></div>
                    </div>
                  )}
                  <button className="panel-link">예산·재정 상세 보기 <ArrowRight size={15} /></button>
                </article>

                <article className="panel funding-panel">
                  <div className="panel-head"><div><p className="panel-kicker">PORTFOLIO</p><h3>재원 구성</h3><span>총 {formatMoney(summary.budget)}</span></div><button className="more-button" aria-label="재원 구성 상세">•••</button></div>
                  <div className="donut-wrap">
                    <div className="donut" role="img" aria-label="국고 48%, 지자체 24%, 교비 17%, 자체 11%"><div><strong>48%</strong><span>국고</span></div></div>
                  </div>
                  <div className="fund-list">
                    <div><span><i className="fund national" />국고</span><strong>280.4억 <small>48%</small></strong></div>
                    <div><span><i className="fund local" />지자체</span><strong>140.2억 <small>24%</small></strong></div>
                    <div><span><i className="fund school" />교비</span><strong>99.3억 <small>17%</small></strong></div>
                    <div><span><i className="fund own" />자체</span><strong>64.3억 <small>11%</small></strong></div>
                  </div>
                </article>
              </section>

              <section className="content-grid lower-grid">
                <article className="panel risk-panel">
                  <div className="panel-head"><div><p className="panel-kicker red">ATTENTION QUEUE</p><h3>우선 확인이 필요한 항목</h3><span>위험도와 마감 임박 순</span></div><button className="filter-button">전체 7건 <ChevronDown size={14} /></button></div>
                  <div className="risk-list">
                    {RISK_ITEMS.map((item) => (
                      <button className="risk-item" key={item.title}>
                        <span className={`severity ${item.tone}`}><AlertTriangle size={17} /></span>
                        <span className="risk-copy"><span><b className={item.tone}>{item.level}</b><em>{item.type}</em></span><strong>{item.title}</strong><small>{item.detail}</small></span>
                        <span className="risk-due">{item.due}<ChevronRight size={16} /></span>
                      </button>
                    ))}
                  </div>
                  <button className="panel-link">주의 항목 전체 보기 <ArrowRight size={15} /></button>
                </article>

                <article className="panel schedule-panel">
                  <div className="panel-head"><div><p className="panel-kicker">SCHEDULE</p><h3>다가오는 주요 일정</h3><span>향후 14일</span></div><button className="calendar-button"><CalendarDays size={16} /> 캘린더</button></div>
                  <div className="schedule-list">
                    {UPCOMING.map((item) => <div className="schedule-item" key={item.title}><div className={`date-box ${item.tone}`}><strong>{item.day}</strong><span>{item.month}</span></div><div><strong>{item.title}</strong><span>{item.meta}</span></div><ChevronRight size={17} /></div>)}
                  </div>
                  <button className="panel-link">전체 일정 보기 <ArrowRight size={15} /></button>
                </article>
              </section>

              <section className="content-grid bottom-grid">
                <article className="panel heatmap-panel">
                  <div className="panel-head"><div><p className="panel-kicker">PERFORMANCE</p><h3>조직 × 핵심지표 달성률</h3><span>셀을 선택하면 원천 실적까지 이동합니다.</span></div><div className="heat-legend"><span><i className="heat-good" />95%+</span><span><i className="heat-watch" />75~84%</span><span><i className="heat-risk" />75% 미만</span></div></div>
                  <div className="heat-table" role="table" aria-label="조직별 핵심지표 달성률">
                    <div className="heat-row heat-header" role="row"><span role="columnheader">조직</span><span>산학수익</span><span>신규수주</span><span>기술이전</span><span>교육성과</span></div>
                    {HEATMAP.map((row) => <div className="heat-row" role="row" key={row.org}><strong role="rowheader">{row.org}</strong>{row.values.map((value, index) => <button className={heatClass(value)} key={`${row.org}-${index}`} aria-label={`${row.org} ${value}%`}>{value}%</button>)}</div>)}
                  </div>
                </article>

                <article className="panel evidence-panel">
                  <div className="panel-head"><div><p className="panel-kicker">EVIDENCE</p><h3>최근 갱신 근거</h3><span>수치와 연결된 최신 문서</span></div><FileCheck2 size={20} className="head-icon" /></div>
                  <div className="evidence-list">
                    {EVIDENCE.map((item) => <button key={item.title}><span className="doc-icon"><FileText size={17} /></span><span><strong>{item.title}</strong><small>{item.owner} · {item.time}</small></span><em className={item.status === "검증완료" ? "done" : "waiting"}>{item.status === "검증완료" && <Check size={12} />}{item.status}</em></button>)}
                  </div>
                  <button className="panel-link">문서·근거 전체 보기 <ArrowRight size={15} /></button>
                </article>
              </section>

              <footer><span>최종 데이터 갱신 2026.07.21 09:42</span><span>모든 값은 화면 설계용 합성 데이터입니다.</span></footer>
            </>
          )}

          {activeTab === "조직·사업 맵" && <OrgMap />}

          {activeTab !== "통합 IR 대시보드" && activeTab !== "조직·사업 맵" && (
            <div className="empty-tab-state">
              <h2>{activeTab}</h2>
              <p>해당 서비스는 준비 중입니다.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
