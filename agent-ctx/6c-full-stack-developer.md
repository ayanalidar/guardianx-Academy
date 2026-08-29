# Task 6c — Bulk Student Import + Attendance Tracking + Certificate Templates APIs

**Agent:** full-stack-developer
**Date:** GuardianX Academy LMS, Task 6c

## Summary
Built all 9 API route files for the Bulk Student Import, Attendance Tracking, Certificate Templates, Course Prerequisites management, and Admin Email Log features on top of the existing Prisma schema (AttendanceRecord, CertificateTemplate, EmailLog models + new fields on Course/Lab/Certificate). No schema modifications.

## Files Created

### Shared helper
1. `src/lib/csv.ts` — Minimal CSV parser (quoted fields + `""` escape + line-ending normalization), `parseCsvObjects` (lowercased-header objects), `isValidEmail` regex, `generateTempPassword()` (`GX-XXXXXX` with unambiguous alphabet).

### A. Bulk Student Import
2. `src/app/api/instructor/bulk-import/route.ts` — POST. Accepts `{ courseId, students: [...] }` OR `{ courseId, csv }`. INSTRUCTOR/ADMIN only; instructors can only import into own courses. Per-row: validate name+email → if user exists, skip creation but still enroll → else create with temp password (bcryptjs, cost 10) + role STUDENT → enroll (create Enrollment + increment Course.studentsCount) → send welcome email (with temp password) for new users / notification email for existing users newly enrolled. Cap 200 students/request. Per-row try/catch. Returns `{ created, enrolled, skipped, results: [{ email, status, tempPassword?, error? }] }`.
3. `src/app/api/instructor/bulk-import/preview/route.ts` — POST. Accepts `{ csv }`, parses + validates each row (name ≥ 2 chars, valid email regex). Returns `{ rows: [{ name, email, title, valid, error? }], totalRows, validRows }`. No DB writes.

### B. Attendance Tracking
4. `src/app/api/instructor/courses/[id]/attendance/route.ts` —
   - GET: optional `?date=` + `?sessionType=` filters; returns `{ course, records (with user relation), byDate (grouped by `date|sessionType`), roster (all enrolled users) }`. Owner/admin gated.
   - POST: `{ userId, date (YYYY-MM-DD), sessionType?, status (present|absent|late|excused), notes? }`. Validates date regex + status enum + enrollment. Upserts via compound unique `courseId_userId_date_sessionType`.
5. `src/app/api/instructor/courses/[id]/attendance/bulk/route.ts` — POST. Body `{ date, sessionType?, records: [...] }`. Per-record validation + try/catch. Upserts each. Returns `{ upserted, errors, total }`.
6. `src/app/api/me/attendance/route.ts` — GET. Student's own records across all enrolled courses. Returns aggregated `stats` (totalSessions, present, absent, late, excused, attendanceRate = (present+late)/total*100), per-course breakdown, recent 20 records.

### C. Certificate Templates
7. `src/app/api/certificate-templates/route.ts` —
   - GET (public): lists all templates with `_count.certificates`, sorted by `isDefault desc, createdAt desc`.
   - POST (ADMIN/INSTRUCTOR): creates template with all visual-config fields. Wrapped in `$transaction` — if `isDefault: true`, first `updateMany` unsets isDefault on all other templates. Returns 201.
8. `src/app/api/certificate-templates/[id]/route.ts` —
   - GET: fetch one template with `_count.certificates`.
   - PATCH (ADMIN/INSTRUCTOR): allowlisted field set; if `isDefault: true`, transaction unsets others first.
   - DELETE (ADMIN/INSTRUCTOR): 409 if any certificates reference the template; otherwise deletes.

### D. Course Prerequisites
9. `src/app/api/instructor/courses/[id]/prerequisites/route.ts` —
   - GET: returns `prerequisites` (resolved course objects for current prereqIds) + `candidates` (other courses by the same instructor, or all for admin — for picker UI).
   - PUT: `{ prerequisiteIds: string[] }`. Dedupes, strips self-reference, validates all IDs exist (count check), stores as comma-joined string in `Course.prerequisiteIds`. Complements existing `/api/courses/[id]/enroll` GET which already enforces prereqs at enrollment time.

### E. Email Notifications Log
10. `src/app/api/admin/emails/route.ts` — GET. ADMIN only. Optional `?type=` + `?status=` filters; pagination via `?page=` + `?pageSize=` (max 100). Includes `user` relation (`id, name, email`). Returns `{ logs, page, pageSize, total, totalPages }`.

## Key Implementation Decisions
- **Auth pattern:** All write endpoints check `getCurrentUser()`; instructor endpoints verify role INSTRUCTOR/ADMIN + resource ownership. Admins bypass ownership checks.
- **Params:** Next.js 16 async params pattern — `{ params }: { params: Promise<{ id: string }> }` with `await params`.
- **Password hashing:** Used `bcryptjs` (matches existing `api/auth/register/route.ts`). `bcrypt.hashSync(tempPassword, 10)`.
- **CSV parsing:** Hand-rolled minimal parser (no new dependency). Handles quoted fields with embedded commas, `""` escape sequence, and `\r\n` / `\r` / `\n` line endings.
- **Bulk import resilience:** Per-row try/catch so one bad row doesn't abort the batch. Validation errors → row skipped with `error` field in results.
- **Emails:** Welcome email with temp password for new users; notification email for existing users newly enrolled. Failures in `sendEmail` are caught internally (already handled in lib/email.ts) and don't break the import.
- **Attendance upsert:** Uses compound unique key `courseId_userId_date_sessionType` (matches `@@unique([courseId, userId, date, sessionType])` in schema).
- **Certificate template isDefault:** Transaction-wrapped mutual exclusion — setting `isDefault: true` on one template unsets it on all others (both on POST create and PATCH update).
- **Certificate template delete safety:** 409 Conflict if any certificates reference the template (checked via `_count.certificates`).
- **Prerequisites storage:** Stored as comma-joined string in `Course.prerequisiteIds` (matches existing schema field). Self-reference blocked, deduped, validated.
- **Admin email log:** Exposes the audit trail already produced by `sendEmail()` calls throughout the platform (assignment grading, enrollment, bulk-import welcomes, etc.).

## Verification
- All 10 files compile via `bun build` (each bundled successfully, 0 errors).
- All files follow existing project conventions (typed params, NextResponse.json, consistent error shapes `{ error: string }` with 401/403/404/400/409 status codes).
- TypeScript strict-compatible: ownership helper uses discriminated-union narrowing via early-return + `!` assertion when already checked.
- No `"use client"` directives (server route handlers only).
- Did NOT modify Prisma schema (as instructed).
- Lint intentionally NOT run per task instructions (parent will run it).
