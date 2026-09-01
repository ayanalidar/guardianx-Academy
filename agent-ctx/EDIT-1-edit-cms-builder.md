# Task ID: EDIT-1
## Agent: edit-cms-builder
## Task: School Onboarding System + Full Content Management (editable certifications, homepage, partner directory)

## Summary
Built two major features end-to-end: (1) a School Onboarding System where each
instructor/admin gets their own scoped school portal — they fill out an
onboarding form (School Name, Address, City, Contact Person, Contact Email,
Contact Phone) which creates a School record and links it to their user account.
The existing school APIs were refactored to require explicit onboarding (no more
auto-provisioned "default academy") and all data is scoped by the user's
schoolId (true multi-tenant: each school admin only sees their own batches,
students, attendance, reports). A new "School Settings" tab lets them edit
their school info after onboarding.

(2) A full Content Management layer: three new Prisma models (Certification,
SiteContent, PartnerInstitution) seeded with the previously-hardcoded data
(27 certifications, 29 homepage content keys, 13 partner institutions). Each
entity now has full CRUD APIs + admin editing UI on both the public pages
(inline Edit/Delete buttons + Add buttons visible only to ADMIN) and the admin
dashboard (3 new tabs: Certifications, Partners, Site Content). The homepage
also has an "Edit Page" button (admin only) that opens a modal to edit all
homepage copy in one place.

## What was built

### 1. Prisma schema (`prisma/schema.prisma`)
- Added `updatedAt DateTime @updatedAt` to existing `School` model
- New `Certification` model: id, short, full, body, level, category, color, duration, desc, popular, order, createdAt, updatedAt
- New `SiteContent` model: id, key (unique), value, type (text|html|json), updatedAt
- New `PartnerInstitution` model: id, name, shortName, type, location, city, country, established, studentsCount, mouSigned, mouDuration, partnershipLevel, coursesOffered (pipe-separated), studentsTrained, certificationsEarned, labsSetup, facultyTrained, description, achievements (pipe-separated), contactPerson, contactRole, email, phone, website, color, order, createdAt, updatedAt
- Ran `bun run db:push` — applied successfully

### 2. Seed script (`prisma/seed-content-cms.ts`)
- Idempotent seed (skips if records already exist)
- Seeded 27 certifications across 8 categories (CEH, OSCP, CCNA, CISSP, CyberArk, etc.)
- Seeded 29 site content items (hero_*, stats_*, features_*, certs_cta_*, journey_*, tech_*, final_cta_*, certifications_hero_*, partners_hero_*)
- Seeded 13 partner institutions (4 schools, 4 colleges, 5 universities — IIT-D, NUS, VIT, BITS-H, SRM, BIT, PICT, etc.)
- All data was previously hardcoded in the views — now in the DB

### 3. School Onboarding APIs
- `POST /api/school/onboard` — creates School + links to user (transactional). Requires name + contactEmail.
- `GET /api/school/settings` — returns the user's school (or `{ school: null }`)
- `PATCH /api/school/settings` — updates school info (name, address, city, contact fields)

### 4. Refactored existing school APIs (removed auto-provisioning)
- `GET /api/school/batches` — returns `{ school: null, batches: [], needsOnboarding: true }` if no school
- `POST /api/school/batches` — returns 404 with needsOnboarding flag if no school
- `GET /api/school/students` — returns `{ students: [], needsOnboarding: true }` if no school
- `GET /api/school/reports` — returns empty report with needsOnboarding flag if no school
- All data remains scoped by `user.schoolId` (multi-tenant isolation preserved)

### 5. School Dashboard updates (`src/views/school-dashboard.tsx`)
- New `SchoolOnboarding` component — shown when user has no schoolId. 6-field form.
- New `SettingsTab` component — editable school profile + read-only ID/Created date.
- Main view fetches `/api/school/settings` first; if `school === null`, shows onboarding form; else shows the dashboard with the school's actual name in the hero.
- TabsList now has 6 tabs: Overview, Students, Batches, Attendance, Reports, Settings.

### 6. Certification CRUD APIs (`src/app/api/admin/certifications/`)
- `GET /api/admin/certifications` (admin) + `GET /api/certifications` (public)
- `POST /api/admin/certifications` (admin) — auto-assigns next order
- `PATCH /api/admin/certifications/[id]` (admin) — partial update
- `DELETE /api/admin/certifications/[id]` (admin)

### 7. Certifications view updates (`src/views/certifications.tsx`)
- Replaced hardcoded `ALL_CERTS` array with TanStack Query fetch from `/api/certifications`
- Added "Add Certification" button (ADMIN only) in the hero
- Added Edit/Delete buttons on each cert card (ADMIN only) — Edit opens inline `CertForm`; Delete shows AlertDialog
- `CertForm` (create/edit) supports all 9 fields + popular checkbox

### 8. Site Content APIs
- `GET /api/site-content` (public) — returns `{ content: {key: value}, items: [...] }`
- `PATCH /api/admin/site-content/[key]` (admin) — upserts a content item

### 9. Home view updates (`src/views/home.tsx`)
- Added `CONTENT_FALLBACKS` map (29 default values) so the page renders before the API responds
- Added TanStack Query fetch + `c(key, fallback)` helper
- Replaced all hardcoded strings in hero, stats bar, features, certs CTA, journey, tech stack, final CTA with `c()` calls
- Added "Edit Page" button in header (ADMIN only)
- New `EditPageModal` — Dialog with 7 grouped sections, per-field Save buttons, Input/Textarea based on value length

### 10. Partner CRUD APIs (`src/app/api/admin/partners/`)
- `GET /api/admin/partners` (admin) + `GET /api/partners` (public)
- `POST /api/admin/partners` (admin) — converts arrays to pipe-separated
- `PATCH /api/admin/partners/[id]` (admin) — partial update with array conversion
- `DELETE /api/admin/partners/[id]` (admin)

### 11. Partner Institutions view updates (`src/views/partner-institutions.tsx`)
- Removed hardcoded `PARTNERS` array (~360 lines)
- `PartnerDirectory` fetches from `/api/partners` and converts DB shape (pipe strings) to interface shape (arrays) via `React.useMemo`
- Added "Add Partner" button (ADMIN only)
- Added Edit/Delete buttons on each `PartnerCard` (ADMIN only) — Edit opens inline `PartnerForm`; Delete shows AlertDialog
- `PartnerForm` (create/edit) supports all 23 fields, with newline-separated courses/achievements converted to arrays on save

### 12. Admin Dashboard updates (`src/views/admin-dashboard.tsx`)
- Added 3 new tabs: Certifications, Partners, Site Content (now 7 tabs total)
- TabsList uses `flex-wrap h-auto` to fit all tabs on smaller screens
- `CertsTab`: search + Add + grid of cert cards with Edit/Delete + `AdminCertForm`
- `AdminPartnersTab`: search + type filter + Add + list of partner cards with inline Edit + `AdminPartnerForm`
- `SiteContentTab`: info card + search + list of `SiteContentEditor` cards with inline Input/Textarea + per-field Save

## Verification
- `bun run db:push` — schema applied successfully
- Seed script: ✅ 27 certs, ✅ 29 content items, ✅ 13 partners seeded
- `bun run lint` — exit 0 (0 errors, 0 warnings)
- `npx tsc --noEmit --skipLibCheck` — 0 errors in any file I created or modified
- Dev server: `GET /` returns 200, multiple successful compiles in dev.log
- All holographic CSS classes preserved (holo-border, scanlines, bg-grid, glass-card, hover-lift, animate-reveal-up, stagger-*, holo-shimmer, glass-reflection, neon-text)
- All text uses Tailwind theme variables (text-foreground, text-muted-foreground, bg-card, bg-muted, border-border) — visible in both dark and light mode
- Used existing shadcn/ui components throughout (Card, Button, Badge, Input, Textarea, Select, Tabs, Table, AlertDialog, Skeleton, Dialog, Progress)
- TanStack Query for all data fetching with proper query invalidation on mutations
- Sonner toasts for all success/error feedback
- Role-gated UI: Edit/Delete/Add buttons and the Edit Page modal only render for users with `role === "ADMIN"`
- School onboarding form only shows for INSTRUCTOR/ADMIN users without a schoolId

## Files created (13)
1. `prisma/seed-content-cms.ts`
2. `src/app/api/school/onboard/route.ts`
3. `src/app/api/school/settings/route.ts`
4. `src/app/api/admin/certifications/route.ts`
5. `src/app/api/admin/certifications/[id]/route.ts`
6. `src/app/api/certifications/route.ts`
7. `src/app/api/site-content/route.ts`
8. `src/app/api/admin/site-content/[key]/route.ts`
9. `src/app/api/admin/partners/route.ts`
10. `src/app/api/admin/partners/[id]/route.ts`
11. `src/app/api/partners/route.ts`
(+ updated: schema.prisma, school-dashboard.tsx, certifications.tsx, home.tsx, partner-institutions.tsx, admin-dashboard.tsx, school/batches/route.ts, school/students/route.ts, school/reports/route.ts)

## Demo accounts (unchanged)
- admin@guardianx.io / admin123 (full CMS + school onboarding access)
- instructor@guardianx.io / instructor123 (school onboarding + management access)
- student@guardianx.io / student123 (view-only access to public content)
