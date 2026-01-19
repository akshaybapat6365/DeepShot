# Changelog

## Update policy
- Add an entry for every material change.
- Use date-stamped headings in YYYY-MM-DD format.
- Keep entries short and link to related tasks when relevant.

## 2026-01-19
- Rebuilt the left column to house active-cycle metrics and removed the header stat strip to reclaim calendar height.
- Added focus-active toggle plus a horizontal cycle chip row; inactive cycles dim but remain visible.
- Improved calendar readability with larger day/dose text, clearer status chips, and consistent Past labeling for elapsed scheduled days.
- Strengthened active-vs-inactive hierarchy (rails, glows, opacity) and reduced calendar clipping via scrollable main layout.
- Swapped typography to Barlow Condensed/Barlow, refined OLED palette + glass depth, and refreshed protocol theme colors.
- Updated design-system docs to reflect the new palette/typography and calendar overrides.

## 2026-01-15
- Fixed Firebase authDomain configuration to use the Firebase app domain (prevents Google redirect URI mismatch).
- Removed runtime authDomain override in the Firebase client init.
- Marked past scheduled days as "Past" in the calendar and selected-day status.
- Cleared lint errors by refactoring protocol/injection hooks and moving button variants to a shared file.
- Updated mobile login flow to attempt popup first, ensure persistence, and fall back to redirect.
- Added a Cycle Library dialog and surfaced active cycle details in the header.
- Added monthly scheduled/logged day counters to the calendar header.
- Added ability to set the active cycle from the Cycle Library and visually de-emphasized inactive cycles.
- Emphasized active-cycle layers in the calendar with stronger markers and tooltips listing cycle names.
- Adjusted cycle list layout to prevent action buttons from overflowing cards.
- Strengthened active-vs-inactive hierarchy in calendar cells and cycle cards; muted past badges.
- Applied UI/UX Pro Max design system guidance (Fira Code/Sans typography + OLED-style palette tweaks) and improved calendar hierarchy labels.
- Deepened UI/UX Pro Max adoption: OLED dark palette, trust blue/orange accents, stronger active cycle signaling, and refined calendar legend colors.

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
- Added mobile-safe auth flow with redirect fallback and clearer sign-in error messaging.
- Forced auth persistence to keep mobile sessions from bouncing back to login.
- Ensured auth persistence resolves before redirect or popup sign-in completes.
- Waited for redirect results before clearing auth loading state.
- Prevented redirect users from being overwritten by the initial null auth state.
- Re-initialized Firebase Auth with explicit persistence fallbacks for mobile Safari.
- Aligned authDomain to the runtime hosting domain and disabled index.html caching.
