# DeepShot - Agent Notes

## Mandatory preflight
- Read `~/Projects/agent-scripts/AGENTS.MD` before anything else (skip if missing).
- Read `AGENT_ENFORCEMENT.md` before any action.

## Summary
- DeepShot = TRT cycle + injection tracking with a bold, layered calendar.
- Core outputs: mg per injection, mg per week, next shot, upcoming schedule.

## Stack
- React + TypeScript + Vite (SPA)
- Tailwind CSS + shadcn/ui, lucide icons, dark mode default
- Firebase Hosting + Auth + Firestore

## UI intent
- Bold, aggressive, high-contrast UI with depth and layered hierarchy.
- Cycle management dashboard + live calendar side-by-side.
- Calendar shows multi-cycle layers, logged shots, scheduled shots, and today.
- Each day cell shows date, dose, status, and layered color bars.
- Calendar is the primary visual focus with large, readable cells.
- DeepShot icon branding should appear in favicon + key UI surfaces.

## Cycle rules
- Multiple cycles visible at once with per-cycle theme colors.
- Cycle start date can be in the past or present.
- Cycle end date is user-defined; schedule stops at end date.
- Restarting creates a new cycle; history remains visible.
- Soft delete only; trash + restore for protocols and injections.

## Firestore schema (extended)
- users/{uid}/protocols/{protocolId}
  - name, startDate, endDate|null, intervalDays, doseMl, concentrationMgPerMl
  - isActive, themeKey, isTrashed, trashedAt, notes, createdAt, updatedAt
- users/{uid}/injections/{injectionId}
  - protocolId, date, doseMl, concentrationMgPerMl, doseMg
  - isTrashed, trashedAt, notes, createdAt, updatedAt

## Design system notes
- Theme accents: amber + sky (multi-theme via `protocolThemes`).
- Use layered shadows, rounded corners, and bold typography (Space Grotesk).
- Avoid generic UI grids, weak contrast, or low-visibility calendars.

## Documentation loop
- Update `changelog.md` for every material change.
- Keep `taskslist.md`, `readme.md`, `projectrules.md` aligned.
