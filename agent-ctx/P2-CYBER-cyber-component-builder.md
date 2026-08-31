# Task P2-CYBER — Cyber Component Library Builder

## Task
Build a reusable "cyber" component library in `src/components/cyber/` for the GuardianX Academy Next.js 16 project.

## What was created (11 files, 2036 LOC)

All files live in `/home/z/my-project/src/components/cyber/`:

1. **`status-dot.tsx`** (93 LOC) — `StatusDot` — small status indicator dot (online/offline/warning/idle) with optional pulse + label
2. **`terminal.tsx`** (212 LOC) — `CyberTerminal` — realistic terminal that types lines char-by-char with mac-style title bar, blinking cursor, scanlines, role="log"
3. **`xp-bar.tsx`** (103 LOC) — `XPBar` — animated XP progress bar with violet→cyan gradient fill, optional level badge, progress-active stripes, role="progressbar"
4. **`rank-badge.tsx`** (175 LOC) — `RankBadge` — color-coded rank badge with 8-tier hierarchy (RECRUIT→ELITE GUARDIAN); elite uses shimmer gradient
5. **`flag-input.tsx`** (219 LOC) — `FlagInput` — specialized flag-capture input with `GX{...}` prefix/suffix chips, Enter-to-submit, loading/correct/incorrect states with animated icon
6. **`lab-card.tsx`** (179 LOC) — `LabCard` — lab mission card with difficulty banner, status dot, target IP, services chips, XP reward, hover lift
7. **`mission-card.tsx`** (149 LOC) — `MissionCard` — cinematic "current mission" card with objective, time elapsed, XP reward, embedded flag input, launch CTA
8. **`skill-node.tsx`** (240 LOC) — `SkillNode` — skill-tree node with locked/available/in-progress/completed states; SVG connection lines, pulsing border, animated ring
9. **`stat-tile.tsx`** (107 LOC) — `StatTile` — compact dashboard stat tile with icon, big number, label, optional trend indicator (up/down arrow)
10. **`threat-map.tsx`** (517 LOC) — `ThreatMap` — canvas-based animated network viz: pulsing nodes (core/labs/targets/students), packet flow along edges, transient status-event overlays
11. **`index.ts`** (42 LOC) — barrel export re-exporting all components + types

## Design highlights

- All components use OKLCH design tokens via existing `card-premium`, `glow-soft`, `scanlines`, `text-gradient-shimmer`, `bg-grid` classes
- Tailwind color classes for status: violet (primary), cyan (info), emerald (success), amber (warning), rose (threat)
- Framer-motion: hover lifts, enter animations, blinking cursors, animated SVG paths, AnimatePresence for icon swaps
- Accessibility: role="log"/"progressbar"/"status"/"img", aria-valuenow/min/max, aria-invalid/describedby, keyboard handlers (Enter/Space)
- Reduced motion: every animated component checks prefers-reduced-motion; ThreatMap renders a single static frame
- TypeScript strict typing on all props; barrel exports types alongside components
- No existing files modified — strictly additive

## Lint result

```
$ bun run lint
$ eslint .
EXIT_CODE=0
```

✅ 0 errors, 0 warnings. Also verified via `tsc --noEmit` — 0 type errors in `cyber/` files.

## What other agents should know

- Import pattern: `import { CyberTerminal, LabCard, ... } from "@/components/cyber"` (barrel) or direct `@/components/cyber/<component>`
- All types are exported (`LabDifficulty`, `StatusDotStatus`, `RankName`, `TerminalLine`, `SkillNodeStatus`, etc.)
- `LabCard` accepts `onClick` — when provided it becomes keyboard-focusable with role="button"
- `FlagInput` strips any literal `GX{`/`}` from input and reconstructs canonical form on submit
- `RankBadge` fuzzy-matches rank strings to one of 8 canonical ranks
- `ThreatMap` accepts `variant="hero"|"section"|"compact"` — scales node count, packet count, event frequency
- `SkillNode` is designed to be placed inside a relatively-positioned container with `position` prop for absolute placement; `connections` draw SVG lines to other node centers
