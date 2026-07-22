# Gap Analysis: committee-operations

> Date: 2026-07-23 | Design: `docs/02-design/features/committee-operations.design.md`

## Match Rate: 91% (development/staging scope)

설계 항목 35개를 데이터·보안 12개, 서버/API 10개, 관리자/위원 UX 8개, 분석/보고서 5개로 나누어 확인했다. 32개는 구현되었고 3개는 운영 게이트 또는 기존 인증·조직 기반 기능에 의존한다. 운영 준비 완료율이 아니라 개발/스테이징 MVP의 설계 일치율이다.

## Implemented Items

- [x] 위원회 종류·일정·상태, 위원장/위원/간사, 의안 데이터 모델
- [x] 위원별 보안코드 bcrypt 해시(`pgcrypto.crypt`), 5회 실패 잠금
- [x] 12시간 HttpOnly/SameSite 위원 세션과 토큰 SHA-256 해시 저장
- [x] private `meeting_docs`, PDF MIME·확장자·매직바이트·20MB 검증
- [x] 위원/위원회/문서 IDOR 재검증 후 300초 signed URL 발급
- [x] 문서 열람 횟수·최초/최종 시각 추적과 감사로그
- [x] 의안별 찬성/반대/기권, 임시저장, 최종제출 잠금
- [x] 필수 의안 완료 후 일반 전자서명과 제출 스냅샷·IP/UA 해시
- [x] 관리자 생성 UI, PDF 업로드, 위원회 목록·진행률
- [x] 개인별 미접속/접속/열람/심의/서명 참여현황과 의안별 집계
- [x] 위원 전용 로그인, 의안 탐색, 인앱 PDF 리더, 심의·서명 UX
- [x] 비식별 집계 기반 규칙 분석과 선택적 OpenAI Responses API 분석
- [x] 공급자/모델/프롬프트 버전/입력 digest/근거 저장
- [x] 한글 A4 결과보고서 PDF 생성, private Storage 저장, 단기 다운로드 URL
- [x] 한글 글꼴·페이지·잘림을 Poppler PNG 렌더링으로 확인
- [x] 설계/계획/환경변수 예시와 Vercel 파일 추적 설정
- [x] ESLint, TypeScript, Webpack production build, HTTP smoke 통과

## Remaining / Operational Gate

- [ ] 실제 Supabase 프로젝트에 migration 적용 및 pgTAP RLS 테스트 실행: 연결 프로젝트가 개발/스테이징인지 확인할 환경 매핑과 DB 자격증명이 없어 원격 변경하지 않음.
- [ ] 기존 `profiles/memberships/organizations`가 아직 구현되지 않아 관리자 권한은 현재 위원회 `created_by` 소유자 기준. 조직 역할 기반 관리 권한은 기반 인증 모듈과 통합 필요.
- [ ] 분석 `reviewed/approved/rejected` 승인 UI와 기존 보고서 버전 목록 다운로드 UI는 후속 운영 화면으로 남음. 생성·저장 데이터/API는 구현됨.

## Deviations

- 결과 PDF의 CJK 부분 글꼴 임베딩에서 누락 글리프가 확인되어 전체 Noto Sans CJK KR을 임베딩한다. PDF 크기는 약 13MB이며 20MB 정책 안이다.
- OpenAI 키가 없거나 호출/형식 검증에 실패하면 근거 기반 규칙 요약으로 폴백한다. 원문 PDF·이름·이메일은 AI 입력에 포함하지 않는다.
- 운영 권한정책 미승인 때문에 UI에는 합성 데이터가 남아 있으며 실제 운영 데이터 시드는 추가하지 않았다.

## Verification Evidence

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build -- --webpack`: pass
- Routes: 관리자 5개, 위원 6개, `/committee`, `/committee/login`
- Runtime smoke: `/` 200, `/committee/login` 200, 비인증 workspace 401
- PDF: A4 1 page sample, 13,853,199 bytes, Poppler render visual pass
- `git diff --check`: pass
- Supabase CLI/remote pgTAP: not run (CLI/DB credential and environment approval unavailable)

## Recommendation

1. 연결된 Supabase가 비운영 개발/스테이징임을 확인한 뒤 migration과 `supabase/tests/committee_rls.sql`을 실행한다.
2. 실제 역할·조직 정책 승인 후 `created_by` 소유권을 공통 membership 함수로 교체한다.
3. 운영 전 개인정보 보존, 보안코드 전달, 서명 법적 수준, AI 외부전송을 승인한다.
