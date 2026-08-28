# GuardianX — Cyber Security LMS Platform

## Project Overview
GuardianX is a comprehensive Learning Management System (LMS) for cyber security certification courses (CEH, CCNA, CCNP, RHCSA, WAPT, CISSP, CYBERARK-IAM & PAM, etc.). It includes:
- Full LMS (course catalog, lessons, PDF study material, on-the-go notes, progress tracking, quizzes, certificates)
- Live sessions with screen sharing + two-way voice (instructor <-> students) via WebRTC + Socket.io signaling
- Cyber security practice labs (open-source style challenges)

## Tech Stack
- Next.js 16 (App Router) + TypeScript, single `/` route SPA
- Tailwind CSS 4 + shadcn/ui (New York), Lucide icons
- Prisma (SQLite), NextAuth v4 (credentials), Zustand + TanStack Query
- Socket.io mini-service for WebRTC signaling (port 3003)
- Theme: cyber-security dark-first with emerald/green accents

## Architecture
- `src/app/page.tsx` — single SPA entry, view switching via Zustand store
- `src/views/*` — self-contained view components
- `src/app/api/*` — REST API routes (courses, lessons, enrollments, progress, notes, quizzes, labs, live-sessions)
- `mini-services/live-signaling/index.ts` — socket.io WebRTC signaling server (port 3003)

---
Task ID: 0
Agent: orchestrator
Task: Initial project setup and planning

Work Log:
- Explored existing project (Next.js 16 scaffold, shadcn/ui installed, Prisma SQLite, empty mini-services folder, websocket example available)
- Designed architecture: single-route SPA with Zustand view-switching
- Planned DB schema and feature modules

Stage Summary:
- Foundation ready to build. Starting with Prisma schema + seed data (Task 1), then auth + app shell (Task 2), then LMS core (Task 3), etc.

---
Task ID: 1-6
Agent: orchestrator (full build)
Task: Build complete GuardianX LMS platform (auth, app shell, LMS core, labs, live sessions, certificates, community, notes)

Work Log:
- Designed & pushed Prisma schema: User, Course, Module, Lesson, Enrollment, LessonProgress, Note, Quiz, Question, QuizAttempt, Certificate, Lab, LabProgress, LiveSession, LiveSessionMember, Discussion, DiscussionReply
- Seeded DB: 3 users (admin/instructor/student), 7 certification courses (CEH, CCNA, CCNP, RHCSA, WAPT, CISSP, CyberArk) with modules/lessons/quizzes, 8 cyber labs, demo enrollments, a seeded live session, a sample note
- Configured NextAuth v4 credentials provider (JWT strategy, role callback via token.role + token.sub)
- Built theme: dark-first cyber-security aesthetic (emerald/green accents, grid backgrounds, scanlines, glow effects, terminal scrollbars) with light mode toggle
- Built app shell: sticky sidebar nav (desktop) + Sheet (mobile), top bar with search/theme/notifications/profile dropdown, sticky footer
- Built single-route SPA router (Zustand view store) with 12 views
- LMS core views: Dashboard (hero, stats, continue-learning, live-now, featured, platform stats), Course Catalog (search/filter by category+level), Course Detail (hero, curriculum accordion, enroll, instructor, labs, community), Lesson View (reading tab + PDF-style paginated document viewer + quiz + on-the-go notes side panel with create/edit/delete/pin/color), My Learning, My Notes (search, color tags, edit, pin, delete), Certificates (verifiable cards), Community (course-scoped discussions + replies), Profile (stats grid)
- Cyber Labs: Labs catalog (filter by category/difficulty, progress badges), Lab Detail (mission briefing markdown, objectives, interactive terminal with command simulation per tool - nmap/sqlmap/find/hashcat/etc., hint reveal, flag submission, reward card)
- Live Sessions: socket.io signaling mini-service on port 3003 (room join/leave, WebRTC offer/answer/ICE relay, media-state, chat, present-request/grant), WebRTC client manager (peer connections, screen sharing via getDisplayMedia, mic toggle via getUserMedia, presenter handoff), Live Sessions view (list/create/join, live room with stage video, controls bar, participants list, live chat, present-request approval for host)
- Installed remark-gfm for proper markdown table/code rendering
- Verified end-to-end with agent-browser: auth login (student), dashboard, catalog (7 courses), course detail, lesson view with notes creation, labs (8 labs) + terminal command execution + flag submission, live session join (WebRTC connected). All APIs return 200, lint passes clean.

Stage Summary:
- Platform fully functional and verified. LMS (most important) complete with PDF-style viewer + on-the-go notes + quizzes + progress + auto-certificates. Live sessions with WebRTC screen-sharing + 2-way voice + presenter handoff working. Cyber labs with interactive terminal + 8 challenges.
- Demo accounts: admin@guardianx.io/admin123, instructor@guardianx.io/instructor123, student@guardianx.io/student123
- Known limitation: WebRTC requires browser mic/screen permissions and a second peer to fully test two-way media (single-browser test confirms signaling/connection only).
- Mini-service live-signaling running on port 3003 (bun --hot).

---
Task ID: 7 (cron review round 1)
Agent: cron-web-dev-reviewer
Task: QA test with agent-browser, fix bugs, add achievement/streak system, lab progress tracking, more labs, command palette search, styling polish

## Current Project Status Assessment
- Platform was fully functional from the previous build (auth, LMS core, labs, live sessions, certificates, community, notes).
- QA with agent-browser found 2 bugs and several enhancement opportunities.
- All services running: dev server (port 3000), signaling mini-service (port 3003).

## Bugs Found & Fixed
1. **Dashboard/My Learning showed 0% progress** — `/api/courses?enrolled=true` didn't return enrollment progress. FIXED: API now includes enrollment.progress/completed/lastAccessed. Dashboard "Continue Learning" and My Learning view now show real progress bars (CEH 35%, CCNA 60%, WAPT 12%).
2. **Nested `<button>` hydration error** — course cards used `<button>` wrapping shadcn `<Button>` "Continue". FIXED: converted outer `<button>` to `<div role="button">` with keyboard handlers (Enter/Space) for accessibility. Verified DOM has no nested buttons.

## Completed Modifications (New Features)
1. **Achievement/XP/Level/Streak System** (NEW)
   - Prisma models: `Achievement`, `UserAchievement`, `UserActivity`; User gained `xp/level/streak/lastActiveDate` fields
   - `src/lib/gamification.ts`: XP rewards per activity, level curve (level N = N*200 XP), rank titles (Novice→Apprentice→Sentinel→Guardian→...→Cyber Legend), 14 achievement definitions checked dynamically, streak tracking (consecutive-day logic)
   - XP wired into all 6 activity endpoints: lesson complete (+15), lab solved (+100-800 by difficulty, -10/hint), quiz passed (+50), note created (+5), course enrolled (+25), cert earned (+300)
   - `/api/achievements` endpoint: full gamification profile (level, XP, rank, streak, achievements earned/locked, 7-day activity heatmap, top-10 leaderboard)
   - `/api/me` now returns gamification stats (xp, level, streak, rank, levelInfo)
   - **Achievements view** (NEW): hero with level/XP bar/rank, streak card, 14 achievement cards (earned highlighted, locked dimmed with lock icon), tier badges (bronze/silver/gold/platinum), weekly activity heatmap, recent XP activity feed, top-10 leaderboard with rank highlighting
   - **Header XP widget**: shows level badge, XP count, progress bar, flame streak count — clickable to achievements
   - **Gamification toaster**: celebratory toasts on level-up + achievement unlock (wired into lesson/lab/quiz mutations)

2. **Lab Progress Tracking UI** (NEW)
   - `/api/labs/stats`: per-category + per-difficulty completion stats with earned points
   - LabProgressDashboard component in Labs view: overall completion (X/15, points, %), per-category progress bars, per-difficulty stat cards with progress bars

3. **7 New Cyber Labs** (15 total now)
   - XSS Stored Comment Hijack, JWT alg:none Bypass, Windows Privesc Unquoted Service, Wi-Fi WPA2 Crack, IDOR Horizontal Escalation, Log4Shell CVE-2021-44228, RE Crackme Binary
   - Each with full scenario, objectives, hints, flag, simulated terminal commands

4. **Command Palette (⌘K / Ctrl+K)** (NEW)
   - `/api/search` endpoint: fuzzy search across courses + labs
   - Global ⌘K shortcut opens palette; quick navigation links + live debounced search results grouped by Courses/Labs
   - Accessible (sr-only DialogTitle/Description)

5. **Dashboard Streak Widget** (NEW): replaced generic "Daily Challenge" with real gamification card showing streak count, 7-day dots, rank, XP, link to achievements

6. **Styling polish**: card-hover effects, focus-visible rings on interactive cards, gradient/glow accents, tier-colored achievement badges, heatmap intensity legend

## Verification Results
- agent-browser QA: login, dashboard (progress + streak widget), catalog (7 courses), course detail, lesson view (notes), labs (15 labs + progress dashboard), lab detail (terminal + flag submission → XP + level-up + achievement toast), achievements (14 badges, heatmap, leaderboard), command palette (⌘K search), live sessions (join). All 200 OK.
- ESLint: clean (0 errors, 0 warnings)
- Gamification flow verified end-to-end: solved IDOR lab → XP 140→240, level 1→2, streak 0→1, achievements auto-checked
- Dev log: no errors
- Signaling server: running on port 3003

## Unresolved Issues / Risks
- WebRTC two-way media still requires 2 browsers + mic/screen permissions to fully test (single-browser confirms signaling only) — inherent limitation.
- Achievement toasts depend on mutation response surfacing; retroactive XP from pre-gamification activities already awarded on first achievements page load.
- Prisma query logging is verbose in dev log (cosmetic; can set `log: []` in db.ts if desired).

## Priority Recommendations for Next Phase
1. Seed more demo activity data for the leaderboard (other students with XP) so it doesn't look sparse.
2. Add a "lesson preview" overlay on locked lessons instead of just blocking.
3. Course rating/review system (students rate courses after completion).
4. Instructor dashboard: create/upload courses, see student progress.
5. Notifications panel (the bell icon currently does nothing).
6. Lab time tracking (actual time spent, not just completion).
7. Certificate PDF export (currently just a visual card).

## Demo Accounts (unchanged)
- student@guardianx.io / student123
- instructor@guardianx.io / instructor123
- admin@guardianx.io / admin123
