# Changelog

## Update policy
- Add an entry for every material change.
- Use date-stamped headings in YYYY-MM-DD format.
- Keep entries short and link to related tasks when relevant.

## 2026-01-21
- Phase 1 UI Redesign: Calendar cells now larger (min 52px mobile, 72px desktop) with visible dose, status labels, and active layer indicators.
- Added weekly view toggle in CalendarHeader for detailed 7-day view with larger date cards.
- Created WeeklyCalendarGrid component with week navigation and prominent day cards.
- Improved day selection panel in CycleSidebar with status badges, dose summary, and richer log display.
- Fixed accessibility: increased muted-foreground contrast, added ARIA labels to calendar cells, focus-visible rings.
- Added CSS utility classes for has-logs and is-scheduled calendar states.
- All calendar cells now have proper aria-label, aria-pressed, and aria-current attributes.
- Phase 2 Insights Panel: Added expandable insights with streak tracking (current/best/total), 6-week activity heatmap, and weekly/monthly comparison charts.
- Enhanced InjectionHeatmap to display GitHub-style grid with weekday labels and proper week alignment.
- Added streakData calculation to useInsightsData hook (current streak, longest streak, total injections).
- InsightsPanel now collapsible with expand/collapse toggle to show full analytics.
- Phase 3 Settings: Created SettingsDialog with user profile display, timezone selector, and sign-out button.
- Added useUserSettings hook for real-time user settings sync from Firestore.
- Added updateUserSettings function to firestore.ts for persisting settings changes.
- Replaced logout button in AppHeader with settings icon; logout moved to Settings dialog.
- Phase 4 Onboarding: Created 4-step OnboardingWizard with animated transitions for new users.
- Improved SignedOutScreen with feature preview cards (Schedule, Insights, Private) and enhanced branding.
- Improved NoActiveCycleScreen with step-by-step setup preview and better visual hierarchy.
- Added useOnboarding hook using useSyncExternalStore for localStorage-based onboarding state.
- Phase 5 Notifications: Created NotificationCenter with upcoming, missed, and streak notifications.
- Added notification bell with badge count to AppHeader.
- Created useNotifications hook to compute notification count based on schedule and adherence.
- Notifications include "Log Now" quick action for injections due today.
- Phase 6 Data Export: Added JSON and CSV export functionality in Settings dialog.
- Created export.ts with exportToJSON, exportToCSV, and downloadFile utilities.
- JSON export includes full protocol and injection history; CSV export focuses on injection log.
- Phase 7 PWA: Added Progressive Web App support with service worker and install prompt.
- Configured vite-plugin-pwa with workbox for offline caching of static assets and Google Fonts.
- Added manifest.json with app metadata, theme colors, and icon configuration.
- Updated index.html with meta tags for iOS standalone mode and theme color.
- Created InstallPrompt component with "Add to Home Screen" banner for supported browsers.
- Phase 8 Blood Work Tracking: Added comprehensive blood work logging and visualization.
- Created useBloodWork hook with Firestore real-time sync for lab results.
- Added addBloodWork, updateBloodWork, deleteBloodWork functions to firestore.ts.
- Created BloodWorkDialog for logging Total T, Free T, E2, SHBG, Hematocrit, PSA.
- Created BloodWorkPanel with latest values, trend indicators, line charts, and recent entries.
- Integrated blood work into InsightsPanel with add/edit/delete functionality.

## 2026-01-19
- Rebuilt the left column to house active-cycle metrics and removed the header stat strip to reclaim calendar height.
- Added focus-active toggle plus a horizontal cycle chip row; inactive cycles dim but remain visible.
- Improved calendar readability with larger day/dose text, clearer status chips, and consistent Past labeling for elapsed scheduled days.
- Strengthened active-vs-inactive hierarchy (rails, glows, opacity) and reduced calendar clipping via scrollable main layout.
- Swapped typography to Barlow Condensed/Barlow, refined OLED palette + glass depth, and refreshed protocol theme colors.
- Updated design-system docs to reflect the new palette/typography and calendar overrides.
- Added mobile bottom navigation, Vaul bottom-sheet dialogs, and pull-to-refresh with 44px touch targets.
- Introduced an Insights panel with dosage trend, adherence ring, heatmap, and weekly/monthly comparisons.
- Added loading skeletons, view transitions, button/cell motion, celebration confetti, and optimistic injection logging.
- Refactored dashboard layout with reusable CalendarPanel/DashboardContent and new protocol/metric hooks.

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
