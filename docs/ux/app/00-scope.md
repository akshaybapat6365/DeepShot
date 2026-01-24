# Scope

## Goals
- Capture app-wide UI/UX evidence (screenshots + DOM metrics) for authenticated and unauthenticated flows.
- Produce a documented, evidence-linked diagnosis and prioritized backlog for UI/UX improvements.
- Preserve product behavior and data integrity while collecting evidence.

## Non-goals
- Implementing UI changes or redesigning screens.
- Modifying Firestore schemas, migrations, or data exports.
- Reworking authentication or onboarding flows beyond documentation.

## Constraints (no data loss, no schema changes)
- Do not change app code, styling, or dependencies.
- Do not alter Firestore schemas or data records.
- No destructive actions in the UI (e.g., delete protocols or logs).

## In-scope Areas
- Signed-out experience and onboarding overlays.
- Authenticated dashboard (calendar, cycles, insights).
- Core dialogs/drawers (cycle list, injection, protocol, settings, notifications, blood work).
- Mobile navigation and responsive layouts.

## Out-of-scope Areas
- Backend infrastructure, Firebase rules, or deployment config.
- Analytics/telemetry instrumentation.
- PWA install/update flows beyond documentation.

## Success Criteria
- Screen inventory includes all user-visible routes and overlays with file references.
- Evidence pack includes ≥10 screens with desktop + mobile screenshots and metrics.
- Diagnosis links every issue to evidence (screenshot/metrics or file path + lines).
- Commit captured with required message and summary.
