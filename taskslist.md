# Tasks List

## Documentation loop
- Update [changelog.md](changelog.md) for every material change.
- Keep [readme.md](readme.md), [agent.md](agent.md), and [projectrules.md](projectrules.md) aligned with scope and decisions.

## Active
- [ ] QA cycle dashboard + layered calendar on desktop and mobile.

## Next
- [ ] Add profile settings (timezone, default protocol) UI.
- [ ] Add validation for injection edit conflicts (duplicate same-day logs).

## Backlog
- [ ] Notifications or reminders for upcoming injections.
- [ ] Import or export injection history.

## Done
- [x] Confirm tech stack choices (React + TS + Vite, Tailwind + shadcn/ui, shadcn Calendar).
- [x] Define Firestore schema for users, protocols, and injection logs.
- [x] Build initial dashboard and calendar wireframe.
- [x] Wire Firebase Auth state and Firestore reads/writes.
- [x] Build log injection and protocol restart forms.
- [x] Sync schedule generation to active protocol and injection history.
- [x] Populate `.env.local` with Firebase project credentials.
- [x] Deploy Firestore rules and Hosting configuration.
- [x] Initialize project docs and documentation loop.
- [x] Finalize full-screen 7-column calendar grid with large day cells that fill the viewport.
- [x] Consolidate all status, legend, and selected-day details into the header (no sidebar/footer panels).
- [x] Refine protocol presets: ED, EOD, E2D, E3D with clear selection state.
- [x] Refresh typography and palette to avoid neon green/black-heavy styling.
- [x] Build cycle management dashboard with live calendar preview.
- [x] Add cycle themes, optional end dates, and multi-layer calendar rendering.
- [x] Add trash/restore flows for protocols and injections.
- [x] Create Firebase project `deepshot` and deploy Hosting + Firestore rules.
- [x] Add high-resolution JPEG export for the calendar grid.
- [x] Redesign calendar-first layout for bolder hierarchy, larger day cells, and denser info.
- [x] Integrate DeepShot icon branding into favicon and key UI touchpoints.
