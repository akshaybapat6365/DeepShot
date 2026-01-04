# Project Rules

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

## Documentation loop (always-on)
- Every change requires an entry in [changelog.md](changelog.md).
- Every new or updated task must be reflected in [taskslist.md](taskslist.md).
- Keep [readme.md](readme.md) current for scope or architecture changes.
- Keep [agent.md](agent.md) short and accurate for quick onboarding.

## Change hygiene
- Do not delete historical protocols or logs.
- New protocol creation is additive and must not overwrite prior schedules.
- Schedule generation must be deterministic based on interval and start or most recent injection.
