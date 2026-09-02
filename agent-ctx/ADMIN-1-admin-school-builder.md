# Task ID: ADMIN-1
## Agent: admin-school-builder
## Task: Build Admin CMS (full CRUD) + School Management System

## Summary
Built two major features end-to-end: (1) a comprehensive Admin CMS giving
platform administrators full CRUD over courses/modules/lessons/labs/users
with analytics dashboards; (2) a School Management System for instructors
and admins to manage batches, students, attendance, and reports.

## What was built

### A. Prisma schema additions (`prisma/schema.prisma`)
- New `School` model: id, name, address, city, contactPerson, contactEmail, contactPhone, createdAt, batches[], admins[]
- New `Batch` model: id, schoolId, name, courseIds (comma-separated), startDate, endDate, status (active|completed|paused), students[]
- New `BatchStudent` model: id, batchId, userId, enrolledAt, attendance[] + unique constraint on (batchId, userId)
- New `Attendance` model: id, batchStudentId, date, status (present|absent|late|excused), notes
- Added `schoolId` (optional) and `school` relation to `User` model — for school admin users
- Ran `bun run db:push` — schema applied successfully to SQLite db

### B. Admin API endpoints (`src/app/api/admin/`)
All endpoints require `user.role === "ADMIN"` and return 403 Forbidden otherwise.

1. **`POST/GET /api/admin/courses`** — Create new course / list all courses with module+lesson counts and enrollment stats
2. **`PATCH/DELETE /api/admin/courses/[id]`** — Update / delete course (cascade deletes modules, lessons, enrollments, certificates)
3. **`POST /api/admin/courses/[id]/modules`** — Create module in course
4. **`PATCH/DELETE /api/admin/modules/[id]`** — Update / delete module (cascade deletes lessons)
5. **`POST /api/admin/modules/[id]/lessons`** — Create lesson in module (supports title, type, content, duration, preview flag, pdfUrl, pdfPages)
6. **`PATCH/DELETE /api/admin/lessons/[id]`** — Update / delete lesson
7. **`POST/GET /api/admin/labs`** — Create lab / list all labs with attempt/session counts
8. **`PATCH/DELETE /api/admin/labs/[id]`** — Update / delete lab (cascade deletes progress, sessions)
9. **`GET /api/admin/users`** — List all users with aggregated stats (enrollments, completedCourses, certificates, labsSolved, notes, activities)
10. **`PATCH /api/admin/users/[id]`** — Update user role (STUDENT/INSTRUCTOR/ADMIN); prevents admins from demoting themselves
11. **`GET /api/admin/analytics`** — Platform-wide analytics: 13 totals (users, students, instructors, admins, courses, labs, enrollments, completedEnrollments, certificates, labsSolved, notes, discussions, revenue), 30-day signup series, role distribution, top 8 courses by enrollment, top 8 labs by attempts, course category distribution

### C. School API endpoints (`src/app/api/school/`)
All endpoints require `user.role === "INSTRUCTOR" || "ADMIN"`. Auto-provisions a default school for users who don't have one assigned.

1. **`GET/POST /api/school/batches`** — List batches for current user's school / create new batch (name, courseIds, startDate, endDate, status)
2. **`GET/PATCH/DELETE /api/school/batches/[id]`** — Get single batch (with students + attendance summary) / update / delete (with school ownership check)
3. **`POST /api/school/batches/[id]/students`** — Add student to batch (by userId OR email — if email doesn't exist, creates placeholder student account with password "student123")
4. **`DELETE /api/school/batches/[id]/students/[studentId]`** — Remove student from batch
5. **`GET/POST /api/school/attendance`** — Get attendance (filterable by batchId + date) / mark attendance (single or batch upsert per student per day)
6. **`GET /api/school/students`** — List all students across this school's batches with progress aggregations (enrollments, labsSolved, certificates, notes, attendancePresent, avgProgress)
7. **`GET /api/school/reports`** — Comprehensive reports: totals, completionRate, labPerformance (byDifficulty + byCategory), certificationStats (total + byCourse), attendanceStats (present/absent/late/excused + rate), batchProgress (per-batch metrics)
8. **`POST /api/school/announcements`** — Post announcement to all school's students (creates Notification records per student)

### D. Admin Dashboard view (`src/views/admin-dashboard.tsx`)
- Hero card with holo-border + scanlines + emerald accent
- 4 tabs: Courses | Labs | Users | Analytics

**Courses tab:**
- Search bar (by title or short name)
- "Add Course" button toggles inline form with all fields (title, shortName, slug, description, longDescription, category, level, durationHours, price, color, tags, certBody, published checkbox)
- Course list cards show shortName badge, title, level/category badges, module/lesson/enrollment/rating/price stats
- Per-course: Edit (inline form), Modules (expandable manager), Delete (AlertDialog confirmation)
- Modules Manager: list modules with edit/delete + per-module Add Lesson button; Module editor + New Module form + Lesson editor + New Lesson form (inline)
- Auto-generates slug from title if not provided; enforces slug uniqueness

**Labs tab:**
- Search bar (by title or category)
- "Add Lab" button toggles inline form with all fields (title, slug, description, longDescription, category, difficulty, durationMin, points, scenario, objectives, hints, flag, commands, color, tags, virtualEnv, published)
- Lab list cards show title, difficulty/category badges, duration/points/attempts/flag stats
- Per-lab: Edit (inline form), Delete (AlertDialog confirmation)

**Users tab:**
- Search + role filter dropdown
- Table of users with avatar, name/email, role dropdown (instant update via PATCH), XP/Level, courses (with completed count), labs (solved of attempted), certs
- Role dropdown shows colored badges per role (Admin=amber, Instructor=cyan, Student=emerald)

**Analytics tab:**
- 8 stat cards: Total Users, Courses, Labs, Certificates, Revenue (est.), Notes, Discussions, Admins
- 4 charts using recharts: Signups area chart (30 days), Role distribution pie chart, Courses by category bar chart, Top courses by enrollment (horizontal bar)
- Top labs by attempts grid (ranked, with difficulty badge + points)

### E. School Dashboard view (`src/views/school-dashboard.tsx`)
- Hero card with holo-border + scanlines + amber accent
- 5 tabs: Overview | Students | Batches | Attendance | Reports

**Overview tab:**
- School info card (name, location, contact info) with announcement composer
- 4 stat cards: Total Students, Active Batches, Avg Progress, Certifications
- Active batches list (top 6)
- Top students by XP (top 8 ranked)
- Quick stats row: Attendance Rate, Course Completion, Labs Solved, Certifications (with progress bars)
- Announcement composer: posts notification to all school students

**Students tab:**
- Search bar (by name or email)
- Table of students with batches, courses, progress bar, labs, certs, attendance, XP/Level
- Avatar initials, multi-batch badges

**Batches tab:**
- "Add Batch" button toggles inline form (name, courseIds, startDate, endDate, status)
- Batch card grid: name, dates, status badge, student count, manage/edit buttons
- Batch form supports create and edit modes
- Batch Students Manager: add students by email (auto-creates placeholder account if needed), remove students with confirmation

**Attendance tab:**
- Batch selector + date picker
- Attendance Marker: lists all batch students with 4 status buttons each (Present/Late/Absent/Excused) — color-coded
- Loads existing attendance for the selected date; saves via upsert
- Summary badges show live counts per status

**Reports tab:**
- 4 stat cards: Total Students, Completion Rate, Labs Solved, Attendance Rate
- 2 radial gauge charts: Course Completion + Attendance Rate (with center % text)
- Lab Performance by Difficulty bar chart (Attempted vs Solved)
- Attendance Breakdown pie chart (Present/Late/Absent/Excused)
- Per-Batch Performance table (students, enrollments, completed, avg progress, labs, certs, attendance %)
- Certifications by Course list (with course color badges)

### F. Navigation updates (`src/components/platform/app-shell.tsx`)
- Added "School" nav item (visible to INSTRUCTOR + ADMIN) with Building2 icon, amber accent, active state
- Added "Admin" nav item (visible to ADMIN only) with ShieldCheck icon, emerald accent, active state
- Added Instructor, School, Admin items to command palette (⌘K) with role-gating
- Imported ShieldCheck + Building2 icons (Building2 already imported)

### G. Store + page wiring
- `src/store/app-store.ts`: Added `{ name: "admin" }` and `{ name: "school" }` to View union
- `src/app/page.tsx`: Imported `AdminDashboardView` and `SchoolDashboardView`, added to ViewRouter

## Verification
- `bun run lint` — exit 0 (0 errors, 0 warnings)
- `bun run db:push` — schema applied successfully
- Dev server compiled cleanly (verified via dev.log GET / 200 responses)
- All admin endpoints check `user.role === "ADMIN"` and return 403 otherwise
- All school endpoints check `user.role === "INSTRUCTOR" || "ADMIN"` and return 403 otherwise
- Role-gated nav items only show for authorized users
- View-level access control: AdminDashboardView shows "Admin access required" card for non-admins; SchoolDashboardView shows "School access required" card for students

## Files Created
- `src/app/api/admin/courses/route.ts` — GET + POST
- `src/app/api/admin/courses/[id]/route.ts` — PATCH + DELETE
- `src/app/api/admin/courses/[id]/modules/route.ts` — POST
- `src/app/api/admin/modules/[id]/route.ts` — PATCH + DELETE
- `src/app/api/admin/modules/[id]/lessons/route.ts` — POST
- `src/app/api/admin/lessons/[id]/route.ts` — PATCH + DELETE
- `src/app/api/admin/labs/route.ts` — GET + POST
- `src/app/api/admin/labs/[id]/route.ts` — PATCH + DELETE
- `src/app/api/admin/users/route.ts` — GET
- `src/app/api/admin/users/[id]/route.ts` — PATCH
- `src/app/api/admin/analytics/route.ts` — GET
- `src/app/api/school/batches/route.ts` — GET + POST
- `src/app/api/school/batches/[id]/route.ts` — GET + PATCH + DELETE
- `src/app/api/school/batches/[id]/students/route.ts` — POST
- `src/app/api/school/batches/[id]/students/[studentId]/route.ts` — DELETE
- `src/app/api/school/attendance/route.ts` — GET + POST
- `src/app/api/school/students/route.ts` — GET
- `src/app/api/school/reports/route.ts` — GET
- `src/app/api/school/announcements/route.ts` — POST
- `src/views/admin-dashboard.tsx` — AdminDashboardView
- `src/views/school-dashboard.tsx` — SchoolDashboardView

## Files Updated
- `prisma/schema.prisma` — Added School, Batch, BatchStudent, Attendance models; added schoolId + school relation to User
- `src/store/app-store.ts` — Added "admin" and "school" view types
- `src/app/page.tsx` — Imported + wired AdminDashboardView and SchoolDashboardView in ViewRouter
- `src/components/platform/app-shell.tsx` — Added Admin + School nav items (role-gated); added to command palette

## Demo Accounts (unchanged)
- student@guardianx.io / student123
- instructor@guardianx.io / instructor123
- admin@guardianx.io / admin123

## Notes
- Admin/School views render the appropriate "access required" card if a non-authorized user somehow navigates there
- Default school is auto-provisioned for instructors/admins who don't have one assigned (named "GuardianX Default Academy", city "Bengaluru") — happens lazily on first GET /api/school/batches or GET /api/school/students call
- Adding students to batches by email auto-creates a placeholder student account (password: "student123") if the email doesn't already exist
- All delete operations use cascade deletes via Prisma schema (modules cascade to lessons, batches cascade to BatchStudent which cascades to Attendance)
- Holographic CSS classes (holo-border, scanlines, bg-grid, card-hover) used throughout — visible in both dark and light mode
- TanStack Query used for all data fetching with proper query invalidation on mutations
- Sonner toasts for all success/error feedback
- AlertDialog used for delete confirmations (courses and labs)
- Inline forms (not modals) for create/edit to keep workflow smooth
