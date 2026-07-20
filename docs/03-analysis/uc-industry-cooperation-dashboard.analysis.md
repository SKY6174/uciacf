# Gap Analysis: uc-industry-cooperation-dashboard

> Date: 2026-07-21 | Design: `docs/02-design/features/uc-industry-cooperation-dashboard.design.md`

---

## Match Rate: 38%

설계의 전체 구현 범위를 24개 기능 묶음으로 나누어 확인했으며, 이번 작업에서 9개 항목을 프런트엔드 시제품 수준으로 구현했다. 현재 결과물은 단장용 통합 IR 홈의 정보구조와 반응형 시각 설계를 검증하기 위한 합성 데이터 UI다. 운영 데이터, 인증, RLS, 저장소, 반입 기능은 구현 착수 게이트 승인 전이므로 연결하지 않았다.

## Implemented Items

- [x] Next.js App Router, TypeScript 기반 프로젝트 구성
- [x] UC 블루 중심의 라이트 대시보드 디자인 시스템
- [x] 고정 사이드바, 전역 검색, 사용자·동기화 도구
- [x] 회계연도·기준월·조직 전역 필터 UI
- [x] 총예산·집행률·KPI·위험사업 핵심 카드
- [x] 기준일, 검증상태, 데이터 최신성 표시
- [x] 조직별 예산·집행 비교와 차트/표 대체 보기
- [x] 재원구성, 주의 큐, 일정, KPI 히트맵, 최근 근거 패널
- [x] 데스크톱·태블릿·모바일 반응형 및 키보드 포커스 처리

## Missing Items

- [ ] Supabase Auth와 사용자 프로필
- [ ] 역할·조직 범위 기반 RLS 및 직접 API 권한 테스트
- [ ] 조직·사업·기간·예산·지표 스키마와 migration
- [ ] 서버 컴포넌트 기반 실제 조회 및 집계 View/RPC
- [ ] 조직·사업 상세와 전역 필터 유지 드릴다운
- [ ] 지표 입력·제출·검증 워크플로
- [ ] 회의·위원회·일정·문서 상세 기능
- [ ] Storage 서명 URL과 문서 보안등급 정책
- [ ] CSV/XLSX 반입·검증·롤백·오류 리포트
- [ ] 감사 로그와 민감 변경 추적
- [ ] 접근성 자동 검사 및 대표 사용자 E2E
- [ ] 개발·스테이징·운영 Supabase 분리
- [ ] 성능·백업·복구·운영 관측성 검증
- [ ] 공식 조직·역할·지표·회계 규칙 승인 데이터
- [ ] 실제 UC 브랜드 자산과 공식 명칭 검수

## Changed Items (Deviations from Design)

- [x] 차트 라이브러리 대신 가벼운 CSS 막대·도넛 시각화를 사용했다. 데이터 테이블 대체 보기를 함께 제공해 접근성 계약은 유지했다.
- [x] 운영 연결 전 UI 검증을 위해 모든 값에 합성 데이터임을 명시했다.
- [x] 실제 UC 로고 파일이 없어 텍스트 기반 임시 `UC` 마크를 사용했다.

## Verification

- TypeScript: 통과
- ESLint: 통과
- Production build: 통과 (`next build --webpack`)
- Static route: `/` 생성 확인
- Runtime smoke: 핵심 제목·합성 데이터 고지·예산 패널 노출 확인
- Social preview: `/og.png` HTTP 200 확인

## Recommendations

1. 최신 공식 조직도, 역할 범위, 핵심지표 사전과 환경 분리 방식을 먼저 승인한다.
2. 다음 구현은 Supabase Auth → 프로필·멤버십 → 조직 RLS 테스트 순서로 진행한다.
3. 실제 데이터 연동 전에 현재 합성 데이터 화면을 단장·실무자와 검토해 정보 우선순위를 확정한다.

## Next Steps

- [ ] 구현 착수 게이트 정책 승인
- [ ] Supabase 개발/스테이징 프로젝트 연결
- [ ] 인증·조직·멤버십·RLS 구현
- [ ] 실제 집계 API 연결 후 Gap Analysis 재실행
