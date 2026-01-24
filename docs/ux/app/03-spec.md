# App-wide UI/UX Refresh Spec (Plan Only)

## 1) Constraints (non-negotiable)
- No data model/schema changes.
- No changes to auth/data flows unless required for UI correctness.
- No new UI frameworks; reuse existing tokens/components (`src/index.css`, `tailwind.config.js`, `src/components/ui/*`).
- Limit refactors; only touch files required by this spec.

## 2) Visual System Contract (objective, enforceable)
**Spacing system (grid/scale)**
- Base unit: 4px.
- Approved spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Section padding: 16–24px (desktop), 12–20px (mobile).
- Gaps between primary blocks: 16–24px desktop; 12–16px mobile.

**Typography scale**
- H1: 24–28px, 600–700 weight, line-height 1.2–1.3.
- H2: 20–22px, 600 weight, line-height 1.25–1.35.
- H3/Panel title: 16–18px, 600 weight, line-height 1.3–1.4.
- Body: 13–14px desktop, 14–15px mobile, line-height 1.45–1.6.
- Supporting text/labels: 12–13px desktop, 12–14px mobile.
- Button text: 13–14px desktop, 14px mobile.

**Elevation/shadow rules**
- Use existing “glass” surfaces + border (no new shadow tokens).
- Elevation levels: 
  - Level 0: background only.
  - Level 1: `glass-card`/`glass-panel` with border `border-white/5`.
  - Level 2 (dialogs): `glass-panel` + border `border-white/10`.

**Surface/background rules**
- Background uses existing app backdrop (no new gradients beyond current tokens).
- Panels/cards use `glass-card` or `glass-panel` classes only.
- Dialogs/drawers use `ResponsiveDialog`/`Drawer` with consistent padding.

**Color usage rules (tokens only)**
- Use `primary`, `accent`, `destructive`, `muted`, `foreground` tokens from Tailwind config.
- No hard-coded hex colors outside existing components; if needed, add token-only variants.

**Component density rules**
- Primary CTAs: height ≥32px desktop, ≥44px mobile.
- Dialog max widths: `sm:max-w-md` (≈448px) for simple dialogs, `sm:max-w-3xl` for cycle list.
- Panel padding: 12–16px (mobile), 16–20px (desktop).
- Calendar cells must keep text ≥12px and avoid truncation at 390 width.

## 3) Component Standardization Plan
**Buttons**
- Inconsistency: desktop CTAs vary 28–36px (`app-notifications-dialog-desktop-1440.png`, `app-bloodwork-panel-desktop-1440.png`) → Diagnosis Issue 6.
- Standard: primary/secondary CTAs ≥32px desktop, ≥44px mobile; consistent `text-sm`/`text-xs` usage.
- Screens affected: dashboard header, dialogs, blood work panel.

**Inputs**
- Inconsistency: form density differs between injection/protocol dialogs (`app-injection-dialog-desktop-1440.png`, `app-protocol-dialog-desktop-1440.png`).
- Standard: input rows use spacing scale (12–16px gaps), label size ≥12px, helper text ≥12px.
- Screens affected: injection, protocol, blood work dialogs.

**Cards/Panels**
- Inconsistency: panel headers and body text run small (`app-cycle-sidebar-desktop-1440.png`, `app-bloodwork-panel-desktop-1440.png`) → Diagnosis Issue 1.
- Standard: panel titles 16–18px, body 13–14px desktop, 14–15px mobile.
- Screens affected: cycle sidebar, insights/blood work panel.

**Badges/Chips**
- Inconsistency: small badge text (10–12px) in cycle sidebar and calendar stats (`app-cycle-sidebar-desktop-1440.png`, `app-dashboard-month-desktop-1440.png`) → Diagnosis Issue 9.
- Standard: badges ≥11px desktop, ≥12px mobile, padding 4–8px.
- Screens affected: cycle sidebar, calendar stats, dialogs.

**Alerts/Errors**
- Inconsistency: notifications dialog feels undersized (`app-notifications-dialog-desktop-1440.png`) → Diagnosis Issue 4.
- Standard: alert cards use consistent padding and icon sizing; dialog density ≥0.12.
- Screens affected: notifications dialog.

**Modals/Drawers**
- Inconsistency: mobile drawers start far below top (`app-cycle-list-dialog-mobile-390.png`, `app-settings-dialog-mobile-390.png`, `app-notifications-dialog-mobile-390.png`) → Diagnosis Issue 7.
- Standard: mobile drawer top offset ≤120px; dialog body begins within top 20% of viewport.
- Screens affected: cycle list, settings, notifications, injection, protocol, blood work dialogs.

**Tables/Lists**
- Inconsistency: cycle list density and label sizes vary (`app-cycle-list-dialog-desktop-1440.png`).
- Standard: list rows use 12–16px vertical padding; label text ≥12px.
- Screens affected: cycle list dialog.

**Calendar Cells**
- Inconsistency: calendar stats and cell labels run at 10px (`app-dashboard-month-desktop-1440.png`) → Diagnosis Issue 9.
- Standard: calendar cell labels ≥12px, scheduled dose text ≥12px on desktop/mobile.
- Screens affected: dashboard month/week views.

## 4) Screen-by-screen Changes (top 10)
1) **Dashboard (Month)**
   - Current issues: Issue 1, Issue 2, Issue 6, Issue 9 (`app-dashboard-month-desktop-1440.png`, `app-dashboard-month-mobile-390.png`).
   - Layout adjustments: reduce header vertical padding; tighten calendar grid margins; constrain container height to viewport.
   - Required states: loading (calendar skeleton), empty (no protocols), error (export failure toast).
   - Responsive: maintain calendar legibility at 390 width with ≥12px labels.
   - Acceptance tests: density ratio ≤1.0 on desktop; body text ≥13px desktop / ≥14px mobile; CTA height ≥32px.

2) **Dashboard (Week)**
   - Current issues: Issue 1, Issue 2, Issue 9 (`app-dashboard-week-desktop-1440.png`, `app-dashboard-week-mobile-390.png`).
   - Layout adjustments: align week header and stats; ensure week cards use consistent padding.
   - Required states: loading (week skeleton), empty (no scheduled injections).
   - Responsive: maintain week grid readability at 390 width.
   - Acceptance tests: density ratio ≤1.0; labels ≥12px; CTA height ≥32px.

3) **Cycle Sidebar**
   - Current issues: Issue 1, Issue 6 (`app-cycle-sidebar-desktop-1440.png`, `app-cycle-sidebar-mobile-390.png`).
   - Layout adjustments: increase section header sizes; align CTA heights; normalize card spacing.
   - Required states: no inactive cycles, no logs (schedule-only badge).
   - Responsive: keep sidebar padding 12–16px on mobile.
   - Acceptance tests: panel title ≥16px, badge text ≥11px, CTA height ≥32px desktop/≥44px mobile.

4) **Blood Work Panel**
   - Current issues: Issue 1, Issue 5, Issue 6 (`app-bloodwork-panel-desktop-1440.png`, `app-bloodwork-panel-mobile-390.png`).
   - Layout adjustments: elevate summary card above fold; align with insights header spacing.
   - Required states: empty (no blood work logged), logged summary.
   - Responsive: keep CTA aligned right but ≥44px on mobile.
   - Acceptance tests: panel top offset ≤650 desktop; CTA height ≥32px desktop/≥44px mobile.

5) **Cycle List Dialog**
   - Current issues: Issue 7 (`app-cycle-list-dialog-mobile-390.png`), density on desktop.
   - Layout adjustments: reduce drawer top offset; standardize list row padding.
   - Required states: empty cycle list (existing empty message).
   - Responsive: drawer top offset ≤120; dialog max width `sm:max-w-3xl`.
   - Acceptance tests: top offset ≤120 mobile; list row padding 12–16px.

6) **Injection Dialog**
   - Current issues: Issue 10 (`app-injection-dialog-mobile-390.png`).
   - Layout adjustments: increase internal spacing consistency; reduce overall dialog height to ≤0.85 density.
   - Required states: edit vs create mode, validation errors.
   - Responsive: CTA visible without scrolling on mobile.
   - Acceptance tests: density ratio ≤0.85; CTA visible at 390×844.

7) **Protocol Dialog**
   - Current issues: Issue 3, Issue 10 (`app-protocol-dialog-mobile-390.png`, `app-protocol-dialog-desktop-1440.png`).
   - Layout adjustments: move primary CTA above fold; group fields into tighter sections.
   - Required states: create vs edit, validation errors.
   - Responsive: CTA within initial viewport on mobile.
   - Acceptance tests: CTA top ≤820 at 390×844; density ratio ≤0.85.

8) **Settings Dialog**
   - Current issues: Issue 7 on mobile (`app-settings-dialog-mobile-390.png`).
   - Layout adjustments: reduce drawer top offset; standardize section spacing.
   - Required states: saving spinner/error toast.
   - Responsive: drawer top offset ≤120; CTA height ≥44px.
   - Acceptance tests: top offset ≤120; CTA height ≥44px mobile.

9) **Notifications Dialog**
   - Current issues: Issue 4, Issue 6, Issue 7 (`app-notifications-dialog-desktop-1440.png`, `app-notifications-dialog-mobile-390.png`).
   - Layout adjustments: increase dialog density; standardize CTA height.
   - Required states: empty (no notifications), list with 1+ items.
   - Responsive: drawer top offset ≤120; CTA ≥44px.
   - Acceptance tests: density ratio ≥0.12 desktop; CTA height ≥32px desktop/≥44px mobile.

10) **Blood Work Dialog**
   - Current issues: Issue 8 (`app-bloodwork-dialog-desktop-1440.png`, `app-bloodwork-dialog-mobile-390.png`).
   - Layout adjustments: add helper copy; align input spacing with injection/protocol dialogs.
   - Required states: validation errors, edit mode.
   - Responsive: CTA visible without scrolling; helper text ≥12px.
   - Acceptance tests: helper text detected ≥12px; CTA visible at 390×844.

## 5) Implementation Plan (phased, low-risk)
**Phase 1: Foundations (tokens/components/rules)**
- Expected files: `src/index.css`, `tailwind.config.js`, `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/drawer.tsx`, `src/components/ui/responsive-dialog.tsx`, `src/components/ui/badge.tsx` (if present), `src/components/ui/input.tsx` (if present).
- Verification: `npm run lint`, `npm run build`, capture baseline screenshots (same list as Step 3).
- Rollback: `git revert` phase commit(s) or reset to `66b89dc` tag/commit.

**Phase 2: Core workflow screens**
- Expected files: `src/components/calendar/*`, `src/components/cycles/CycleSidebar.tsx`, `src/components/layout/DashboardContent.tsx`, `src/components/insights/InsightsPanel.tsx`.
- Verification: lint/build + updated screenshots for dashboard month/week, cycle sidebar, blood work panel.
- Rollback: revert phase commits; keep Phase 1 intact if needed.

**Phase 3: Dialogs + states + accessibility**
- Expected files: `src/components/InjectionDialog.tsx`, `src/components/ProtocolDialog.tsx`, `src/components/SettingsDialog.tsx`, `src/components/NotificationCenter.tsx`, `src/components/BloodWorkDialog.tsx`, `src/components/CycleListDialog.tsx`.
- Verification: lint/build + dialog screenshots (desktop/mobile). Optional a11y checks if tooling available.
- Rollback: revert phase commits in reverse order.

## 6) Verification Protocol (repeatable)
- Required commands: `npm run lint`, `npm run build`.
- Required screenshots (before/after, same viewports 1440/390):
  - Dashboard month/week, cycle sidebar, blood work panel, cycle list dialog, settings dialog, notifications dialog, injection dialog, protocol dialog, blood work dialog.
- Optional: Lighthouse/a11y checks if CLI is available.
- Done criteria:
  - All acceptance tests in Section 4 pass.
  - No lint/build errors.
  - Screenshot diff shows improved hierarchy/density without layout regressions.
