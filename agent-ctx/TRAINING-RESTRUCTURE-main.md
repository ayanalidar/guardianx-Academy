# Task: TRAINING-RESTRUCTURE — Homepage restructure + Batches view

**Agent:** main (Z.ai Code orchestrator)
**Task ID:** TRAINING-RESTRUCTURE
**Status:** ✅ Complete
**Lint result:** 0 errors, 0 warnings (`bun run lint` exit code 0)

## Goal
Restructure the GuardianX Academy homepage hero and add 5 new sections
(Who We Train, Upcoming Batches, Flexible Schedules, Training Methodology,
Expert Instructors). Build a new dedicated `batches` view with filters
and a request-a-batch CTA. Wire the new view into the SPA router and
public-views set.

## Files Modified

### `src/store/app-store.ts`
- Added `| { name: "batches" }` to the `View` union type (after `catalog`).

### `src/app/page.tsx`
- Imported `BatchesView` from `@/views/batches` (static import — matches
  the pattern for `CourseCatalogView`, `ImpactView`, etc. since batches
  is a public-facing page that should SSR).
- Added `"batches"` to the `PUBLIC_VIEWS` set so the view renders inside
  `PublicPageShell` (header + footer) for both anonymous and
  authenticated visitors.
- Added `{view.name === "batches" && <BatchesView />}` to `ViewRouter`.

### `src/views/home.tsx`
Six groups of changes:

**1. Imports** — added 14 new lucide icons needed by the new sections:
`Calendar, Clock, Video, Sun, SunMedium, Sunset, Moon, CalendarDays,
CalendarCheck, FileText, ClipboardList, FileQuestion, Microscope`. Also
imported the `View` type from `@/store/app-store` so hero CTA targets
can be typed as `View`.

**2. Hero defaults updated** (CMS-overridable via `home.hero.*` content
rows, with new hardcoded fallbacks):
- `title` → `"Master cybersecurity with"`
- `titleAccent` → `"expert instructors."` (rendered with
  `text-gradient-premium`)
- `description` → `"Learn cybersecurity through live instructor-led
  training, hands-on labs, structured certification batches, expert study
  materials and real-world practice."`
- `ctaPrimary` → `"EXPLORE TRAINING"` (navigates to `catalog`)
- `ctaSecondary` → `"VIEW UPCOMING BATCHES"` (navigates to `batches`)
- `ctaTertiary` (NEW) → `"FOR INSTITUTIONS"` (navigates to
  `institutions-schools`)

**3. Removed auth-aware hero CTA logic** — the previous
`useQuery("/api/auth/session")` call (queryKey `home-auth-session`),
the `isLoggedIn` derived flag, the `liveLearnerCount` memo, the
`SessionData` interface, and the `heroPrimaryLabel/heroSecondaryLabel/
heroPrimaryTarget/heroSecondaryTarget` variables are all gone. The hero
CTAs are now fixed to the discovery flows specified in the task brief
(catalog / batches / institutions-schools). The `liveLearnerCount` logic
was replaced by a static `"12 EXPERT INSTRUCTORS"` indicator. The
`statsData` query remains (still powers the trust-stats section).

**4. Hero CTAs block** — now renders three buttons:
- Primary (filled, premium violet): `EXPLORE TRAINING` → `catalog`
- Secondary (outline): `VIEW UPCOMING BATCHES` → `batches` (with
  Calendar icon)
- Tertiary (ghost, muted): `FOR INSTITUTIONS` → `institutions-schools`
  (with Building2 icon)

**5. Live indicators** — replaced the old `LABS ONLINE` / `CTF ACTIVE`
/ learner-count strip with the new `BATCHES OPEN` / `LIVE SESSIONS` /
`12 EXPERT INSTRUCTORS` strip. Still uses the existing `StatusDot`
cyber component for visual consistency.

**6. Five new sections inserted between Hero and Platform Intro:**

- **WHO WE TRAIN** — 4 audience cards in a 1/2/4-col responsive grid
  (Aspirants / Freshers / Working Professionals / Institutions) with
  `GraduationCap / Rocket / Briefcase / Building2` icons. Each card
  uses `card-premium rounded-xl p-5 lg:p-6`.

- **UPCOMING BATCHES** — 4 batch cards in a 1/2-col grid. Each card
  shows certification badge, batch name, schedule, start date, mode,
  instructor, seats, level, and a `VIEW BATCH` button. Difficulty
  color coding: Beginner→emerald, Intermediate→amber, Advanced→rose.
  Hover state lifts the card and adds a colored shadow. Includes a
  "See all upcoming batches" button below the grid that navigates to
  the new batches view. The CISSP card is marked `almostFull: true`
  and surfaces an amber "Almost Full" label.

- **FLEXIBLE SCHEDULES** — 6 schedule-option cards in a 2/3-col grid
  (WEEKDAY / WEEKEND / MORNING / AFTERNOON / EVENING / LATE NIGHT)
  with `CalendarDays / CalendarCheck / Sun / SunMedium / Sunset /
  Moon` icons. Each card shows an example time slot.

- **TRAINING METHODOLOGY** — 7-step timeline rendered as a horizontal
  timeline on `lg:` (with a gradient connecting line behind 7 circular
  icon nodes) and as a vertical timeline on mobile/tablet (with
  vertical line segments between nodes). Steps: 01 LIVE LECTURE
  (Video) → 02 IN-DEPTH ANALYSIS (Microscope) → 03 STUDY MATERIAL
  (FileText) → 04 HANDS-ON LAB (FlaskConical) → 05 ASSIGNMENT
  (ClipboardList) → 06 MOCK TEST (FileQuestion) → 07 EXAM PREPARATION
  (Award). Each step shows number, icon, title, and description.

- **EXPERT INSTRUCTORS** — 3 verified instructor cards in a 1/3-col
  grid. Each card shows: colored circular avatar with initials, name
  with a `BadgeCheck` icon, expertise line, experience, certifications,
  a "VERIFIED INSTRUCTOR PROFILE" footer badge, and a `VIEW INSTRUCTOR`
  outline button. Instructors: Dr. Sarah Chen (violet, 12+ yrs, CEH/
  OSCP/CISSP), Raj Patel (cyan, 8+ yrs, CCNA/CCNP/GCIA), Alex Mercer
  (amber, 15+ yrs, CISSP/CCSP/CISM).

**7. Static data arrays appended** at the end of the file (after
`FALLBACK_PARTNERS`):
- `AUDIENCES` (4 entries)
- `UPCOMING_BATCHES` (4 entries with full color coding)
- `SCHEDULES` (6 entries)
- `METHODOLOGY_STEPS` (7 entries)
- `INSTRUCTORS` (3 entries)

All existing homepage sections (Platform Intro, Cyber Range, Learning
Paths, Skill Tree, Mission Control, Gamification, Career Center,
Institutions, Certifications, Success Stories, Trust / Partners, Final
CTA) are untouched.

## Files Created

### `src/views/batches.tsx` (new — `BatchesView`)
Dedicated batches discovery page. Four sections:

1. **Hero** — Back-to-home button, "LIVE INSTRUCTOR-LED BATCHES" eyebrow,
   "Upcoming Certification Batches" headline (with "Certification
   Batches" in `text-gradient-premium`), description "Live
   instructor-led training with flexible schedules", and a live-status
   strip (BATCHES OPEN / LIVE SESSIONS / 12 EXPERT INSTRUCTORS) that
   mirrors the homepage hero.

2. **Filters** — Four filter groups in a 1/2/4-col grid:
   - Certification: native `<select>` (All / Security+ / CEH / CCNA /
     CISSP)
   - Schedule: 6 toggle pills (All / Weekday / Weekend / Morning /
     Evening / Late Night) with icons
   - Mode: 3 toggle pills (All / Live Online / On-Campus) with icons
   - Level: 4 toggle pills (All / Beginner / Intermediate / Advanced)
   
   An "X active" badge appears when any filter is set, with a "Clear
   filters" button. Filter state is managed with `useState` and the
   filtered list is memoized. Includes an empty-state card when no
   batches match.

3. **Batch Grid** — Same 4 hardcoded batches from the homepage,
   rendered as detailed cards (same visual design as the homepage
   batch cards). Each card has an "ENROLL NOW" button that navigates
   to the contact view. Shows "Showing X of Y upcoming batches" above
   the grid.

4. **CTA** — "Don't see your batch?" section with a "REQUEST A BATCH"
   button (navigates to `contact`) and a "BROWSE ALL COURSES" button
   (navigates to `catalog`). Includes a "Custom batches available
   worldwide · Online & on-campus" footnote.

The view reuses the `BATCHES` data shape from the homepage (with one
extra `scheduleType` field per batch for the schedule filter). The
data is hardcoded for now — a later task will wire it to a DB-backed
`/api/batches` endpoint.

## Wiring Summary

| Where | Change |
|-------|--------|
| `src/store/app-store.ts` | `View` union now includes `{ name: "batches" }` |
| `src/app/page.tsx` imports | `import { BatchesView } from "@/views/batches"` |
| `src/app/page.tsx` `PUBLIC_VIEWS` | `"batches"` added (between `catalog` and `course`) |
| `src/app/page.tsx` `ViewRouter` | `{view.name === "batches" && <BatchesView />}` |
| `src/views/home.tsx` hero CTAs | Primary→`catalog`, Secondary→`batches`, Tertiary→`institutions-schools` |

## Constraints Honored
- ✅ ADDITIVE — no existing homepage section was removed. The 13
  original sections are still in place; the 5 new sections are inserted
  between the Hero and the Platform Intro section.
- ✅ Hero updates follow the task spec exactly: new headline, new
  description, three CTAs with the specified targets, new live
  indicators, ParticleLogo on the right untouched.
- ✅ All 4 batches from the task brief are hardcoded with the exact
  data specified (certification, batch name, schedule, start date,
  mode, instructor, seats, level).
- ✅ The CISSP batch's "5 available (Almost Full)" is rendered as an
  amber "Almost Full" label.
- ✅ All 7 methodology steps are present in the correct order with
  the specified titles.
- ✅ All 3 instructors match the spec (Sarah Chen / Raj Patel / Alex
  Mercer) with the exact expertise, experience, and certifications.
  Each has a "VERIFIED" badge as required.
- ✅ Batches view has all 4 required filter groups (Certification,
  Schedule, Mode, Level) and the "REQUEST A BATCH" CTA navigates to
  `contact`.
- ✅ `bun run lint` = 0 errors, 0 warnings.
- ✅ Compact spacing (`py-8 lg:py-12`) used for all new sections,
  matching the existing homepage rhythm.
- ✅ Responsive — all grids collapse to 1 or 2 columns on mobile.
- ✅ Used existing shadcn/ui `Button` and `Badge` components.
- ✅ Used `motion` from `framer-motion` with 0.3–0.4s animations and
  no scroll triggers.
- ✅ Used `cn` from `@/lib/utils` for conditional class composition.
- ✅ Used `useAppStore` for navigation.
- ✅ Used lucide icons throughout.

## Lint Result
```
$ bun run lint
$ eslint .
EXIT_CODE=0
```
0 errors, 0 warnings.
