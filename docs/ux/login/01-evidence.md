# Evidence

## Routes
| URL/Route | Component file path | How reached (auth gate/router) | Notes |
| --- | --- | --- | --- |
| `/` | `src/App.tsx` (auth gate) + `src/components/layout/EmptyStates.tsx` | Auth gate in `App` renders `SignedOutScreen` when `!user` | `App` renders `SignedOutScreen` in main when unauthenticated (`src/App.tsx:451-481`); `SignedOutScreen` layout defined in `src/components/layout/EmptyStates.tsx:1-63`. |

Entry point: `src/main.tsx:1-12` mounts `App` and global styles.

## Component Tree
Top-down (login screen):
- `src/main.tsx` → `<App />` (`src/main.tsx:1-12`)
- `src/App.tsx` → `<AppHeader />` + `<main>` → auth gate (`src/App.tsx:451-499`)
- Auth gate → `<SignedOutScreen />` (`src/App.tsx:480-482`)
- `src/components/layout/EmptyStates.tsx` → `SignedOutScreen` children:
  - Hero icon + badge, title `<h1>DeepShot</h1>`, subtitle `<p>` (`src/components/layout/EmptyStates.tsx:13-29`)
  - Features grid (Schedule/Insights/Private) (`src/components/layout/EmptyStates.tsx:31-45`)
  - Primary CTA button (`Continue with Google`) (`src/components/layout/EmptyStates.tsx:47-55`)
  - Supporting text footer (`src/components/layout/EmptyStates.tsx:57-59`)

Header (unauthenticated): `AppHeader` renders a `Sign In` button when `user` is null (`src/components/layout/AppHeader.tsx:26-93`).

## Screenshots
- `docs/ux/login/assets/login-desktop-1440.png`
- `docs/ux/login/assets/login-mobile-390.png`

## DOM Metrics
Evidence URL used: `http://localhost:5176/` (dev server session).

Desktop (window bounds set to 1440×900):
- JS evaluated:
  ```js
  (() => {
    const container = document.querySelector('main div.max-w-sm');
    const heading = document.querySelector('main h1');
    const body = document.querySelector('main p.text-muted-foreground');
    const button = document.querySelector('main button');
    const rect = container ? container.getBoundingClientRect() : null;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    return {
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      devicePixelRatio: window.devicePixelRatio,
      containerTop: rect ? rect.top : null,
      containerLeft: rect ? rect.left : null,
      containerWidth: rect ? rect.width : null,
      containerHeight: rect ? rect.height : null,
      containerAreaRatio: rect ? (rect.width * rect.height) / (viewport.width * viewport.height) : null,
      headingFontSize: heading ? getComputedStyle(heading).fontSize : null,
      bodyFontSize: body ? getComputedStyle(body).fontSize : null,
      buttonFontSize: button ? getComputedStyle(button).fontSize : null,
    };
  })();
  ```
- Output:
  - viewport: 1440×813 (dpr 2)
  - container rect: top 234.625, left 528, width 384, height 396.75
  - area ratio: 0.13013530135301354
  - font sizes: heading 24px, body 14px, button 16px

Mobile (window bounds set to 390×844):
- JS evaluated: same as above
- Output:
  - viewport: 390×757 (dpr 2)
  - container rect: top 212.625, left 24, width 342, height 396.75
  - area ratio: 0.4596026826542018
  - font sizes: heading 24px, body 14px, button 16px

## Audit Results
- Lighthouse CLI attempt: `lighthouse --version` → `command not found` (CLI unavailable in PATH).

## Styling Sources
- Global CSS + background + component tokens: `src/index.css:1-120`
- Tailwind config (colors, fonts, radius): `tailwind.config.js:1-69`
- Login layout + Tailwind utility classes: `src/components/layout/EmptyStates.tsx:11-60`
- Button component + variants: `src/components/ui/button.tsx:1-28`, `src/components/ui/button-variants.ts:1-30`
- Header sign-in button styling (unauth state): `src/components/layout/AppHeader.tsx:36-93`
