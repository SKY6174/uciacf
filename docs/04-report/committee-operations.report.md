# 위원회 운영 시스템 구현 보고서

> 작성일: 2026-07-23 | 범위: 개발/스테이징 MVP | 상태: Code complete, deployment gate pending

## 결과

대시보드의 `회의·위원회` 메뉴에 관리자 워크스페이스를 추가하고, `/committee/login`과 `/committee`에 외부 위원 전용 심의 흐름을 구현했다. Supabase migration, private Storage, 제한 세션, signed URL, 심의/서명, 참여현황, 선택적 AI 분석, 한글 PDF 보고서 생성이 하나의 추적 가능한 흐름으로 연결된다.

## 주요 산출물

- 계획/설계: `docs/01-plan/features/committee-operations.plan.md`, `docs/02-design/features/committee-operations.design.md`
- DB/RLS/Storage: `supabase/migrations/202607230001_committee_operations.sql`
- DB 검증: `supabase/tests/committee_rls.sql`
- 관리자 UI: `components/committee/committee-admin.tsx`
- 위원 UI: `components/committee/committee-workspace.tsx`, `app/committee/*`
- 서버 API: `app/api/committees/**`, `app/api/committee-member/**`
- PDF: `lib/committee/report.ts`, `assets/fonts/NotoSansCJKkr-Regular.otf`
- 환경 설정 예시: `.env.example`
- Gap 분석: `docs/03-analysis/committee-operations.analysis.md`

## 보안 구현

- 접근코드 평문 미보관, bcrypt 해시 비교와 실패 잠금
- 세션 원문은 HttpOnly 쿠키, DB에는 SHA-256 해시만 보관
- PDF public URL 금지, 300초 signed URL만 발급
- PDF MIME/확장자/매직바이트/20MB 동시 검증
- 위원회/위원/의안/문서 소유관계 서버 재검증
- 심의 최종제출 잠금, 서명 스냅샷, append-only 감사 이벤트
- service-role과 OpenAI 키는 서버 환경변수만 사용
- AI에는 이름·이메일·원문 PDF가 아닌 비식별 집계만 전달

## AI 분석

`OPENAI_API_KEY`가 있고 `OPENAI_COMMITTEE_MODEL`이 설정되면 Responses API로 비식별 집계를 분석한다. 기본 모델 예시는 `gpt-5.6-terra`이며, 키가 없거나 호출/JSON 검증에 실패하면 로컬 규칙 요약으로 안전하게 폴백한다. 모든 결과는 공급자, 모델, 프롬프트 버전, 입력 digest, 근거 집계와 함께 저장한다.

## 검증 결과

| 검증 | 결과 |
|---|---|
| ESLint | 통과 |
| TypeScript | 통과 |
| Next.js production build (`--webpack`) | 통과 |
| HTTP smoke | `/` 200, `/committee/login` 200, 비인증 workspace 401 |
| PDF | A4/한글/푸터/잘림 없음, 약 13MB |
| 설계 일치율 | 개발/스테이징 범위 91% |

## 배포 전 실행 순서

1. 연결 Supabase가 운영이 아닌 개발/스테이징 프로젝트인지 확인한다.
2. migration을 적용하고 `supabase/tests/committee_rls.sql`을 실행한다.
3. Vercel에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`를 환경별로 설정한다.
4. AI를 사용할 때만 `OPENAI_API_KEY`, `OPENAI_COMMITTEE_MODEL`을 서버 환경에 추가한다.
5. Supabase Auth 관리자 계정으로 로그인한 후 위원회 생성→PDF 업로드→위원 로그인→열람→심의→서명→분석→보고서를 E2E 확인한다.

## 운영 전 승인 필요

- 위원 개인정보 수집·보존·파기
- 보안코드 전달·재발급·MFA
- 문서 다운로드/인쇄 및 보안등급
- 일반 전자서명과 공인전자서명 요구 수준
- AI 외부전송과 공급자 계약/처리지역
- 공통 조직·멤버십 기반 관리자 권한
