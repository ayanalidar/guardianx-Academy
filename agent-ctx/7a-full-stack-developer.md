# Task 7a — Student Views: Assignments, Messaging, Study Groups, Office Hours

**Agent:** full-stack-developer
**Date:** GuardianX Academy LMS, Task 7a

## Summary
Created 4 NEW student-facing view files (`src/views/assignments.tsx`, `messaging.tsx`, `study-groups.tsx`, `office-hours.tsx`) that consume the API routes built in tasks 6a / 6b / 6c. No existing files were modified — purely additive UI layer. Each view follows the existing holographic aesthetic (dark-first emerald/cyan/amber, `card-hover`, `bg-grid`, gradient banners, shadcn/ui primitives, Lucide icons, sonner toasts, TanStack Query).

## Files Created

### 1. `src/views/assignments.tsx` — `AssignmentsView()`
- Header with `ClipboardList` icon + subtitle.
- 4 stat cards: Pending / Submitted / Graded / Overdue (computed from `me/assignments` data: pending = `missing && !overdue`, submitted = `submitted|resubmitted|returned`, graded, overdue).
- Filter tabs: All / Pending / Submitted / Graded / Overdue (rose-tinted).
- `AssignmentCard`: course `shortName` avatar block, title, status badge (color-mapped via `statusBadge`), due-date label, points, late flag, grade display, "Due soon" badge; "Open" and (conditional) "Peer Review" buttons.
- `AssignmentDialog`: fetches `GET /api/assignments/[id]` for full instructions; renders description, scrollable instructions box, rules grid (submission type / late policy / peer review), and a submission form (content textarea + fileUrl input) posting to `POST /api/assignments/[id]/submit`; on success invalidates `["me","assignments"]` + toast.
- `PeerReviewDialog`: fetches `GET /api/assignments/[id]/peer-reviews`; handles `needsOwnSubmission` empty state; lists `toReview` submissions as expandable cards (avatar + content preview + file link); review form has 1–5 star rating (hover preview + fill) + feedback textarea; posts to `POST /api/submissions/[id]/peer-review`; shows completed reviews with star badges; progress chip "X / target".
- Loading skeletons + empty state with "Browse Courses" CTA.

### 2. `src/views/messaging.tsx` — `MessagingView()`
- Two-pane layout (`md:grid-cols-[320px_1fr]`); on mobile, shows list OR conversation with a back chevron toggle.
- Left pane: `MessageSquare` header + "New Message" button; `Search` input filters by name or last-message content; thread list with avatar, name (bolded when unread), last-message preview (prefixed "You: " when sent by me), time-ago, red unread count badge.
- `NewMessageDialog`: fetches `/api/messages/contacts`, renders selectable recipient list (avatar + name + title + role badge), message textarea; posts to `/api/messages/threads`; on success opens the new thread.
- `ConversationPane`: header with back button + other user's avatar/name/title/role; messages grouped by day ("Today"/"Yesterday"/weekday); bubbles right-aligned emerald (mine) / left-aligned muted (received); auto-scrolls to bottom; `refetchInterval: 10000` for live updates.
- Composer: textarea (Enter sends, Shift+Enter newline) + Send button; posts to `/api/messages/threads/[id]/messages`.
- Mark-as-read: `openThread` fires `POST /api/messages/threads/[id]/read` then invalidates `["message-threads"]`.
- Empty state ("Select a conversation"), loading skeletons.
- Query keys: `["message-threads"]`, `["thread", threadId]`, `["message-contacts"]`.

### 3. `src/views/study-groups.tsx` — `StudyGroupsView()`
- Header with `Users` icon + subtitle; two tabs: Discover / My Groups.
- Discover tab: search input + "Create Group" button; responsive grid (`sm:grid-cols-2 lg:grid-cols-3`) of `GroupCard`s.
- `GroupCard`: title, private (`Lock`) / public (`Globe`) icon, course badge, description (line-clamped), tags (capped at 4 + "+N"), capacity bar (`Progress`), creator avatar + name + time-ago, and contextual Open/Join actions ("Joined" if member, "Full" if at capacity, "Join with Code" if private, "Join" otherwise).
- `CreateGroupDialog`: title, description, optional `<select>` linked-course (loaded from `/api/courses?enrolled=true`), maxMembers, meetingLink, tags (comma → array), `Switch` for `isPrivate` (reveals joinCode input when on); posts to `/api/study-groups`.
- `JoinCodeDialog`: monospace uppercase centered code input; posts to `/api/study-groups/[id]/join` with `{ joinCode }`.
- `GroupDetailDialog`: fetches `/api/study-groups/[id]` (with members); shows description, meeting link, tags, full member list with crown-badge owner.
- My Groups tab: list of joined groups with Owner (`Crown` amber) / Member (`UserIcon` emerald) role badge, member count, meeting-link indicator, time-ago, "Open" button.
- Empty states + skeletons for both tabs.
- Query keys: `["study-groups"]`, `["my-study-groups"]`, `["study-group", id]`.

### 4. `src/views/office-hours.tsx` — `OfficeHoursView()`
- Header with `CalendarClock` icon + subtitle; two tabs: Available Slots / My Bookings.
- Available Slots: responsive grid of `SlotCard`s — instructor avatar + name + title, course badge, date (weekday + month + day), time range with duration in parens, mode badge (Video/In-Person/Chat color-coded via `modeColor` helper + `ModeIcon` component), location badge, capacity bar, and contextual action: "Booked" (emerald check, when `myBooking`), "Session ended" (past), "Fully booked" (full), or "Book Slot".
- `BookSlotDialog`: summary card (mode/date/time/location), topic input (max 200), notes textarea (max 2000); posts to `/api/office-hours/[id]/book`; on success invalidates both relevant queries + toast.
- My Bookings: list of `BookingCard`s — instructor info, date/time, mode badge, course badge, status badge (Confirmed/Completed/Cancelled), topic, clamped notes, location, and a "Cancel" button that toasts "Contact instructor to cancel" (no cancel endpoint per spec).
- Empty states + skeletons; 30s `refetchInterval` on both queries.
- Refactored `modeIcon` helper into a proper `ModeIcon` React component to satisfy ESLint's `react-hooks/static-components` rule.

## Key Implementation Decisions
- **API contract fidelity:** Inspected every backend route file from tasks 6a/6b/6c to map exact response shapes (e.g., `me/assignments` returns `assignments[]` + `stats`; `peer-reviews` returns `toReview`/`completed`/`progress`/optional `needsOwnSubmission`; messaging threads include `unreadCount` and `lastMessage.isMine`). All views consume these shapes without modification.
- **Status bucketing:** For assignments, "Pending" = `status === 'missing' && !overdue` (i.e., not-yet-submitted and still has time). This avoids double-counting with the "Overdue" bucket (which is `overdue === true`).
- **Polling:** Messages refetch every 10s (both thread list + active thread); office-hours refetch every 30s. Both chosen to keep capacity/unread counts fresh without hammering the DB.
- **Mark-as-read:** Triggered client-side in `openThread` rather than relying solely on the GET-thread side effect, so the unread badge clears immediately even when navigating back without re-fetching the thread.
- **Component creation during render:** ESLint's `react-hooks/static-components` flagged the original `const Icon = modeIcon(slot.mode)` pattern in `office-hours.tsx`. Fixed by extracting a proper `ModeIcon` React component (`<ModeIcon mode="video" className="…" />`) instead of returning a component reference from a helper.
- **No router/nav wiring:** Per task instructions, did NOT add these views to the Zustand `View` union, app-shell nav, or `page.tsx`. Parent orchestrator will handle that.
- **Holographic style match:** Read `certificates.tsx`, `community.tsx`, `my-learning.tsx`, `instructor-dashboard.tsx` to mirror the look — `card-hover` lift on hover, `bg-grid` overlays on stat cards, gradient banners (`from-emerald-500/40 via-cyan-500/30 to-transparent`), emerald/cyan/amber accent badges, monospace font for IDs/codes, `Avatar`/`AvatarFallback` with `bg-emerald-500/10 text-emerald-400` fallbacks.

## Verification
- `bun run lint` → **0 errors, 0 warnings** (after the `ModeIcon` refactor).
- Dev log (`tail -n 30 /home/z/my-project/dev.log`) → no errors; existing endpoints continue returning 200.
- All 4 files start with `"use client"` and `export function XxxView()` per the spec.
- TypeScript strict-compatible: typed `interface`s for every API response, no `any` leaks in public signatures, proper discriminated-union handling for `SubmissionStatus` and `SlotMode`.
- All views handle loading (skeletons), empty (illustrated states with CTAs), and error (toast) states.

## Files NOT Modified (per task constraint)
- No existing files were changed. The 4 new view files are purely additive and ready to be wired into the SPA router + nav by the parent orchestrator.
