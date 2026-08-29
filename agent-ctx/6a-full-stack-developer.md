# Task 6a — Assignment System + Grading Rubric + Peer Review APIs

**Agent:** full-stack-developer
**Date:** GuardianX Academy LMS, Task 6a

## Summary
Built all 12 API route files for the Assignment System, Grading Rubrics, and Peer Review features on top of the existing Prisma schema (Assignment, AssignmentSubmission, GradingRubric, RubricCriterion, PeerReview models).

## Files Created
1. `src/app/api/instructor/courses/[id]/assignments/route.ts` — GET (list, owner+enrolled) + POST (create, owner-only)
2. `src/app/api/instructor/assignments/[id]/route.ts` — GET (with submission counts) + PATCH + DELETE
3. `src/app/api/assignments/[id]/route.ts` — GET (student/enrolled view of assignment + rubric)
4. `src/app/api/assignments/[id]/submit/route.ts` — POST (submit/resubmit, late detection, confirmation email)
5. `src/app/api/assignments/[id]/my-submission/route.ts` — GET (student's own submission + peer reviews received)
6. `src/app/api/instructor/assignments/[id]/submissions/route.ts` — GET (list submissions with user info + stats, optional status filter)
7. `src/app/api/instructor/submissions/[id]/grade/route.ts` — POST (grade 0-100, feedback, rubricScores; email + notification to student)
8. `src/app/api/instructor/rubrics/route.ts` — GET (list instructor's rubrics with criteria) + POST (create rubric + criteria)
9. `src/app/api/instructor/rubrics/[id]/route.ts` — GET + PATCH (update + replace criteria) + DELETE (detach from assignments first)
10. `src/app/api/assignments/[id]/peer-reviews/route.ts` — GET (lazy-assign random peer submissions, dedupe by existing PeerReview records)
11. `src/app/api/submissions/[id]/peer-review/route.ts` — POST (submit review, dedupe via unique constraint, notify reviewed user)
12. `src/app/api/me/assignments/route.ts` — GET (student dashboard: all assignments across enrolled courses with status + due-soon flags)

## Key Implementation Decisions
- **Auth pattern:** All write endpoints check `getCurrentUser()`; instructor endpoints verify role INSTRUCTOR/ADMIN + resource ownership. Admins bypass ownership checks.
- **Params:** Next.js 16 async params pattern — `{ params }: { params: Promise<{ id: string }> }` with `await params`.
- **Resubmission:** Resets grade/gradedAt/gradedBy/feedback and sets status to `resubmitted` so instructor knows to re-grade.
- **Peer review lazy assignment:** No separate "assignment" model — picks `(peerReviewCount - completedCount)` random unreviewed submissions from other students each call. Requires student to have submitted their own work first.
- **Rubric criteria replacement:** PATCH deletes all old criteria then `createMany` new ones in a single transaction-like flow.
- **Rubric deletion:** Detaches rubric from assignments (sets `rubricId = null`) before deletion since the field is nullable.
- **Compound unique keys used:** `userId_courseId` (Enrollment), `assignmentId_userId` (AssignmentSubmission), `submissionId_reviewerId` (PeerReview).
- **Emails/notifications:** Use existing `sendEmail` and `createNotification` helpers; failures are caught and logged (don't break the request).

## Verification
- All files follow existing project conventions (seen in `instructor/courses/route.ts`, `instructor/modules/[id]/lessons/route.ts`, `courses/[id]/enroll/route.ts`).
- TypeScript strict-compatible: typed params, no `any` leaks, proper union narrowing for ownership helper.
- No `"use client"` directives (server route handlers only).
- Did NOT modify Prisma schema (as instructed).
