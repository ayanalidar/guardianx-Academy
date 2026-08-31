# Agent Work Record — P7-MISSION-CONTROL

## Task
Completely rewrite `src/views/dashboard.tsx` as "GUARDIANX // MISSION CONTROL" — a Security Operations Center (SOC) style student dashboard using the cyber component library.

## Context Reviewed (from prior agent records)
- `agent-ctx/P2-CYBER-cyber-component-builder.md` — cyber component library at `src/components/cyber/` (StatTile, XPBar, RankBadge, MissionCard, StatusDot, LabCard, FlagInput, SkillNode, ThreatMap, CyberTerminal, MissionCard)
- `agent-ctx/P6-P8-P9-VIEWS-full-stack-developer.md` — established SPA view patterns, `useAppStore().navigate`, dark premium design system, violet/cyan/amber accents (no indigo/blue), `py-8 lg:py-12` spacing convention
- `worklog.md` AUDIT-P1 section — overall architecture, NextAuth session flow, Prisma schema (User, UserActivity, Lab, LabProgress, Enrollment, Achievement, UserAchievement)
- `src/lib/gamification.ts` — `levelFromXp(xp)` returns `{ level, currentLevelXp, nextLevelXp, progress }`; `rankTitle(level)` returns rank string; `XP_REWARDS` and `ACHIEVEMENT_DEFS` tables drive activity logging

## Files Created / Modified

### 1. `src/app/api/leaderboard/route.ts` — **NEW** (63 LOC)
- General-purpose leaderboard endpoint returning global top-10 users by XP.
- Response: `{ topUsers, currentUser, totalUsers }`. Each user entry has `{ rank, id, name, title, avatar, xp, level, rankTitle, isMe }`.
- `currentUser` field is populated even if the user is outside top-10 (so the dashboard can highlight their row regardless of rank).
- Anonymous requests get `currentUser: null` and `isMe: false` on every entry (safe for unauthenticated calls).
- Uses `getCurrentUser()` from `@/lib/session`, `levelFromXp`/`rankTitle` from `@/lib/gamification`.

### 2. `src/app/api/me/route.ts` — **MODIFIED**
- Added an 8th `Promise.all` branch querying `db.userActivity.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 })`.
- Returns a new top-level `activities` array on the JSON response: `{ id, type, xp, meta, date, createdAt }[]`.
- Backwards compatible — existing fields (`user`, `stats`, `gamification`) are unchanged. The `useUser()` hook in `src/hooks/use-user.ts` continues to work without modification (it just ignores the new field).

### 3. `src/views/dashboard.tsx` — **OVERWRITTEN** (was 402 LOC; now 1199 LOC)
- Kept the `DashboardView` export name (preserves `page.tsx` ViewRouter contract: `view.name === "dashboard"`).
- 10 distinct sections + 2 shared building blocks (SectionHeader, EmptyState).
- Full SOC aesthetic: `bg-grid` + `bg-mesh` atmospheric background, `scanlines` texture on header, mono labels for all technical metadata, `StatusDot` pulse indicators, fine borders, compact `py-6 lg:py-8` spacing.

**Sections (top-to-bottom):**
1. **HEADER STRIP** — "GUARDIANX // MISSION CONTROL" mono label, user name, `RankBadge`. Right: live `StatusDot` ("SYSTEMS ONLINE", "{N} LABS AVAILABLE"), live clock (1s tick).
2. **STATS ROW** — 4 `StatTile`s (Level/XP/Streak/Rank) + full-width `XPBar` below showing level progress.
3. **CURRENT MISSION** — `MissionCard` for next recommended lab (first lab with `progress.status !== "completed"`). Empty state with `[EXPLORE LABS]` CTA.
4. **CONTINUE LEARNING** — 3 in-progress course cards with progress bars. Empty state with `[BROWSE CATALOG]` CTA.
5. **ACTIVE LABS** — `LabCard`s for `progress.status === "in_progress"` labs (deterministic pseudo-IP from lab ID, services derived from tags). Empty state with `[BROWSE LABS]` CTA.
6. **DAILY OBJECTIVE** — "Complete one Web Security lab", 0/1 progress, +250 XP reward, status badge.
7. **ACHIEVEMENTS** — Grid of 6 earned badges with icon/color mapping. Empty state if none earned.
8. **LEADERBOARD** — Top 5 + user's row (highlighted, with `· YOU` tag). "VIEW FULL LEADERBOARD" link.
9. **SKILL PROFILE** — 6 animated bars (Web/Network/Crypto/Forensics/Reverse/Governance) computed from lab completion per category.
10. **ACTIVITY FEED** — Timeline of 5 recent activities with type-specific icons, timestamps, and +XP chips.

**Cyber components used:** `StatTile`, `XPBar`, `RankBadge`, `MissionCard`, `LabCard`, `StatusDot` (all 6 specified by the task).

**Data fetching:** TanStack Query for `/api/me`, `/api/courses?enrolled=true&status=in-progress`, `/api/labs`, `/api/leaderboard`, `/api/achievements`. `enabled: !!user?.id` gating on user-dependent queries.

**Empty/loading states:** Every section has a Skeleton fallback during loading and an intentional `EmptyState` with a CTA when there's no data.

## Lint
- `bun run lint` → 0 errors, 0 warnings.
- Initial pass flagged unused lucide imports (AlertTriangle, CheckCircle2, Globe, Lock, Network, Server, Sparkles, Wifi) — all removed.
- Note: project's `eslint.config.mjs` has `@typescript-eslint/no-unused-vars: "off"`, so unused imports wouldn't be auto-flagged. I checked manually and removed them anyway for code hygiene.

## Dev Server
- `dev.log` confirms: `GET / 200`, `GET /api/leaderboard 200`, `GET /api/me 200` all green.
- "Fast Refresh had to perform a full reload" warnings are HMR reconciling large file diffs (not actual compile errors). The page renders successfully (200KB HTML payload, ~150ms render time).

## Notes for Next Agent
- The `useUser()` hook (`src/hooks/use-user.ts`) does NOT expose the new `activities` field on its return type. The dashboard works around this by issuing a separate `useQuery({ queryKey: ["me"] })` that deduplicates against the same TanStack Query cache key. If you want to consume `activities` elsewhere, either extend the `useUser` return type or replicate the same pattern.
- The `LeaderboardEntry` shape returned by `/api/leaderboard` is intentionally a flat object (no nested `user` wrapper) so the dashboard can map over it directly. If you need a different shape (e.g. for the dedicated `/views/leaderboard.tsx` page), keep the flat fields and add the wrapper on the consumer side.
- `deriveServices()` and `pseudoIp()` are deterministic helpers — the same lab always renders the same IP and service list. This is intentional so the UI is stable across re-renders.
- The Daily Objective (`labsSolvedToday` prop) is currently hardcoded to 0 — there's no real "labs solved today" counter in the existing `/api/me` response. A future agent could extend `/api/me` to include a `dailyStats` block (labs solved today, XP today, etc.) and wire it in.
- The Skill Profile percentages are computed from `labs.filter(category === X && progress.status === "completed")` over total labs per category. Categories with 0 labs render 0% — this is intentional (empty skill = nothing mastered yet).
