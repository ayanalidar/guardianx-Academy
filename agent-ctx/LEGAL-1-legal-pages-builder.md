# Task ID: LEGAL-1
## Agent: legal-pages-builder
## Task: Build legal pages, footer, rebranding

### What was built

**1. New file: `src/components/platform/site-footer.tsx`**
- Comprehensive 4-column footer (Platform, Company, Legal, Resources)
- Brand block with "GuardianX Academy" name + "Building Tomorrow's Cyber Guardians" tagline
- Newsletter signup with email validation (regex) and toast confirmation
- Social links: Twitter, LinkedIn, GitHub, YouTube (lucide-react icons)
- Bottom bar with version (v2.0.0), copyright, terms/conduct quick links
- "Demo Access" strip with credentials
- "All systems operational" status indicator
- Holographic ambient glow, top accent gradient line
- Uses `useAppStore` for view navigation
- Footer is `mt-auto` so it sticks to viewport bottom (sticky footer pattern)

**2. New file: `src/views/legal.tsx` (~1539 lines)**
- Exports `LegalPage` component (takes `pageType: LegalPageType` prop) and `LegalPageType` type
- Exports types: "privacy" | "terms" | "about" | "faq" | "refund" | "cookies" | "conduct"
- Sticky sidebar (`lg:sticky lg:top-24`) with nav for all 7 legal pages
- Each sidebar item: icon + label + description, active state highlight
- "Contact Legal Team" button at sidebar bottom
- Hero header card with `holo-gradient`, `particle-network`, `blob` orb, `text-holo` title
- Shows "Last updated" date + "Effective immediately" notice per page
- Main content card with all sections per page type
- Footer nav with "Contact Us" + "Get Started" buttons
- Quick-links grid showing 6 OTHER legal pages (excludes current)

**Page contents (comprehensive):**
- **About Us**: Story, Mission, Vision, Values (6 cards), Stats (8 metrics), Team (6 roles), Timeline (2021-2025)
- **Privacy Policy**: 12 sections — data collection, usage, GDPR legal basis, cookies, third-party services (6 providers), retention, user rights (GDPR), CCPA, security, children, changes, contact
- **Terms & Conditions**: 14 sections — acceptance, accounts, acceptable use, IP, prohibited, labs special terms, proctored exams, payments, liability, indemnification, termination, changes, governing law, contact
- **FAQ**: 7 categories with accordion — Courses (5), Labs (6), Exams (6), Live Sessions (4), Partnerships (5), Account/Billing (5), Technical (4) = 35 total questions
- **Refund Policy**: 9 sections — course refunds (14-day/30-day), exam fees, subscriptions (monthly/annual), institutional, process, non-refundable items, chargebacks, statutory rights, contact
- **Cookie Policy**: 7 sections — what are cookies, 4 types (Strictly Necessary, Preference, Analytics, Marketing) with examples + durations, third-party, how to manage (browser + platform), DNT, updates, contact
- **Code of Conduct**: 11 sections — core principles (6 cards), expected behavior, unacceptable behavior, academic integrity, anti-cheating (proctoring safeguards + consequences), ethical hacking pledge (7-point pledge), reporting, enforcement/due process, legal compliance, acknowledgment, contact

**3. Updated: `src/store/app-store.ts`**
- Added 7 new view types to `View` union: `privacy`, `terms`, `about`, `faq`, `refund`, `cookies`, `conduct`

**4. Updated: `src/app/page.tsx`**
- Imported `LegalPage` and `SiteFooter`
- Added 7 new view names to `PUBLIC_VIEWS` set
- Added 7 conditionals in `ViewRouter`: `{view.name === "privacy" && <LegalPage pageType="privacy" />}` (etc.)
- Replaced `PublicPageShell` simple footer with `<SiteFooter />`
- Updated `PublicPageShell` header: "GuardianX" → "GuardianX Academy" + tagline "Building Tomorrow's Cyber Guardians"
- Added "About" nav button to public header

**5. Updated: `src/views/home.tsx`**
- Imported `SiteFooter`
- Replaced 50-line inline footer with `<SiteFooter />`
- Updated nav brand: "GuardianX" → "GuardianX Academy"
- Updated tagline: "SECURE · LEARN · DEFEND" → "Building Tomorrow's Cyber Guardians"
- Added "About" nav button to header

### Holographic theme elements used
- `glass-card`, `holo-border`, `holo-shimmer`, `glass-reflection` on cards
- `holo-gradient`, `particle-network`, `blob` orbs on hero sections
- `text-holo` on titles, `neon-text` on section headings
- `breathe` + `neon-border` on primary CTAs
- `mt-auto` for sticky footer pattern
- All accent colors: emerald, cyan, violet, amber, teal, red (no indigo/blue)

### Verification
- ESLint: clean (0 errors, 0 warnings) — `bun run lint` exit 0
- Dev server compiles successfully
- All 7 legal page types present in compiled bundle: About Us, Code of Conduct, Cookie Policy, FAQ, Privacy Policy, Refund Policy, Terms
- SiteFooter component bundled with newsletter, social links, "GuardianX Academy" branding
- Home view bundle contains "Tomorrow" (new tagline) and "GuardianX Academy"
