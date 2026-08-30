# Task 21B — 9 GuardianX Academy Features (CTF, Weekly Challenges, Team Missions, Analytics, Assessments, Prerequisites Graph, Lab Snapshots, Cyber Range, Bug Bounty)

**Agent:** full-stack-developer (Z.ai Code)
**Task ID:** 21B
**Date:** 2025

## Scope

Build 9 features for GuardianX Academy (Next.js 16 + Prisma SQLite + TypeScript), each with API route(s) + a premium `"use client"` view. The Prisma schema was already complete — no schema modifications. Total: 17 new API route files + 9 new view files.

## Reference materials read

- `/home/z/my-project/worklog.md` — prior task history (especially Task 21A which built 7 features with same pattern).
- `/home/z/my-project/src/lib/db.ts` — Prisma client singleton.
- `/home/z/my-project/src/lib/session.ts` — `getCurrentUser()` returns `{ id, email, name, role, avatar, title, bio, schoolId }`.
- `/home/z/my-project/src/app/globals.css` — premium design tokens (deep near-black `oklch(0.06 0.006 270)`, solid card `oklch(0.18 0.012 270 / 0.95)`, violet primary `oklch(0.6 0.2 295)`, premium classes `card-premium`, `bg-mesh`, `text-gradient-premium`, `pulse-dot`, `glow-soft`, `btn-premium`).
- `/home/z/my-project/src/views/dashboard.tsx` — reference for premium style: hero with greeting, dominant mission card, ScrollReveal motion, Counter components, violet glow orbs.
- `prisma/schema.prisma` lines 871–1180 — confirmed all model groups exist.

## Files Created (all NEW)

### API Routes (17 files)

1. **CTF Platform (4 files)**
   - `src/app/api/ctf/competitions/route.ts` — GET (auto-seeds 3 competitions × 4 challenges each); POST (admin/instructor create).
   - `src/app/api/ctf/competitions/[id]/route.ts` — GET competition detail with challenges + leaderboard + myTeam + solved flags.
   - `src/app/api/ctf/teams/route.ts` — GET ?competitionId= lists teams; POST creates team (caller=captain).
   - `src/app/api/ctf/submit/route.ts` — POST flag submission, awards points only on first correct solve.

2. **Weekly Challenges (1 file)**
   - `src/app/api/challenges/route.ts` — GET active+leaderboard OR ?history=true; POST submit flag (single-attempt).

3. **Team Missions (2 files)**
   - `src/app/api/team-missions/route.ts` — GET (auto-seeds 4 missions); POST create session.
   - `src/app/api/team-missions/[id]/route.ts` — GET session; POST join with role.

4. **Learning Analytics (1 file)**
   - `src/app/api/analytics/route.ts` — GET auto-computes from enrollments + labProgress + quizAttempts + activities, upserts LearningAnalytics record.

5. **Skill Assessments (2 files)**
   - `src/app/api/skill-assessments/route.ts` — GET (auto-seeds 5 assessments × 4–5 questions each).
   - `src/app/api/skill-assessments/[id]/route.ts` — GET detail (no correctAnswer leaked); POST submit answers → score + skill breakdown.

6. **Prerequisites Graph (1 file)**
   - `src/app/api/prerequisites-graph/route.ts` — GET all courses with parsed prerequisiteIds → { nodes, edges, categories }.

7. **Lab Snapshots (2 files)**
   - `src/app/api/lab-snapshots/route.ts` — GET user's snapshots; POST create.
   - `src/app/api/lab-snapshots/[id]/route.ts` — GET load; DELETE remove.

8. **Cyber Range (2 files)**
   - `src/app/api/cyber-range/route.ts` — GET (auto-seeds 3 ranges with topology+machines); POST create session.
   - `src/app/api/cyber-range/[id]/route.ts` — GET session; POST join with role.

9. **Bug Bounty (1 file)**
   - `src/app/api/bug-bounty/route.ts` — GET programs OR ?mine=true submissions (auto-seeds 8 programs); POST submit finding.

### Views (9 files)

1. `src/views/ctf-platform.tsx` — `CTFPlatformView`. Competition list grid → jeopardy board grouped by category → flag submission Dialog → live leaderboard. Create-team dialog.
2. `src/views/weekly-challenges.tsx` — `WeeklyChallengesView`. Active challenge card with **live countdown timer** + elapsed timer + single-submission flow + reveal-hint + top-10 leaderboard. Past challenges tab with revealed flags.
3. `src/views/team-missions.tsx` — `TeamMissionsView`. Mission cards with objectives → session detail with scenario brief + team lobby with role badges (Leader/Scanner/Exploiter/Reporter) + role picker.
4. `src/views/learning-analytics.tsx` — `LearningAnalyticsView`. KPI cards + **custom SVG radar chart** (6-axis) + peer percentile bars + weekly activity bar chart + course completion Progress list.
5. `src/views/skill-assessments.tsx` — `SkillAssessmentsView`. List → question-by-question test interface with Progress + question navigator grid → results with score banner + skill breakdown + per-question explanations.
6. `src/views/prerequisites-visualizer.tsx` — `PrerequisitesVisualizerView`. **Pure SVG graph** (3-column layout Beginner→Advanced, curved bezier edges with arrows). Click node → side panel with prerequisites + unlocks navigation.
7. `src/views/lab-snapshots.tsx` — `LabSnapshotsView`. Snapshot grid with load/download/delete actions. Create dialog with lab Select. Restore dialog with JSON state preview.
8. `src/views/cyber-range.tsx` — `CyberRangeView`. Range cards with **mini SVG topology** + machine list → session detail with full SVG topology + team roster with role badges + role picker (attacker/defender/observer).
9. `src/views/bug-bounty.tsx` — `BugBountyView`. Programs grid + my submissions tab. Submit Finding dialog with responsible-disclosure warning + severity select.

## Cross-Cutting Notes

- All 9 view files start with `"use client"` and export the named function.
- All 17 API routes use `getCurrentUser()` for auth + `import { db } from "@/lib/db"`. Each sets `export const runtime = "nodejs"`.
- Premium styling: `bg-mesh` atmospheric overlay, violet glow orbs top-right, `card-premium` hover lift, `pulse-dot` for live indicators, `text-gradient-premium` on hero keywords, `ScrollReveal` from motion-system, `bg-grid` overlays, `btn-premium` on action buttons.
- Mobile-first responsive: all grids use `sm:` / `md:` / `lg:` breakpoints.
- Seed-on-first-GET pattern: each list API checks `count()` and seeds realistic data only if table is empty.
- TanStack Query (`useQuery` for reads, `useMutation` for writes, `useQueryClient().invalidateQueries()` after mutations). `sonner` toasts for user feedback. 10–30s polling on detail/leaderboard queries to feel "live".
- Custom SVG visualizations: radar chart (learning analytics), prerequisite graph (3-column curved-edge layout), topology previews (mini + full) for cyber range. **No external chart/graph libraries added**.
- ESLint: 0 errors, 0 warnings (`bun run lint` clean).
- Dev server log healthy — no compile or runtime errors after creation (only pre-existing NEXTAUTH_URL warning).

## Wiring needed by orchestrator

The orchestrator can extend `useAppStore` View type and add nav items for: `ctf`, `weekly-challenges`, `team-missions`, `learning-analytics`, `skill-assessments`, `prerequisites-graph`, `lab-snapshots`, `cyber-range`, `bug-bounty`. Each view is self-contained and imports nothing view-specific outside its own file.
