# Antigravity 개발 안내

이 저장소는 Google Antigravity IDE와 CLI에서 Codex와 동일한 설계·보안 원칙으로 개발할 수 있도록 구성되어 있습니다.

## 준비된 Antigravity 구성

- Workspace Rule: `.agents/rules/uc-iacf-project.md`
- Workspace Workflow: `.agents/workflows/continue-uc-dashboard.md`
- Project Skill: `.agents/skills/uc-industry-dashboard/SKILL.md`
- 공통 프로젝트 지침: `AGENTS.md`
- 설계 진입점: `DESIGN.md`

Antigravity는 `.agents/rules/`, `.agents/workflows/`, `.agents/skills/`를 프로젝트 범위 설정으로 인식합니다. 저장소 루트를 workspace로 열어야 이 구성이 적용됩니다.

## Antigravity IDE에서 시작

터미널에서 저장소 루트를 엽니다.

```bash
cd /Users/thomas/Documents/UC-IACF
agy-ide .
```

Antigravity IDE의 Agent 패널에서 다음 순서로 확인합니다.

1. `...` → `Customizations` → `Rules`에서 `uc-iacf-project` 규칙 확인
2. 새 대화에서 `이 프로젝트에 설치된 skill과 적용할 rule을 알려줘`라고 요청
3. `/continue-uc-dashboard` workflow를 실행하거나 아래 시작 프롬프트 사용

권장 시작 프롬프트:

```text
uc-industry-dashboard skill과 workspace rule을 적용해 현재 PDCA 및 Gap Analysis를 읽고,
다음 구현 우선순위를 제안해줘. 운영 데이터와 원격 환경은 변경하지 마.
```

## Antigravity CLI에서 시작

저장소 루트에서 대화형 세션을 엽니다.

```bash
cd /Users/thomas/Documents/UC-IACF
agy -i
```

권한을 자동 승인하는 `--dangerously-skip-permissions`는 사용하지 않습니다. 터미널·브라우저·원격 서비스 변경은 검토 기반으로 승인합니다.

## 로컬 애플리케이션 실행

```bash
npm ci
npm run dev
```

기본 개발 주소는 `http://localhost:3000`입니다.

검증 명령:

```bash
npm run typecheck
npm run lint
npm run build
```

## 프로젝트 기준 문서

작업 전 반드시 다음 순서로 읽습니다.

1. `AGENTS.md`
2. `DESIGN.md`
3. `docs/01-plan/features/uc-industry-cooperation-dashboard.plan.md`
4. `docs/02-design/features/uc-industry-cooperation-dashboard.design.md`
5. `docs/03-analysis/uc-industry-cooperation-dashboard.analysis.md`
6. `.agents/skills/uc-industry-dashboard/SKILL.md`

## 현재 구현 범위

- 단장용 통합 IR 홈 UI
- 합성 데이터 기반 예산·집행·KPI·위험·일정·근거 패널
- 반응형 레이아웃과 차트의 표 대체 보기
- GitHub → Vercel 자동 배포
- Vercel Production의 Supabase 공개 연결값

아직 구현하지 않은 주요 범위는 Supabase Auth, 프로필·멤버십, 조직 범위 RLS, 실제 스키마와 집계 View/RPC, 상세 드릴다운, 입력·검증 워크플로입니다. 실제 운영 데이터를 사용하기 전 상세 설계의 구현 착수 게이트를 승인해야 합니다.

## 환경과 보안

- `.env*`는 Git에 포함하지 않습니다.
- Supabase `service_role` 또는 secret key를 클라이언트 코드에 넣지 않습니다.
- 로컬과 Vercel Preview는 운영 Supabase를 사용하지 않습니다.
- 데이터베이스 변경은 `supabase/migrations/`의 migration으로 관리합니다.
- Git push, Vercel 배포, 원격 DB 변경은 사용자 요청이 있을 때만 수행합니다.

## 유용한 요청 예시

```text
/continue-uc-dashboard
```

```text
상세 설계와 Gap Analysis를 기준으로 Supabase Auth, profiles, memberships와 RLS 테스트를 설계해줘.
구현 착수 게이트에서 승인되지 않은 항목은 코드로 만들지 말고 먼저 목록으로 알려줘.
```

```text
현재 통합 IR 홈을 검토하고 기준일, 검증상태, 근거 추적, 모바일 접근성의 설계 불일치를 찾아줘.
코드는 수정하지 마.
```
