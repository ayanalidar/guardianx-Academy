# EXAMS-RBAC-FIX work record

Two backend improvements — (1) mock exam engine completion (master-prompt §41), (2) RBAC server-side hardening (master-prompt §50).

## Files modified
- `prisma/schema.prisma` — added `shuffleMap String?` on `ExamAttempt`; updated User `role` comment to include SUPER_ADMIN/PROCTOR/INSTITUTION_ADMIN; added `Permission` model; added `certification GuardianCertification? @relation(...)` on Exam + back-relation `exams Exam[]` on GuardianCertification (was missing — existing `/api/exams` routes were broken at runtime).
- `src/lib/session.ts` — added `AuthUser` type + `requireRole(roles: string[]): Promise<AuthUser | NextResponse>` helper.
- `src/app/api/admin/instructors/route.ts` — GET + POST use `requireRole(["ADMIN", "INSTRUCTOR"])` / `requireRole(["ADMIN"])`.
- `src/app/api/admin/leads/route.ts` — GET + POST use `requireRole(["ADMIN"])`.
- `src/app/api/admin/training-batches/route.ts` — GET + POST use `requireRole(["ADMIN", "INSTRUCTOR"])` / `requireRole(["ADMIN"])`.
- `src/app/api/admin/students/route.ts` — GET uses `requireRole(["ADMIN"])`.
- `src/app/api/admin/users/route.ts` — GET + POST use `requireRole(["ADMIN"])`. Expanded `validRoles` + added `roleTitles` map.
- `src/app/api/exams/[id]/start/route.ts` — full rewrite with Fisher-Yates shuffle, subset, shuffleMap persistence, attempt creation.
- `src/app/api/exams/[id]/submit/route.ts` — full rewrite with shuffleMap-based grading + privacy fix (hide `correctAnswer`/`explanation` for wrong answers).
- `src/app/api/exams/route.ts` — list now includes `readinessScore` (avg of last 3 attempts) + `attemptsCount` per exam.
- `src/app/api/exams/[id]/route.ts` — `userContext` now includes `readinessScore: number | null`.
- `src/views/exams.tsx` — added authenticated-only `ExamReadinessSection` block + `ReadinessMeter` component.
- `src/views/exam-detail.tsx` — added `readinessScore` to the `userContext` TS interface + added a "Readiness (last 3)" row to the eligibility sidebar.

## Files created
- `/home/z/my-project/verify-exams-rbac-fix.sh` (~210 lines) — single-bash verification script.

## Exam model fields
The Exam model already had `questionCount Int @default(50)`, `shuffleQuestions Boolean @default(true)`, `shuffleOptions Boolean @default(true)`, `duration Int` (≈ timeLimitMin). No new Exam fields were added.

## requireRole() implementation
```typescript
export type AuthUser = NonNullable<SafeUser>

export async function requireRole(
  roles: string[]
): Promise<AuthUser | NextResponse> {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!roles.includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return user
}
```

Usage:
```typescript
const user = await requireRole(["ADMIN"])
if (user instanceof NextResponse) return user
// ... user is guaranteed ADMIN
```

## APIs updated
1. `/api/admin/instructors` GET + POST
2. `/api/admin/leads` GET + POST
3. `/api/admin/training-batches` GET + POST
4. `/api/admin/students` GET
5. `/api/admin/users` GET + POST

## Permission model added
```
model Permission {
  id        String   @id @default(cuid())
  role      String   // STUDENT | INSTRUCTOR | ADMIN | SUPER_ADMIN | PROCTOR | SCHOOL_ADMIN | INSTITUTION_ADMIN
  action    String   // e.g. "course.create", "exam.grade", "cert.issue"
  resource  String   @default("*") // resource name or "*" for all
  createdAt DateTime @default(now())
  @@unique([role, action, resource])
}
```

## Lint result
`bun run lint` → 0 errors, 1 pre-existing unrelated warning (`src/lib/db.ts:25:5 Unused eslint-disable directive`).

## Verification results
- Logged in as ADMIN (`admin@academy.guardianx.cloud` / `admin123`) and STUDENT (`student@academy.guardianx.cloud` / `student123`).
- RBAC: STUDENT gets 403 on all 6 admin endpoints; ADMIN gets 200/201 on all 6. ✓
- Exam engine: Two attempts return questions in different order (shuffle works); submit with wrong answers → Score 0, Correct 0, Passed False, no correctAnswer leaked. ✓
- `/api/exams` returns `readinessScore` per exam (`null` when never attempted). ✓

## Issues encountered
1. `include: { certification: true }` was broken at runtime — fixed by adding the missing relation on Exam + back-relation on GuardianCertification.
2. Shell `DATABASE_URL` overrides `.env` — worked around by exporting the Neon URL inline.
3. Dev server dies when parent bash session exits — worked around by running dev + tests + kill in one Bash command.
4. Seeded admin/student emails differ from `seed.ts` — used the actual `@academy.guardianx.cloud` emails with `admin123` / `student123`.
