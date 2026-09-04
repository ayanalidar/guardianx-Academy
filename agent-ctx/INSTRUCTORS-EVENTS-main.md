# INSTRUCTORS-EVENTS — Work Record

**Task ID:** INSTRUCTORS-EVENTS
**Agent:** INSTRUCTORS-EVENTS (Z.ai Code subagent)
**Task:** Two new public-facing features — (1) public /instructors page + detail pages (master-prompt §25), (2) Event model + /events listing + detail pages (master-prompt §36).

---

## Summary

| Aspect | Status |
| --- | --- |
| **Feature 1** — public instructors listing + detail | ✅ Complete, browser-verified |
| **Feature 2** — Event model + public events listing + detail | ✅ Complete, browser-verified |
| **Lint** | `bun run lint` → 0 errors (1 pre-existing warning in `src/lib/db.ts`) |
| **DB** | Neon PostgreSQL — Event model synced via `bun run db:push`. 5 events + 2 instructor profiles seeded. |
| **Browser verification** | 4/4 routes verified end-to-end with agent-browser + screenshots saved |

---

## Files Created

| File | Lines | Purpose |
| --- | --- | --- |
| `src/app/api/instructors/route.ts` | 100 | Public `GET /api/instructors` — returns all INSTRUCTOR users with InstructorProfile + course + batch + learner counts |
| `src/app/api/instructors/[id]/route.ts` | 117 | Public `GET /api/instructors/[id]` — single instructor full profile + assigned courses + assigned batches |
| `src/views/instructors.tsx` | 285 | Public instructors listing — hero "Learn from people who have done the work.", grid of cards, mini stats strip, apply-to-instruct CTA |
| `src/views/instructor-detail.tsx` | 360 | Public instructor detail — sticky avatar card + bio + stats + expertise + certifications + assigned courses + assigned batches + book-a-session CTA |
| `src/views/event-detail.tsx` | 313 | Public event detail — hero + facts grid + long description + sticky register CTA + related events |
| `prisma/seed-events.ts` | 200 | Idempotent upsert-by-slug seed for 5 sample events (workshop, webinar, ctf, campus, bootcamp) |
| `prisma/seed-instructor-profiles.ts` | 110 | Backfill InstructorProfile rows for the 2 existing INSTRUCTOR users + link TrainingBatch rows by `instructor` name → `instructorId` |
| `/home/z/my-project/verify-instructors-events.sh` | 170 | Single-bash verification script (dev server + curl APIs + agent-browser snapshots + screenshots) |
| `/home/z/my-project/agent-ctx/INSTRUCTORS-EVENTS-main.md` | (this file) | Work record |

## Files Modified

| File | Change |
| --- | --- |
| `prisma/schema.prisma` | Appended `model Event` (slug, title, type, dates, time, venue, mode, organizer, instructor, capacity, registered, fee, status, tags, featured, order, published). |
| `src/app/api/events/route.ts` | Rewrote to return `{ events, count }` and accept `?type=` filter, ordered by `order` then `startIsoDate`. |
| `src/app/api/events/[slug]/route.ts` | Rewrote to return `{ event, related }` with 3 related same-type events. |
| `src/store/app-store.ts` | Added 4 view types to the `View` union: `instructors`, `instructor-detail` (with `instructorId`), `events`, `event-detail` (with `eventSlug`). |
| `src/lib/url-router.ts` | Added `instructors`/`events` to `knownViews`; `viewToHash` serializes `/instructor/<id>` and `/event/<slug>`; `hashToView` parses them back. Documented the new hash formats. |
| `src/app/page.tsx` | Imported 4 new views; added all 4 to `PUBLIC_VIEWS`; added 4 branches to `ViewRouter`. |
| `src/views/events.tsx` | Full rewrite — premium dark-tech hero "Cybersecurity Events & Workshops", 6 filter pills (All/Workshops/Webinars/CTFs/Campus Programs/Bootcamps) with live counts, 3-up grid of event cards with type-colored badge / title / description / date+time / venue / capacity / fee / View Event CTA, stats strip (upcoming / registered / free). |
| `src/components/platform/public-footer.tsx` | COMPANY column "Instructors" → `instructors` (was `support`). RESOURCES column Events/Workshops/Webinars → `events` (was `support`). Help stays `support`. |
| `src/components/platform/public-header.tsx` | Added `Users` to lucide imports. Added 2 items to the `ABOUT` mega-menu group: "Instructors" (→ `instructors`) + "Events" (→ `events`). |

---

## Schema change (Event model)

Appended to `prisma/schema.prisma`:

```prisma
model Event {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  description     String   @default("")
  longDescription String   @default("")
  type            String   @default("workshop")  // workshop | webinar | ctf | campus | awareness | corporate | bootcamp
  category        String   @default("General")
  startDate       String   @default("")          // display string e.g. "October 15, 2026"
  startIsoDate    String?                         // ISO date for sorting
  endDate         String   @default("")
  time            String   @default("")
  venue           String   @default("Online")
  mode            String   @default("Live Online")
  organizer       String   @default("GuardianX")
  instructor      String?
  capacity        Int      @default(100)
  registered      Int      @default(0)
  fee             String   @default("Free")
  status          String   @default("Open")
  imageUrl        String?
  tags            String   @default("")
  featured        Boolean  @default(false)
  order           Int      @default(0)
  published       Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

`bun run db:push` synced the table to Neon (Prisma Client regenerated in 639 ms).

## Seed result

`bunx tsx prisma/seed-events.ts`:
```
[seed-events] Upserting 5 events...
  ✓ workshop | Web Application Penetration Testing Workshop
  ✓ webinar  | Career Paths in Cybersecurity 2026
  ✓ ctf      | GuardianX CTF Championship 2026
  ✓ campus   | School Cyber Awareness Program
  ✓ bootcamp | Ethical Hacking Bootcamp
[seed-events] Done. Total Event rows: 5
```

`bunx tsx prisma/seed-instructor-profiles.ts`:
```
  + created Dr. Sarah Chen (cmtg4f6u90001mko81lwh8vhb)
  + created Raj Patel (cmtg4f71v0002mko844gqkl44)
[seed-instructor-profiles] Done. 0 created, 2 updated.
[seed-instructor-profiles] Linking TrainingBatch rows by instructor name...
  ~ linked 1 batch(es) → Dr. Sarah Chen
  ~ linked 1 batch(es) → Raj Patel
[seed-instructor-profiles] Done. 2 batch(es) linked.
```

(Both seed scripts are idempotent — upsert-by-slug / upsert-by-userId.)

---

## API routes

### `GET /api/instructors` (public)
Returns `{ instructors: [...], count: N }`. Each instructor row:
- `id, name, avatar, title, bio, createdAt`
- `expertise: string[]`, `yearsExperience: number`, `certifications: string[]`, `linkedinUrl: string|null`, `maxBatches: number`
- `coursesCount, batchesCount, learnersCount`
- `courses: [{ id, title, slug, level, durationHours, category }]` (published only)

Implementation: queries `User.findMany({ where: { role: "INSTRUCTOR" }, include: { instructorProfile, taughtCourses, _count: { taughtCourses } } })` + parallel `groupBy` on `TrainingBatch.instructorId` and `Enrollment.courseId` (via the course's `instructorId`).

### `GET /api/instructors/[id]` (public)
Returns `{ instructor: {...} | null }` (404 with `{ instructor: null }` when not found).
- Full profile (same fields as listing + `email, phone`).
- `stats: { coursesCount, batchesCount, learnersCount, yearsExperience }`.
- `courses: [{ ..., enrolledCount }]` (published only, with per-course enrollment counts).
- `batches: [{ id, name, certification, schedule, startDate, mode, seats, enrolled, status, level }]`.

### `GET /api/events` (public)
Returns `{ events, count }`. Ordered by `order` asc then `startIsoDate` asc. Supports `?type=workshop|webinar|ctf|campus|bootcamp|awareness|corporate` filter (empty / `all` returns everything). All events returned are `published: true`.

### `GET /api/events/[slug]` (public)
Returns `{ event, related }` (404 with `{ event: null, related: [] }` when not found / unpublished). `related` is up to 3 same-type events (excluding the current slug).

---

## Views

### `src/views/instructors.tsx` — `InstructorsView`
- Hero: `GUARDIANX INSTRUCTORS` badge, heading "Learn from people who have done the work." (with `text-gradient-premium` accent), subtitle.
- Mini stats strip: # instructors, # courses taught, # active batches, # learners reached.
- Grid (sm:2, lg:3) of instructor cards — `card-premium` styling, hover lift, accent rotation across 5 colors (violet/cyan/amber/emerald/rose).
- Each card: avatar (image or initials in accent ring), name, title, LinkedIn icon-link, expertise tags (top 4), bio (line-clamp-3), 3-up mini-stats row (Years/Courses/Learners), certification list (mono), "View Profile" outline button → `#/instructor/<id>`.
- Loading skeleton (6 pulsing placeholders), error card (rose), empty state ("No instructors published yet" + Contact button), "Apply to instruct" CTA card at bottom.
- Fetched via `useQuery({ queryKey: ["public-instructors"], staleTime: 60_000 })`.

### `src/views/instructor-detail.tsx` — `InstructorDetailView`
- Back nav ("All instructors" ghost button).
- 3-col hero: left sticky avatar card (image / 28×28 initials, name, title, LinkedIn link, email, "Book a session" + "Contact" buttons) + right bio + 4-up stats strip + expertise + certifications.
- "Assigned courses" section — `card-premium` cards (sm:2, lg:3) with course title (clickable → `#/course/<id>`), level badge, duration, enrolled count, category footer.
- "Assigned batches" section — `card-premium` cards with certification, name, status badge (color-coded Open / Almost Full / Full / Completed), start date, schedule, mode, enrollment count.
- Empty assigned state ("not currently teaching any public courses or batches") for instructors with neither.
- CTA "Work directly with {first name}." → Book a session.
- Loading / error / not-found states.

### `src/views/events.tsx` — `EventsView` (rewritten premium)
- Hero: `GUARDIANX EVENTS` badge, heading "Cybersecurity Events & Workshops." with `text-gradient-premium` accent.
- Mini stats: # upcoming, # registered (sum), # free events.
- Filter pills: All / Workshops / Webinars / CTFs / Campus Programs / Bootcamps — each shows the live count from the dataset (filter by `type` field client-side after a single `GET /api/events` fetch).
- Grid of event cards: type icon (color-coded by type), FEATURED tag if applicable, type badge, title (line-clamp-2), description (line-clamp-2), date+time, venue (MapPin/Video icon), registered/capacity, fee (emerald for Free, amber for paid), "View Event" link → `#/event/<slug>`.
- Type → accent mapping: workshop→violet, webinar→cyan, ctf→rose, campus/awareness→emerald, corporate/bootcamp→amber.
- Loading / error / empty states per filter.

### `src/views/event-detail.tsx` — `EventDetailView`
- Back nav ("All events" ghost button).
- 3-col hero: left card with type badge + FEATURED + status (Open/Full/Completed/Cancelled), title, description, 2-col facts grid (Date, Ends, Time, Mode, Organizer, Instructor, Capacity, Fee). Right card is a sticky "REGISTER" panel with fee display, registration count + date + venue, "Register Now" button (disabled when not Open), "Ask a question" outline button, footnote about contact-team registration flow.
- "ABOUT THIS EVENT" card with long description (whitespace-pre-line) + tags split by `|`.
- "Related" section with up to 3 same-type events (smaller card layout) — clicking navigates + scrolls to top.
- Loading / error / not-found states.

---

## Lint result

```
$ bun run lint
$ eslint .

/home/z/my-project/src/lib/db.ts
  25:5  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')

✖ 1 problem (0 errors, 1 warning)
```

The single warning is pre-existing and unrelated to this task (a stale `eslint-disable` in `src/lib/db.ts`). No new warnings or errors introduced by the 9 new/modified files in this task.

---

## Browser verification

Single-bash verification script: clean tool-results temp files → start dev server (Neon DATABASE_URL exported inline) → curl all 4 API routes → agent-browser open + snapshot + read + screenshot for each of the 4 hash routes → close browser + kill dev server.

### API verification (curl)
```
GET /api/instructors                     → HTTP 200, count: 2
  - Raj Patel       | years=8  | courses=2 | batches=1 | learners=1  | expertise=['Network Security','Defensive Security','Cloud Security'] | certs=['CCNA','CCNP Security','GCIA']
  - Dr. Sarah Chen  | years=12 | courses=27 | batches=1 | learners=2  | expertise=['Offensive Security','Web Security','Penetration Testing'] | certs=['CEH','OSCP','CISSP']

GET /api/instructors/cmtg4f71v0002mko844gqkl44  → HTTP 200
  name: Raj Patel
  title: Network & Cloud Security Engineer, CCIE #56789
  stats: courses=2 batches=1 learners=1 years=8
  courses assigned: 2 (Cisco Certified Network Associate, CCNP Enterprise — Advanced Routing & Switching)
  batches assigned: 1 (CCNA | CCNA Morning Batch | November 03 | Live Online)

GET /api/events                          → HTTP 200, count: 5
  - workshop | Web Application Penetration Testing Workshop | October 15, 2026 | Free
  - webinar  | Career Paths in Cybersecurity 2026           | October 20, 2026 | Free
  - ctf      | GuardianX CTF Championship 2026              | November 5, 2026  | ₹500
  - campus   | School Cyber Awareness Program               | November 10, 2026 | Free
  - bootcamp | Ethical Hacking Bootcamp                     | November 15, 2026 | ₹2000

GET /api/events/web-application-pentesting-workshop-2026  → HTTP 200
  title: Web Application Penetration Testing Workshop
  type: workshop | startDate: October 15, 2026 | fee: Free | venue: Online (Zoom + GuardianX Labs)
  longDescription length: 530
  related events: 0  (no other workshop-type events seeded)
```

### Hash-route verification (agent-browser)
**`#/instructors`** — snapshot showed:
- `heading "Learn from people who have done the work." [level=1]`
- `heading "Raj Patel" [level=3]` + `link "Raj Patel on LinkedIn"` + `button "View Profile"`
- `heading "Dr. Sarah Chen" [level=3]` + `link "Dr. Sarah Chen on LinkedIn"` + `button "View Profile"`
- `heading "Want to teach with us?"` + `button "Apply to instruct"`
- Stat chips text: "2 Instructors · 29 Courses taught · 2 Active batches · 3 Learners reached"

**`#/instructor/cmtg4f71v0002mko844gqkl44`** — snapshot showed:
- `button "All instructors"` back nav
- `heading "Raj Patel" [level=1]` + `link "LinkedIn profile"` + `button "Book a session"` + `button "Contact"`
- `heading "Assigned courses" [level=2]` → 2 course cards (`Beginner Cisco Certified Network Associate 35h 1 NETWORKING`, `Advanced CCNP Enterprise — Advanced Routing & Switching 60h 0 NETWORKING`)
- `heading "Assigned batches" [level=2]` → `heading "CCNA" [level=3]`
- `heading "Work directly with Raj."` + `button "Book a session"` CTA
- Read text confirmed: avatar "RP", title "Network & Cloud Security Engineer, CCIE #56789", LinkedIn + email, "ABOUT" bio card, "8+ Years experience" stat

**`#/events`** — snapshot showed:
- `heading "Cybersecurity Events & Workshops." [level=1]`
- 6 filter pills: `button "All 5"`, `"Workshops 1"`, `"Webinars 1"`, `"CTFs 1"`, `"Campus Programs 1"`, `"Bootcamps 1"`
- 5 event cards as buttons (with FEATURED tag on 4 of them, type-colored badges for workshop/webinar/ctf/bootcamp, the 5th campus program card has no FEATURED tag):
  - `Web Application Penetration Testing Workshop` (FEATURED WORKSHOP, Free, 42/100)
  - `Career Paths in Cybersecurity 2026` (FEATURED WEBINAR, Free, 184/500)
  - `GuardianX CTF Championship 2026` (FEATURED CTF, ₹500, 312/1000)
  - `School Cyber Awareness Program` (CAMPUS, Free, 60/200)
  - `Ethical Hacking Bootcamp` (FEATURED BOOTCAMP, ₹2000, 28/50)
- Stat chips text: "5 Upcoming · 626 Registered · 3 Free events"

**`#/event/web-application-pentesting-workshop-2026`** — snapshot showed:
- `button "All events"` back nav
- `heading "Web Application Penetration Testing Workshop" [level=1]`
- `button "Register Now"` (active) + `button "Ask a question"`
- Read text confirmed: "workshop FEATURED Open" status badges, full description, "Date October 15, 2026", "Ends October 16, 2026", "Time 7:00 PM - 9:00 PM IST", "Mode Live Online · Online (Zoom + GuardianX Labs)"

### Screenshots saved
- `/home/z/my-project/agent-ctx/instructors-list.png` (372 KB)
- `/home/z/my-project/agent-ctx/instructor-detail.png` (199 KB)
- `/home/z/my-project/agent-ctx/events-list.png` (379 KB)
- `/home/z/my-project/agent-ctx/event-detail.png` (199 KB)

---

## Issues encountered

1. **Shell `DATABASE_URL` overriding `.env`** — same issue hit by the FOOTER-VERIFY-FIX agent. `bun run db:push` failed with "the URL must start with the protocol `postgresql://`" because the shell exports `DATABASE_URL=file:/home/z/my-project/db/custom.db`. `.env` has the correct Neon URL but the shell value wins. Fixed by exporting the Neon URL in the same command that runs `db:push` / seed scripts / `next dev`. The `dev.sh` already does this for normal dev runs.

2. **Missing `Users` import in public-header** — I added a "Instructors" mega-menu item using the `Users` icon, but `Users` wasn't in the existing lucide import list. The dev server returned HTTP 500 with `ReferenceError: Users is not defined`. Fixed by adding `Users` to the import block in `src/components/platform/public-header.tsx`. Lint passed both before and after the fix (the reference error only shows at runtime — `eslint .` doesn't catch missing imports for module-scoped identifiers).

3. **Pre-existing 2 instructors had no `InstructorProfile` rows** — the 2 INSTRUCTOR users in the DB (`Dr. Sarah Chen`, `Raj Patel`) had `instructorProfile: null`. Without profiles, the public `/instructors` page would render cards with `yearsExperience: 0`, no expertise, no certifications — making the listing look empty even though the users exist. Created `prisma/seed-instructor-profiles.ts` to backfill the 2 profiles (12 / 8 years experience, real certs, LinkedIn URLs). Also linked the seeded `TrainingBatch` rows (whose `instructor` text matches "Dr. Sarah Chen" / "Raj Patel") to their `instructorId` so the instructor-detail "Assigned batches" section has real data.

4. **The existing `/api/events` and `/api/events/[slug]` route stubs were partial** — the routes already existed and returned `{ events }` / `{ event }`, but they (a) didn't support `?type=` filtering, (b) didn't return `count`, (c) didn't include related events, and (d) used `orderBy: { startDate: "asc" }` on a string column (would sort lexicographically on display strings like "October 15, 2026" which is fine for October but breaks for "September 5, 2026" vs "October 5, 2025"). Rewrote both to the spec: order by `order` then `startIsoDate`, return `{ events, count }` / `{ event, related }`, support `?type=`.

5. **agent-browser screenshot timing** — initial `ls -lh` of the screenshots right after the verify script returned showed only 3 of 4 PNGs because the instructor-detail screenshot write completed a moment later than the script's bash exit. Re-listing ~1 s later confirmed all 4 PNGs saved (199 KB / 199 KB / 372 KB / 379 KB).

---

## Stage Summary

- **Feature 1 COMPLETE:** Public `/instructors` listing (`#/instructors`) renders all INSTRUCTOR users with their InstructorProfile (expertise, yearsExperience, certifications, linkedinUrl) + computed course/batch/learner counts. Each card has a "View Profile" button that navigates to `#/instructor/<id>`, which renders the instructor's full bio, stats strip, expertise, certifications, assigned courses (clickable → `#/course/<id>`), assigned batches, and a "Book a session" / "Contact" CTA. Backfilled 2 InstructorProfile rows + linked 2 TrainingBatch rows so the detail page actually has data to show. Verified in browser: 2 instructor cards render with names, titles, LinkedIn links, expertise tags, certifications, and "View Profile" buttons. Instructor detail page (Raj Patel) shows bio, 8+ years experience stat, 2 assigned courses, 1 assigned batch (CCNA), and CTAs.

- **Feature 2 COMPLETE:** Added the `Event` model to `prisma/schema.prisma`, synced to Neon via `bun run db:push`, seeded 5 events (workshop + webinar + ctf + campus + bootcamp) via `prisma/seed-events.ts` (idempotent upsert-by-slug). Public `/events` listing (`#/events`) renders all published events with 6 filter pills (All / Workshops / Webinars / CTFs / Campus Programs / Bootcamps) showing live counts. Each event card has type-colored badge, title, description, date+time, venue, capacity, fee, and "View Event" button → `#/event/<slug>`. Detail page renders the hero with type/featured/status badges, title, description, 2-col facts grid (Date, Ends, Time, Mode, Organizer, Instructor, Capacity, Fee), long description card, tags, sticky Register Now CTA, and related events section (3 same-type events). Verified in browser: 5 event cards render with correct types, fees, dates, capacities; workshop detail page shows all facts + Register Now button.

- **Routing wired:** 4 new view types added to `app-store.ts`, 2 new hash formats (`#/instructor/<id>`, `#/event/<slug>`) added to `url-router.ts` (both `viewToHash` serializer + `hashToView` parser), 4 imports + 4 `ViewRouter` branches added to `page.tsx`, all 4 added to `PUBLIC_VIEWS` (no-login access). Header mega-menu "About" group gained "Instructors" + "Events" items. Footer COMPANY column "Instructors" → `instructors`, RESOURCES column Events/Workshops/Webinars → `events`.

- **Lint:** 0 errors (1 pre-existing unrelated warning in `src/lib/db.ts`). No new warnings introduced.

- **Browser-verified end-to-end:** All 4 API routes returned 200 with the expected payload shape (`/api/instructors` → 2 instructors; `/api/instructors/<id>` → Raj Patel with 2 courses + 1 batch; `/api/events` → 5 events; `/api/events/<slug>` → workshop detail). All 4 hash routes rendered with the expected content via agent-browser snapshots + read: instructors listing shows 2 cards with full profile data, instructor detail shows assigned courses + batches, events listing shows all 5 cards with filter pills, event detail shows hero + facts + Register CTA. 4 screenshots saved to `agent-ctx/`.
