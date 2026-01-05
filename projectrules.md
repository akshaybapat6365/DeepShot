# Project Rules

> ## ⛔ MANDATORY: [AGENT_ENFORCEMENT.md](AGENT_ENFORCEMENT.md)
> **All agents MUST read and comply with the enforcement protocol before starting work.**
> **This is non-negotiable. Violations trigger immediate consequences.**

---

## Scope rules
- Primary goal: track TRT injections, compute dosage, and show schedules.
- Must support multiple protocols with history preserved.
- Calendar shows scheduled injections and logged injections with clear visual distinction.

## Data and auth
- Require login before any personal data access.
- Persist data via Firebase Auth + Cloud Firestore.
- Host via Firebase Hosting.
- Store computed `doseMg` on injection logs for stability.
- Enforce per-user access in `firestore.rules`.

## Frontend stack
- React + TypeScript + Vite (SPA) only.
- Tailwind CSS + shadcn/ui with lucide icons.
- Default to dark mode by setting `html` class to `dark`.
- Use shadcn Calendar (react-day-picker) unless advanced features require FullCalendar.

## UI requirements
- Cycle management dashboard sits beside a live calendar for realtime feedback.
- Calendar supports multi-cycle layered visualization with clear hierarchy.
- Day cells show date, dose, and status indicator.
- Calendar is the primary visual focus: large cells, bold typography, clear contrast.
- Layout must scale cleanly from phone to desktop without hiding calendar detail.
- Protocol presets must include ED, EOD, E2D, and E3D.
- Deletions must be recoverable via trash/restore.

## Documentation loop (always-on)
- Every change requires an entry in [changelog.md](changelog.md).
- Every new or updated task must be reflected in [taskslist.md](taskslist.md).
- Keep [readme.md](readme.md) current for scope or architecture changes.
- Keep [agent.md](agent.md) short and accurate for quick onboarding.

## Change hygiene
- Do not delete historical protocols or logs.
- New protocol creation is additive and must not overwrite prior schedules.
- Schedule generation must be deterministic based on interval and start or most recent injection.
