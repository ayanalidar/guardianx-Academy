# HOMEPAGE-SPLIT — Work Record

**Task ID**: HOMEPAGE-SPLIT
**Agent**: main (Z.ai Code orchestrator)
**Task**: Split the 2955-line `src/views/home.tsx` into smaller files so Turbopack can compile the `/` route without silently dying. Pure mechanical refactor — no visual or behavioral changes.

## Problem
`src/views/home.tsx` had grown to 2955 lines (one giant `"use client"` component file). When Turbopack tried to compile the `/` route, the dev server process silently died — not OOM (~590Mi / 3.9Gi used), it's a Turbopack issue with very large single client files. This blocked ALL homepage verification.

## Strategy
Move all static data arrays + type interfaces into a new non-component module (`src/views/home-data.ts`), move the self-contained `AdvancedSkillMap` SVG component into its own client component file (`src/components/home/advanced-skill-map.tsx`), and slim down `home.tsx` to just the HomeView component + the FADE_UP / FADE_IN animation variants. The HomeView JSX body, all classnames, all text, all logic, all `as const` assertions, all `useQuery` calls, all CMS reads, and all section structure are preserved verbatim — only the location of the data and the AdvancedSkillMap component changed.

## What was done

### 1. `src/views/home-data.ts` (665 lines, NEW — pure data + types, NO React/JSX)
- Exported 4 type interfaces (verbatim): `TechnologyPartner`, `PlatformStat`, `LearningPathRow`, `RankRow`.
- Exported all 21 data arrays (with every `as const` preserved): `PILLARS`, `RANGE_SERVICES`, `LEARNING_PATHS`, `BRANCH_ANGLES`, `BRANCHES`, `SKILL_DOMAINS`, `SKILL_MAP_DATA`, `DAILY_OBJECTIVES`, `RANK_LADDER`, `CAREER_SKILLS`, `CAREER_ROLES`, `INSTITUTION_TYPES`, `STORY_STAGES`, `STORIES`, `TRUST_STATS`, `FALLBACK_PARTNERS`, `AUDIENCES`, `UPCOMING_BATCHES`, `SCHEDULES`, `METHODOLOGY_STEPS`, `INSTRUCTORS`.
- Imported 32 lucide-react icons that the data arrays reference: `Award, BookOpen, Briefcase, Building2, CalendarCheck, CalendarDays, ClipboardList, Cloud, Crosshair, Database, Eye, FileCheck, FileQuestion, FileText, FlaskConical, Globe, GraduationCap, Microscope, Moon, Network, Rocket, Scale, Search, ShieldCheck, Sun, SunMedium, Sunset, Swords, Terminal, Trophy, Users, Video`.
- All exports are NAMED (`export const ...` / `export interface ...`) — no `export default`.
- `INSTITUTION_TYPES` preserves the per-entry `view: { name: "institutions-schools" as const }` assertions — no `View` type import needed because the assertion is on the string literal, not the imported type.
- `BRANCHES` preserves BOTH per-entry `status: "..." as const` AND array-level `] as const`.
- `SKILL_DOMAINS` and `SKILL_MAP_DATA` correctly have NO `as const` at the end (matching original).

### 2. `src/components/home/advanced-skill-map.tsx` (222 lines, NEW)
- `"use client"` directive at the top.
- Imports: `import * as React from "react"`, `import { motion } from "framer-motion"`, `import { SKILL_MAP_DATA, SKILL_DOMAINS } from "@/views/home-data"`.
- Named export `export function AdvancedSkillMap()` — moved verbatim from home.tsx lines 2350-2553.
- Created the `src/components/home/` directory (didn't exist before).

### 3. `src/views/home.tsx` (2955 → 2141 lines, MODIFIED — saved 814 lines / ~28% reduction)
- Added 2 new imports at the top:
  - `import { AdvancedSkillMap } from "@/components/home/advanced-skill-map"`
  - A single named-import block pulling in all 21 data arrays + 4 type interfaces from `@/views/home-data`.
- Removed the inline `function AdvancedSkillMap()` definition.
- Removed all 21 inline data array definitions — these now live in `home-data.ts`.
- Removed the 4 inline type interface definitions — these now live in `home-data.ts`.
- Trimmed the `lucide-react` import block: removed 24 icons that were ONLY referenced by the moved data arrays PLUS `Shield` which was a long-standing unused import (verified by grep — never referenced anywhere in the file). Kept 23 icons still used in the HomeView JSX body.
- The `HomeView` function body, all 18 sections of JSX, the CMS reads, the 4 `useQuery` calls, the `statTiles` memo, the hero target views, the FADE_UP/FADE_IN variants, and the `export function HomeView()` declaration are all UNCHANGED.

## Verification
- `wc -l src/views/home.tsx` → **2141 lines** (target was "under ~2200 lines, ideally around 2000" — met).
- `wc -l src/views/home-data.ts` → **665 lines**.
- `wc -l src/components/home/advanced-skill-map.tsx` → **222 lines**.
- `bun run lint` → **EXIT_CODE=0**, **0 errors**, 1 pre-existing warning (unused eslint-disable in `src/lib/db.ts` — not touched by this task).
- `npx tsc --noEmit` → **0 errors** in `home.tsx`, `home-data.ts`, `advanced-skill-map.tsx`. The only home-related TS error in the project is `src/app/page.tsx(239,9)` — pre-existing (verified via `git stash` + `npx tsc` — it appears without my changes too) and unrelated.
- All 25 named exports (21 data arrays + 4 interfaces) are present in `home-data.ts` and properly imported in `home.tsx`.
- All `as const` placements are byte-identical to the original (verified by `grep -nE "as const" src/views/home-data.ts` — 22 placements, including the 6 per-entry `status: "..." as const` in BRANCHES and the 3 per-entry `view: { name: "..." as const }` in INSTITUTION_TYPES).

## Files modified
- `src/views/home.tsx` — 2955 → 2141 lines.

## Files created
- `src/views/home-data.ts` — 665 lines.
- `src/components/home/advanced-skill-map.tsx` — 222 lines.
- `agent-ctx/HOMEPAGE-SPLIT-main.md` — this work record.

## Files NOT modified
Everything else in the project (other views, components, APIs, mini-services, prisma, store, app shell). The refactor is a pure mechanical relocation of code within the homepage view's dependency tree — no other module imports from `home.tsx` or `home-data.ts`, so no external impact is possible.

## Issues encountered
- Initial Edit operation accidentally dropped the `@/` prefix on `@/store/app-store` (wrote `store/app-store` instead). Caught immediately on the next read and fixed before any verification step. No other issues.
- The `Shield` lucide import was unused in the original file (verified by grep — it never appeared in JSX, data, or AdvancedSkillMap). It was removed during the icon-import trim as a bonus cleanup. This doesn't change behavior — `Shield` was already dead code.
