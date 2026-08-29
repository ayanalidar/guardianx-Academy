# Task 7b — Instructor Dashboard Tab Components

**Agent:** full-stack-developer
**Task:** Build 6 NEW instructor tab component files in `src/components/instructor/`
**Date:** 2025

## Scope

Six new client components consumed by the parent instructor dashboard (not wired in this task — parent task will do that). All files live under `src/components/instructor/`.

## Files Created (all NEW)

1. **`assignments-tab.tsx`** — `InstructorAssignmentsTab`
   - Two-column layout: left = course `<Select>` of instructor's courses (from `GET /api/instructor/courses`), right = assignments list.
   - "Create Assignment" button → `AssignmentFormDialog` with all required fields: title, description, instructions (textarea), pointsPossible, dueDate (datetime-local), submissionType (select: text/file/url), allowLate (Switch), latePenalty (number), enablePeerReview (Switch + peerReviewCount + peerReviewDueDate), rubricId (select from `GET /api/instructor/rubrics`), moduleId (select optional — loaded via public `GET /api/courses/[id]` which returns modules).
   - "Rubrics" button → `RubricsManagerDialog` listing rubrics with create/edit/delete. Rubric form supports dynamic criteria list (add/remove rows with label/description/points).
   - Assignment cards show title, due date (overdue in rose), points, submission count badge, peer-review + rubric badges, late policy badge. Click "Open" → `AssignmentDetailDialog` with two sub-tabs:
     - **Submissions** tab: stats cards (total/pending/graded/avg), filter chips, expandable submission rows (avatar, name, late badge, status, grade), inline grading button → `GradingDialog` with rubric score sliders (when rubric exists) + manual grade fallback + feedback textarea → posts to `POST /api/instructor/submissions/[id]/grade` with `{ grade, feedback, rubricScores }`.
     - **Edit** tab: reuses `AssignmentFormDialog` in edit mode → `PATCH /api/instructor/assignments/[id]`.
   - Delete button with `AlertDialog` confirm → `DELETE /api/instructor/assignments/[id]`.
   - Loading skeletons + empty states everywhere.
   - Query keys: `["instructor","courses","list"]`, `["instructor","assignments",courseId]`, `["instructor","submissions",assignmentId]`, `["instructor","rubrics"]`, `["instructor","rubric",rubricId]`.

2. **`office-hours-tab.tsx`** — `InstructorOfficeHoursTab`
   - Header with "Create Slot" button.
   - 3 stat cards: Total Slots, Upcoming, Total Bookings.
   - `CreateSlotDialog`: startAt/endAt (datetime-local), mode (select: video/in-person/chat), location (input), maxBookings (number), courseId (optional select). Posts to `POST /api/instructor/office-hours`.
   - Slot cards: date/time formatted, mode badge (icon + colored), location (monospace), capacity `Progress` bar (booked/maxBookings), "X bookings" expandable list with student avatar + name + topic + notes, Delete button → `DELETE /api/instructor/office-hours/[id]` (with confirm dialog showing how many bookings will be cancelled).
   - Past slots dimmed (opacity-70).
   - 30s polling `refetchInterval` to keep capacity fresh.
   - Query keys: `["instructor","office-hours"]`.

3. **`messaging-tab.tsx`** — `InstructorMessagingTab`
   - Two-pane layout (320px thread list + flexible conversation). On mobile, shows one pane at a time with a back chevron.
   - Left pane: header with unread badge, search input (filters by name or last message), thread list (avatar, name, last-message preview prefixed "You:" when sent by me, time-ago, red unread count badge).
   - `NewMessageDialog`: fetches `/api/messages/contacts` (role-aware — instructors see their enrolled students), renders a searchable recipient picker with avatar + name + title + role badge; click-to-select highlighted; posts to `POST /api/messages/threads` with `{ recipientId, content }`; on success opens the new thread.
   - Right pane: conversation header with avatar/name/title/role badge; messages grouped by day ("Today"/"Yesterday"/weekday); bubbles right-aligned emerald for mine, left-aligned card for received; auto-scroll to bottom on new messages; composer textarea (Enter sends, Shift+Enter for newline) + Send button → `POST /api/messages/threads/[id]/messages`.
   - Mark-as-read on thread open: `POST /api/messages/threads/[id]/read` then invalidate threads list.
   - 10s polling on both thread list and active conversation.
   - Query keys: `["instructor","message-threads"]`, `["instructor","message-thread",threadId]`, `["instructor","message-contacts"]`.

4. **`attendance-tab.tsx`** — `InstructorAttendanceTab`
   - Course picker + date picker (input type=date, defaults to today) + sessionType select (live/in-person/exam).
   - **Mark Attendance** section: roster of enrolled students (avatar + name + email), each with 4 status toggle buttons (Present/Late/Absent/Excused, color-coded). "Quick set" row lets you mark all students as a single status. "Save Attendance" button → `POST /api/instructor/courses/[id]/attendance/bulk` with `{ date, sessionType, records: [...] }`. Shows marked count + unsaved-changes indicator.
   - **Stats** (computed client-side): Attendance Rate %, Total Sessions, Most Common Status.
   - **Recent Sessions** list: each session card shows date, session type badge, and per-status counts as colored badges (Present/Late/Absent/Excused).
   - **Per-Student Breakdown** matrix table: students as rows, last 8 sessions as columns, cells colored by status with icon. Sticky first column for student name.
   - Query keys: `["instructor","attendance",courseId,date,sessionType]`, `["instructor","attendance-history",courseId]`.

5. **`bulk-import-tab.tsx`** — `InstructorBulkImportTab`
   - Course picker + "Template CSV" download button (generates blob client-side with sample data).
   - Two mode tabs:
     - **Paste CSV** mode: Textarea with `name,email,title` placeholder + "Insert sample" button. "Preview" button calls `POST /api/instructor/bulk-import/preview` with `{ csv }`.
     - **Manual Entry** mode: dynamic list of `{name, email, title}` rows with add/remove buttons. "Preview" validates client-side (name length + email regex).
   - **Preview Table**: shows #, name, email, title, valid/invalid badge with error reason.
   - **Import** action card (amber warning) + confirm `AlertDialog` → `POST /api/instructor/bulk-import` with either `{ courseId, csv }` or `{ courseId, students: [...] }`.
   - **Import Results** view: 3 stat cards (Created/Enrolled/Skipped), security warning card (temp passwords should be shared securely) with "Copy All" button, results table with email + status badge + temp password (with per-row copy button showing check icon when copied).
   - Query keys: `["instructor","courses","list"]`.

6. **`certificate-templates-tab.tsx`** — `InstructorCertificateTemplatesTab`
   - Fetches all templates from `GET /api/certificate-templates`.
   - "Create Template" button → `TemplateFormDialog` with all fields: name, description, primaryColor + accentColor (`<input type="color">` + hex Input), fontFamily (select: serif/sans/mono), borderStyle (select: classic/modern/minimal/holographic), sealStyle (select: emerald/gold/cyan/holographic — each rendered with a colored swatch), backgroundPattern (select: grid/particles/none/circuit), signatureText, logoUrl, isDefault (Switch).
   - **Live Preview**: `CertificatePreview` component renders a mini certificate (banner gradient from primary→accent, border style applied, seal in bottom-right, signature text in bottom-left, pattern overlay). Updates in real-time as the form changes. Also used as a compact banner on each template card.
   - Template cards: live preview banner + name + Default badge + description + color swatches (primary + accent with hex values) + style badges (border/seal/font/pattern) + certificate count + Edit/Delete buttons.
   - Delete with `AlertDialog` confirm; disabled if template has certificates referencing it (shows count in description).
   - Posts to `POST /api/certificate-templates` or `PATCH /api/certificate-templates/[id]`.
   - Query keys: `["certificate-templates"]`.

## Cross-Cutting Notes

- All 6 files start with `"use client"` and `export function InstructorXxxTab()`.
- All use TanStack Query (`useQuery`/`useMutation`/`useQueryClient`) with proper invalidation after mutations + error toasts via `sonner`.
- All use shadcn/ui primitives (`Card`, `Button`, `Badge`, `Input`, `Textarea`, `Label`, `Avatar`, `Dialog`, `AlertDialog`, `Tabs`, `Skeleton`, `Progress`, `Switch`, `Select`, `Table`, `ScrollArea` where appropriate) + `lucide-react` icons + `cn` util + `api` helper from `@/lib/api`.
- Mobile-first responsive (`sm:`, `md:`, `lg:` breakpoints); semantic HTML (`header`, `section`).
- Holographic styling: `card-hover`, `bg-grid`, `holo-border`, gradient banners, emerald/cyan/amber/rose accents, `bg-card/50 backdrop-blur`, monospace font for IDs/hex codes.
- datetime-local inputs convert to ISO via `new Date(value).toISOString()` on submit; existing dates converted back via a `toLocalDateTimeInputValue` helper for prefill.
- No existing files modified. No new routes created. Parent dashboard will wire these tabs in.
- ESLint passes cleanly (0 errors, 0 warnings). Dev server log healthy (no compile/runtime errors).

## Key API shapes verified (read directly from route handlers)

- `GET /api/instructor/courses` → `{ courses: [...], totals }`
- `GET /api/instructor/courses/[id]/assignments` → `{ course, assignments }` (each assignment has `_count.submissions`, `rubric`)
- `POST /api/instructor/courses/[id]/assignments` body matches form fields; `PATCH /api/instructor/assignments/[id]` accepts same field set; `DELETE` returns `{ ok: true }`.
- `GET /api/instructor/assignments/[id]/submissions` → `{ assignment, submissions, stats }` with submissions including `user` and `_count.peerReviews`.
- `POST /api/instructor/submissions/[id]/grade` body `{ grade: number, feedback: string, rubricScores: array }` — grade is 0-100.
- `GET /api/instructor/rubrics` → `{ rubrics: [...] }` with `criteria` and `_count.assignments`. `POST` body `{ title, description, criteria: [{label, description, points, order}] }`. `PATCH /api/instructor/rubrics/[id]` same shape. `DELETE` returns `{ ok: true }`.
- `GET /api/instructor/office-hours` → `{ slots: [...] }` with `course`, `bookings` (each with `student`), `bookingsCount`. `POST` body `{ startAt, endAt, mode, location, maxBookings, courseId }`. `DELETE` returns `{ ok: true, cancelledBookings: number }`.
- `GET /api/messages/threads` → `{ threads: [...] }` with `other`, `lastMessage`, `unreadCount`. `POST /api/messages/threads` body `{ recipientId, content }` returns `{ thread: { id }, message }`.
- `GET /api/messages/threads/[id]` → `{ thread: { other }, messages }`. `POST /api/messages/threads/[id]/messages` body `{ content }`. `POST /api/messages/threads/[id]/read` marks as read.
- `GET /api/messages/contacts` → `{ contacts: [...] }` (role-aware).
- `GET /api/instructor/courses/[id]/attendance?date=&sessionType=` → `{ course, records, byDate, roster }`. `POST /api/instructor/courses/[id]/attendance/bulk` body `{ date, sessionType, records: [{userId, status, notes?}] }` returns `{ upserted, errors, total }`.
- `POST /api/instructor/bulk-import/preview` body `{ csv }` returns `{ rows: [...], totalRows, validRows }`. `POST /api/instructor/bulk-import` body `{ courseId, csv } | { courseId, students: [...] }` returns `{ created, enrolled, skipped, results: [...] }`.
- `GET /api/certificate-templates` → `{ templates: [...] }` with `_count.certificates`. `POST` body matches form fields. `DELETE /api/certificate-templates/[id]` returns 409 if certificates reference it.

## Notes / Caveats

- Module picker inside the assignment form fetches modules from the public `GET /api/courses/[courseId]` endpoint (which includes `modules` with `lessons`), since `GET /api/instructor/courses/[id]/modules` does not exist (only POST). Endpoint ownership check still applies at submit time server-side.
- All mutations invalidate their relevant query keys so lists refresh after writes.
- Color inputs use native `<input type="color">` paired with a hex `<Input>` for precision.
- The "Copy All" button for bulk-import temp passwords writes `email\tpassword` TSV format to the clipboard.
- Live certificate preview uses inline styles (primaryColor, accentColor, seal gradients) since the colors are dynamic per template.
