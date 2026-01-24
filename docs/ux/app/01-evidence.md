# Evidence

## Screen Inventory
| Screen name | URL/Route | Entry path (how reached) | Component file path | Notes |
| --- | --- | --- | --- | --- |
| Signed-out (Login) | `/` | Auth gate in `App` when `!user` | `src/App.tsx:451-482` → `src/components/layout/EmptyStates.tsx:1-63` | Renders `SignedOutScreen` with CTA button. |
| Onboarding Wizard | `/` | Auth gate when `user && hasCompletedOnboarding === false && !activeProtocol` | `src/App.tsx:482-487` → `src/components/OnboardingWizard.tsx:1-99` | Full-screen overlay wizard. |
| No Active Cycle | `/` | Auth gate when `user && !activeProtocol` | `src/App.tsx:487-488` → `src/components/layout/EmptyStates.tsx:65-127` | Prompts to create first cycle. |
| Dashboard (Calendar + Cycles + Insights) | `/` | Auth gate when `user && activeProtocol` | `src/App.tsx:489-497` → `src/components/layout/DashboardContent.tsx:1-62` | Desktop grid or mobile tabbed views. |
| Calendar Panel (Month/Week) | `/` | Dashboard content | `src/components/calendar/CalendarPanel.tsx:1-131` | Switches between month grid and weekly grid. |
| Cycles Sidebar | `/` | Dashboard content | `src/components/cycles/CycleSidebar.tsx:1-200` | Active cycle card, other cycles, selected day. |
| Insights Panel | `/` | Dashboard content | `src/components/insights/InsightsPanel.tsx` (export at line 24) | Analytics + blood work panel. |
| Mobile Navigation | `/` | Auth gate when `isMobile && user && activeProtocol` | `src/App.tsx:502-504` → `src/components/layout/MobileNav.tsx` | Bottom tab switcher. |
| Cycle List Dialog | `/` | Triggered by header cycles button | `src/App.tsx:506-517` → `src/components/CycleListDialog.tsx` (export at line 48) | Overlay dialog. |
| Injection Dialog | `/` | Triggered by Log actions | `src/App.tsx:519-533` → `src/components/InjectionDialog.tsx` (export at line 51) | Overlay dialog. |
| Protocol Dialog | `/` | Triggered by New/Edit cycle actions | `src/App.tsx:535-544` → `src/components/ProtocolDialog.tsx` (export at line 62) | Overlay dialog. |
| Settings Dialog | `/` | Triggered by settings icon | `src/App.tsx:546-555` → `src/components/SettingsDialog.tsx:1-200` | Overlay dialog (drawer on mobile). |
| Notification Center | `/` | Triggered by bell icon | `src/App.tsx:557-566` → `src/components/NotificationCenter.tsx:1-200` | Overlay dialog (drawer on mobile). |
| Blood Work Dialog | `/` | Triggered by Insights panel | `src/App.tsx:568-573` → `src/components/BloodWorkDialog.tsx` (export at line 29) | Overlay dialog. |
| Install Prompt | `/` | PWA prompt when installable | `src/App.tsx:575` → `src/components/InstallPrompt.tsx` | Floating banner. |

## Screenshot Index
| Screen | Desktop (1440) | Mobile (390) | Notes |
| --- | --- | --- | --- |
| Dashboard (Month) | `app-dashboard-month-desktop-1440.png` | `app-dashboard-month-mobile-390.png` | Calendar month view. |
| Dashboard (Week) | `app-dashboard-week-desktop-1440.png` | `app-dashboard-week-mobile-390.png` | Calendar week view. |
| Cycle List Dialog | `app-cycle-list-dialog-desktop-1440.png` | `app-cycle-list-dialog-mobile-390.png` | Dialog/drawer state. |
| Settings Dialog | `app-settings-dialog-desktop-1440.png` | `app-settings-dialog-mobile-390.png` | Dialog/drawer state. |
| Notifications Dialog | `app-notifications-dialog-desktop-1440.png` | `app-notifications-dialog-mobile-390.png` | Dialog/drawer state. |
| Injection Dialog | `app-injection-dialog-desktop-1440.png` | `app-injection-dialog-mobile-390.png` | Dialog/drawer state. |
| Protocol Dialog | `app-protocol-dialog-desktop-1440.png` | `app-protocol-dialog-mobile-390.png` | Dialog/drawer state. |
| Blood Work Dialog | `app-bloodwork-dialog-desktop-1440.png` | `app-bloodwork-dialog-mobile-390.png` | Dialog/drawer state. |
| Blood Work Panel | `app-bloodwork-panel-desktop-1440.png` | `app-bloodwork-panel-mobile-390.png` | Panel/empty state (“No blood work logged”). |
| Cycle Sidebar | `app-cycle-sidebar-desktop-1440.png` | `app-cycle-sidebar-mobile-390.png` | Active cycle + selected day panel. |

## Metrics
Desktop metrics (1440 width):
| Screen | Viewport | Container rect (x,y,w,h) | Density ratio | Top offset | Typography (heading/body/cta) | Primary CTA (selector → rect) |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard (Month) | 1710×1073 | 0,53,1710,1134 | 1.05685 | 53 | 14px / 10px / 12px | `header button:text(Log)` → 1494.53,10,67.47,32 |
| Dashboard (Week) | 1710×1073 | 0,53,1710,1134 | 1.05685 | 53 | 14px / 10px / 12px | `header button:text(Log)` → 1494.53,10,67.47,32 |
| Cycle List Dialog | 1710×1073 | 471,348,768,377 | 0.1578 | 348 | 24px / 14px / 14px | `[role=dialog] button:text(New cycle)` → 496,447,125.34,36 |
| Settings Dialog | 1710×1073 | 631,258,448,557 | 0.1360 | 258 | 18px / 16px / 14px | `[role=dialog] button:text(Sign out)` → 656,710,398,36 |
| Notifications Dialog | 1710×1073 | 631,439.5,448,194 | 0.04737 | 439.5 | 18px / 14px / 12px | `[role=dialog] button:text(Log Now)` → 705,563.5,74.74,28 |
| Injection Dialog | 1710×1073 | 567,255,576,563 | 0.17674 | 255 | 20px / 14px / 14px | `[role=dialog] button:text(Log Injection)` → 999.99,757,118.01,36 |
| Protocol Dialog | 1710×1073 | 519,105,672,863 | 0.31607 | 105 | 24px / 14px / 14px | `[role=dialog] button:text(Create/Save)` → 1047.78,907,118.22,36 |
| Blood Work Dialog | 1710×1073 | 631,263.5,448,546 | 0.13331 | 263.5 | 18px / null / 14px | `[role=dialog] button:text(Log/Save)` → 945.73,748.5,108.27,36 |
| Blood Work Panel | 1710×1073 | 1059.45,851,630.55,206 | 0.07079 | 851 | 12px / 14px / 12px | `section:contains(Blood Work) button:text(Log)` → 1605.53,868,67.47,28 |
| Cycle Sidebar | 1710×1073 | 1059.45,69,630.55,608 | 0.20894 | 69 | 10px / 12px / 12px | `section:contains(Active) button:text(New)` → 1593.13,86,79.88,28 |

Mobile metrics (390 width):
| Screen | Viewport | Container rect (x,y,w,h) | Density ratio | Top offset | Typography (heading/body/cta) | Primary CTA (selector → rect) |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard (Month) | 390×844 | 0,65,390,683 | 0.80924 | 65 | 14px / null / 12px | `header button:text(Log)` → 180,10,44,44 |
| Dashboard (Week) | 390×844 | 0,65,390,683 | 0.80924 | 65 | 14px / null / 12px | `header button:text(Log)` → 180,10,44,44 |
| Cycle List Dialog | 390×844 | 0,275,390,569 | 0.67417 | 275 | 24px / 14px / 14px | `[data-vaul-drawer] button:text(New cycle)` → 25,394,125.34,44 |
| Settings Dialog | 390×844 | 0,281,390,563 | 0.66706 | 281 | 18px / 16px / 14px | `[data-vaul-drawer] button:text(Sign out)` → 17,723,356,44 |
| Notifications Dialog | 390×844 | 0,648,390,196 | 0.23223 | 648 | 18px / 14px / 12px | `[data-vaul-drawer] button:text(Log Now)` → 66,750,74.74,44 |
| Injection Dialog | 390×844 | 0,99,390,745 | 0.88270 | 99 | 20px / 14px / 14px | `[data-vaul-drawer] button:text(Log Injection)` → 25,719,340,44 |
| Protocol Dialog | 390×844 | 0,84.41,390,759.59 | 0.89999 | 84.41 | 24px / 14px / 14px | `[data-vaul-drawer] button:text(Create/Save)` → 25,1282.41,340,44 |
| Blood Work Dialog | 390×844 | 0,346,390,498 | 0.59005 | 346 | 18px / null / 14px | `[data-vaul-drawer] button:text(Log/Save)` → 200,799,173,44 |
| Blood Work Panel | 390×844 | 12,325,366,222 | 0.24685 | 325 | 12px / 14px / 12px | `section:contains(Blood Work) button:text(Log)` → 293.53,342,67.47,44 |
| Cycle Sidebar | 390×844 | 12,77,366,608 | 0.67605 | 77 | 10px / 12px / 12px | `section:contains(Active) button:text(New)` → 281.13,94,79.88,44 |

## Notes
- Evidence captured from authenticated session at `http://localhost:5176/`.
- Mobile metrics use a simulated viewport (`390×844`, dpr 2) via Puppeteer `page.setViewport`.
- No explicit error or loading states were visible during capture.

## UI Foundation Map
- Global styles and theme tokens: `src/index.css:1-120`
- Tailwind config (colors, fonts, radius): `tailwind.config.js:1-69`
- App shell + auth gate: `src/App.tsx:451-499`
- Header (signed-out vs signed-in controls): `src/components/layout/AppHeader.tsx:26-93`
- Button component + variants: `src/components/ui/button.tsx:1-28`, `src/components/ui/button-variants.ts:1-30`
- Dialog and drawer primitives: `src/components/ui/dialog.tsx`, `src/components/ui/drawer.tsx`, `src/components/ui/responsive-dialog.tsx`
- Scroll and tabs primitives: `src/components/ui/scroll-area.tsx`, `src/components/ui/tabs.tsx`
