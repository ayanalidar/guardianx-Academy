# Task admin-jobs-1 — Admin Jobs CRUD

**Agent**: admin-jobs-builder
**Status**: ✅ Complete
**Date**: session #10

## What was built
Admin CRUD for the Job model, mirroring the existing Events Manager pattern.

## Files created
- `src/app/api/admin/jobs/route.ts` — GET (all jobs, ADMIN-only) + POST (create, postedById forced to admin)
- `src/app/api/admin/jobs/[id]/route.ts` — PATCH (whitelisted fields) + DELETE (cascade to applications)
- `src/views/admin-jobs.tsx` — AdminJobsView (named export, ~330 lines, "use client")

## Files modified (wiring)
- `src/store/app-store.ts` — added `| { name: "admin-jobs" }` after `admin-learning-paths`
- `src/lib/url-router.ts` — added `"admin-jobs"` to knownViews after `"admin-learning-paths"`
- `src/app/page.tsx` — dynamic import + render conditional `{view.name === "admin-jobs" && <AdminJobsView />}`
- `src/components/platform/app-shell.tsx` — added `{ label: "Jobs Board", icon: Briefcase, view: { name: "admin-jobs" } }` to ADMIN_NAV

## Important note for downstream agents
The task description's Job field list (salaryMin/salaryMax/currency/experienceMin/experienceMax/postedAt/featured/category) did NOT match the real Prisma schema. The real `model Job` has: title, company, companyLogo?, location, remote (Bool), type, salary (free text), description, requirements, requiredCerts (JSON array string), requiredSkills (JSON array string), postedById (FK→User, server-forced), status (active|closed|draft), applications[], createdAt. I built against the real schema.

## Key implementation details
- `requiredCerts` + `requiredSkills` round-trip: stored as JSON array strings in DB → shown as comma-separated text in the admin form → re-normalized to JSON arrays on save. The API accepts real arrays, JSON array strings, or comma/newline-separated strings defensively.
- `postedById` is forced to `user.id` on the server during POST — never trusted from the client.
- GET includes `postedBy` (id/name/email) + `_count.applications` (exposed as `applicationCount`).
- View has stats strip (Total / Active / Drafts / Closed / Applications), search input, status filter Select, color-coded status badges (emerald=active, amber=draft, muted=closed), violet "Remote" badge, violet application-count badge.
- Delete confirm dialog warns about N applications being cascade-deleted if > 0.

## Lint + TypeScript
- `bun run lint` → 0 errors, 0 warnings in new files (1 pre-existing warning in src/lib/db.ts).
- `npx tsc --noEmit --skipLibCheck` (full project) → 0 errors in new files.

## Navigation entry
Admin sidebar → "Jobs Board" (Briefcase icon) → renders AdminJobsView at `#/admin-jobs`.
