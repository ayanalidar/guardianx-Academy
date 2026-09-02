// Seed CMS content — run with: bun run prisma/seed-cms.ts
// Populates the SiteContent table with all editable copy for every public page.
// Idempotent: upserts by [page, section, key].
//
// The seed content itself lives in src/lib/cms-seed.ts so that the
// /api/admin/site-content/seed API route can upsert the same defaults
// with the request's authenticated Prisma client (and updatedBy audit
// column) rather than spinning up its own PrismaClient.

import { PrismaClient } from "@prisma/client"
import { SEED_CMS } from "../src/lib/cms-seed"

const db = new PrismaClient()

async function main() {
  console.log(`Seeding ${SEED_CMS.length} CMS content items...`)

  for (const item of SEED_CMS) {
    await db.siteContent.upsert({
      where: {
        page_section_key: {
          page: item.page,
          section: item.section,
          key: item.key,
        }
      },
      create: {
        page: item.page,
        section: item.section,
        key: item.key,
        value: item.value,
      },
      update: {
        value: item.value,
      },
    })
  }

  // Group counts for log
  const byPage = SEED_CMS.reduce((acc, item) => {
    acc[item.page] = (acc[item.page] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log("✓ CMS content seeded successfully:")
  for (const [page, count] of Object.entries(byPage)) {
    console.log(`  - ${page}: ${count} items`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
