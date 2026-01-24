# Diagnosis

## Issues (evidence-linked)
1) **Small supporting typography in core panels**
   - Severity: High
   - Evidence: `app-dashboard-month-desktop-1440.png` metrics show body text 10px; `app-cycle-sidebar-desktop-1440.png` heading 10px; `app-cycle-sidebar-mobile-390.png` heading 10px.
   - User impact: Key labels are hard to scan, especially in dense panels.
   - Acceptance test: Supporting labels and section headers are ≥12px (mobile) and ≥13px (desktop) across dashboard panels.

2) **Dashboard container exceeds viewport height**
   - Severity: Medium
   - Evidence: `app-dashboard-month-desktop-1440.png` container height 1134 vs viewport 1073 (density ratio 1.05685); same for `app-dashboard-week-desktop-1440.png`.
   - User impact: Content may overflow or require scrolling even when the viewport appears full.
   - Acceptance test: Container height ≤ viewport height on desktop (density ratio ≤1.0).

3) **Mobile protocol dialog CTA is below the initial viewport**
   - Severity: High
   - Evidence: `app-protocol-dialog-mobile-390.png` CTA top 1282.41 with viewport height 844.
   - User impact: Users may miss the primary action without scrolling.
   - Acceptance test: Primary CTA is visible within the initial viewport on mobile.

4) **Notifications dialog occupies minimal area on desktop**
   - Severity: Low
   - Evidence: `app-notifications-dialog-desktop-1440.png` density ratio 0.04737.
   - User impact: The dialog feels lightweight relative to the rest of the UI, reducing perceived importance.
   - Acceptance test: Notification dialog density ratio ≥0.12 on desktop or includes additional context.

5) **Blood work panel sits low in the viewport**
   - Severity: Medium
   - Evidence: `app-bloodwork-panel-desktop-1440.png` top offset 851; `app-bloodwork-panel-mobile-390.png` top offset 325.
   - User impact: The panel is easy to miss during quick scans.
   - Acceptance test: Blood work panel top offset ≤650 on desktop in default view or surfaced via a summary card.

6) **Desktop CTA heights vary widely and can be small**
   - Severity: Medium
   - Evidence: `app-notifications-dialog-desktop-1440.png` CTA height 28; `app-bloodwork-panel-desktop-1440.png` CTA height 28; `app-dashboard-month-desktop-1440.png` header CTA height 32.
   - User impact: Small click targets reduce confidence and accessibility.
   - Acceptance test: Primary CTAs are ≥32px height in desktop views and consistent across panels.

7) **Mobile drawers start far below the top edge**
   - Severity: Medium
   - Evidence: `app-cycle-list-dialog-mobile-390.png` top offset 275; `app-settings-dialog-mobile-390.png` top offset 281; `app-notifications-dialog-mobile-390.png` top offset 648.
   - User impact: Less content fits above the fold and dialogs feel detached from the header.
   - Acceptance test: Drawer top offset ≤120 for primary dialogs on mobile.

8) **Blood work dialog lacks visible descriptive body text**
   - Severity: Low
   - Evidence: `app-bloodwork-dialog-desktop-1440.png` and `app-bloodwork-dialog-mobile-390.png` body font size not detected (null).
   - User impact: Reduced clarity for first-time users logging labs.
   - Acceptance test: Dialog includes a visible helper line (≥12px) describing required inputs.

9) **Calendar panel relies on very small stats text**
   - Severity: Low
   - Evidence: `app-dashboard-month-desktop-1440.png` body font size 10px; `app-dashboard-week-desktop-1440.png` body font size 10px.
   - User impact: Logged/scheduled summaries are easy to overlook.
   - Acceptance test: Month stats text ≥12px with clearer contrast.

10) **Mobile dialogs are near full-screen, reducing spatial hierarchy**
   - Severity: Medium
   - Evidence: `app-injection-dialog-mobile-390.png` density ratio 0.88270; `app-protocol-dialog-mobile-390.png` density ratio 0.89999.
   - User impact: Dialogs feel like new pages, which can obscure context.
   - Acceptance test: Mobile dialog density ratio ≤0.85 or includes visible header context showing underlying page.

## Cross-cutting Themes
1) **Typography scale skewed small in dense panels**
   - Evidence: `app-cycle-sidebar-desktop-1440.png` heading 10px; `app-bloodwork-panel-desktop-1440.png` heading 12px; `app-dashboard-month-desktop-1440.png` body 10px.
2) **Content density/overflow in the desktop dashboard**
   - Evidence: `app-dashboard-month-desktop-1440.png` density ratio 1.05685; `app-dashboard-week-desktop-1440.png` density ratio 1.05685.
3) **Mobile dialogs consume most of the viewport**
   - Evidence: `app-injection-dialog-mobile-390.png` ratio 0.88270; `app-protocol-dialog-mobile-390.png` ratio 0.89999.
4) **CTA sizing and placement varies across surfaces**
   - Evidence: desktop CTA heights range 28–36px (`app-notifications-dialog-desktop-1440.png`, `app-injection-dialog-desktop-1440.png`); header CTA at y=10 vs dialog CTA at y=757 (`app-dashboard-month-desktop-1440.png`, `app-injection-dialog-desktop-1440.png`).
5) **Lower-priority panels sit low in the viewport**
   - Evidence: `app-bloodwork-panel-desktop-1440.png` top offset 851; `app-bloodwork-panel-mobile-390.png` top offset 325.
6) **Dialogs/drawers with large top offsets reduce usable space**
   - Evidence: `app-cycle-list-dialog-mobile-390.png` top offset 275; `app-notifications-dialog-mobile-390.png` top offset 648.

## Severity/Priority
- **P0 (must fix):**
  - Small typography in core panels (Issue 1).
  - Mobile protocol dialog CTA below fold (Issue 3).
- **P1:**
  - Desktop dashboard overflow (Issue 2).
  - Mobile dialogs occupying most of viewport (Issue 10).
  - Mobile drawer top offsets too large (Issue 7).
- **P2:**
  - Notifications dialog under-scaled (Issue 4).
  - Blood work panel visibility (Issue 5).
  - CTA height consistency (Issue 6).
  - Missing helper text in blood work dialog (Issue 8).
  - Small calendar stats text (Issue 9).

## Acceptance Tests
- Dashboard panels maintain body text ≥12px and headers ≥13px (desktop) / ≥12px (mobile).
- Calendar container density ratio ≤1.0 on desktop default view.
- Mobile protocol dialog CTA visible within initial viewport without scrolling.
- Mobile drawer top offset ≤120 for primary dialogs.
- Desktop primary CTA height ≥32px across dialogs/panels.
- Blood work dialog contains visible helper text (≥12px).
