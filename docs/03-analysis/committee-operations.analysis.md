# Gap Analysis: committee-operations

> Date: 2026-07-23 | Design: `docs/02-design/features/committee-operations.design.md` v1.1.0

## Match Rate: 100% (10/10)

## Summary

임기별 위원회 구성과 개별 운영 회차를 분리하는 v1.1.0 변경 범위를 설계, migration, API, 관리자 UI에 반영했다. 운영 회차는 개최일 기준 유효 구성원을 조회해 회차별 `committee_members` 스냅샷을 만들므로 이후 인사변경이 과거 심의 증적을 변경하지 않는다.

## Implemented Items

- [x] `committee_compositions` 임기별 구성 마스터
- [x] `committee_composition_members` 유효기간 기반 임명 이력
- [x] 후임자 등록과 기존 위원 종료를 단일 DB 함수로 처리
- [x] 운영 회차의 구성 참조와 구성원 원천 참조
- [x] 개최일 기준 유효 명단 조회 및 회차 스냅샷 복사
- [x] 장기 구성과 분리된 회차별 접근 보안코드
- [x] 구성 조회/등록 및 개별 위원 변경 API
- [x] 구성 관리와 운영 현황을 분리한 관리자 UI
- [x] 구성 생성·위원 교체·회차 생성 감사로그
- [x] 구성/구성원 RLS와 schema 테스트 항목

## Missing Items

- 없음(이번 v1.1.0 변경 범위 기준)

## Changed Items

- 원격 DB에 기존 테이블과 정책은 있었으나 migration 이력이 없어, 최초 migration의 정책 생성부를 재실행 가능하게 보강했다.
- 보안코드는 인사명단 마스터에 저장하지 않고 운영 회차 생성 시 다시 설정하도록 확정했다.

## Verification

- ESLint: 통과
- TypeScript: 통과
- Next.js production build: 통과
- Supabase remote migrations `202607230001`, `202607230002`: 적용 확인
- Vercel Production deployment: Ready
- 공개 화면: `위원회 구성`과 `위원회 운영 현황` 분리 확인
- 비인증 API: 401 JSON 경계 확인
- pgTAP 실행: 테스트 정의는 갱신했으나 로컬 Docker daemon 부재로 실행하지 못함

## Recommendations

1. 운영 전 역할·조직별 RLS 시나리오와 pgTAP을 Docker 사용 가능 환경에서 재실행한다.
2. 실제 위원 개인정보를 입력하기 전에 보존·파기 정책과 운영 Supabase 분리 게이트를 승인한다.

## Next Steps

- [x] 설계와 구현 정합성 확인
- [ ] 운영 데이터 투입 전 보안·개인정보 게이트 승인
