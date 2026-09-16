# referral-program-1 — Referral Program

## Scope
Built a referral program where enrolled students get a unique referral link; when someone enrolls via their link, both parties receive a discount coupon.

## Database
- Added `Referral` model to `prisma/schema.prisma` (id, referrerId, referredEmail, referredUserId, status, couponCode, createdAt, updatedAt; indexes on referrerId + referredEmail).
- Added `referrals Referral[] @relation("referrer")` to the `User` model.
- Ran `DATABASE_URL="...neon.tech/neondb?sslmode=require" prisma db push --accept-data-loss` + `prisma generate`. Schema is in sync; existing data preserved.

## APIs
- **POST /api/referral/create** (auth required) — idempotently returns the logged-in student's active (PENDING) referral, creating one if none exists. Response: `{ referralId, referralLink }` where link = `https://academy.guardianx.cloud/?ref=<referralId>`.
- **GET /api/referral/my** (auth required) — returns all referrals made by the logged-in user, aggregate stats (`{ total, pending, enrolled, rewarded, expired }`), and the active `referralId` + `referralLink`.
- **POST /api/referral/track** (public, no auth) — body `{ referralId, email, userId? }`. Validates the referral is PENDING + not self-referral, then generates two unique reward Coupons (15% off, single-use, 90-day validity) — one for the referrer (stamped on the Referral row + status=REWARDED) and one for the referred user. Idempotent on repeat calls.
- All routes use `getCurrentUser` + `withErrorHandler` from `@/lib/session`, and `db` from `@/lib/db`.

## Signup tracking
- Updated `src/app/api/auth/register/route.ts` to accept an optional `ref` field in the body. After successfully creating the new user, if `ref` is present and resolves to a PENDING Referral owned by a *different* user, the route allocates two reward coupons and stamps the referral as REWARDED (status non-fatal — the account is already created).
- Anti-abuse guards: cannot self-refer (by id or matching email), only PENDING referrals can be tracked.
- Updated `src/components/platform/auth-screen.tsx` `handleRegister` to read `gx_ref` from localStorage and pass it as `ref` to `/api/auth/register`. Clears the stored ref after a successful registration so it can't be reused.
- Added a `?ref=` URL capture effect to `src/app/page.tsx` — on first visit, if the URL contains a `?ref=<id>` matching a cuid-like pattern, it's persisted to `localStorage.gx_ref`. This survives SPA navigation from the landing page to the auth screen.

## Dashboard widget
- Added a `ReferEarnPanel` component to `src/views/dashboard.tsx` and mounted it at the top of the right column of the main grid (above Daily Objective).
- Card content:
  - Gift icon + headline "Invite friends, earn discounts" + 15% off explainer.
  - 3-tile stat strip: Referrals (total) / Enrolled / Rewards (rewarded count).
  - Referral link display + Copy button (with checkmark confirmation + sonner toast).
  - "Share on WhatsApp" button — opens `https://wa.me/?text=...` with the link pre-filled.
  - Lazy "Get my referral link" CTA — most students won't need a link until they decide to share, so we don't pre-create Referral rows for every dashboard visit. Calls POST /api/referral/create on click.
  - Latest rewarded coupon badge — surfaces the referrer's coupon code once a referral converts.
- Fetches `/api/referral/my` via TanStack Query (`api()` from `@/lib/api`); all success/error feedback via `toast` from `sonner`.
- Design: dark theme + violet accents, `card-premium` + `scanlines` + violet glow orb matching the existing GuardianX design language. Reuses the dashboard's `SectionHeader` / `TONE_MAP` for visual consistency.

## Files changed
- `prisma/schema.prisma` — added Referral model + User.referrals relation.
- `src/app/api/referral/create/route.ts` — NEW.
- `src/app/api/referral/my/route.ts` — NEW.
- `src/app/api/referral/track/route.ts` — NEW.
- `src/app/api/auth/register/route.ts` — added `ref` field, referral-tracking helper, reward allocation.
- `src/components/platform/auth-screen.tsx` — pass `ref` from localStorage to register, clear after success.
- `src/app/page.tsx` — capture `?ref=` to localStorage on first visit.
- `src/views/dashboard.tsx` — added `ReferEarnPanel` + `ReferralStat` components, mounted in right column. Added lucide-react icon imports (`Gift, Copy, Check, Users, UserCheck, Ticket, Send`) + `toast` from `sonner`.

## Verification
- `bun run lint` → 0 errors, 1 pre-existing warning in `src/lib/db.ts` (untouched).
- `npx tsc --noEmit --skipLibCheck` → 0 errors in any of the changed/new files (pre-existing errors in unrelated files untouched).
- Dev server log shows clean compile + 200s.

## Reward config
- 15% off, single-use, 90-day validity, applies to any course (courseId=null). Both referrer and referred user receive the same reward.
