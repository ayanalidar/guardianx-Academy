# TRAINING-BATCH-CRUD — main (Z.ai Code orchestrator)

## Task
Make the certification training batches fully DB-driven with admin CRUD:
1. Add a new `TrainingBatch` Prisma model (separate from the existing school-tied `Batch` model).
2. Seed the 4 demo batches shown on the homepage.
3. Create a public read-only API for fetching published batches.
4. Create an admin CRUD API for fetching/creating/updating/deleting batches.
5. Wire the homepage + public batches view to fetch from the API with a static fallback.
6. Upgrade the admin Batch Calendar to be fully DB-driven with create/edit/delete dialogs.

## Work Log

**Step 1 — Prisma schema** — Appended a new `TrainingBatch` model at the end of `prisma/schema.prisma` (after `LeadStatusHistory`). All fields are SQLite-safe primitives (String / Int / Boolean / DateTime — no `String[]` arrays). Includes all the visual color-class fields the homepage static array uses (certColor, certTint, certBorder, levelColor, levelTint, levelBorder, borderColor, btnClass) so the DB rows map 1:1 to the JSX. `bun run db:push` synced successfully.

**Step 2 — Seed script** — Created `prisma/seed-batches.ts` (one-off, idempotent — deletes by `certification+name` then recreates the 4 rows). Lifted the 4 batch values verbatim from `UPCOMING_BATCHES` in `src/views/home-data.ts`. Added `startIsoDate` (ISO "2025-10-12" etc.) and `enrolled` count for each (the static array didn't track enrolled). Ran `bun run prisma/seed-batches.ts` — 4 rows created. Verified via `bunx tsx -e "db.trainingBatch.findMany()"` → 4 rows.

**Step 3 — Public API** — Created `src/app/api/training-batches/route.ts` (GET, no auth, returns `{ batches, count }` of all `published: true` rows, ordered by `order` then `startDate`). `export const runtime = "nodejs"`.

**Step 4 — Admin CRUD API (list + create)** — Created `src/app/api/admin/training-batches/route.ts`:
- `GET` — ADMIN or INSTRUCTOR; lists ALL batches (incl. unpublished), ordered by `order` then `startDate`.
- `POST` — ADMIN only; validates required fields (certification, name, schedule, startDate, instructor); auto-computes cert color palette from `certification` name (Security+→emerald, CEH→amber, CCNA→cyan, CISSP→rose, default→violet) and level color palette from `level` (Beginner→emerald, Intermediate→amber, Advanced→rose) and stores them in the cert*/level*/borderColor/btnClass columns so the homepage + admin cards render identically to the original static design.

**Step 5 — Admin CRUD API (single-item)** — Created `src/app/api/admin/training-batches/[id]/route.ts`:
- `GET` — ADMIN or INSTRUCTOR; fetches a single batch by id (404 if not found).
- `PATCH` — ADMIN only; updates any subset of fields (whitelist of 19 string + 3 int + 2 bool fields); returns the updated row.
- `DELETE` — ADMIN only; deletes the row; returns `{ success: true }` (404 if not found).

**Step 6 — Homepage wired to API** — Updated `src/views/home.tsx`:
- Added a 5th `useQuery` (`["home-training-batches"]`, fetches `/api/training-batches`, staleTime 60s) alongside the existing 4 (partners/stats/paths/ranks).
- Added a local `TrainingBatchRow` type and computed `displayBatches: TrainingBatchRow[]` via `useMemo` — maps API rows to include the derived `almostFull = (seats - (enrolled ?? 0)) <= 2 || status === "Almost Full"`, falls back to the static `UPCOMING_BATCHES` array when the API returns null/empty.
- Swapped the JSX `UPCOMING_BATCHES.map(...)` for `displayBatches.slice(0, 4).map(...)`. The JSX itself is byte-for-byte unchanged — same `b.certification`, `b.name`, `b.schedule`, `b.startDate`, `b.mode`, `b.instructor`, `b.seats`, `b.almostFull`, `b.level`, `b.certColor`, `b.certTint`, `b.certBorder`, `b.levelColor`, `b.levelTint`, `b.levelBorder`, `b.borderColor`, `b.btnClass` references.
- Static `UPCOMING_BATCHES` import retained as the fallback (per the task spec).

**Step 7 — Public BatchesView wired to API** — Updated `src/views/batches.tsx`:
- Removed the inline `BATCHES` const (the 4 batch objects).
- Added `import { UPCOMING_BATCHES } from "@/views/home-data"` + `import { useQuery } from "@tanstack/react-query"`.
- Added helper functions `deriveCertGroup(cert)` (security→Security+, ceh→CEH, ccna→CCNA, cissp→CISSP) and `deriveScheduleType(schedule)` (weekend if Sat/Sun, late-night if 10pm+, morning if AM, evening if PM, else weekday).
- Added `normalizeBatch(raw)` that takes either an API row or a static `UPCOMING_BATCHES` item and returns a `Batch` with the derived `certGroup` and `scheduleType` populated.
- Added `useQuery(["batches-view-training-batches"], ...)` and computed `allBatches: Batch[]` (API rows mapped via `normalizeBatch`, falls back to `UPCOMING_BATCHES`).
- `filteredBatches` now filters `allBatches` (was filtering the local `BATCHES` const). "Showing X of Y batches" text now uses `allBatches.length`.
- Loosened the `Batch` interface `certGroup` / `mode` / `level` from literal unions to `string` so DB-driven batches with new cert names still typecheck.

**Step 8 — Admin Batch Calendar upgraded** — Full rewrite of `src/views/admin-batch-calendar.tsx` (was 350 lines of hardcoded mock data, now ~640 lines of DB-driven CRUD):
- `useQuery(["admin-training-batches"], ...)` fetches all batches (incl. unpublished) from the admin API. Loading state shows a Skeleton-based calendar placeholder; error state shows a "Retry" button; empty state shows a "Create your first batch" button (all wired up).
- The month calendar grid renders the DB batches: each batch's `startIsoDate` (or parsed `startDate` like "October 12") is matched against the calendar's `YYYY-MM-DD` for that day. The schedule-string's day-of-week tokens (Sat/Sun/Mon/Tue/Wed/Thu/Fri) are extracted via `deriveDays()` and used to show small color bars under each day that a batch runs on. Starting batches show a ▶ chip with the cert shortname.
- Each batch card in the "Upcoming Batches" list now has an **Edit** button (opens the edit dialog pre-filled) and a **Delete** button (opens a delete-confirm dialog). Status badge color-coded (Open/Almost Full/Full/Completed/Cancelled). Shows enrolled/seats, featured, unpublished indicators.
- The batch detail modal (clicking a batch) shows all batch fields + description and has Edit + Delete buttons.
- Create dialog (`Dialog`) form fields: certification, name, schedule, startDate (display), startIsoDate (date picker), mode (Select: Live Online / On-Campus), instructor, seats (number), enrolled (number), order (number), level (Select: Beginner/Intermediate/Advanced), status (Select: Open/Almost Full/Full/Completed/Cancelled), description (Textarea), featured (Checkbox), published (Checkbox). On submit → POST to `/api/admin/training-batches`, invalidates `admin-training-batches` + `home-training-batches` + `batches-view-training-batches` query keys, toast on success/error.
- Edit dialog reuses the same `BatchFormFields` component, pre-filled with the batch's current values. On submit → PATCH to `/api/admin/training-batches/{id}`, same invalidation + toast.
- Delete dialog (separate `Dialog`) asks for confirmation, then DELETE on confirm, same invalidation + toast.
- Used existing shadcn components: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, Textarea, Checkbox, Select, Card, Badge, Skeleton. Added a small `view` (month/week) toggle button row in the header (preserved from the original layout).

**Step 9 — Verification** — All checks pass:
- `bun run lint` → **0 errors**, 1 pre-existing warning (unused eslint-disable in `src/lib/db.ts` — not touched).
- `npx tsc --noEmit` → 0 errors in any file I modified. The only TS errors remaining in the project are pre-existing in `app-shell.tsx`, `webrtc.ts`, `admin-dashboard.tsx`, `leaderboard.tsx`, `live-sessions.tsx`, `page.tsx` — none touched by this task.
- Dev server (started in a single bash command per the sandbox contract) → `Ready in 999ms`, no compile errors.
- `curl -s http://localhost:3000/api/training-batches` → **200**, returns `{ batches: [...4 rows...], count: 4 }` with all fields (id, certification, name, schedule, startDate, startIsoDate, mode, instructor, instructorId, seats, enrolled, level, status, certColor, certTint, certBorder, levelColor, levelTint, levelBorder, borderColor, btnClass, description, featured, order, published, createdAt, updatedAt).
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/training-batches` → **401** (no auth — correct).
- `bunx tsx -e "db.trainingBatch.findMany()"` → `batches: 4` (CompTIA Security+, CEH, CCNA, CISSP).

## Files Created
- `prisma/seed-batches.ts` — idempotent seed script for the 4 demo batches.
- `src/app/api/training-batches/route.ts` — public GET API.
- `src/app/api/admin/training-batches/route.ts` — admin GET list + POST create.
- `src/app/api/admin/training-batches/[id]/route.ts` — admin GET single + PATCH + DELETE.
- `agent-ctx/TRAINING-BATCH-CRUD-main.md` — this work record.

## Files Modified
- `prisma/schema.prisma` — appended `TrainingBatch` model (zero changes to existing models).
- `src/views/home.tsx` — added `["home-training-batches"]` useQuery + `displayBatches` memo; swapped the UPCOMING BATCHES section's `.map()` source from `UPCOMING_BATCHES` to `displayBatches.slice(0, 4)`. Static `UPCOMING_BATCHES` import retained as fallback.
- `src/views/batches.tsx` — removed inline `BATCHES` const; added useQuery + `normalizeBatch` helper; `filteredBatches` + count now use `allBatches`. Visual design unchanged.
- `src/views/admin-batch-calendar.tsx` — full rewrite: hardcoded `BATCHES` const removed, replaced with `useQuery` + create/edit/delete dialogs + loading/error/empty states. Calendar layout preserved.

## Files NOT Modified
- `src/views/home-data.ts` — `UPCOMING_BATCHES` static array retained as fallback (per the task spec). All other static arrays untouched.
- All other views, components, APIs, mini-services, the `Batch` (school) model, the existing `/api/admin/batches` mock route, etc. — none touched.

## Issues Encountered
- One TypeScript error during initial check: `'??' and '||' operations cannot be mixed without parentheses` in `normalizeBatch` (`raw.almostFull ?? (a) || b`). Fixed by wrapping the right-hand side in parens: `raw.almostFull ?? ((a) || b)`. No runtime behavior change.
- The directory creation for `[id]` required escaping the square brackets in bash (`mkdir -p .../\[id\]`); the actual Next.js route works as expected.
- The `Checkbox` component returns `boolean | "indeterminate"` for `onCheckedChange`; explicitly narrowed with `v === true` when storing back into the form state.

## Stage Summary
The certification training batches are now fully DB-driven with admin CRUD. The `TrainingBatch` Prisma model holds all 4 seeded batches (Security+, CEH, CCNA, CISSP) plus any future admin-created batches. The homepage `UPCOMING BATCHES` section + the public `/batches` view both fetch from `/api/training-batches` with the static `UPCOMING_BATCHES` array kept as a fallback. The admin Batch Calendar renders all batches on a month calendar (start-date chips + schedule-day bars), supports create/edit/delete via two reusable Dialog forms (one shared `BatchFormFields` component), shows loading/error/empty states, and toasts on every CRUD action. All three relevant query keys (`admin-training-batches`, `home-training-batches`, `batches-view-training-batches`) are invalidated together so every view stays in sync after any admin change. ESLint: 0 errors. End-to-end API verification: public API returns 4 batches, admin API returns 401 (no auth) as expected, DB has 4 rows. No existing functionality broken — the homepage visual design, batches view visual design, and admin calendar layout are all preserved (only the data source swapped from static to DB + CRUD added).
