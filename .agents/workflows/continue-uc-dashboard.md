# Continue UC-IACF dashboard development

Continue the `uc-industry-cooperation-dashboard` feature using the repository's approved design and current implementation state.

## 1. Recover context

- Read `AGENTS.md`, `DESIGN.md`, the linked plan and detailed design.
- Load `.agents/skills/uc-industry-dashboard/SKILL.md`.
- Read `docs/.pdca-status.json` and the newest `docs/03-analysis/*.analysis.md`.
- Inspect `git status`, recent commits, `package.json`, and only the source files relevant to the request.

## 2. Establish the safe scope

- Restate the requested outcome and classify it as UI, data, authorization, deployment, or documentation.
- Check the detailed design's implementation gate.
- Use synthetic data unless the user confirms that all required operational-data policies are approved.
- If the task changes architecture, schema, roles, RLS, Storage, or environments, update the design or add an ADR in the same change.

## 3. Implement

- Preserve the established UC visual language and information flow.
- Keep values traceable to period, as-of date, freshness, verification status, and evidence.
- Keep privileged secrets server-only and enforce access in Supabase RLS/Storage.
- Make focused changes and do not alter unrelated user work.

## 4. Verify

Run the applicable commands:

```bash
npm run typecheck
npm run lint
npm run build
```

For database work, validate migrations and allowed/forbidden role-by-organization cases. For UI work, verify responsive behavior, keyboard access, readable status labels, and table alternatives for charts.

## 5. Hand off

- Summarize the implemented outcome, validation results, remaining design gaps, and next safe action.
- Update the Gap Analysis when the implementation scope materially changes.
- Commit, push, deploy, or mutate remote services only when the user's request explicitly includes that action.

