# Changelog

## Update policy
- Add an entry for every material change.
- Use date-stamped headings in YYYY-MM-DD format.
- Keep entries short and link to related tasks when relevant.

## 2026-01-03
- Initialized project docs: [agent.md](agent.md), [projectrules.md](projectrules.md), [readme.md](readme.md), [taskslist.md](taskslist.md), [changelog.md](changelog.md).
- Scaffolded Vite app, Tailwind + shadcn/ui setup, Firebase config stub, and initial dashboard/calendar wireframe.
- Wired Firebase Auth + Firestore reads/writes, added log/protocol dialogs, schedule generation, and Firebase Hosting/rules config.
- Renamed the app to DeepShot in the UI and docs.
- Deployed Firestore rules and Hosting for the DeepShot project.
- Documented `updatedAt` fields in the Firestore schema.
- Initialized a git repository and pushed a private GitHub repo `DeepShot`.

## 2026-01-04
- Started calendar redesign for a full-screen 7-column grid with header-only controls and larger day cells.
- Audited project files and synced docs for the upcoming full-screen calendar refinement and preset cleanup.
- Rebuilt the calendar into a full-viewport 7x6 grid with header-only controls, legend, and selected-day summary.
- Updated protocol presets to ED/EOD/E2D/E3D with distinct selection state and refreshed dialog styling.
- Swapped typography to Space Grotesk and replaced the neon palette with an amber + sky theme.
- Added a doseMg fallback for legacy injection logs without stored totals.
- Reworked the UI into a cycle management dashboard with a layered, theme-aware calendar and soft-delete trash restore.
- Recreated agent notes to align with `~/Projects/agent-scripts/AGENTS.MD`.
- Created new Firebase project `deepshot`, provisioned Firestore, and deployed Hosting to https://deepshot.web.app.
- Added high-resolution JPEG export for the calendar grid.
- Audited the current UI and documented the next design pass for a bolder, calendar-first, branded experience.

## 2026-01-05
- Integrated the DeepShot icon into the favicon and primary branding surfaces.
- Rebalanced the layout to emphasize the calendar with larger day cells, clearer status cues, and a metric strip in the header.
- Enhanced cycle list visuals with stronger hierarchy, dose details, and active-state styling.
- Refined the global background and glass surfaces for deeper contrast.
