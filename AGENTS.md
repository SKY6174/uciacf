# UC-IACF 프로젝트 지침

## 구현 기준

- 작업 전 루트의 `DESIGN.md`와 연결된 계획·상세 설계 문서를 읽는다.
- 산학협력단 대시보드 작업에는 `.agents/skills/uc-industry-dashboard/SKILL.md`를 적용한다.
- 구조, 데이터 모델, 권한 또는 배포 결정이 달라지면 구현과 함께 설계 문서를 갱신한다.
- 운영데이터를 사용하기 전에 상세 설계서의 구현 착수 게이트를 승인받는다.

## 보안

- `.env*`, 비밀키, 개인정보, 운영 데이터 덤프를 커밋하지 않는다.
- Supabase `service_role` 키를 브라우저 코드에 노출하지 않는다.
- 업무 데이터 권한은 UI가 아니라 Supabase RLS와 Storage 정책으로 집행한다.
- Vercel Preview와 로컬 환경은 운영 Supabase 프로젝트를 사용하지 않는다.

## 검증

- 변경 범위에 맞춰 build, typecheck, lint, 테스트를 실행한다.
- 데이터베이스 변경은 migration으로 관리하고 역할·조직별 RLS 테스트를 포함한다.
- 대시보드의 주요 수치는 기준일, 검증상태, 원천 근거까지 추적 가능해야 한다.
