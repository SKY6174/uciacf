# 산학협력단 성과관리 페이지 마일스톤 진척 변화 기록

이 파일은 프로젝트의 주요 마일스톤(Milestone)별 목표 진척율 및 일자별 구체적인 구조/설계상의 변화 과정을 누적 추적하는 관리 문서입니다.

---

## 📌 현재 마일스톤 종합 현황

| 마일스톤 명 | 목표 요약 | 시작일 | 목표일 | 현재 진척도 | 상태 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M1. 기초 환경 구성 & DB 연동** | Next.js 초기 셋업, Supabase SDK 연동, 로컬/원격 설정 동기화 | 2026-07-21 | 2026-07-21 | **100%** | **완료** |
| **M2. 위원회 운영 시스템 & 보안 연동** | 위원회 생성, 외부 위원 보안 페이지, PDF 리딩, 심의/서명, 모니터링/AI/보고서 | 2026-07-22 | 2026-07-23 | **100%** | **완료** |
| **M3. 성과 지표 & DB 스키마 설계** | Metric Definitions, Values, Audit Log 테이블 설계 및 마이그레이션 | - | - | **0%** | 대기 |
| **M4. 대시보드 UI & 필터링 시각화** | 대시보드 쉘 화면 구성 및 메트릭 비교 차트 시각화 구현 | - | - | **0%** | 대기 |

---

## 📈 일자별 진척 및 의사결정 기록

### 2026-07-23 (목)

* **마일스톤 M2 (위원회 운영 시스템) 검토 및 완성**:
  * **내용**: 위원회 생성(위원장/위원/간사 구성, PDF전용 Storage 업로드), 외부 위원 보안 페이지(비밀번호 암호화/잠금/HttpOnly 세션), 300초 시큐어 Signed URL PDF 열람, 의안 심의 및 서명 증적 제출, 참여현황 모니터링, AI 종합 분석 및 PDF 결과보고서 자동 생성의 전체 파이프라인을 검토하고 빌드 검증을 마쳤습니다.
  * **산출물**:
    * 데이터베이스 마이그레이션: [`supabase/migrations/202607230001_committee_operations.sql`](file:///Users/thomas/Documents/UC-IACF/supabase/migrations/202607230001_committee_operations.sql)
    * 외부 위원 로그인/워크스페이스: [`app/committee/login/page.tsx`](file:///Users/thomas/Documents/UC-IACF/app/committee/login/page.tsx), [`components/committee/committee-workspace.tsx`](file:///Users/thomas/Documents/UC-IACF/components/committee/committee-workspace.tsx)
    * 관리자 위원회 관리 컴포넌트: [`components/committee/committee-admin.tsx`](file:///Users/thomas/Documents/UC-IACF/components/committee/committee-admin.tsx)
    * API 라우트: [`app/api/committees/route.ts`](file:///Users/thomas/Documents/UC-IACF/app/api/committees/route.ts), [`app/api/committee-member/documents/[id]/open/route.ts`](file:///Users/thomas/Documents/UC-IACF/app/api/committee-member/documents/[id]/open/route.ts) 등 11개 라우트


---

## 📈 일자별 진척 및 의사결정 기록

### 2026-07-21 (화)

* **마일스톤 M1 완료**:
  * **내용**: Next.js 프로젝트 내에 `@supabase/supabase-js` 의존성을 탑재하고, 원격 Supabase 프로젝트 Ref(`tbbdcjqgzoqwddgvywph`)로의 API 호출 주소 및 익명인증키(Anon Key) 연동을 `.env.local` 파일에 주입하였습니다.
  * **산출물**:
    * 환경 변수 파일: [`.env.local`](file:///Users/thomas/Documents/UC-IACF/.env.local) (URL 및 Key 등록)
    * 초기화 유틸리티: [`lib/supabase.ts`](file:///Users/thomas/Documents/UC-IACF/lib/supabase.ts) (인스턴스 생성 완료)
* **개발일기 시스템 인프라 구축**:
  * **의사결정**: 에이전트의 개발 산출물 추적을 극대화하기 위해 매일 밤 11시(23:00)에 작업 내역(Git, Chat)을 모아 개발일기(`daily_events.md`)와 마일스톤 진척 변화(`milestone_progress.md`)를 누적 갱신하는 에이전트 전용 크론 스케줄러를 가동했습니다.
  * **지침 반영**: [`AGENTS.md`](file:///Users/thomas/Documents/UC-IACF/AGENTS.md)의 신규 지침으로 추가 및 등록 완료.
* **조직·사업 맵 화면 설계 및 연결선 정렬**:
  * **의사결정**: 대시보드 내의 탭 전환 기능을 활성화하고, 계층 관계가 한눈에 들어오는 가로/세로 격자 직선 트리를 구축했습니다. 선이 끊어지는 오류를 원천 차단하기 위해 Flexbox 가상 요소 분할 기법을 표준 스타일로 정립했습니다.
  * **산출물**:
    * 조직도 컴포넌트: [`components/org-map.tsx`](file:///Users/thomas/Documents/UC-IACF/components/org-map.tsx)
    * 스타일 정의: [`app/globals.css`](file:///Users/thomas/Documents/UC-IACF/app/globals.css) (직선 정렬 리뉴얼)
* **새로고침 상태 보존 매커니즘 도입**:
  * **의사결정**: 브라우저 새로고침 시 탭 상태 유실을 방지하고 Next.js SSR 환경의 Hydration Mismatch를 막기 위해 클라이언트 마운트 동기화(`localStorage` + `useEffect`) 패턴을 도입하여 UX(사용자 경험)를 극대화했습니다.
* **조직도 2차 레이아웃 및 계층 개선**:
  * **의사결정**: 급식센터 가독성(2줄 개행/가운데점)을 높이고, 동일 범주 하위 센터 간 수직 격자선을 삭제해 상하 종속관계 착시를 방지했으며, 단장-리더 간 여백을 64px로 넓혀 시야를 틔웠습니다. 또한, `국책사업단`을 L2 리더 레벨로 격상하고 점선(Dashed)으로 구조적 명화를 유도했습니다.
* **조직도 3차 정밀 기하학적 튜닝**:
  * **의사결정**: 부단장 카드가 단장 바로 아래에 수직 축 정렬을 형성하도록 L2 구조를 "메인 기둥 및 우측 absolute 분기 스트림" 구조로 전면 리디렉션했습니다. 또한 본부장 산하를 1개 부서로 압축해 1:1 결합화하고, 급식센터 카드들의 패딩을 줄여 높이를 50% 슬림하게 다이어트하였습니다.
