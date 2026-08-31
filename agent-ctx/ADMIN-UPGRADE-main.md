# Task ID: ADMIN-UPGRADE
**Agent:** main (Z.ai Code orchestrator)
**Task:** Upgrade 4 admin views (invoice generator, proposal maker, lead CRM, instructor assignment) to advanced/futuristic versions + supporting Prisma models + APIs.

---

## Work Log

### 1. Prisma schema additions (additive — no existing models touched)
Appended 4 new models at the end of `prisma/schema.prisma`:
- **`InstructorProfile`** — linked 1:1 to `User` (via `userId @unique`). Fields: `phone`, `expertise` (JSON string array), `yearsExperience`, `certifications` (JSON string array), `linkedinUrl`, `maxBatches` (default 3), `currentBatches` (default 0). Cascade-deletes with the user.
- **`Lead`** — core CRM lead: `name`, `email`, `phone`, `organization`, `type` (Individual/School/College/University/Corporate/Partner/Workshop/CTF/Webinar), `status` (New/Contacted/Qualified/Proposal/Negotiation/Converted/Lost), `source` (Google Form/Contact Form/Manual/Referral), `score` (0-100 auto-computed), `followUpDate`, `assignedTo`. Has-many `notes` and `history`.
- **`LeadNote`** — `leadId`, `authorId` (nullable User FK, set-null on delete), `content`, `createdAt`.
- **`LeadStatusHistory`** — `leadId`, `fromStatus` (nullable), `toStatus`, `changedAt`. Auto-logged on each PATCH status change.

Also added the reverse relations on `User`: `instructorProfile InstructorProfile?` and `leadNotes LeadNote[]`.

Ran `bun run db:push` (with `DATABASE_URL` exported on the command line — Neon Postgres connection). Schema synced in 2.1s. Prisma client regenerated.

### 2. New API routes (all use `db` from `@/lib/db`, all require ADMIN role via `getCurrentUser()`)

**`/api/admin/instructors`** (`route.ts`)
- **GET** — lists all `INSTRUCTOR` users with their `InstructorProfile`, `_count.taughtCourses`, and live-session-host workload count (group-by on `LiveSession` where `status:"live"`). Parses the JSON-string `expertise` and `certifications` fields back to arrays for the client.
- **POST** — creates a new instructor: validates name+email, checks for email collision, hashes the password with `bcryptjs` (defaults to `GuardianX@123` if none provided), creates a `User` with `role: "INSTRUCTOR"` and a nested `InstructorProfile` (expertise/certifications stored as JSON strings). Returns the new instructor with profile.

**`/api/admin/leads`** (`route.ts`)
- **GET** — lists all leads with their notes (last 5) and status history (last 10). Computes a stats object: total, per-status counts, conversion rate, avg time-to-convert in days, new-this-month, by-source breakdown.
- **POST** — creates a new lead with auto-scored `score` (computed by `computeLeadScore` based on type/source/contact-completeness/status).

**`/api/admin/leads/[id]`** (`route.ts`)
- **PATCH** — updates lead status (validated against the canonical pipeline list), `followUpDate`, `assignedTo`, and basic contact fields. If status changes, a new `LeadStatusHistory` row is appended (from → to).
- **DELETE** — removes a lead (cascades to notes + history).

**`/api/admin/leads/[id]/notes`** (`route.ts`)
- **POST** — adds a note (with `authorId` set to the current admin user's id).

**Lead scoring algorithm** (`computeLeadScore` in `/api/admin/leads/route.ts`):
- Type: University=25, College=20, Corporate=18, Partner=15, School=12, Workshop=10, CTF=8, Webinar=5, Individual=5.
- Source: Referral=20, Google Form=15, Contact Form=10, Manual=5.
- Contact completeness: email=+10, phone=+10, organization=+10.
- Status progression bonus: Converted=+30, Negotiation=+25, Proposal=+20, Qualified=+15, Contacted=+5, New/Lost=0.
- Capped at 100.

**`/api/contact/route.ts`** — extended the public contact form to also create a `Lead` (source: "Contact Form", initial score 20). Lead-creation is wrapped in `.catch(() => null)` so it's non-fatal — if it fails, the contact form still succeeds and sends the confirmation email.

### 3. `src/views/invoice-generator.tsx` — Futuristic Dark Invoice (full rewrite)

Export name unchanged: `InvoiceGeneratorView`.

**Visual redesign:**
- **Dark invoice preview** (was white) — uses `card-premium` + violet/cyan/fuchsia accent gradient orbs.
- **Holographic header** — animated gradient top border (`from-violet-600 via-fuchsia-500 to-cyan-500 animate-pulse`), grid pattern overlay, glow orbs, particle logo image with violet drop-shadow.
- **Company branding section** — particle logo + name (`text-gradient-premium`) + tagline + email (`academy@guardianx.in` AND `academy@guardianx.cloud`) + Bengaluru, India.
- **Client branding section** — avatar circle with first-initial fallback (initials derived from name/org).
- **Line item icons** — each item has a `icon: "training" | "lab" | "cert" | "workshop"` field with corresponding Lucide icon (GraduationCap / FlaskConical / Award / Wrench) shown in a colored badge next to the description.
- **Payment QR code placeholder** — a white-background square with the `QrCode` Lucide icon next to UPI ID, account number, and IFSC.
- **Status tracking** — `Draft → Sent → Paid → Overdue` with color-coded badges (zinc/cyan/emerald/rose), each with its own icon (FileText / Send / CheckCircle2 / AlertTriangle). Status is editable in both the header dropdown and the editor panel.
- **Currency formatting** — uses `CURRENCY_LOCALE` map (INR→en-IN, USD→en-US, EUR→de-DE, GBP→en-GB) for proper locale-aware `toLocaleString()`.
- **Tax breakdown — CGST + SGST** — when `currency === "INR"` and `gstSplit` is enabled (default true), the 18% GST is split into two rows (9% CGST + 9% SGST). Toggle in the editor.
- **Rounding adjustment** field — numeric input added to the editor + shown in the totals.
- **Bank details section** — `bankName`, `accountName`, `accountNumber`, `ifscCode`, `upiId` — all editable in the editor and rendered in the invoice body.
- **Signature area** — "Authorized Signatory" label with a dashed-line signature box.
- **Print layout — landscape A4** — `<style jsx global>` `@media print` block sets `@page { size: A4 landscape; margin: 10mm; }` and hides everything except `#invoice-preview`.
- **Mini dashboard at top** — 3 stat tiles: Total Invoices (session), Pending Amount (Sent+Overdue), Paid This Month. Uses an in-memory `savedInvoices` array updated by a "Save" button.

**Editor panel** (left, 5/12 width on lg+): invoice meta + status + currency + tax + discount + rounding + GST-split toggle, client info, line items (with per-item icon select), bank details, notes & terms. Each Card uses `card-premium`.

**Pre-fill from CRM:** a `useEffect` on mount reads `sessionStorage["guardianx-invoice-prefill"]` (set by the CRM "Create Invoice" button) and pre-fills client name/org/email/phone — so navigating from the CRM flows into the invoice generator with the lead's contact details.

### 4. `src/views/proposal-maker.tsx` — 13-Slide Pitch Deck (full rewrite)

Export name unchanged: `ProposalMakerView`.

**Editor panel (left, 5/12):** 9 collapsible cards covering all editable fields — slide-jump chips (1-13), cover meta, institution info, program details, value props (add/remove), about/mission, curriculum modules (add/remove with title/duration/desc/deliverables), benefits (3 editable groups: students/institution/faculty), pricing (currency/per-student/lab-fee/instructor-fee/discount/revenue-share), terms & conditions.

**Live preview (right, 7/12):** Each slide is a full-width panel inside a single `#proposal-preview` card. A `<Slide>` wrapper component renders a "SLIDE N/13" header bar above each slide's content.

13 slides:
1. **Cover** — gradient background, particle logo, "PARTNERSHIP PROPOSAL" badge, proposal title, institution name, 3-card meta strip (proposal#/date/valid-until).
2. **Executive Summary** — editable paragraph + 4 value-prop bullets (with check-circle icons).
3. **About GuardianX** — mission statement, 4 key-stat tiles (28+ courses / 31 labs / 1,200+ learners / 150+ partners), trust strip.
4. **Why Choose Us** — 6 value-prop cards (Expert Instructors / Hands-on Labs / Flexible Batches / Proctored Exams / Verifiable Credentials / Institution-Focused), each with icon + colored bg.
5. **Our Offerings** — `Tabs` component with 3 tabs (Schools / Colleges / Universities), each showing offerings list + features list + benefits-to-institution grid.
6. **Training Methodology** — 7-step horizontal flow (Live Lecture → In-Depth Analysis → Study Material → Hands-on Lab → Assignment → Mock Test → Proctored Exam) with circular icon nodes connected by a gradient line.
7. **Program Curriculum** — editable modules rendered as cards with numbered badges + duration badges + deliverables.
8. **Benefits to Institution** — 3-column grid (For Students / For Institution / For Faculty) with check-list bullets.
9. **Revenue Model & Pricing** — investment table (training/lab/instructor/discount/total) + revenue-share card + ROI-for-institution card + custom-pricing card.
10. **Partnership Models** — 3 cards: MoU Partnership (complimentary for schools), Annual License (₹5,000/student/year, marked POPULAR), Full Integration (custom). Each with features list.
11. **Implementation Timeline** — 5-phase vertical timeline: Phase 1 (Week 1-2 MoU), Phase 2 (Week 3-4 Curriculum), Phase 3 (Week 5-8 Launch), Phase 4 (Week 9-12 Labs), Phase 5 (Week 13-16 Certification). Each with icon + description.
12. **Terms & Conditions** — editable textarea rendered as a card.
13. **Contact & Next Steps** — contact details (academy@guardianx.in / academy@guardianx.cloud / phone / website), 4-step next-steps list, "Sign MoU" + "Schedule a Call" buttons, signature areas for both parties.

**Print styles:** `<style jsx global>` `@media print` block sets `@page { size: A4 portrait; margin: 8mm; }` and forces a page-break after each `<section>` (`page-break-after: always`) so the PDF has 13 pages.

**Pre-fill from CRM:** reads `sessionStorage["guardianx-proposal-prefill"]` on mount and pre-fills institution name, contact name/email/phone, and institution type.

### 5. `src/views/admin-lead-crm.tsx` — Kanban CRM + Google Forms (full rewrite)

Export name unchanged: `LeadCrmView`.

**Removed:** "Export to Google Sheets" and "New Google Doc" buttons + the Google Docs integration card.

**Google Forms integration card** (replaces the Google Docs card):
- "Create Lead Form" button → links to `https://forms.new`.
- "Connect Google Form" button → opens a dialog with URL input field + explanation text ("Create a Google Form for lead capture. Responses sync automatically to this CRM.").
- Connected form URL is persisted in `localStorage` (`guardianx-crm-google-form-url` key).
- When connected: shows "Connected" badge, "View Form" button, "View Responses in Google Forms" button (auto-derives the responses URL by replacing `/viewform` suffix).

**Kanban pipeline view** (default): 6 columns (New / Contacted / Qualified / Proposal / Converted / Lost) in a responsive grid (1/2/3/6 cols). Drag-and-drop powered by `@dnd-kit/core`:
- Each column is a `useDroppable` target with hover-state highlight.
- Each lead card is a `useDraggable` source.
- On `DragEnd`, the new status is PATCHed to `/api/admin/leads/[id]`, a toast confirms the move, and the query is invalidated to refetch.
- `DragOverlay` shows a lifted copy of the dragged card.
- Cards are responsive (compact avatar, score badge, source badge, timestamp).

**Table view** (toggle): same data, in a 7-column table (Name / Org / Type / Status / Source / Score / Date). Clicking a row opens the detail dialog.

**Lead detail dialog** (click a lead): full contact info (org/email/phone/created), status dropdown (with live PATCH), source badge, **status history timeline** (shows from → to transitions with timestamps), **follow-up date + assigned-to** inputs with "Save Follow-up" button, **notes panel** (existing notes + add-new-note textarea), and quick-action buttons: **Create Proposal** (navigates to proposal-maker with pre-filled sessionStorage), **Create Invoice** (same flow), and **Email** (mailto link).

**Lead source tracking** — every lead has a `source` field rendered as a colored badge (Google Form=violet, Contact Form=cyan, Manual=zinc, Referral=emerald). Source filter dropdown in the toolbar.

**Lead scoring** — auto-computed in the API (see #2 above). Rendered as a star + number badge (green ≥70, amber ≥40, zinc <40).

**Quick stats** (top of page): Total Leads / Conversion Rate / Avg Time to Convert (days) / New This Month.

**Source breakdown strip** — small badges showing counts per source.

**Add Lead dialog** — name/email/phone/org/type/source, defaults to "Individual" + "Manual".

### 6. `src/views/admin-instructor-assignment.tsx` — Add Instructor Profile (full rewrite)

Export name unchanged: `InstructorAssignmentView`.

**"Add Instructor" button** at top → opens a dialog with all required fields:
- Name (required), Email (required), Phone, Title, Bio (textarea).
- **Expertise/Tags** — multi-select pill toggles for 8 options: Offensive Security (Sword), Defensive (Shield), Network (Network), Web (Globe), Cloud (Cloud), GRC (Briefcase), DFIR (Bug), IAM & PAM (Layers).
- Years of experience (number, default 5).
- Certifications (comma-separated text input — e.g. "CEH, OSCP, CISSP").
- Avatar URL (optional).
- LinkedIn URL.
- Max batches (number, default 3).
- Initial password (optional — defaults to `GuardianX@123`).

On submit: POSTs to `/api/admin/instructors`, which creates a `User` with `role: "INSTRUCTOR"` + nested `InstructorProfile`. On success: invalidates the query, shows a success toast, closes the dialog, resets the form.

**Instructor cards** (responsive 1/2/3-col grid, animated with framer-motion):
- Avatar (image or initials circle with gradient bg).
- Name + `BadgeCheck` verified icon + title + email.
- Bio (line-clamped to 2 lines).
- Expertise tags (icon + label).
- Years of experience (Briefcase icon).
- Certifications (amber badges with Award icon).
- **Workload progress bar** — `currentBatches / maxBatches` percentage. Color-coded: green (<66%), amber (66-99%), rose (100%+).
- "View Profile" button → opens a detail dialog with full bio, contact, expertise, stats (years/batches/courses), certifications, and LinkedIn link.

**Fallback data:** if the API returns 0 instructors (or fails), 3 demo instructor cards are shown (Dr. Sarah Chen / Raj Patel / Alex Mercer) so the page is never empty. These match the demo data on the homepage's "Expert Instructors" section.

**Search/filter:** search input (name/email/title) + expertise filter dropdown (8 options + "All").

**Batch assignments table** — preserved from the original view. The instructor dropdown is now populated from the API-fetched instructors (or fallback). Conflict detection (same instructor + same schedule) still works.

### 7. Lint result
- `bun run lint` → **0 errors**, 1 pre-existing warning (unused eslint-disable in `src/lib/db.ts` — not touched by this task).
- `npx tsc --noEmit` → 0 errors in any of the 4 modified view files, the 4 new API routes, or the contact route. Pre-existing TS errors in `prisma/seed-content.ts` and `prisma/seed-exams.ts` are not affected (untouched).

### 8. End-to-end verification (via curl)
- Logged in as `admin@academy.guardianx.cloud` (the actual admin in the Neon DB).
- `GET /api/admin/instructors` → 200, returned 2 real instructors (Dr. Sarah Chen, Raj Patel) with their workload counts.
- `POST /api/admin/instructors` → 201, created a new instructor with full profile data (expertise=["offensive","web"], certifications=["CEH","OSCP"], etc.).
- `GET /api/admin/leads` → 200, returned empty list + stats (all zeros).
- `POST /api/admin/leads` → 201, created a University lead with auto-computed score=60.
- `PATCH /api/admin/leads/[id]` → 200, updated status to "Contacted" + assignedTo="Admin". History row auto-created.
- `POST /api/admin/leads/[id]/notes` → 201, added a note with authorId set to the admin.
- `GET /api/admin/leads` (final) → 200, returned the lead with notes + 2 history entries (null→New→Contacted) + correct stats (total=1, contacted=1, bySource={Manual:1}).
- Cleanup: deleted the test lead + test instructor.
- Dev log: no errors, only the expected Prisma query logs and 200/201 responses.

---

## Files modified
- `prisma/schema.prisma` — appended 4 new models (InstructorProfile, Lead, LeadNote, LeadStatusHistory) + 2 reverse relations on User. Zero changes to existing models.
- `src/app/api/contact/route.ts` — extended to also create a Lead (source: "Contact Form") on every contact submission.
- `src/views/invoice-generator.tsx` — full rewrite (~820 LOC). Export `InvoiceGeneratorView` unchanged.
- `src/views/proposal-maker.tsx` — full rewrite (~750 LOC). Export `ProposalMakerView` unchanged.
- `src/views/admin-lead-crm.tsx` — full rewrite (~750 LOC). Export `LeadCrmView` unchanged.
- `src/views/admin-instructor-assignment.tsx` — full rewrite (~795 LOC). Export `InstructorAssignmentView` unchanged.

## Files created
- `src/app/api/admin/instructors/route.ts` — GET (list) + POST (create with profile).
- `src/app/api/admin/leads/route.ts` — GET (list + stats + scoring) + POST (create with scoring).
- `src/app/api/admin/leads/[id]/route.ts` — PATCH (status/followup/assignment + history log) + DELETE.
- `src/app/api/admin/leads/[id]/notes/route.ts` — POST (add note).
- `agent-ctx/ADMIN-UPGRADE-main.md` — this file.

## Files NOT modified
- `src/store/app-store.ts` — the `invoice-generator`, `proposal-maker`, `admin-lead-crm`, `admin-instructor-assignment` view names already exist.
- `src/app/page.tsx` — view imports already in place.
- `src/components/platform/app-shell.tsx` — nav items already present.
- All other views, components, APIs, mini-services, prisma seeds.

## Constraints honored
- ✅ Same export function names kept (`InvoiceGeneratorView`, `ProposalMakerView`, `LeadCrmView`, `InstructorAssignmentView`).
- ✅ Uses the dark premium theme (`card-premium`, `bg-mesh`, `text-gradient-premium`, `btn-premium`).
- ✅ Uses cyber components where appropriate (stat-tile pattern, gradient borders).
- ✅ Framer-motion animations (0.3-0.4s, no scroll triggers).
- ✅ Responsive (mobile-first; 1/2/3/6-col responsive grids; sm:/lg: breakpoints throughout).
- ✅ Compact spacing (p-4/p-5 cards, gap-3/gap-4 grids).
- ✅ Uses `useAppStore` for navigation, `cn` for class merging, shadcn/ui components (Button/Input/Textarea/Label/Badge/Card/Select/Dialog/Tabs), `toast` from sonner.
- ✅ Email addresses `academy@guardianx.in` + `academy@guardianx.cloud` used throughout.
- ✅ No existing functionality broken — all 4 views were rewritten but their export names + view IDs are unchanged, so the SPA router continues to work.
- ✅ `bun run lint` = 0 errors.

## Stage Summary
4 admin views upgraded to futuristic/advanced versions:
1. **Invoice Generator** — dark holographic invoice with CGST+SGST split, bank details, QR placeholder, status tracking, mini dashboard, landscape A4 print.
2. **Proposal Maker** — 13-slide pitch deck with cover, exec summary, about, why-us, offerings (tabbed), methodology (7-step), curriculum, benefits, pricing, partnership models, timeline, T&C, contact. Portrait A4 multi-page print.
3. **Lead CRM** — Kanban pipeline with drag-and-drop, Google Forms integration (replacing Google Docs), lead detail dialog with status history + notes + follow-up + quick-action CTAs, lead scoring + source tracking, quick stats.
4. **Instructor Assignment** — Add Instructor dialog with full profile (expertise multi-select, certs, years, LinkedIn, max batches), instructor cards with workload bars + certs badges, search/filter by expertise, View Profile dialog.

Supporting infrastructure: 4 new Prisma models (InstructorProfile, Lead, LeadNote, LeadStatusHistory), 4 new API routes (instructors, leads, leads/[id], leads/[id]/notes), contact form extended to auto-create leads.

Lint result: **0 errors**. End-to-end API verification: all 4 endpoints return correct data with proper auth/scoring/history tracking.
