# Task 21A — 7 GuardianX Academy Features

**Agent:** full-stack-developer (Z.ai Code)
**Task:** Build 7 features (AI Learning Assistant, Threat Feed, AI Code Review, Career Planner, Job Board, Mock Interview Engine, Resume Builder) — APIs + views. No schema changes.

## Scope

7 self-contained features, each with API route(s) + a premium-styled client view. All 7 Prisma models already existed — task was purely additive. 13 new API route files + 7 new view files.

## Files Created (all NEW)

### 1. AI Learning Assistant
- `src/app/api/ai-assistant/route.ts` — POST question + context → LLM response. Persists session + messages.
- `src/app/api/ai-assistant/sessions/route.ts` — GET user's sessions; `?sessionId=` returns full messages.
- `src/views/ai-assistant.tsx` — `AIAssistantView`. Chat panel + session history + context selector.

### 2. Live Threat Intelligence Feed
- `src/app/api/threat-feed/route.ts` — GET (auto-seeds 20 items) + POST (admin).
- `src/views/threat-feed.tsx` — `ThreatFeedView`. LIVE pulse dot, severity stat cards, filterable threat cards.

### 3. AI Code Review
- `src/app/api/code-review/route.ts` — POST code + language → AI security analysis (JSON-strict prompt).
- `src/app/api/code-review/history/route.ts` — GET user's review history.
- `src/views/code-review.tsx` — `CodeReviewView`. Code editor + score gauge + issues list + history.

### 4. Career Path Planner
- `src/app/api/career/roles/route.ts` — GET roles (auto-seeds 10: SOC Analyst, Pentester, SecEng, CISO, etc.).
- `src/app/api/career/path/route.ts` — GET / POST user's career path (server computes progress from completed courses/labs).
- `src/views/career-planner.tsx` — `CareerPlannerView`. Role picker grid + roadmap with recommended courses/certs/labs.

### 5. Job Board
- `src/app/api/jobs/route.ts` — GET (auto-seeds 12 jobs, with filters) + POST (admin/instructor).
- `src/app/api/jobs/[id]/route.ts` — GET detail / DELETE (owner/admin).
- `src/app/api/jobs/[id]/apply/route.ts` — POST apply with cover letter.
- `src/views/job-board.tsx` — `JobBoardView`. Job grid + detail Dialog + apply Dialog.

### 6. Mock Interview Engine
- `src/app/api/interviews/questions/route.ts` — GET questions by role (auto-seeds 30 across 7 roles).
- `src/app/api/interviews/route.ts` — POST start interview / GET list.
- `src/app/api/interviews/[id]/route.ts` — GET single / POST submit answers (LLM grading with heuristic fallback).
- `src/views/mock-interview.tsx` — `MockInterviewView`. Setup → Active (with timer) → Results phases.

### 7. Resume Builder
- `src/app/api/resume/route.ts` — GET (auto-creates default) / POST (supports `?autopopulate=true` to import certs/courses/labs from GuardianX profile).
- `src/views/resume-builder.tsx` — `ResumeBuilderView`. Full form + sticky live preview (rendered on white background) + Download HTML.

## Cross-Cutting

- All 7 views: `"use client"` + named exports matching the requested names (`AIAssistantView`, `ThreatFeedView`, `CodeReviewView`, `CareerPlannerView`, `JobBoardView`, `MockInterviewView`, `ResumeBuilderView`).
- All 13 API routes: `getCurrentUser()` auth + `import { db } from "@/lib/db"` + `export const runtime = "nodejs"`.
- 3 AI features use lazy `await import("z-ai-web-dev-sdk")` with try/catch + graceful fallback (no 500s on AI failure).
- All 4 list endpoints auto-seed realistic data on first GET (no manual seed scripts).
- Premium design: `bg-mesh` atmosphere, violet glow orbs, `card-premium`, `text-gradient-premium`, `pulse-dot`, `ScrollReveal`, `stagger-item`, `animate-scale-in`. Consistent violet primary (`bg-violet-600 hover:bg-violet-500 btn-premium`).
- TanStack Query (`useQuery`/`useMutation`/`useQueryClient`) + `sonner` toasts throughout.
- Mobile-first responsive; sticky footers via flex-col layouts where needed.
- ESLint: 0 errors, 0 warnings. Dev server log healthy.
- No existing files modified. Schema unchanged.

## Wiring Note for Orchestrator

The 7 views are NOT yet wired into the app shell — that's the orchestrator's job. To wire them:
1. Extend `View` union type in `src/store/app-store.ts` with names like `ai-assistant`, `threat-feed`, `code-review`, `career-planner`, `job-board`, `mock-interview`, `resume-builder`.
2. Add nav items in `src/components/platform/app-shell.tsx`.
3. Add render cases in `src/app/page.tsx`.
4. Each view is a self-contained default-exported function — just import and render.
