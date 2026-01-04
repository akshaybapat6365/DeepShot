# DeepShot - Agent Notes

> ## ⛔ STOP — READ [AGENT_ENFORCEMENT.md](AGENT_ENFORCEMENT.md) FIRST
> **Before doing ANYTHING, you MUST read and comply with the enforcement protocol.**
> **Violations will result in session termination. No exceptions.**

---

## Quick context
- Summary: A web app to track TRT injections, compute mg per injection and mg per week, and show upcoming injection dates on a calendar with history preserved.
- Access: User login required; data persists across sessions and devices.
- Stack: React + TypeScript + Vite (SPA), Tailwind CSS + shadcn/ui, Firebase Hosting + Auth + Firestore.
- UI: Dark mode default; calendar-first view uses shadcn Calendar (react-day-picker) with day-details panel.
- Data: Auth state + Firestore reads/writes wired; log injection and protocol restart dialogs live in the UI.

## Core inputs
- concentration_mg_per_ml: number (variable per vial)
- dose_ml: number
- protocol_interval_days: number (ED, EOD, E2D, E3D, and custom)
- start_date: date
- injection_log_date: date (including today or yesterday)

## Core outputs
- mg_per_injection = dose_ml * concentration_mg_per_ml
- mg_per_week = mg_per_injection * (7 / protocol_interval_days)
- next_injection_date = most recent injection date + interval
- upcoming_schedule_dates = generated sequence for the active protocol

## Scheduling behavior
- Generate future injection dates from the selected interval.
- Allow restarting with a new protocol without deleting history.
- Keep past protocols and injection logs visible alongside the current schedule.

## Documentation loop
- Update [taskslist.md](taskslist.md) for new work, status changes, and blockers.
- Update [changelog.md](changelog.md) for every material change.
- Keep [readme.md](readme.md) and [projectrules.md](projectrules.md) aligned with scope or policy changes.
