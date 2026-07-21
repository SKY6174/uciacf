# 산학협력단 성과관리 페이지 마일스톤 진척 변화 기록

이 파일은 프로젝트의 주요 마일스톤(Milestone)별 목표 진척율 및 일자별 구체적인 구조/설계상의 변화 과정을 누적 추적하는 관리 문서입니다.

---

## 📌 현재 마일스톤 종합 현황

| 마일스톤 명 | 목표 요약 | 시작일 | 목표일 | 현재 진척도 | 상태 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M1. 기초 환경 구성 & DB 연동** | Next.js 초기 셋업, Supabase SDK 연동, 로컬/원격 설정 동기화 | 2026-07-21 | 2026-07-21 | **100%** | **완료** |
| **M2. 사용자 인증 & 권한(RLS) 구축** | Supabase Auth 연동, 역할 정의, DB RLS 및 Storage 정책 검증 | 2026-07-22 | - | **0%** | 대기 |
| **M3. 성과 지표 & DB 스키마 설계** | Metric Definitions, Values, Audit Log 테이블 설계 및 마이그레이션 | - | - | **0%** | 대기 |
| **M4. 대시보드 UI & 필터링 시각화** | 대시보드 쉘 화면 구성 및 메트릭 비교 차트 시각화 구현 | - | - | **0%** | 대기 |

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
