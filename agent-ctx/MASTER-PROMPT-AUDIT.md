# GuardianX Academy — Master Prompt Audit Report

**Task ID:** MASTER-PROMPT-AUDIT
**Agent:** Explore (research-only)
**Date:** 2026-09-01 (session continuation)
**Scope:** Compare current codebase against the 108-section / 26-phase master prompt at `upload/Pasted Content_1788289113141.txt`.
**Method:** READ-ONLY. No code modified. Every finding is backed by file inspection.

Status legend: **DONE** · **PARTIAL** · **MISSING** · **BROKEN** · **INSECURE**

---

## 1. Routing — §7-13

**Status: DONE** (with one **BROKEN** sub-item)

**Evidence**
- `src/lib/url-router.ts` — `viewToHash` / `hashToView` serialise the Zustand `View` state into the URL hash. Known-views whitelist (~58 view names). Unknown hash → falls back to `home` (no crash).
- `src/store/app-store.ts` — `pushViewToHash` / `replaceViewInHash` write to `history.pushState`, `popstate` + `hashchange` listeners handle back/forward.
- `src/app/page.tsx` — calls `hydrateFromHash()` in a useEffect to sync deep links on mount; re-fetches `/api/auth/session` on every navigate event (login-flow fix from this session).

**Gaps**
- `#/verify` and `#/verify/:certificateId` are advertised by master-prompt §9 and by the credentials view (`window.open('/verify?id=' + credId)`) but **no `verify` view exists in the URL router known-views list**, and there is no real Next.js route at `/verify`. Opening that URL in a new tab 404s. → **BROKEN** (links from `credentials.tsx` to `/verify?id=…`).
- `#/corporate-training`, `#/grc`, `#/events`, `#/careers`, `#/instructors`, `#/mock-exams`, `#/proctored-exams`, `#/challenges`, `#/partner`, `#/about`, `#/faq`, `#/help`, `#/security`, `#/privacy`, `#/terms`, `#/refund-policy`, `#/responsible-disclosure`, `#/cookie-policy` are all listed in master-prompt §9 but have no matching view name in the router. Either the route is absent, or it's a generic `support` view that swallows them all.
- Deep-link refresh works for all whitelisted views (the `key={JSON.stringify(view)}` remount on `page.tsx` guarantees a clean mount).

**Priority: HIGH** — close the `/verify` dead link and add the public routes the master prompt explicitly names.

---

## 2. Header navigation — §11-12

**Status: PARTIAL**

**Evidence** — `src/components/platform/public-header.tsx` (564 lines). Mega-menu has 5 groups: `Learn`, `Practice`, `Career`, `Institutions`, `About`. Active states are implemented (`isViewActive` highlights current group with violet pill + dot). Keyboard accessible (Escape closes, focus rings, `aria-expanded`).

**Gaps vs §11 spec**
- Required groups `TRAINING`, `PRACTICE`, `ASSESSMENT`, `INSTITUTIONS`, `RESOURCES`. Actual: `Learn`, `Practice`, `Career`, `Institutions`, `About`.
- **`ASSESSMENT` group is missing entirely** — no Mock Exams / Proctored Exams / Certificate Verification entry in the nav. Master-prompt §11 explicitly requires it.
- **`RESOURCES` group is missing** — no Events / Workshops / Webinars / Help in nav. Help is buried inside the `support` view only.
- **Corporate Training missing** from Institutions dropdown.
- **Mock Exams missing** from any nav group (only Proctored Exams appears under `Learn`).
- Header is hardcoded (not CMS-driven). Master-prompt §27 says navigation must be admin-editable.

**Priority: MEDIUM** — restructure groups to match §11 spec; add Mock Exams + Events + Help.

---

## 3. Footer — §55-56

**Status: PARTIAL** (one **BROKEN** sub-item)

**Evidence** — `src/components/platform/public-footer.tsx` (178 lines). Has 6 link columns: `LEARN`, `PRACTICE`, `INSTITUTIONS`, `CAREER`, `GUARDIANX`, `SUPPORT`, plus a brand column. CTA banner, contact info, "System operational" indicator.

**Gaps vs §55 spec**
- Required **7 columns**: TRAINING / PRACTICE / ASSESSMENT / INSTITUTIONS / COMPANY / RESOURCES / LEGAL. Actual is 6 columns and mis-named.
- **No `ASSESSMENT` column** (no Mock Exams / Proctored Exams / Certificate Verification).
- **No `LEGAL` column** — Privacy / Terms / Refund Policy / Responsible Disclosure / Cookie Policy. Footer has bare "Privacy" and "Terms" buttons at the bottom that point to `support` view, and no `Refund Policy` / `Responsible Disclosure` / `Cookie Policy` at all.
- **No `COMPANY` column** — missing Instructors / Careers / Security links (master-prompt §55 explicitly lists Instructors under Company).
- Dead links / dupes (§56 violation):
  - "About" and "Impact" both navigate to `impact` view (duplicate).
  - "Security" navigates to `contact` view (mismatched destination).
  - "FAQ", "Help Center", "Terms", "Privacy" all navigate to `support` view (4 links collapse to 1 destination — not real routes).
  - "Colleges & Universities" merges two distinct routes into one link (universities route is unreachable from the footer).
- Footer is hardcoded (not CMS-driven). Master-prompt §27-28 says footer must be admin-editable.

**Priority: HIGH** — fix dead links; rebuild footer to the 7-column LEGAL-inclusive spec.

---

## 4. Courses — §17-22

**Status: PARTIAL** (DB-driven catalog; detail page incomplete; course-vs-batch broken)

**Evidence**
- `src/views/course-catalog.tsx` (746 lines) — search/filter (category, level, status), DB-driven via `/api/courses`.
- `src/app/api/courses/route.ts` (92 lines) — public GET, filters by `category` / `level` / `q` / `enrolledOnly` / `status`; includes instructor + modules + enrollment counts; server-side auth via `getCurrentUser` (optional, used for progress).
- `src/app/api/admin/courses/route.ts` (143 lines) + `[id]/route.ts` (87 lines) — admin CRUD with server-side role check (`user.role !== "ADMIN"` → 403).
- `src/views/course-detail.tsx` (1505 lines) — hero, modules, lessons, instructor, prerequisites, discussions, related courses, enroll button.
- Prisma `Course` model (schema.prisma:185-224) — has title, slug, shortName, description, longDescription, category, level, durationHours, price, rating, studentsCount, thumbnail, color, tags, certBody, published, prerequisiteIds, instructorId.

**Gaps**
- Course detail page does NOT render all 20 sections listed in §21 — missing: practical exercises (only via labs tab), assignments (not surfaced on detail), study materials (no field on Course), mock exam, proctored exam, GuardianX certification, external certification preparation, career relevance, FAQs (no per-course FAQ model). Learning outcomes are **synthesised** by string-splitting `longDescription` + prepending "Master {tag} fundamentals…" (course-detail.tsx:370-383) — not a real field on the Course model.
- **Course ↔ Batch link is broken (§22)**. The `Course` model has no `batches` relation. The `Batch` model is school-tied (has `schoolId`), the `TrainingBatch` model has `certification` + `instructorId` but no `courseId`. Course detail page fakes batches via `UPCOMING_BATCHES` static array imported from `src/views/home-data.ts` (course-detail.tsx:60-70, 290). Real "one course, many batches" relationship does not exist.
- Sort options from §19 (Recommended / Newest / Popular / Upcoming / Duration / Price) — only `Popular` (default, by studentsCount desc) and `enrolledOnly` (by enrollment count) are implemented; the rest are not exposed by the API.
- Filters from §19 (Domain / Certification / Duration / Instructor / Schedule / Delivery Mode / Price / Upcoming / Practical / Assessment) — only Domain (category), Level, and search are implemented.

**Priority: HIGH** — fix the Course↔Batch relationship; add the missing 12 sections to course detail; persist `learningOutcomes`, `prerequisites`, `careerRelevance`, `faqs` as real DB columns (or a `CourseSection` model).

---

## 5. Batches — §23-24

**Status: DONE** (DB-driven with admin CRUD, server-side auth)

**Evidence**
- `src/views/batches.tsx` (726 lines) — DB-driven via `/api/training-batches`, with a `UPCOMING_BATCHES` static fallback for resilience. Filters by certification, schedule, mode, level.
- `src/views/admin-batch-calendar.tsx` — admin calendar view.
- `src/app/api/training-batches/route.ts` (15 lines) — public GET, returns `published: true` batches ordered by `order` then `startDate`.
- `src/app/api/admin/training-batches/route.ts` (206 lines) — admin GET (ADMIN+INSTRUCTOR), POST (ADMIN-only) with auto-computed cert/level color palettes.
- `src/app/api/admin/training-batches/[id]/route.ts` (104 lines) — admin GET/PATCH/DELETE, allow-listed field updates, ADMIN-only mutations.
- Prisma `TrainingBatch` model (schema.prisma:1523-1551) — has certification, name, schedule, startDate, startIsoDate, mode, instructor, instructorId, seats, enrolled, level, status, color/style fields, featured, order, published.

**Gaps**
- Batches are certification-batches (e.g. "Security+ Weekend Batch") — NOT linked to a Course (§22 violation, see Area 4). A learner cannot see "all batches for course X" because the relationship doesn't exist.
- No `/batches/:batchId` deep link (master-prompt §9). The URL router has no `batch-detail` view. Clicking a batch card on `batches.tsx` does not navigate (it just renders the card).
- Flexible scheduling from §24 (weekday morning / afternoon / evening / late night / weekend morning / afternoon / evening / custom) — `schedule` is a free-text display string, not a structured attribute. Filtering derives `scheduleType` heuristically from the string.

**Priority: MEDIUM** — add `courseId` to `TrainingBatch`, expose `/batches/:batchId` route, and split the `schedule` field into structured weekday/time slots.

---

## 6. Instructors — §25

**Status: PARTIAL** (admin-side DONE; public-side MISSING)

**Evidence**
- `src/views/admin-instructor-assignment.tsx` (817 lines) — admin UI for listing/assigning instructors to batches. Note: lines 70-76 still contain a **hardcoded `BATCHES` mock array** used for the assignment UI (not from DB).
- `src/app/api/admin/instructors/route.ts` (168 lines) — admin GET (ADMIN+INSTRUCTOR) and POST (ADMIN). Creates a `User` with role `INSTRUCTOR` + linked `InstructorProfile`.
- `src/app/api/admin/instructors/[id]/route.ts` (38 lines) — DELETE (ADMIN-only). Prevents self-deletion. Properly cascades `InstructorProfile` delete.
- `src/views/instructor-dashboard.tsx` (1743 lines) — instructor's own dashboard with 11 tabs: My Courses, Assignments, Live Sessions, Office Hours, My Students, Attendance, Messages, Bulk Import, Cert Templates, Calendar, Analytics.
- Prisma `InstructorProfile` model (schema.prisma:1467-1480) — has phone, expertise (JSON), yearsExperience, certifications (JSON), linkedinUrl, maxBatches, currentBatches.

**Gaps**
- **No public `/instructors` view** and **no public `/instructors/:instructorSlug` detail page** (master-prompt §9, §25). The URL router has no `instructors` or `instructor-detail` view name.
- `InstructorProfile` has **no `slug` field** — public detail URL would need a slug or `userId`-based route.
- Instructor dashboard has **no Announcements tab** and **no Feedback tab** (§25 explicitly lists both). Grading is implemented (submissions/[id]/grade API), announcements are not (no Announcement model).
- The admin assignment view uses a hardcoded mock `BATCHES` array (lines 70-76) — should fetch real batches from `/api/admin/training-batches`.
- An INSTRUCTOR can call `GET /api/admin/instructors` and see **all** instructors' profiles (including personal phone numbers, certifications). This is over-permissive (§91 data-isolation violation).

**Priority: HIGH** — build the public `/instructors` listing + `/instructors/:slug` detail page; add a `slug` field to `InstructorProfile`; lock down admin-instructors GET to ADMIN-only.

---

## 7. Labs + Cyber Range — §32-34

**Status: PARTIAL** (catalog DONE; security INSECURE)

**Evidence**
- `src/views/labs.tsx` (567 lines) — DB-driven via `/api/labs` with search + category + difficulty filters, "featured mission" hero, lab stats.
- `src/views/lab-detail.tsx` — single-lab terminal experience (not audited in detail but exists).
- `src/views/cyber-range.tsx` (647 lines) — marketing-style "what the cyber range IS" view with hardcoded `NMAP_LINES` terminal demo and `LAB_CATEGORIES` with counts.
- `src/app/api/labs/route.ts` (40 lines) — public GET. Filters by category/difficulty/search.
- `src/app/api/labs/[slug]/route.ts` (18 lines) — public GET single lab.
- `src/app/api/labs/[slug]/submit/route.ts` (97 lines) — auth-required POST. Handles `start` / `hint` / `submit` / `heartbeat` actions; awards XP; sends email on completion; auto-grade.
- Prisma `Lab` model (schema.prisma:342-369) — has title, slug, category, difficulty, durationMin, points, scenario, objectives, hints, **`flag`**, commands, virtualEnv, xpReward, passingScore, autoGrade, published. `LabProgress` tracks status / flagFound / hintsUsed / timeSpentMs.

**Critical security gap (§34, §80-81)**
- **`/api/labs` (public, no auth) spreads the entire `Lab` row via `...l`** — this exposes the `flag` field (the answer to the lab) to anyone who hits the endpoint. Anyone can curl `GET /api/labs` and capture every flag without ever solving anything.
- **`/api/labs/[slug]` (public, no auth) returns the entire lab object including `flag`**. The inline comment even acknowledges: *"Don't leak the flag in listing but do expose for the lab detail (lab is interactive)"* — but the lab detail page is reachable without authentication, so this still leaks flags publicly.
- The `submit` endpoint correctly only returns `lab.flag` after a correct submission.
- Cyber range view ships a fake `nmap -sV 10.10.24.14` terminal demo with a fictional IP — acceptable as marketing, but borderline on §34 (no real infra exposed, but it normalises the idea of exposing target IPs).

**Gaps**
- Lab has `flag` as a single string field — no multi-flag support, no per-flag scoring (§32 mentions "flags" plural).
- Lab has no `prerequisites` field on the model (§32 requires "prerequisites").
- No `XP` / `badges` / `completion history` are surfaced in a lab-history view per learner (the data exists in `LabProgress`, but there's no `/labs/history` route).

**Priority: HIGH** — strip `flag` from all public lab API responses immediately; only return it from `submit` after a correct submission.

---

## 8. CTF + Events — §35-36

**Status: PARTIAL** (CTF DONE; Events MISSING)

**Evidence (CTF)**
- `src/views/ctf-platform.tsx` (602 lines) — competition list, jeopardy grid, team creation, flag submission, leaderboard. DB-driven via `/api/ctf/competitions`.
- `src/app/api/ctf/competitions/route.ts` (180 lines) — GET (auth required) auto-seeds 3 demo competitions + 4 challenges each if empty; POST (ADMIN+INSTRUCTOR).
- `src/app/api/ctf/teams/route.ts`, `submit/route.ts`, `competitions/[id]/route.ts` — team join, flag submit, single-competition fetch.
- Prisma models: `CTFCompetition` (schema.prisma:873), `CTFChallenge` (891), `CTFTeam` (908), `CTFTeamMember` (922), `CTFSubmission` (934). CTF teams + scoring + leaderboard all exist.

**Evidence (Events)**
- **No `src/views/events*.tsx` file exists.**
- **No `/api/events` route.**
- **No `Event` Prisma model.** (The closest thing is `LiveSession` which is for live classroom sessions, not public workshops/webinars.)
- The header has no Events link.
- The footer has no Events link.

**Gaps**
- Events page (§36) is entirely MISSING — no `/events`, no `/events/:eventSlug`. Workshops / webinars / campus programs / awareness programs / corporate events / bootcamps are not modelled.
- CTF route is `#/ctf-platform` (matches `ctf-platform` view name) — but master-prompt §9 specifies `/ctf` and `/ctf/:eventSlug`. The current router doesn't expose a per-CTF-event deep link (clicking a competition opens an in-page modal/panel, not a route).

**Priority: HIGH** — build `src/views/events.tsx` + `Event` model + `/api/events` + `/events/:eventSlug` route; expose per-CTF deep links.

---

## 9. Mock Exams + Proctored Exams — §41-43

**Status: PARTIAL** (proctored exam runner DONE; mock exam engine MISSING; question bank secured)

**Evidence (Proctored Exams)**
- `src/views/exams.tsx` (239 lines) — public marketing page for GuardianX proctored exams + GuardianX certifications catalog.
- `src/views/exam-detail.tsx` (1818 lines) — the actual exam runner. Implements: candidate consent, camera check via `getUserMedia`, fullscreen entry, `visibilitychange` + `fullscreenchange` listeners, tab-switch flags, autosave (heartbeat), per-domain scoring breakdown. Posts flags to `/api/proctoring/[attemptId]`.
- `src/app/api/exams/route.ts` (38 lines) — public GET of published exams + user's attempts.
- `src/app/api/exams/[id]/start/route.ts` (169 lines) — auth-required. Enforces `maxAttempts`. Resumes in-progress attempts. Returns questions **without `correctAnswer`** (the Prisma `select` clause explicitly omits it — §80 compliant).
- `src/app/api/exams/[id]/submit/route.ts` (417 lines) — auth-required, ownership-checked. Server-side grading. Persists `proctorFlags` + `timeSpent`. Issues a `GuardianCredential` idempotently when `score >= passingScore`.
- `src/app/api/proctoring/[attemptId]/route.ts` (145 lines) — auth + ownership-checked. Records `tabSwitches`, `windowBlurs`, `incidentCount`, camera/mic/screen flags.
- Prisma: `Exam` (1361), `QuestionBank` (1384), `ExamAttempt` (1403), `GuardianCredential` (1422), `ProctoringSession` (1443).

**Evidence (Mock Exams)**
- **No `mock-exams` view exists in the URL router.** Master-prompt §9 requires `/mock-exams` as a distinct route.
- **No `src/views/mock-exams*.tsx` file.**
- The `Exam` model has `proctoringEnabled Boolean @default(true)` — there's no separate "mock exam" type or flag. Mock exams would need `proctoringEnabled = false` + a different UI flow, but the catalog doesn't distinguish them and the exam-detail view treats everything as proctored.

**Gaps**
- **Mock exam engine missing (§41)** — no question bank UI, no randomization (the start endpoint returns ALL questions in `createdAt asc` order — does NOT honour `Exam.questionCount` or `shuffleQuestions` / `shuffleOptions`), no attempt history view, no readiness score, no analytics dashboard.
- **No screen sharing** — `ProctoringSession` model has a `screenShared` field but `exam-detail.tsx` only calls `getUserMedia` (camera), never `getDisplayMedia` (screen share).
- No proctor workflow UI — there is no `/proctor` view and no `PROCTOR` role. The platform has no proctor dashboard to review incidents or approve candidates.
- No exam scheduling UI — exams are immediately startable, no calendar/slot booking.
- Rate limiting on `/api/exams/[id]/start` and `/submit` — none implemented (could allow brute-forcing answers).

**Priority: HIGH** — build the mock-exam route + UI; honour `shuffleQuestions` / `shuffleOptions` / `questionCount` in the start endpoint; add screen sharing via `getDisplayMedia`.

---

## 10. Certifications + Verification — §44-45

**Status: PARTIAL** (GuardianX certs DONE; verification BROKEN at /verify URL)

**Evidence**
- `src/views/credentials.tsx` (230 lines) — shows user's earned `GuardianCredential`s + has an inline verify form hitting `/api/credentials/verify/[credentialId]`. Copy-link uses `window.open('/verify?id=' + credId, '_blank')` — **this URL 404s (no real route)**.
- `src/views/certificates.tsx` (615 lines) — separate "course completion certificate" view (uses the `Certificate` model, not `GuardianCredential`). Has PDF download + QR + verify card.
- `src/app/api/credentials/verify/[credentialId]/route.ts` (30 lines) — PUBLIC GET (no auth). Returns `valid`, `candidateName`, `certificationName`, `score`, `issueDate`, `expiryDate`, `status`, `skillsAssessed`. Does not expose unnecessary learner info (§82 compliant).
- `src/app/api/certificates/verify/route.ts` (74 lines) — PUBLIC GET. Verifies the older `Certificate` model (course completion certs), with tamper-evident hash check.
- `src/app/api/guardian-certifications/route.ts` (23 lines) — PUBLIC GET of the catalog of GuardianX certifications.
- Prisma: `GuardianCertification` (1341), `GuardianCredential` (1422), `Certificate` (328) — three distinct models. The distinction between GuardianX cert (§44) and external cert prep (§45) is encoded by `GuardianCertification` vs `Course.certBody` (external certification body name).

**Gaps**
- **`/verify` and `/verify/:certificateId` are listed in master-prompt §9 but the URL router has no `verify` view and Next.js has no `/verify` route.** The credentials view's "Verify" button opens `/verify?id=…` in a new tab — that tab 404s. BROKEN.
- No `Certificate.changes` audit log — `GuardianCredential` has `status` (valid/revoked/expired) but no `revocationReason` / `revokedAt` / `revokedBy` fields. Master-prompt §44 requires "Certificate changes/revocations must be auditable" — no audit table exists for credential lifecycle.
- No admin UI for revoking a credential — `src/views/admin-cert-bulk.tsx` exists for bulk issuance, but there's no revoke UI.

**Priority: HIGH** — add `#/verify` view to the URL router OR create a real Next.js `/verify/[credentialId]` route; add `revocationReason` / `revokedBy` columns to `GuardianCredential`.

---

## 11. Learning Paths — §46

**Status: DONE** (DB-driven; admin-editable through Prisma, no admin UI)

**Evidence**
- `src/views/learning-paths.tsx` (907 lines) — DB-driven via `/api/learning-paths`. Renders path cards with skills, career outcome, modules, prerequisites, progress.
- `src/app/api/learning-paths/route.ts` (40 lines) — public GET, returns published paths ordered by `order`. `src/app/api/learning-paths/[slug]/route.ts` exists for single-path fetch.
- Prisma `LearningPath` model (schema.prisma:1210-1232) — has slug, title, subtitle, description, icon, color, tint, difficulty, duration, skillsCount, labsCount, xpReward, careerOutcome, skills (JSON), courses (JSON), order, published, featured.

**Gaps**
- `skills` and `courses` are stored as JSON arrays — not proper relations. Cannot easily reorder or query "which paths include course X".
- No admin UI for editing learning paths — must edit via raw Prisma/seed scripts. Master-prompt §46 says "Learning Paths must be editable from Admin" — there is no `/admin/learning-paths` view. The `cms-dashboard.tsx` does not cover learning paths.

**Priority: MEDIUM** — add an admin learning-path editor (basic CRUD over `LearningPath` + `courses[]`).

---

## 12. GRC — §3, §29-31

**Status: DONE** (correctly modelled as a domain, NOT a separate ecosystem)

**Evidence**
- **No `GrcContent` model exists** in the Prisma schema (no separate GRC architecture).
- **No `/grc` view and no `/api/grc` route.** GRC is treated purely as a course category value — `Course.category` can be "Security Management" or "Identity & Access" (matches the "GRC" domain).
- The course catalog filter `CATEGORIES` (course-catalog.tsx:37) explicitly lists `"Identity & Access"` and `"Security Management"` as GRC-aligned categories.
- The career-path card "Governance & Risk" (course-catalog.tsx:85-93) filters by `categoryFilter: "Identity & Access"`.
- The fallback `GuardianCertification` catalog includes `GX Certified GRC Professional` (exams.tsx:234-238).

**Assessment**
- This is **architecturally correct** per §29 ("GRC must NOT be implemented as a completely separate product ecosystem"). One generic `Course` model handles GRC alongside Offensive/Defensive/Cloud/AppSec/etc.
- **Minor gap (§30):** there is no marketing/discovery page at `/grc` that aggregates GRC courses + GRC learning paths + GRC instructors. The master prompt says "It can have a marketing/discovery page at `/grc` but this must ultimately connect users to the same Course engine." This is optional but would improve discoverability.
- **Gap (§31):** the `Lab` model has no `grcExerciseType` field or specific GRC practical templates (risk assessment, risk register, control mapping, ISO 27001 implementation, NIST mapping). All current labs are technical (Web/Network/Privesc/Crypto/Forensics/RE/AD/Cloud/OSINT/Mobile/IoT). GRC practicals would need a non-terminal UI (forms, document editing) — the lab terminal doesn't support that.

**Priority: LOW** — add `/grc` marketing page (optional); design GRC practical exercise type later.

---

## 13. Institutions (Schools/Colleges/Universities) + Corporate — §37-40

**Status: PARTIAL** (schools/colleges/universities marketing pages DONE; Corporate Training MISSING; admin via School API)

**Evidence**
- `src/views/institutions-schools.tsx` (625 lines) — K-12 SMS feature set, partner flow, CTA.
- `src/views/institutions-colleges.tsx` (287 lines) — college program offering.
- `src/views/institutions-universities.tsx` (274 lines) — university features.
- `src/views/partner-institutions.tsx` — partner-with-us view.
- `src/app/api/school/*` — full school admin API: `overview`, `courses`, `batches` (+ `[id]` + `[id]/students` + `[id]/students/[userId]`), `attendance`, `students` (+ `[id]`), `reports`, `settings`. These power a school-admin dashboard.
- `src/views/school-dashboard.tsx` + `school-dashboard-inner.tsx` — institution admin view (SCHOOL_ADMIN role).
- Prisma: `School` (88), `SchoolMember` (114), `Batch` (126) school-tied, `BatchMember` (140).
- `src/lib/auth.ts` has a separate `school-login` CredentialsProvider (schoolCode + adminEmail + password) → creates a `SCHOOL_ADMIN` user linked to the school.

**Gaps**
- **No `/corporate-training` view exists.** Master-prompt §40 explicitly requires it ("Create /corporate-training"). The URL router has no `corporate-training` view name. The header has no Corporate Training link.
- The schools/colleges/universities views are **marketing pages only** — no public "browse university programs" or "browse corporate packages" experience. They list features and ask the visitor to contact.
- `cms-dashboard.tsx` has an `institutions` page editor for partner-types/flow-steps/models/benefits text, but NOT for creating/editing actual partner-school records. School records are managed via the `school-login` flow only, not by an ADMIN from the platform.
- Schools use the same `Course`/`Batch` engine (good — §40 says corporate programs "should still use the same underlying Course and Batch architecture").

**Priority: HIGH** — build `/corporate-training` view + add Corporate Training to the Institutions dropdown in header + footer.

---

## 14. Learner Dashboard + Gamification + Career — §47-49

**Status: DONE**

**Evidence**
- `src/views/dashboard.tsx` (1228 lines) — "Mission Control" SOC-style learner dashboard with: next-mission card, in-progress courses, active labs, daily objective, achievements, leaderboard standing, skill profile, activity feed, loading skeletons, empty states.
- `src/views/leaderboard.tsx` (605 lines) — global XP leaderboard, DB-driven via `/api/leaderboard`.
- `src/views/career-planner.tsx` (1224 lines) — career path matching engine, DB-driven via `/api/career-roles` + `/api/career/path`.
- `src/views/skill-tree.tsx` — skill tree, DB-driven via `/api/skills`.
- `src/views/achievements.tsx` — earned achievements grid, DB-driven via `/api/achievements`.
- Prisma models: `Achievement` (151), `UserAchievement` (163), `UserActivity` (174), `Rank` (1269) — 8 tiers from Recruit to Elite Guardian, `CareerPathRole` (1286), `Skill`/`SkillCategory` (1235/1250).
- `src/lib/gamification.ts` — `awardXp`, `levelFromXp`, `rankTitle`, `XP_REWARDS`.

**Gaps (minor)**
- `dashboard.tsx` does not surface: Mock Exams attempted (none yet), Proctored Exams attempted (no widget), Career Readiness score (only as part of career-planner view), Notifications (separate `/api/notifications` exists but the dashboard doesn't surface them as a panel). All other §47 items are present.
- No streak missions / weekly missions UI (achievements exist, but no "missions" concept per §48).

**Priority: LOW** — add a Notifications panel to the dashboard; add an exam-history widget.

---

## 15. RBAC — §50

**Status: PARTIAL** (server-side enforced; role set is INCOMPLETE)

**Evidence**
- `src/lib/session.ts` (15 lines) — `getCurrentUser()` calls `getServerSession(authOptions)` and re-fetches the user from DB (so the role is always fresh, not stale from the JWT). Returns `{ id, email, name, role, avatar, title, bio, schoolId }`.
- `src/lib/auth.ts` (145 lines) — JWT strategy, secure cookies (httpOnly, sameSite=lax, secure in production), NEXTAUTH_SECRET fails loudly in production, school-login provider creates `SCHOOL_ADMIN` users.
- Sample admin APIs (`/api/admin/instructors/route.ts`, `/api/admin/training-batches/route.ts`, `/api/admin/courses/route.ts`, etc.) all check `getCurrentUser()` then enforce `user.role !== "ADMIN"` → 403.
- `/api/auth/register/route.ts` — rate-limited (5/min/IP), zod-validated password complexity, forces role `STUDENT` (no self-escalation), hides email existence.
- Roles used in codebase: `STUDENT`, `INSTRUCTOR`, `ADMIN`, `SCHOOL_ADMIN`.

**Gaps vs §50 spec**
- Master-prompt §50 requires minimum roles: **SUPER_ADMIN, ADMIN, INSTRUCTOR, PROCTOR, INSTITUTION_ADMIN, LEARNER**.
- **`SUPER_ADMIN` is MISSING.** No super-admin tier above `ADMIN`.
- **`PROCTOR` is MISSING.** No proctor role + no proctor dashboard. The `ProctoringSession` model exists, but no human proctor can review flags/incidents — only the system records them.
- **`INSTITUTION_ADMIN` is MISSING** (currently `SCHOOL_ADMIN` serves this role, but only for K-12 schools — no separate college/university/corporate admin role).
- **`LEARNER` is called `STUDENT`** — minor naming mismatch.
- `getCurrentUser` doesn't return `permissions` or a `requireRole()` helper — every API repeats the same `if (user.role !== "ADMIN")` boilerplate, which is error-prone. A shared `requireRole("ADMIN")` helper would prevent a missing check from becoming a privilege escalation.
- No `Permission` model — only role strings on `User`. Master-prompt §94 lists `Permission` as a core model.
- **Instructor over-permission** — `/api/admin/instructors` GET allows `INSTRUCTOR` role to list ALL instructors including phone numbers and personal cert info (§91 violation).
- No middleware.ts file — no route-level protection; every API is on its own.

**Priority: HIGH** — add `SUPER_ADMIN`, `PROCTOR` roles; build a `requireRole()` helper; lock down `/api/admin/instructors` GET to ADMIN-only; consider a `Permission` model for fine-grained access.

---

## 16. Admin CMS — §27-28

**Status: PARTIAL**

**Evidence**
- `src/views/cms-dashboard.tsx` (1260 lines) — admin text-content editor for 7 pages: `home`, `impact`, `contact`, `institutions`, `catalog`, `auth`, `global`. Each page has named sections (hero, stats, trust, audiences, courses, labs, corporate, partners, benefits, finalCta, contactInfo, formFields, faq, partnerTypes, flowSteps, models, mission, outcomes, stories, tabs, filters, header, footer). Inline edit + save via `/api/cms/[page]/[section]`.
- `src/app/api/cms/route.ts` (58 lines) — admin GET (ADMIN-only) + POST upsert.
- `src/app/api/cms/[page]/route.ts` and `[page]/[section]/route.ts` exist.
- Prisma `SiteContent` model (1192) — `page` + `section` + `key` + `value (Json)` + `updatedBy`. Editable.
- Separate admin views for courses (`/admin/courses` API + `course-studio.tsx`), batches (`admin-batch-calendar.tsx` + `/api/admin/training-batches`), instructors (`admin-instructor-assignment.tsx` + `/api/admin/instructors`), labs (`/api/admin/labs`), certificates (`admin-cert-bulk.tsx` + `/api/admin/certificates`), leads (`admin-lead-crm.tsx` + `/api/admin/leads`), users (`/api/admin/users`), notifications (`admin-notifications.tsx`), revenue (`admin-revenue.tsx`), email campaigns (`admin-email-campaign.tsx`).
- `src/views/admin-dashboard.tsx` — top-level admin shell.

**Gaps vs §27 spec**
- CMS dashboard edits **text content only**, not the entity records. Master-prompt §27 lists "Domains, Courses, Learning Paths, Batches, Instructors, Labs, Cyber Range, Challenges, CTFs, Mock Exams, Question Banks, Proctored Exams, Results, Certificates, Credential templates, Verification, Revocation, Programs, Cohorts, Institutions, Reports, Users, Roles, Permissions, Settings, Logs, Analytics". Of these:
  - ✅ Courses — `course-studio.tsx` + `/api/admin/courses` + `/api/course-studio` APIs.
  - ✅ Batches — `admin-batch-calendar.tsx` + admin batches APIs.
  - ✅ Instructors — `admin-instructor-assignment.tsx` + admin instructors APIs.
  - ✅ Labs — `/api/admin/labs` (no admin UI view, but API exists).
  - ✅ Certificates — `admin-cert-bulk.tsx` + `/api/admin/certificates`.
  - ❌ **Domains** — no Domain admin UI and no `Domain` model at all (courses use a free-text `category` field).
  - ❌ **Learning Paths** — no admin editor.
  - ❌ **Cyber Range / Challenges** — no admin UI.
  - ❌ **CTFs** — admin can POST a competition via API, but no admin UI.
  - ❌ **Mock Exams** — no admin UI (and no mock-exam concept at all).
  - ❌ **Question Banks** — no admin UI to manage `QuestionBank` rows.
  - ❌ **Proctored Exams** — no admin UI to manage `Exam` rows.
  - ❌ **Results** — no admin results viewer.
  - ❌ **Credential templates** — `CertificateTemplate` model exists, but the admin UI is in the instructor dashboard (`certificate-templates-tab.tsx`), not the platform admin.
  - ❌ **Verification / Revocation** — no admin revoke UI.
  - ❌ **Programs / Cohorts / Institutions / Reports** — only the school admin dashboard covers schools; no platform-wide institution admin.
  - ❌ **Roles / Permissions** — no admin role/permission editor.
  - ❌ **Settings / Logs / Analytics** — admin-platform-health is mock, admin-audit-log is mock.

**Priority: HIGH** — build the missing admin CRUD views: Domains, Question Banks, Exams, Learning Paths, Events, Credential revocation, real Audit Log.

---

## 17. Security audit — §51-54, §80-82

**Status: PARTIAL** (one INSECURE finding)

**Evidence**
- `src/lib/auth.ts` — bcrypt password hashing, secure cookies, JWT, NEXTAUTH_SECRET hard-fail in prod. ✓
- `/api/auth/register/route.ts` — zod validation, bcrypt 12 rounds, rate-limited (5/min/IP), no email enumeration, force `STUDENT` role. ✓
- `/api/exams/[id]/start` — strips `correctAnswer` from questions before returning (§80 compliant). ✓
- `src/lib/session.ts` — re-fetches user from DB on every request (no stale JWT role). ✓
- `public/robots.txt` — Disallow `/api/`. ✓
- `src/app/layout.tsx` — has skip-to-content link, theme-color meta, but **no Content-Security-Policy, no X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy, no Strict-Transport-Security headers**. No `middleware.ts` file exists. No `next.config.ts` security headers.

**INSECURE findings**
- **`/api/labs` and `/api/labs/[slug]` publicly expose the `flag` field** (the lab answer) — see Area 7. INSECURE.
- **No rate limiting on `/api/auth/[...nextauth]`** (login) — only the register endpoint is rate-limited. Brute-force attacks on passwords are not throttled. INSECURE.
- **No rate limiting on `/api/exams/[id]/start` / `/submit`** — could brute-force exam answers.
- **No rate limiting on `/api/credentials/verify/[credentialId]`** — could brute-force credential IDs.
- **No file upload security** — there's no file upload route audited, but master-prompt §54 requires validation/size-limits/safe-storage/malware-scan/signed-URLs/filename sanitisation if uploads exist. The `Lab.pdfUrl` field on `Lesson` could be user-settable; no validation. Profile-image `avatar` field on `User` is a URL string with no validation.
- No CSRF protection on state-changing POST routes (NextAuth CSRF cookie covers auth, but admin POST routes rely on same-site cookie only).
- No security headers in `next.config.ts`.
- No input length limits on `Textarea`/`Input` components — a 1MB course description could be POSTed.

**Priority: HIGH** — fix the lab flag leak immediately; add rate limiting on auth/exam/verify endpoints; add security headers in `next.config.ts` or `middleware.ts`.

---

## 18. Observability + Sentinel — §66-76

**Status: PARTIAL** (UI shells exist but MOCK; no Sentinel; no /health endpoint)

**Evidence**
- `src/views/admin-platform-health.tsx` (122 lines) — **MOCK**: hardcoded `services` array with hardcoded latencies; `Math.random()` for the response-time chart bars; hardcoded "Neon PostgreSQL" even though DB is SQLite (`provider = "sqlite"` in schema.prisma). Says "Vercel" deployment in system info (may not match actual infra).
- `src/views/admin-audit-log.tsx` (125 lines) — **MOCK**: hardcoded `LOGS` array of 8 entries. No `/api/admin/audit-logs` endpoint exists. The "Export" button does nothing. No Prisma `AuditLog` model exists in the schema.
- **No `/api/sentinel` route** — Sentinel self-healing (§71-76) is not implemented at all. No `SystemEvent`, `Incident`, `SentinelAction`, `FeatureFlag` models (master-prompt §94 lists all four). No GREEN/YELLOW/RED action level system.
- **No `/health` endpoint** — neither `src/app/health/route.ts` nor `src/app/api/health/route.ts` exists. Master-prompt §68 requires `/health`, `/liveness`, `/readiness`. None exist.
- No structured logging / request IDs / correlation IDs — APIs use `console.error` only.

**Gaps**
- AuditLog model missing entirely (§66).
- Sentinel engine missing entirely (§71-76): no DETECT/DIAGNOSE/PROTECT/REPAIR/VERIFY/DOCUMENT/ESCALATE workflow, no allowlisted actions, no failure-limit counter, no GREEN/YELLOW/RED classification.
- /health, /liveness, /readiness endpoints missing (§68).
- FeatureFlag model missing (§79).
- Synthetic monitoring tests missing (§69) — the `tests/` folder has only shell scripts for python/database runtime, no E2E critical-path tests.
- Platform resilience (§70) — not implemented (no subsystem isolation).
- Database resilience (§76) — no automated backups, no restoration testing. SQLite database file at `db/custom.db` (single file, no PITR).

**Priority: HIGH** — implement `AuditLog` model + wire into all sensitive mutations; build `/api/health`; replace the two mock admin views with real DB-backed data.

---

## 19. SEO + Accessibility + Performance — §57-60

**Status: PARTIAL**

**Evidence (SEO)**
- `src/app/layout.tsx` — `metadata` includes title, description, keywords, OG, Twitter card, canonical, robots. ✓
- `src/app/sitemap.ts` — **only 6 URLs**: `/`, `/#cyber-range`, `/#learning-paths`, `/#skill-tree`, `/#certifications`, `/#institutions`. The `/certifications` and `/institutions` hash URLs don't even match real router view names (router has `certificates` and `institutions-schools`, not `certifications`/`institutions`). Missing: courses, batches, labs, exams, credentials, contact, impact, all 3 institution sub-pages, etc.
- `public/robots.txt` — Disallow `/api/`. ✓
- No per-page metadata — only the root layout has metadata; no `export const metadata` in any view. Hash-router design makes per-page SEO hard, but master-prompt §57 expects unique titles/descriptions per page.
- No structured data (JSON-LD) for courses / events / certs (§57).

**Evidence (Accessibility)**
- Skip-to-content link in `layout.tsx:134-139` ✓.
- `aria-expanded` / `aria-haspopup` on mega-menu buttons ✓.
- `<html lang="en">` ✓.
- Focus rings on buttons ✓.
- **No reduced-motion support** — `globals.css` was not audited but `motion-system.tsx` uses framer-motion's `motion.div` with no `prefers-reduced-motion` check. Master-prompt §58 requires "reduced-motion support".

**Evidence (Performance)**
- Heavy views are lazy-loaded (`dynamic(() => import(...), { ssr: false })`) ✓ — CTF, weekly-challenges, team-missions, learning-analytics, skill-assessments, prerequisites-visualizer, lab-snapshots, cyber-range, learning-paths, skill-tree, bug-bounty, course-studio, exam-detail. Good.
- No image optimisation visible — views use raw `<img src="/courses/...">` instead of `next/image`. Master-prompt §59 requires "optimize images".
- No code-splitting boundaries reported.

**Priority: MEDIUM** — expand sitemap to all real public routes; add JSON-LD for courses; add reduced-motion media queries; switch to `next/image`.

---

## 20. Search — §83

**Status: PARTIAL**

**Evidence**
- `src/app/api/search/route.ts` (77 lines) — searches **Courses, Labs, and (if logged-in) Notes**. Returns 6 of each.

**Gaps vs §83 spec**
Master-prompt §83 requires unified search across: Courses, Learning Paths, Batches, Instructors, Labs, CTFs, Events, Certifications, Domains, GRC courses, Institutional programs.
- ✅ Courses
- ❌ Learning Paths
- ❌ Batches
- ❌ Instructors (no public listing anyway)
- ✅ Labs
- ❌ CTFs
- ❌ Events (don't exist)
- ❌ Certifications (`GuardianCertification` catalog isn't searched)
- ❌ Domains (no Domain model)
- ❌ GRC courses (subset of courses, but not specifically searchable)
- ❌ Institutional programs

**Priority: MEDIUM** — extend the search endpoint to cover LearningPaths, TrainingBatches, GuardianCertifications, CTFCompetitions.

---

# PHASE PRIORITY LIST — Top 10 highest-impact next steps

Ordered by (security risk × master-prompt emphasis × user-visible impact):

| # | Action | Master-prompt ref | Why |
|---|--------|-------------------|-----|
| 1 | **Strip the `flag` field from `/api/labs` and `/api/labs/[slug]` public responses.** Only return the flag from `/api/labs/[slug]/submit` after a correct submission. Map the `Lab` row to a public DTO that omits `flag`, `commands` (if those leak infrastructure), and any internal scenario secrets. | §34, §80-81 | Currently anyone can curl `GET /api/labs` and capture every flag without solving anything. This is the single most exploitable gap. |
| 2 | **Build the public `/instructors` view + `/instructors/:slug` detail page.** Add a `slug` field to `InstructorProfile`. Wire the URL router (`instructors` + `instructor-detail` view names). Lock down `GET /api/admin/instructors` to ADMIN-only (currently INSTRUCTOR can read all instructors' phone numbers — §91 violation). | §9, §25 | The only instructor UI is admin-only; learners have no way to discover instructors. Master-prompt lists this as a first-class route. |
| 3 | **Create the `Event` model + `/events` view + `/events/:slug` route + `/api/events` CRUD.** Cover workshops, webinars, CTFs, campus programs, awareness programs, corporate events, bootcamps. Add Events to the header `RESOURCES` group and footer. | §9, §36 | Events page is entirely MISSING — no model, no API, no view, no nav link. Major gap in the master prompt's IA. |
| 4 | **Build the Mock Exam engine as a distinct experience.** Add a `mock-exams` view + URL router entry. Honour `Exam.questionCount`, `shuffleQuestions`, `shuffleOptions` in `/api/exams/[id]/start` (currently returns all questions in `createdAt asc` order — no randomisation, no subset). Add an attempt-history view + readiness score. Tag exams with `examKind: "mock" | "proctored"` and split the public catalog. | §9, §41 | Mock exams route is missing; the existing exam start endpoint defeats the purpose of question banks by always returning the same questions in the same order. |
| 5 | **Add the `AuditLog` Prisma model + wire it into every sensitive mutation** (course create/update/publish, batch create/update/delete, instructor create/delete, role change, exam create/submit/result-change, certificate issue/revoke, lab access grant, admin login, proctor action, sentinel action). Build `/api/admin/audit-logs` GET (ADMIN-only) and replace the mock array in `admin-audit-log.tsx` with real data. | §66 | Audit logging is required for every sensitive op; current admin-audit-log view is fully mock. No `AuditLog` model exists. |
| 6 | **Implement `/api/health` + replace the mock `admin-platform-health.tsx` with real DB/API/Cache/Auth ping checks.** Add structured logging with request IDs. Build the `/health`, `/liveness`, `/readiness` endpoints per §68. Remove the "Neon PostgreSQL" + "Vercel" hardcoded strings (DB is SQLite). | §68 | The Platform Health Monitor is fully mocked; no real health endpoint exists for uptime monitoring or load-balancer readiness checks. |
| 7 | **Fix the `/verify` route.** Either add a `verify` view to the URL router (with a `verify-result` sub-state) or create a real Next.js `app/verify/[certificateId]/route.ts` page that SSRs the verification result. Replace the `window.open('/verify?id=…', '_blank')` call in `credentials.tsx` with the working route. Add `revocationReason` + `revokedAt` + `revokedBy` fields to `GuardianCredential`. | §9, §44 | The credentials view's "Verify" button opens a URL that 404s. Public verification must be a real, shareable URL. |
| 8 | **Add the missing RBAC roles and a `requireRole()` helper.** Introduce `SUPER_ADMIN` (above ADMIN), `PROCTOR` (with a `/proctor` dashboard to review `ProctoringSession` flags and approve/void attempts), `INSTITUTION_ADMIN` (generalise `SCHOOL_ADMIN` to colleges/universities/corporate). Build a `requireRole(...roles)` helper in `src/lib/session.ts` and replace the boilerplate `if (user.role !== "ADMIN")` checks across all admin APIs. Add a `Permission` model for fine-grained access. | §50 | Master-prompt §50 explicitly lists these roles; only 4 of 6 exist. The repeating role-check boilerplate is error-prone. |
| 9 | **Rebuild the footer to the 7-column LEGAL-inclusive spec + fix every dead link.** Columns: TRAINING / PRACTICE / ASSESSMENT / INSTITUTIONS / COMPANY / RESOURCES / LEGAL. Add a real `LEGAl` column with Privacy / Terms / Refund Policy / Responsible Disclosure / Cookie Policy. Fix the duplicate "About/Impact" links, the "Security → contact" mismatch, and the FAQ/Help/Terms/Privacy-→-support collapse. Make footer CMS-driven. | §55-56 | Footer is structurally wrong (6 columns, missing LEGAL + ASSESSMENT + COMPANY) and has 4+ dead/duplicate links — direct §56 violation. |
| 10 | **Add rate limiting to `/api/auth/[...nextauth]` (login), `/api/exams/[id]/start`, `/api/exams/[id]/submit`, `/api/credentials/verify/[credentialId]`, and `/api/contact`.** Use an in-memory or Redis-backed counter per IP + per user (the register route already shows the pattern). Add security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`) via `next.config.ts` or a new `src/middleware.ts`. | §51-52 | Login brute-force, exam answer brute-force, and credential-ID brute-force are all currently unthrottled. No security headers are set. |

---

# Summary Scoreboard

| Area | Status | Priority |
|------|--------|----------|
| 1. Routing | DONE + 1 BROKEN (`/verify`) | HIGH |
| 2. Header nav | PARTIAL (missing ASSESSMENT, RESOURCES, Corporate) | MEDIUM |
| 3. Footer | PARTIAL + dead links | HIGH |
| 4. Courses | PARTIAL (Course↔Batch broken, 12 missing detail sections) | HIGH |
| 5. Batches | DONE | — |
| 6. Instructors | PARTIAL (no public pages) | HIGH |
| 7. Labs + Cyber Range | PARTIAL + INSECURE (flag leak) | HIGH |
| 8. CTF + Events | PARTIAL (Events MISSING) | HIGH |
| 9. Mock + Proctored Exams | PARTIAL (mock engine missing, no shuffle, no screen share) | HIGH |
| 10. Certifications + Verify | PARTIAL + BROKEN (`/verify` URL) | HIGH |
| 11. Learning Paths | DONE | — |
| 12. GRC | DONE (correctly modelled as a domain) | LOW |
| 13. Institutions + Corporate | PARTIAL (Corporate MISSING) | HIGH |
| 14. Dashboard + Gamification + Career | DONE | LOW |
| 15. RBAC | PARTIAL (3 roles missing, no helper, instructor over-permission) | HIGH |
| 16. Admin CMS | PARTIAL (text-only; 12+ missing entity editors) | HIGH |
| 17. Security | PARTIAL + INSECURE (lab flag, no rate limit, no headers) | HIGH |
| 18. Observability + Sentinel | PARTIAL (all mock; no Sentinel; no /health) | HIGH |
| 19. SEO + A11y + Perf | PARTIAL (6-URL sitemap, no reduced-motion, no JSON-LD) | MEDIUM |
| 20. Search | PARTIAL (only Courses + Labs + Notes) | MEDIUM |

**Headline:** 1 DONE-with-caveat area (Routing), 3 fully DONE areas (Batches, Learning Paths, GRC), 1 fully DONE dashboard area, 16 PARTIAL/MISSING/INSECURE/BROKEN areas. Two immediate INSECURE findings (lab flag leak, no auth rate limiting) should be fixed before any further feature work.
