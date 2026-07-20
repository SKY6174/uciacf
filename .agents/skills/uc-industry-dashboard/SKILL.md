---
name: uc-industry-dashboard
description: Design, implement, review, or extend the 울산과학대학교 산학협력단 통합 성과관리 대시보드. Use for requests involving its organization tree, executive IR dashboard, budgets and execution, KPI definitions and results, programs, research/industry cooperation, meetings, schedules, documents, Supabase schema/RLS/auth/storage, data imports, or Vercel deployment.
---

# UC 산학협력단 대시보드

Treat the approved design document as the source of truth. In the project, read `DESIGN.md` and the linked detailed design before planning or editing implementation files.

## Workflow

1. Identify whether the request changes requirements, data, UI, security, or deployment.
2. Read the relevant design sections and inspect the current implementation.
3. Stop and surface any conflict with an unapproved item in the implementation gate.
4. Make the smallest coherent change that preserves traceability from summary values to source evidence.
5. Validate types, database migrations, RLS, accessibility, and the affected user journey.
6. Update the design or an ADR when a structural decision changes.

## Non-negotiable rules

- Preserve organization and target history; do not overwrite prior-period meaning.
- Store money in KRW won as integers. Convert only for presentation.
- Store each metric's definition, unit, direction, formula, cadence, owner, source, and thresholds.
- Show period, as-of date, freshness, and verification state with every decision-critical value.
- Enforce access with Supabase RLS and Storage policies. UI visibility is not authorization.
- Never expose the Supabase service-role key to browser code.
- Recheck authorization in server actions and route handlers.
- Record sensitive mutations in an append-only audit trail.
- Do not put production data in Vercel Preview or local development.
- Validate spreadsheet imports before merging and protect exports against CSV formula injection.

## Domain model

Use these stable concepts:

- Organization: a time-bounded hierarchy node such as a team, center, school enterprise, headquarters, or program office.
- Program: a funded initiative or operational project owned by one organization and optionally involving others.
- Period: a fiscal or program year/month used consistently across targets and financial snapshots.
- Metric definition: the canonical business meaning and calculation rule.
- Metric assignment: a metric attached to an organization or program with local weight and thresholds.
- Metric value: a dated, sourced, versioned, and verified observation.
- Document link: evidence or reference connected to one or more domain objects.
- Alert: an explainable snapshot of a breached threshold, overdue item, or stale datum.

Prefer normalized transactional tables plus reviewed SQL views/RPCs for dashboard aggregates. Do not duplicate business formulas in React components.

## UX contract

- Follow the sequence `executive summary → exception → comparison → detail → evidence`.
- Preserve global period and organization filters during drill-down.
- Use the established light UC dashboard language: neutral background, bordered rounded cards, UC blue for selection, green for normal, orange for caution, and red/pink for risk.
- Pair status colors with text or icons and provide a table alternative for charts.
- Keep dense editing workflows separate from the executive overview.
- Make the desktop meeting-room experience primary; keep key cards usable on tablet and mobile.

## Implementation order

1. Confirm glossary, official organization codes, roles, metric catalog, and financial period rules.
2. Establish Next.js, Supabase, Vercel environments, migrations, and CI.
3. Implement authentication, profiles, organization memberships, and RLS tests.
4. Add periods, programs, finance, metrics, and approved seed data.
5. Build aggregate queries and the executive IR dashboard.
6. Add organization/program drill-down and the mixed business explorer.
7. Add submission, verification, meetings, schedules, documents, imports, and audit views.
8. Verify security boundaries, accessibility, performance, backup, and recovery.

## Verification checklist

- Test every role against allowed and forbidden organizations by direct database/API access.
- Trace each home-card value to the underlying rows and evidence.
- Verify zero, null, negative, over-100%, revised-target, and closed-period cases.
- Verify organization changes do not alter historical reports.
- Verify Storage signed URLs and confidential-document permissions.
- Verify import rollback, duplicate detection, error reporting, and audit entries.
- Verify Vercel Preview uses non-production Supabase resources.
- Run build, typecheck, lint, focused tests, RLS tests, and key E2E journeys.

## Completion criteria

Do not call the feature complete until the design-to-code gap is reviewed, critical RLS paths pass, all executive values expose provenance and freshness, and the core executive/manager/editor scenarios work end to end.
