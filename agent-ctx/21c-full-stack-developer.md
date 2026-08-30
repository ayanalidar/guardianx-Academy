# Task 21C — PWA / Mobile App + Parent/Guardian Portal + Course Authoring Studio

**Agent:** full-stack-developer (Z.ai Code)
**Task ID:** 21C
**Date:** 2025

## Scope

Three additive features for GuardianX Academy (Next.js 16 + Prisma SQLite + TypeScript).
The Prisma schema was already complete (`ParentAccount` + `AuthoredCourse` models existed).
No schema modifications. Total: 4 new API route files, 2 new view files, 1 new lib file,
1 new provider component, 1 edited layout, 2 new public assets.

## Reference materials read

- `/home/z/my-project/worklog.md` — prior task history (Task 21A built 7 features,
  Task 21B built 9 features — both followed the same "API + premium client view"
  pattern with `getCurrentUser()` auth + `import { db } from "@/lib/db"`)
- `/home/z/my-project/src/lib/db.ts` — Prisma client singleton
- `/home/z/my-project/src/lib/session.ts` — `getCurrentUser()` returns
  `{ id, email, name, role, avatar, title, bio, schoolId }`
- `/home/z/my-project/src/app/globals.css` — premium design tokens
  (violet primary `oklch(0.6 0.2 295)`, solid card, `card-premium`, `bg-mesh`,
  `text-gradient-premium`, `glow-orb`, `bg-grid`, `btn-premium`, `scanlines`)
- `/home/z/my-project/src/app/layout.tsx` — current layout (had inline SVG icon,
  no manifest link, no theme-color, no apple-touch-icon)
- `/home/z/my-project/prisma/schema.prisma` — confirmed:
  - `ParentAccount { id, email, name, passwordHash, phone, studentId, relationship, createdAt }`
  - `AuthoredCourse { id, title, authorId, status, config (JSON), version, ... }`
  - All relations from User → ParentAccount / AuthoredCourse already wired
- `/home/z/my-project/src/lib/auth.ts` — NextAuth config (used for normal user auth;
  parent portal uses its OWN auth since ParentAccount lives in a separate table)
- `/home/z/my-project/src/app/api/auth/register/route.ts` — reference bcrypt + zod pattern
- `/home/z/my-project/src/app/api/school/students/[id]/route.ts` — reference pattern
  for the kind of aggregate "student overview" query needed for the parent portal
- `/home/z/my-project/src/components/providers/providers.tsx` — Providers wrapper
  where the new ServiceWorkerRegister was added
- `/home/z/my-project/src/lib/api.ts` — client `api()` helper (used as-is)
- `/home/z/my-project/src/views/school-dashboard-inner.tsx` — design reference for
  hero + Tabs + KPI cards + table layouts

## Files Created / Modified (all listed)

### Feature 17 — PWA / Mobile App (5 files)
1. **`public/manifest.json`** *(NEW)* — PWA manifest with GuardianX branding
   (violet theme `#7c3aed`, deep background `#0a0a0f`, standalone display, 4
   install shortcuts: Dashboard / Labs / My Learning / Live Sessions). Icons
   reference `/logo.svg` (any) and `/guardianx-logo.png` (512×512, any + maskable).
2. **`public/sw.js`** *(NEW)* — service worker (vanilla, no dependencies):
   - Install: pre-caches app shell (`/`, `/manifest.json`, `/logo.svg`, `/guardianx-logo.png`)
   - Activate: cleans old caches (versioned `guardianx-sw-v1-*`)
   - Fetch handler: network-first for navigations (falls back to cached shell
     then to a branded offline HTML page), cache-first for same-origin static
     assets, passes through cross-origin & API requests
3. **`src/app/api/pwa/route.ts`** *(NEW)* — GET returns PWA metadata
   (manifestUrl, serviceWorkerUrl, installable flag, themeColor, icons,
   shortcuts, SW features). Auth is OPTIONAL — when a logged-in user calls,
   includes personalised `startUrl` + role.
4. **`src/app/layout.tsx`** *(MODIFIED)* — added `Viewport` export with
   `themeColor` (violet + dark variants), `viewportFit: "cover"`; expanded
   `metadata` with `manifest`, `applicationName`, `appleWebApp` (capable +
   black-translucent status bar), full `icons` set (icon + apple + shortcut);
   added a `<head>` block with explicit `<link rel="manifest">`,
   `<link rel="apple-touch-icon">` (180/192/512), `<link rel="mask-icon">`,
   apple-mobile-web-app-* meta tags.
5. **`src/components/providers/service-worker-register.tsx`** *(NEW)* — client
   component that registers `/sw.js` on mount, listens for `updatefound` +
   `controllerchange` to auto-activate new SW versions, periodically calls
   `reg.update()` (every 60 min). Wired into `providers.tsx`.

### Feature 19 — Parent/Guardian Portal (4 files)
6. **`src/lib/parent-auth.ts`** *(NEW)* — token-based parent auth helper:
   - `signParentToken({ id, email, studentId })` — mints `<base64url(payload)>.<hex-hmac-sha256>`
     with 7-day TTL, signed with `NEXTAUTH_SECRET`
   - `verifyParentToken(token)` — timing-safe HMAC verification + expiry check
   - `readParentToken(req)` — reads `x-parent-token` header (falls back to
     `?parent_token=` query param)
7. **`src/app/api/parent/route.ts`** *(NEW)* —
   - **GET**: returns the parent's student overview (parent profile + student
     user + aggregated stats + courses with progress + certificates + labs +
     attendance summary with recent records + recent activity timeline).
     Auth via `x-parent-token` header.
   - **POST**: parent login (email + password, verified against
     `ParentAccount.passwordHash` using bcrypt). Returns signed token + parent
     profile.
8. **`src/app/api/parent/register/route.ts`** *(NEW)* — POST creates a parent
   account linked to an EXISTING student by the student's registered email.
   Validates the student exists + is a STUDENT role (not instructor/admin).
   Returns signed token + parent profile (same shape as login response) so
   the client can enter the portal immediately.
9. **`src/views/parent-portal.tsx`** *(NEW)* — `ParentPortalView`. Two modes:
   - **Auth screen** (when no token): login/register tabbed Card with violet
     glow orbs + `bg-mesh` atmosphere + `text-gradient-premium` headline
   - **Dashboard** (once authenticated): hero greeting, student banner card
     with avatar + level/streak/XP mini-stats, 4 KPI cards (enrolled courses,
     certificates, labs completed, attendance rate), then a 5-tab layout
     (Courses / Certificates / Labs / Attendance / Activity) with:
     - Courses tab: overall progress bar + per-course cards with progress,
       instructor, last-accessed
     - Certificates tab: amber-accented certificate cards with score + issue date
     - Labs tab: per-lab cards with status badges (completed/in-progress/not-started)
       + difficulty color-coding + flag-captured indicator
     - Attendance tab: stacked-bar summary (present/late/excused/absent) +
       recent sessions list
     - Activity tab: timeline with type-specific icons + XP-earned badges
   - Token persisted to `localStorage` (`guardianx-parent-token`); 30s polling
     on the dashboard query for "live" feel; graceful error UI when token
     expires; sign-out button clears the token.

### Feature 20 — Course Authoring Studio (3 files)
10. **`src/app/api/course-studio/route.ts`** *(NEW)* —
    - **GET**: lists the current user's authored courses with parsed config
      (module/lesson counts derived from the JSON), totals (drafts/review/published)
    - **POST**: creates a new draft `AuthoredCourse` with a starter config
      skeleton (`defaultCourseConfig()` — 1 module + 1 reading lesson) so the
      editor opens with something visible
11. **`src/app/api/course-studio/[id]/route.ts`** *(NEW)* — owner-scoped
    operations on a single authored course:
    - **GET**: returns the full parsed config (for the editor)
    - **PATCH**: updates title, status, or config (validates JSON is
      serialisable); optional `bumpVersion` flag
    - **DELETE**: deletes the draft (does NOT touch any published Course)
    - **POST**: publish — converts the draft config into a real `Course` +
      `Module`(s) + `Lesson`(s) inside a `$transaction`. Re-publishing is
      idempotent: the slug embeds the draft id's last 6 chars, so re-publishing
      updates the existing Course (deletes + recreates modules). Marks the
      authored course as `published` and bumps its version.
12. **`src/views/course-studio.tsx`** *(NEW)* — `CourseStudioView`. Two modes:
    - **List view**: hero with "New Draft" CTA, 4-stat strip (total/drafts/
      review/published), course cards grid with status badges, create-draft
      Dialog (title/description/category/level)
    - **Editor view** (3-pane layout, `lg:grid-cols-[300px_1fr_340px]`):
      - **Top bar**: back button + editable title input + status/version
        badge + "unsaved" indicator + Save / Publish buttons
      - **LEFT (Outline)**: scrollable module list with collapsible lessons,
        grip icon, per-module up/down + delete, per-lesson up/down + delete,
        "+ Module" and "+ Add Lesson" buttons
      - **CENTER (Editor)**: shows ModuleEditor (title + description + lesson
        list) when a module is selected, or LessonEditor (title, content-type
        select, duration, markdown content textarea, PDF URL/pages for PDF
        type, free-preview switch) when a lesson is selected
      - **RIGHT (Preview / JSON / Settings)**: tabbed pane —
        - Preview: course-card preview + selected-lesson preview + full
          curriculum outline
        - JSON: read-only JSON view with Edit / Copy / Download / Apply
          (import) buttons — full JSON-based config editor
        - Settings: shortName, category, level, duration, price, certBody,
          accent color picker (7 colors), tags, long description, thumbnail URL
      - Publish confirmation AlertDialog; `dirty` flag tracks unsaved changes;
        TanStack Query mutations invalidate list + detail queries on save/publish.

## Cross-Cutting Notes

- All 3 view files start with `"use client"` and export the requested named
  functions (`ParentPortalView`, `CourseStudioView`).
- All 4 API routes use `getCurrentUser()` for auth (except parent login +
  register which use their own `ParentAccount` table + a separate signed-token
  scheme since parents are NOT GuardianX users).
- All API routes `export const runtime = "nodejs"` (needed for `crypto` /
  `bcryptjs` / Prisma).
- Premium styling throughout: `bg-card shadow-lg`, violet primary
  (`bg-violet-600 hover:bg-violet-500 btn-premium`), `text-gradient-premium`
  headlines, `bg-mesh` + `glow-orb` atmosphere on hero sections, `bg-grid`
  overlays, `scanlines` on hero cards, `card-hover` lift on cards,
  `stagger-item` on activity timeline.
- Mobile-first responsive: all grids use `sm:` / `md:` / `lg:` breakpoints.
  The 3-pane Course Studio collapses gracefully on mobile.
- TanStack Query (`useQuery` for reads with 30s polling on parent portal,
  `useMutation` for writes, `useQueryClient().invalidateQueries()` after
  mutations). `sonner` toasts for user feedback throughout.
- PWA: layout now properly declares `manifest`, `themeColor` (Viewport export),
  apple-touch-icon at multiple sizes, apple-mobile-web-app-capable, etc.
  Service worker is registered via a new client component wired into
  `Providers`. SW intercepts only same-origin GETs; API requests pass through
  untouched (so NextAuth + XTransformPort gateway still work).
- Parent auth token is HMAC-signed with `NEXTAUTH_SECRET` (7-day TTL),
  timing-safe comparison on verify, stored in `localStorage` on the client.
- Course Studio publish uses a Prisma `$transaction` to atomically create the
  Course + all Modules + all Lessons (or update + replace on re-publish).
  Slug is `${slugify(title)}-${draftId.slice(-6)}` for idempotency.
- ESLint: **0 errors, 0 warnings** (`bun run lint` clean after fixing one
  unused eslint-disable directive).
- Dev server log healthy — only the pre-existing `NEXTAUTH_URL` warning.
  `bun build` syntax-check passes for all 9 new/modified TS/TSX files.
- No existing files modified except `src/app/layout.tsx` (PWA meta tags) and
  `src/components/providers/providers.tsx` (added `<ServiceWorkerRegister />`).
  Prisma schema unchanged.

## Wiring Note for Orchestrator

To surface these features in the app shell, the orchestrator can extend
`useAppStore`'s `View` type with `{ name: "parent-portal" }` and
`{ name: "course-studio" }`, then add nav items + render cases in
`src/app/page.tsx`:

```tsx
{view.name === "parent-portal" && <ParentPortalView />}
{view.name === "course-studio" && <CourseStudioView />}
```

The PWA feature requires NO view wiring — it's pure infrastructure
(manifest + SW + meta tags are all auto-applied on every page load).
