# DEEP-AUDIT — GuardianX LMS Deep Security + Dead Code Audit

**Task ID:** DEEP-AUDIT
**Agent:** Z.ai Code subagent (Explore)
**Mode:** RESEARCH-ONLY — no code modified.
**Scope:** `src/app/api/**`, `src/views/**`, `src/components/**`, `src/hooks/**`, `src/lib/**`, `prisma/**`
**Method:** Static review via Read/Grep/Glob + cross-reference against `src/app/page.tsx` (SPA ViewRouter) and `prisma/schema.prisma`.

---

## Part 1 — Security Findings

### 1.1 Auth / RBAC enforcement (admin + instructor + school routes)

| # | Severity | File / Location | Finding | Recommendation |
|---|----------|-----------------|---------|-----------------|
| S1 | OK | All `src/app/api/admin/**/route.ts` (29 files) | Every admin route checks `getCurrentUser()` AND `user.role !== "ADMIN"` (or `requireRole(["ADMIN"])`). 100% coverage. | None — admin RBAC is correctly enforced. |
| S2 | OK | All `src/app/api/instructor/**/route.ts` (24 files) | Every instructor route checks role AND ownership (`course.instructorId !== user.id` for ADMIN-bypass). | None. |
| S3 | OK | All `src/app/api/school/**/route.ts` (12 files) | Every school route checks `user.role !== "SCHOOL_ADMIN"` + `user.schoolId`. | None. |
| S4 | LOW | `src/app/api/admin/users/route.ts:102-111` | POST accepts role values `SUPER_ADMIN`, `PROCTOR`, `INSTITUTION_ADMIN` from the request body. These roles are stored but the codebase never uses them in any `requireRole()` / `user.role !==` check — so a user with `role="SUPER_ADMIN"` would actually be DENIED access to `/api/admin/*` (which only allows `ADMIN`). A misnamed "SUPER_ADMIN" account is a less-privileged account, which is misleading. | Either remove the unused roles from `validRoles` or extend every `requireRole(["ADMIN"])` to include `SUPER_ADMIN`. |
| S5 | LOW | `src/app/api/admin/users/route.ts:125-132` | Creating a `SCHOOL_ADMIN` user via this route does NOT set `schoolId` or create a `SchoolMember` row. The resulting user is a `SCHOOL_ADMIN` with no school — they will get a 403 "No school linked to this account" from every `/api/school/*` endpoint. | When `finalRole === "SCHOOL_ADMIN"` is selected, require a `schoolId` field in the body and create a `SchoolMember` row. |

### 1.2 Input validation (admin POST/PATCH routes)

| # | Severity | File | Finding | Recommendation |
|---|----------|------|---------|-----------------|
| S6 | MEDIUM | `src/app/api/admin/batches/route.ts`, `admin/certifications/route.ts`, `admin/courses/route.ts`, `admin/courses/[id]/modules/route.ts`, `admin/labs/route.ts`, `admin/leads/route.ts`, `admin/leads/[id]/notes/route.ts`, `admin/modules/[id]/lessons/route.ts`, `admin/partners/route.ts`, `admin/site-content/seed/route.ts`, `admin/training-batches/route.ts`, `admin/users/route.ts` (12 files) | POST/PATCH handlers use **manual** `if (!name?.trim())` checks instead of `zod`. No type/length/range enforcement on numeric fields (e.g. `Number(durationMin ?? 30)`, `Number(points ?? 100)`). Malformed JSON or `null`/object values silently coerce to `NaN`/`0` and persist as bad data. | Migrate to `zod` schemas (already used by `/api/auth/register`, `/api/contact`, `/api/parent/register`). The codebase has `zod ^4.0.2` installed. |
| S7 | MEDIUM | All `src/app/api/instructor/**` and `src/app/api/school/**` POST routes (19 files) | Same pattern as S6 — manual validation only. Same risk. | Same fix. |

### 1.3 SQL injection / Prisma injection

| # | Severity | File | Finding | Recommendation |
|---|----------|------|---------|-----------------|
| S8 | OK | `src/app/api/sentinel/health/route.ts:7` | The only `$queryRaw` in the codebase is `` db.$queryRaw`SELECT 1` `` — a parameterized tagged template literal with no user input. No injection risk. | None. |
| S9 | OK | All other routes | All Prisma `.findMany`/`.where` clauses use Prisma's typed query builder; no `Prisma.raw()` / `Prisma.sql()` interpolation of user input was found. `where: { title: { contains: q } }` is parameterized. | None. |

### 1.4 Exam security (correct-answer leakage, server-side grading)

| # | Severity | File | Finding | Recommendation |
|---|----------|------|---------|-----------------|
| S10 | OK | `src/app/api/exams/[id]/start/route.ts:43-58` | The `select` clause explicitly **omits** `correctAnswer` and `explanation` from the QuestionBank query. `buildClientQuestions()` only returns `id/type/domain/skill/difficulty/question/options/points/tags` to the client. | None. |
| S11 | OK | `src/app/api/exams/[id]/submit/route.ts:142,179,212` | Grading is server-side (`isAnswerCorrect(q, selected)`). For wrong answers, `correctAnswer: null` and `explanation: null` are returned (lines 179, 212). Only correct answers reveal the answer. The client cannot self-grade — the submitted `answers[]` is only used to compute `correct: true/false` server-side. | None. |
| S12 | OK | `src/app/api/exams/[id]/submit/route.ts:81-95` | Attempt ownership is verified (`attempt.userId !== user.id → 403`, `attempt.examId !== examId → 400`, `attempt.status !== "in-progress" → 400`). Idempotent credential issuance (line 309-311). | None. |

### 1.5 Lab flag exposure

| # | Severity | File | Finding | Recommendation |
|---|----------|------|---------|-----------------|
| S13 | OK | `src/lib/safe-lab.ts` | `safeLab()` strips `flag` via `Omit<Lab, "flag">`. | None. |
| S14 | OK | `src/app/api/labs/route.ts:39` | `safeLabs(labs).map(...)` — listing never ships flags. | None. |
| S15 | OK | `src/app/api/labs/[slug]/route.ts:23` | `safeLab(lab)` — detail route never ships flag. | None. |
| S16 | OK | `src/app/api/labs/leaderboard/route.ts:11-14`, `labs/stats/route.ts:9-12` | `select` clause omits `flag`. | None. |
| S17 | OK | `src/app/api/labs/[slug]/submit/route.ts:53-93` | Server compares `flag?.trim() === lab.flag`. The flag is only echoed back to the client AFTER a correct submission (line 89: `flag: correct ? lab.flag : null`). | None. |
| S18 | LOW | `src/app/api/labs/[slug]/orchestrate/route.ts:105,217` | The orchestrate `start` and `status` actions return `dynamicFlag: updated.dynamicFlag` directly to the client. This defeats the purpose of having the user find the flag inside the container. **Mitigating factor:** this endpoint is not called by any frontend view (confirmed in Part 2 — dead code). If a future feature wires up the multiplayer CyberRange flow against this endpoint, users will get the flag for free. | When (re)activating orchestrate, do NOT return `dynamicFlag` in the response — store it only server-side and verify submitted flags against `session.dynamicFlag`. |

### 1.6 Rate limiting

| # | Severity | File | Finding | Recommendation |
|---|----------|------|---------|-----------------|
| S19 | OK | `src/app/api/contact/route.ts:7-21` | IP-based rate limit (3/min). | None. |
| S20 | OK | `src/app/api/auth/register/route.ts:7-21` | IP-based rate limit (5/min). | None. |
| S21 | HIGH | `src/app/api/auth/[...nextauth]/route.ts` | The NextAuth credential login handler has **no rate limit**. Combined with `bcrypt.hashSync(password, 12)` rounds and the constant-time `bcrypt.compareSync`, an attacker can attempt unlimited password guesses against any known email. The register route is rate-limited, but the login route is the actual brute-force target. | Add a per-IP rate limit (e.g. 10 attempts/min) inside the `authorize()` callback in `src/lib/auth.ts`, or use NextAuth's built-in account-lockout via a custom adapter. |
| S22 | MEDIUM | `src/app/api/parent/route.ts:262` | Parent login endpoint has no rate limit. Brute-forceable (password hashed with bcrypt 10 rounds). | Add IP rate limit (same pattern as `register`). |
| S23 | MEDIUM | `src/app/api/parent/register/route.ts` | No rate limit (parent registration). Lower impact since attacker must supply a valid existing `studentEmail`, but still allows enumeration of which student emails exist (404 vs 409 responses). | Add rate limit + return generic "registration failed" for both "student not found" and "parent already exists" cases. |
| S24 | LOW | All `src/app/api/admin/**` POST/PATCH/DELETE routes | No rate limit. Lower risk because they require ADMIN auth, but an authenticated malicious ADMIN could spam-create records. Out-of-scope for this audit. | Optional. |
| S25 | MEDIUM | `src/app/api/crm/webhook/route.ts` | No rate limit on the webhook endpoint. Token-based auth (one shared secret) means anyone with the secret can submit unlimited leads. | Add IP rate limit + length-cap the `lead` body fields. |

### 1.7 Secrets exposure

| # | Severity | File | Finding | Recommendation |
|---|----------|------|---------|-----------------|
| S26 | HIGH | `src/app/api/crm/webhook/route.ts:37` | `const webhookSecret = process.env.CRM_WEBHOOK_SECRET \|\| "guardianx-crm-webhook-2025"`. **Hardcoded fallback secret in source.** If `CRM_WEBHOOK_SECRET` env var is not set (likely in dev and possibly in prod), the secret is the public string `"guardianx-crm-webhook-2025"`. Anyone reading the source can submit arbitrary leads to `/api/crm/webhook`. | Fail loudly in production if `CRM_WEBHOOK_SECRET` is not set (same pattern as `NEXTAUTH_SECRET` in `src/lib/auth.ts:88-96`). Remove the hardcoded fallback. |
| S27 | MEDIUM | `src/app/api/admin/instructors/route.ts:99` | `const finalPassword = password && password.length >= 6 ? password : "GuardianX@123"`. **Hardcoded default instructor password.** When an admin creates an instructor without supplying a password, the instructor account gets the well-known password `"GuardianX@123"`. If the instructor doesn't immediately change it, anyone who reads the source can log in as any instructor created this way. | Either require a password at creation time (return 400 if missing) or generate a random per-instructor password and email it via `/api/lib/email.ts`. |
| S28 | LOW | `src/components/platform/auth-screen.tsx:30-33` | Demo credentials (`student123`, `instructor123`, `admin123`) hardcoded. **Mitigating factor:** gated behind `IS_DEV = process.env.NODE_ENV !== "production"` (line 29), so the demo accounts are only rendered in development. The corresponding seeded accounts in production use different passwords (per worklog PROD-DB task). | Verify the production seed uses different passwords than these demo values (verify in `prisma/seed-production.ts`). |
| S29 | LOW | `src/components/platform/site-footer.tsx:263-265` | The footer prints the demo credentials (`student@guardianx.io / student123`, `instructor@guardianx.io / instructor123`) unconditionally — **no `IS_DEV` gate.** This footer is the dead `SiteFooter` component (see Part 2), so the leak isn't user-facing, but if it's ever reactivated these credentials will be visible to every visitor including in production. | If reactivating `SiteFooter`, gate the demo strip behind `IS_DEV` like `auth-screen.tsx` does. |
| S30 | OK | `.env` Neon URL | The `DATABASE_URL` is in `.env` (git-ignored). No source file under `src/` contains the Neon URL or `npg_HaLfn1qG…` token. | None. |
| S31 | INFO | `dev.sh:2` and `agent-ctx/*.md` | The Neon URL + `NEXTAUTH_SECRET='guardianx-dev-secret-key-change-in-prod-9f7b'` are checked into `dev.sh` and various `agent-ctx/*.md` files. These are dev-only artifacts but live in the repo. If the repo is public, both the DB URL and the dev NEXTAUTH_SECRET are exposed. The prod secret is presumably different. | Add `dev.sh` and `agent-ctx/*.md` to `.gitignore` if the repo is (or will be) public; or rotate the Neon DB password. |

---

## Part 2 — Dead Code Findings

> All items below are **static** dead-code findings (no runtime reference). Each item lists a safety assessment. None were removed (research-only task).

### 2.1 Unused view files (not imported by `src/app/page.tsx`)

| # | File | Exports | Reason it's dead | Safe to remove? |
|---|------|---------|------------------|-----------------|
| D1 | `src/views/mock-exams.tsx` | `MockExamsView` (default? — actually no named export visible) | Not imported anywhere. Not in `View` union in `src/store/app-store.ts`. The footer's "Mock Exams" link goes to `exams`, not `mock-exams`. | YES — remove the file. The `/api/mock-exams` route it calls is also unused (see D-APIS). |
| D2 | `src/views/grc.tsx` | (no named export visible) | Not imported. Not in `View` union. The `/api/grc` route it calls is also unused. | YES — remove file + `/api/grc` route + `GrcContent` Prisma model. |
| D3 | `src/views/partner-institutions.tsx` | `PartnerInstitutionsView` | Not imported. Not in `View` union. Footer's "Partners" link (in dead `SiteFooter`) goes to `{ name: "partners" }` which is also not in the `View` union — so even if `SiteFooter` were active, this view would never render. View is purely static content (no `fetch` calls). | YES — remove file. |
| D4 | `src/views/legal.tsx` | (1400+ lines, no named export visible) | Not imported. Not in `View` union. `View` names referenced by dead `SiteFooter` (`privacy`, `terms`, `faq`, `refund`, `cookies`, `conduct`) don't exist in the union; `PublicFooter` rewrites them all to `support`. The `legal.tsx` content was apparently never wired into the SPA router. | YES — remove file. The legal content lives in `support.tsx` per `PublicFooter` routing. |
| D5 | `src/views/exam-view.tsx` | `ExamView` | Not imported. The active exam views are `exams.tsx` + `exam-detail.tsx` (both wired in `page.tsx`). `exam-view.tsx` is a stale older version. | YES — remove file. |
| D6 | `src/views/certifications.tsx` | (unnamed) | Not imported by `page.tsx`. Not in `View` union (only `certificates` is, which renders `CertificatesView` from `certificates.tsx`). The only file referencing `certifications` view name is the dead `SiteFooter`. The view itself is alive internally (calls `/api/certifications`), but nothing routes to it. | YES — remove file + consider removing `/api/certifications` route if no other consumer exists (the API is called by `ai-course-generator.tsx` which is also dead, see D7). |
| D7 | `src/views/ai-course-generator.tsx` | (unnamed) | Not imported. The `/api/ai-course-generator` endpoint is called from `course-studio.tsx:1719` (live view), so the API stays. The view file itself is dead. | YES — remove the view file. Keep the API route. |
| D8 | `src/views/school-dashboard-inner.tsx` | (internal helper) | Imported by `school-dashboard.tsx` — **NOT DEAD.** (Listed here only to note that it is NOT dead, despite having no direct page.tsx import.) | NO — keep. |

### 2.2 Unused API routes (not called by any frontend view/component/hook)

Each route below has zero `fetch`/`api(...)` call-sites in `src/views`, `src/components`, `src/hooks`. Confirmed via ripgrep on the route path string.

| # | Route | Status | Notes |
|---|-------|--------|-------|
| D9 | `/api/admin/analytics` | Dead | No frontend caller. (Admin dashboard uses `/api/admin/overview`.) |
| D10 | `/api/admin/batches` | Dead | Superseded by `/api/admin/training-batches` (live). |
| D11 | `/api/admin/certifications` + `[id]` | Dead | No frontend caller. `/api/certifications` (public) is used by dead `certifications.tsx`. |
| D12 | `/api/admin/partners` + `[id]` | **DEAD + BROKEN** — references `db.partnerInstitution` which doesn't exist in `schema.prisma`. Will throw at runtime if called. See R1. |
| D13 | `/api/career/roles` + `/path` | Dead | No frontend caller. The `/api/career-roles` route (plural-with-dash, different name) is what the career-planner view actually uses. |
| D14 | `/api/cyber-range` + `[id]` | Dead | Per `agent-ctx/P6-P8-P9-VIEWS-full-stack-developer.md:29`: "The OLD multiplayer CyberRangeView (which used `/api/cyber-range` for session management) was REPLACED by the new cinematic showcase per orchestrator's explicit instruction." `cyber-range.tsx` now calls `/api/labs`, not `/api/cyber-range`. |
| D15 | `/api/exams/attempts` + `[id]` | Dead | No frontend caller. |
| D16 | `/api/lab-sessions` + `[id]` | Dead | No frontend caller. (Frontend uses `/api/labs/[slug]/orchestrate` flow — but that's also dead per D17.) |
| D17 | `/api/labs/[slug]/orchestrate` | Dead + Latent security issue (S18) | No frontend caller. |
| D18 | `/api/me/attendance` | Dead | No frontend caller. |
| D19 | `/api/me/recommendations` | Dead | No frontend caller. (Was probably intended for a "recommended for you" UI section.) |
| D20 | `/api/partners` | Dead + BROKEN — also references `db.partnerInstitution`. See R1. |
| D21 | `/api/pwa` | Dead | The PWA manifest is served from `public/manifest.json` directly; this metadata endpoint isn't called by any view. |
| D22 | `/api/school/announcements` | Dead | No frontend caller. |
| D23 | `/api/school/courses` | Dead | No frontend caller. |
| D24 | `/api/school/onboard` | Dead | No frontend caller. |
| D25 | `/api/search` | Dead | No frontend caller. (Old global-search feature; current catalog view uses local search via `/api/courses`.) |
| D26 | `/api/sentinel/incidents` | Dead + BROKEN — references `db.incident` (model doesn't exist). Has try/catch that swallows the error and returns empty array, so won't crash but is permanently broken. See R2. |
| D27 | `/api/sentinel/events` | Dead + BROKEN — references `db.systemEvent` (model doesn't exist). Same try/catch swallow. See R2. |
| D28 | `/api/sentinel/actions` | Dead + BROKEN — references `db.sentinelAction` (model doesn't exist). Same try/catch swallow. See R2. |
| D29 | `/api/sentinel/health` | Dead | No frontend caller. (`admin-platform-health.tsx` uses hardcoded static data, not this route.) Endpoint works (only uses `db.$queryRaw` + standard `db.*.count()` calls). |
| D30 | `/api/site-content` (GET) | Dead | Public GET; no frontend caller (the CMS uses `/api/cms/[page]` and `/api/admin/site-content/seed`). |
| D31 | `/api/stats` | Dead | No frontend caller. |
| D32 | `/api/mock-exams` | Dead | No frontend caller (the dead `mock-exams.tsx` was its only consumer). |

**Total: 24 dead API routes** (out of ~206 = 11.7%).

### 2.3 Unused `home-data.ts` exports

| # | Symbol | Line | Status |
|---|--------|------|--------|
| D33 | `INSTRUCTORS` | `home-data.ts:637` | DEAD — `home.tsx:72` explicitly comments `// INSTRUCTORS removed — now fetched from /api/instructors`. ~40-line array of hardcoded instructor data with no consumer. Safe to remove. |
| (all other exports) | `PILLARS`, `RANGE_SERVICES`, `LEARNING_PATHS`, `BRANCH_ANGLES`, `BRANCHES`, `SKILL_DOMAINS`, `SKILL_MAP_DATA`, `DAILY_OBJECTIVES`, `RANK_LADDER`, `CAREER_SKILLS`, `CAREER_ROLES`, `INSTITUTION_TYPES`, `STORY_STAGES`, `STORIES`, `TRUST_STATS`, `FALLBACK_PARTNERS`, `AUDIENCES`, `UPCOMING_BATCHES`, `SCHEDULES`, `METHODOLOGY_STEPS` | — | All imported by `home.tsx` (multi-line import block at lines 51-77) or by `batches.tsx` (`UPCOMING_BATCHES`) or by `advanced-skill-map.tsx` (`SKILL_DOMAINS`, `SKILL_MAP_DATA`). NOT dead. |

### 2.4 Unused Prisma models

| # | Model | Status |
|---|-------|--------|
| D34 | `Permission` (`schema.prisma:1601`) | DEAD — never accessed via `db.permission` in any API route, lib, or seed script. Added in the EXAMS-RBAC-FIX task as part of the `requireRole()` introduction but never wired up. Safe to remove from schema. |

### 2.5 Unused seed scripts

| # | File | Status |
|---|------|--------|
| D35 | `prisma/seed-content-cms.ts` | **BROKEN** — references `db.partnerInstitution.count()` (line 260) and `db.partnerInstitution.create()` (line 266) but `PartnerInstitution` model does NOT exist in `schema.prisma`. Will throw at runtime if invoked. See R1. The `SEED_CMS` portion of this file (imported from `src/lib/cms-seed.ts`) is the only salvageable part. |
| D36 | `prisma/seed-labs.ts`, `seed-labs-2.ts`, `seed-labs-3.ts`, `seed-payload-labs.ts` | Four overlapping lab seeders; the latest (`seed-labs-3.ts`) supersedes the earlier ones. Earlier three are likely stale. **No package.json `seed` script references any of them** — they must be run manually via `bun run prisma/seed-*.ts`. Safety: low risk to leave (won't auto-run); high risk if someone re-runs the older ones expecting them to add fresh data (they may overwrite/duplicate). |
| D37 | `prisma/seed.ts`, `seed-content.ts`, `seed-content-2.ts`, `seed-cms.ts`, `seed-courses-advanced.ts`, `seed-events.ts`, `seed-exams.ts`, `seed-instructor-profiles.ts`, `seed-production.ts`, `seed-quizzes.ts`, `seed-school.ts`, `seed-students-reviews.ts`, `seed-templates.ts`, `seed-batches.ts` | All functional (no broken model refs) but **no `prisma.seed` field in `package.json`** — they're not invoked by Prisma's `db:seed` and have no script entrypoint. They're ad-hoc dev artifacts. Safe to keep but documentation note: they need to be run manually. |

### 2.6 Unused components

| # | File | Exports | Reason | Safe to remove? |
|---|------|---------|--------|------------------|
| D38 | `src/components/platform/site-footer.tsx` | `SiteFooter` | Not imported anywhere (only the file itself contains the export). 7 references to nonexistent `View` names (`auth`, `about`, `partners`, `privacy`, `terms`, `faq`, `refund`, `cookies`, `conduct`, `impact`). Superseded by `public-footer.tsx`. Also leaks demo credentials unconditionally (S29). | YES — remove. |
| D39 | `src/components/platform/animations.tsx` | `ScrollReveal`, `Stagger`, `StaggerItem`, `TextReveal`, `MagneticButton`, `Parallax`, `Counter`, `CursorGlow`, `FadeIn`, `ScaleIn`, `AnimatedSection` | Superseded by `src/components/platform/motion-system.tsx` which exports the same names (plus more: `ClipReveal`, `PinnedSection`, `HorizontalScroll`, `ScrollText`, `ScaleReveal`, `BlurReveal`). All view imports use `@/components/platform/motion-system`. The `animations.tsx` file is an older duplicate that is never imported. | YES — remove. |
| D40 | `src/components/platform/theme-toggle.tsx` | `ThemeToggle` (assumed) | Not imported anywhere. The active theme toggle (if any) is provided by `next-themes` via `src/components/providers/theme-provider.tsx`. | YES — remove. |
| D41 | `src/components/platform/holographic-globe.tsx` | (unnamed) | Not imported anywhere. Visual flourish that was never wired into a view. | YES — remove. |
| D42 | `src/components/platform/in-browser-terminal.tsx` | (unnamed) | Not imported anywhere. The active terminal experience uses `src/components/cyber/terminal.tsx` (`CyberTerminal`). | YES — remove. |
| D43 | `src/components/platform/service-worker-register.tsx` | `ServiceWorkerRegister` | Not imported anywhere — the active SW register is `src/components/providers/service-worker-register.tsx` (imported by `src/app/layout.tsx:7` and `src/components/providers/providers.tsx:8`). The platform/ duplicate is dead. | YES — remove. |

### 2.7 Unused hooks

| # | File | Status |
|---|------|--------|
| D44 | `src/hooks/use-notifications.ts` | DEAD — exports `useNotifications()` but is not imported anywhere. Notification polling appears to be inlined into views that need it. Safe to remove. |
| (other hooks) | `use-bookmarks.ts`, `use-mobile.ts`, `use-user.ts`, `use-toast.ts` | All used. |

### 2.8 Unused lib files

| # | File | Status |
|---|------|--------|
| D45 | `src/lib/cms-seed-data.ts` | DEAD — exports `ALL_CONTENT` (664 lines) but the symbol is not imported anywhere. `src/lib/cms-seed.ts` (`SEED_CMS`) is the active version (used by `prisma/seed-cms.ts` and dynamically imported by `/api/admin/site-content/seed/route.ts:43`). The older `cms-seed-data.ts` is an unused duplicate. Safe to remove. |
| (other lib files) | `email.ts`, `session.ts`, `auth.ts`, `db.ts`, `api.ts`, `safe-lab.ts`, `gamification.ts`, `parent-auth.ts`, `colors.ts`, `course-images.ts`, `csv.ts`, `webrtc.ts`, `cms-icons.tsx`, `cms-seed.ts`, `notifications.ts`, `url-router.ts`, `use-content.ts`, `utils.ts`, `certificate-pdf.ts` | All imported somewhere. |

---

## Part 3 — Runtime Error Risks

### 3.1 Missing `await` on db calls

**Result:** CLEAN. Of 241 db mutation calls (`create`/`update`/`delete`/`upsert`) in `src/app/api`, ALL are preceded by `await` (or are inside `await Promise.all([...])` blocks). Of 708 `await db.` call-sites total, none were missing `await`. The "matches" my regex initially flagged were all array elements inside `Promise.all` (correct pattern).

### 3.2 Unhandled promise rejections (`.then()` without `.catch()`)

| # | Severity | File:Line | Finding |
|---|----------|-----------|---------|
| R0a | OK | `src/app/page.tsx:194-196, 215-217` | Two `fetch(...).then(...).catch(...)` chains in `page.tsx` are properly caught. |
| R0b | OK | `src/app/api/school/reports/route.ts:135` | The single `.then()` in API routes is inside an `await Promise.all(...)` chain — properly awaited. |
| R0c | OK | All other API routes | No bare `.then()` chains without `.catch()`. The pattern `await req.json().catch(() => null)` is widely used (good practice — handles malformed JSON). |

### 3.3 Missing error responses (no try/catch)

| # | Severity | Finding |
|---|----------|---------|
| R3 | MEDIUM | **120 of 206 API routes (58%) do NOT wrap their handler body in try/catch.** If Prisma throws (e.g. constraint violation, connection error, type coercion), Next.js returns a raw 500 with the Prisma error stack trace leaked to the client. Most admin/instructor/school routes have manual `if (!body) return 400` checks but no top-level catch. The public-facing `/api/contact`, `/api/auth/register`, `/api/parent/register`, `/api/crm/webhook`, `/api/exams/[id]/submit`, `/api/labs/[slug]/orchestrate` (start branch) all have try/catch. **All `/api/admin/**` and most `/api/instructor/**` routes do not.** Recommendation: add a Next.js route-segment `export const dynamic = "force-dynamic"` + a global error boundary, OR wrap each handler. |

### 3.4 Critical: `db.<missing-model>` references (will throw at runtime)

| # | Severity | File:Line | Model referenced | Exists in schema? | Impact |
|---|----------|-----------|------------------|-------------------|--------|
| R1 | **CRITICAL** | `src/app/api/partners/route.ts:7`<br>`src/app/api/admin/partners/route.ts:13,50,54`<br>`src/app/api/admin/partners/[id]/route.ts:14,54,71,74`<br>`prisma/seed-content-cms.ts:260,266` | `db.partnerInstitution` | **NO** — only `TechnologyPartner` exists (different concept). The `PartnerInstitution` model was created in a previous task (per `agent-ctx/EDIT-1-edit-cms-builder.md:17,31`) but has since been removed from `schema.prisma`. | All 6 endpoints + 1 seed script will throw `TypeError: Cannot read properties of undefined (reading 'findMany')` at runtime. The `/api/partners` endpoint is **public** (no auth) so any visitor will see a 500. **Fix:** either add `PartnerInstitution` back to the schema, or remove the 3 dead routes + remove the dead `prisma/seed-content-cms.ts` script. |
| R2 | HIGH | `src/app/api/sentinel/incidents/route.ts:9,20`<br>`src/app/api/sentinel/events/route.ts:8`<br>`src/app/api/sentinel/actions/route.ts:8` | `db.incident`, `db.systemEvent`, `db.sentinelAction` | **NO** — none of these models exist in `schema.prisma`. | All 4 sentinel endpoints wrap their db calls in try/catch and return empty arrays on error, so they won't crash the request — they'll silently return `[]` forever. The endpoints are also dead (no frontend caller, per D26-D28). **Fix:** remove the entire `/api/sentinel/*` directory + the unused `Incident`/`SystemEvent`/`SentinelAction` model definitions if they were ever added. |

### 3.5 Type mismatches between API response shape and frontend expectation

| # | Severity | File pair | Finding |
|---|----------|-----------|---------|
| R4 | OK | `/api/me` (response: `{ user, stats, gamification, activities }`) vs `useUser()` (`src/hooks/use-user.ts:35`) | Type matches. |
| R5 | OK | `/api/exams/[id]/submit` (response: `{ attempt, exam, grading, answers, credential }`) vs `exam-detail.tsx` consumer | Exam detail reads `result.attempt.score`, `result.answers`, `result.credential?.credentialId` — all present in response. |
| R6 | LOW | `/api/labs/[slug]/orchestrate` start response includes `dynamicFlag` (the answer) | Frontend (`cyber-range.tsx`) doesn't call this route. Latent only. |
| R7 | INFO | `/api/crm/webhook` accepts a top-level `body.token` for auth | Other webhooks typically use HTTP header auth. Frontend doesn't call this; it's a server-to-server endpoint. |

### 3.6 Stale references (views importing deleted Prisma models/fields)

**Result:** CLEAN. A script iterating all `from "@/..."` imports in `src/views/`, `src/components/`, `src/hooks/`, `src/lib/` resolved every import path against the filesystem — **0 stale import paths**. No view imports a deleted module. The `PartnerInstitution` problem (R1) is the opposite: the API uses a model that no longer exists in the schema, not a view importing a deleted API.

---

## Summary

### Issue counts by severity

| Severity | Count | Where |
|----------|-------|-------|
| **CRITICAL** | 1 | R1 (PartnerInstitution model missing — 6 endpoints + 1 seed broken) |
| **HIGH** | 3 | S21 (login has no rate limit), S26 (hardcoded CRM webhook secret), R2 (3 Sentinel models missing — endpoints silently broken) |
| **MEDIUM** | 9 | S6 (12 admin routes lack zod), S7 (19 instructor/school routes lack zod), S22 (parent login no rate limit), S23 (parent register no rate limit), S25 (CRM webhook no rate limit), S27 (hardcoded instructor default password), R3 (120 API routes lack try/catch), S4 (unused role strings accepted), S5 (school admin created without schoolId) |
| **LOW** | 6 | S18 (orchestrate returns dynamicFlag — latent only), S24 (admin routes no rate limit — admin-gated), S28 (demo creds gated by IS_DEV), S29 (dead SiteFooter leaks demo creds unconditionally), S31 (dev.sh + agent-ctx contain Neon URL), R6 (same as S18) |
| **INFO** | 3 | S30 (.env not in source), R7, R4/R5 (clean matches) |
| **OK** | 13 | All other findings verified safe. |
| **Dead code items** | 45 | D1–D45 (1 unused Prisma model, 7 unused views, 24 unused API routes, 1 unused home-data export, 6 unused components, 1 unused hook, 1 unused lib file, plus 4 superseded seed scripts). |

### Top 5 recommendations

1. **🚨 Fix R1 immediately** — Add `PartnerInstitution` back to `prisma/schema.prisma` (the model definition is in `agent-ctx/EDIT-1-edit-cms-builder.md:31`), OR delete the 3 broken partner API routes + `prisma/seed-content-cms.ts`. As-is, the public `/api/partners` endpoint crashes for every visitor. Same fix path resolves R2 (Sentinel models) — delete `/api/sentinel/*` since it's dead and silently broken.

2. **🔐 Add rate limiting to login endpoints (S21, S22, S23)** — Extend the existing in-memory `checkRateLimit()` pattern from `src/app/api/auth/register/route.ts` into `src/lib/auth.ts:authorize()` (or wrap the `signIn` call in `auth-screen.tsx`) and into `/api/parent/route.ts:262` and `/api/parent/register/route.ts`. Brute-force is the most likely attack vector for a credentials-based platform with public registration.

3. **🔐 Remove hardcoded secrets (S26, S27)** — In `src/app/api/crm/webhook/route.ts:37`, follow the same fail-loudly pattern as `NEXTAUTH_SECRET` in `src/lib/auth.ts:88-96`: `if (NODE_ENV === "production" && !process.env.CRM_WEBHOOK_SECRET) throw new Error(...)`. In `src/app/api/admin/instructors/route.ts:99`, require a `password` field (return 400 if missing) instead of defaulting to `"GuardianX@123"`.

4. **🧹 Delete the dead code (D1, D3, D4, D5, D6, D7 + D9–D32 + D38–D45)** — Removing the 7 dead views, 24 dead API routes, 6 dead components, 1 dead hook, 1 dead lib file, and 1 dead Prisma model reduces the codebase surface area meaningfully (~30+ files) and eliminates entire categories of latent bugs (like S18 — the orchestrate flag leak only matters if someone wires up the dead route). Combined with fixes #1 and #2, this is the single biggest code-health win. The dead `SiteFooter` (D38) is also a security item (S29) — its unconditional demo-credential strip should not be in the codebase.

5. **🛡️ Add zod validation + try/catch to admin/instructor/school routes (S6, S7, R3)** — The 31 admin/instructor/school POST routes that use manual `if (!field?.trim())` checks should adopt `zod` (already used in 3 routes). All 120 routes lacking try/catch should be wrapped — even a thin top-level `try { ... } catch (e) { return NextResponse.json({ error: "Internal error" }, { status: 500 }) }` would prevent Prisma stack traces from leaking to clients. Consider a `withErrorHandler()` higher-order wrapper in `src/lib/session.ts` to apply both fixes uniformly.

---

*End of audit. No code was modified during this research-only task.*
