# UI-FIX-1 — UI Fixes (Sidebar nav, Logo, Theme Toggle, Centered Nav, Mobile Responsiveness, PWA)

## Task Summary
Fixed 6 categories of UI/UX issues across the GuardianX Academy platform:
1. Added Partners/Impact/Contact/Certifications to dashboard sidebar nav with visual divider
2. Logo: transparent background (mix-blend-mode), float/glow animations, shown on ALL pages
3. Theme toggle on homepage + all public page headers
4. Centered nav tabs in headers (logo left, tabs center, actions right)
5. Full mobile responsiveness across all views + hamburger nav drawer
6. PWA: manifest.json, service worker, registration, viewport theme color

## Files Modified
- `src/app/globals.css` — Added `.logo-img`, `.logo-animated`, `.logo-glow` classes + `@keyframes logo-float`
- `src/app/layout.tsx` — Added `manifest`, `applicationName`, `appleWebApp` to metadata; added `viewport` export with themeColor; added `<ServiceWorkerRegister />` to body
- `src/app/page.tsx` — Refactored `PublicPageShell` with: (a) `<img>` logo replacing SVG shield, (b) centered nav tabs via `flex-1 justify-center`, (c) `<ThemeToggle />` in header, (d) mobile hamburger menu drawer, (e) shared `PUBLIC_NAV_TABS` constant
- `src/components/platform/app-shell.tsx` — Added `Certifications` item to `NAV_ITEMS`; added `PLATFORM_NAV_ITEMS` constant (Partners/Impact/Contact); rendered them in `NavList` after a "Platform" divider; replaced Shield brand in `Logo` with animated logo `<img>`; rebranded logo text to "GuardianX Academy" + "Building Tomorrow's Cyber Guardians"
- `src/components/platform/auth-screen.tsx` — Replaced 2 brand Shield icons with animated logo `<img>` (desktop left panel + mobile logo); rebranded tagline
- `src/components/platform/site-footer.tsx` — Replaced brand Shield icon (h-9 w-9) with animated logo `<img>` in the footer brand button
- `src/views/home.tsx` — Refactored header: added `<ThemeToggle />`, centered nav tabs (`flex-1 justify-center`), mobile hamburger drawer; added `logo-img logo-animated logo-glow` classes to existing logo; responsive padding/typography throughout (py-16 sm:py-20 lg:py-32, text-4xl sm:text-5xl md:text-7xl, gap-3 sm:gap-4, etc.) on hero, stats, features, lab showcase, journey, tech stack, CTA, final CTA sections
- `src/views/certifications.tsx` — Refactored to content-only view (removed duplicate `<header>` and `<footer>` blocks); now relies on PublicPageShell/AppShell header; added responsive classes (p-5 sm:p-6, gap-4 sm:gap-5, text-3xl sm:text-4xl md:text-5xl); kept Shield as a feature icon for the proctored exam card
- `src/views/partner-institutions.tsx` — Responsive tweaks: hero `min-h-[500px] md:min-h-[600px]`, padding `px-4 sm:px-6 py-12 sm:py-20`, title `text-3xl sm:text-4xl md:text-6xl lg:text-7xl`, floating stats `gap-3 sm:gap-6` and `p-3 sm:p-4`
- `src/views/impact.tsx` — Responsive tweaks: hero `min-h-[420px] md:min-h-[500px]`, padding `px-4 sm:px-6 py-12 sm:py-20`, title `text-3xl sm:text-4xl md:text-6xl`, CTA buttons `px-6 sm:px-8`
- `src/views/contact.tsx` — Responsive tweaks: hero `p-6 sm:p-8 lg:p-12`, title `text-3xl sm:text-4xl md:text-5xl`, contact options `grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4`, form card `p-5 sm:p-6 lg:p-8`

## Files Created
- `public/manifest.json` — PWA manifest: name "GuardianX Academy", short_name "GuardianX", standalone display, dark background, emerald theme color, 192/512px icons
- `public/sw.js` — Service worker: app-shell caching on install, stale-while-revalidate for assets, network-first for navigation requests, cache cleanup on activate
- `src/components/platform/service-worker-register.tsx` — Client component that registers `/sw.js` in production only (after window load)
- `src/components/platform/theme-toggle.tsx` — Shared theme toggle button (sun/moon), used by home page and PublicPageShell headers

## Key Design Decisions

### Logo Treatment
- Used `mix-blend-mode: multiply` for light mode and `screen` for dark mode to make the white PNG background blend into the surface (since we can't easily edit the PNG itself)
- Added `filter: brightness(1.15) saturate(1.25)` in dark mode for slight color enhancement
- Subtle 4s float animation (`translateY(-3px) rotate(2deg)` at midpoint) with `transform-origin: center`
- Drop-shadow glow with emerald color, intensifies on hover

### Sidebar Nav Reorganization
- Kept LMS-focused items in `NAV_ITEMS` (Dashboard, Catalog, My Learning, Notes, Live, Labs, Achievements, Leaderboards, Certificates, Certifications, Community)
- Added new "Certifications" item (view `{ name: "certifications" }`) — distinct from existing "Certificates" (user's earned certs, view `{ name: "certificates" }`)
- Created `PLATFORM_NAV_ITEMS` for Partners/Impact/Contact — rendered after a gradient divider line with a "PLATFORM" label
- Each platform item has its own accent color (emerald/amber/cyan) matching its page theme

### Public Page Header Structure
```
[Logo + Brand Name]  [--- Centered: Nav Tabs (flex-1 justify-center) ---]  [ThemeToggle + Sign In]
```
On mobile (< md): logo + hamburger menu button (ml-auto), nav collapses into a vertical drawer below the header.

### Certifications Page Refactor
The original `certifications.tsx` had its own `<header>` and `<footer>` blocks, which caused a duplicate header when wrapped inside `PublicPageShell` (which also has its own header). Refactored to be content-only (like `partner-institutions.tsx`, `impact.tsx`, `contact.tsx`, `legal.tsx`). The PublicPageShell provides the unified header with logo, nav tabs, theme toggle, and Sign In button. This also means the CertificationsView now works correctly when rendered inside AppShell (logged-in users).

### PWA Architecture
- `manifest.json` is statically served from `/public/`
- `sw.js` is statically served from `/public/`
- `ServiceWorkerRegister` is a client component rendered in the root layout, but it only registers in production (`process.env.NODE_ENV !== "production"` check) to avoid HMR/dev conflicts
- Service worker uses network-first strategy for HTML (so users get fresh content when online, cached fallback when offline) and stale-while-revalidate for static assets

## Verification Results
- ESLint: `bun run lint` — exit 0 (0 errors, 0 warnings)
- Dev server: `GET /` returns 200, multiple successful compilations (`✓ Compiled in XXXms`)
- PWA assets: `/manifest.json` 200, `/sw.js` 200, `/guardianx-academy-logo.png` 200
- Logo `mix-blend-mode` and animation classes confirmed in `globals.css`
- Theme toggle visible in both HomeView and PublicPageShell headers (desktop + mobile drawer)
- Sidebar nav includes Certifications + Platform section (Partners/Impact/Contact) with divider
- All Shield-as-brand-logo usages replaced with `<img>` + animation classes (in app-shell, auth-screen, page PublicPageShell, site-footer, home.tsx)
- Shield-as-feature-icon usages preserved (proctored exam cards, mission statement, etc.)

## Demo Accounts (unchanged)
- student@guardianx.io / student123
- instructor@guardianx.io / instructor123
- admin@guardianx.io / admin123
