// Seed the 4 demo training batches shown on the homepage + public batches view.
// Run with: bun run prisma/seed-batches.ts
// Idempotent: delete + recreate the 4 seeded rows (matched by certification+name).

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

type SeedBatch = {
  certification: string
  name: string
  schedule: string
  startDate: string
  startIsoDate?: string
  mode: string
  instructor: string
  seats: number
  enrolled: number
  level: string
  status: string
  certColor: string
  certTint: string
  certBorder: string
  levelColor: string
  levelTint: string
  levelBorder: string
  borderColor: string
  btnClass: string
  description: string
  featured: boolean
  order: number
  published: boolean
}

// 4 batches — values lifted verbatim from `UPCOMING_BATCHES` in
// `src/views/home-data.ts` so the seeded DB matches the existing static UI.
const BATCHES: SeedBatch[] = [
  {
    certification: "CompTIA Security+",
    name: "Security+ Weekend Batch",
    schedule: "Sat + Sun, 7:00 PM – 9:00 PM IST",
    startDate: "October 12",
    startIsoDate: "2025-10-12",
    mode: "Live Online",
    instructor: "Senior Cybersecurity Instructor",
    seats: 12,
    enrolled: 6,
    level: "Beginner",
    status: "Open",
    certColor: "text-emerald-300",
    certTint: "bg-emerald-500/15",
    certBorder: "border-emerald-500/30",
    levelColor: "text-emerald-300",
    levelTint: "bg-emerald-500/10",
    levelBorder: "border-emerald-500/30",
    borderColor:
      "border-border/60 hover:border-emerald-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.65_0.15_155_/_0.25)]",
    btnClass: "bg-emerald-600 hover:bg-emerald-500",
    description:
      "CompTIA Security+ weekend batch covering network security, threats, vulnerabilities, identity & access management, and cryptography. Live instructor-led sessions every Saturday & Sunday evening.",
    featured: true,
    order: 1,
    published: true,
  },
  {
    certification: "CEH (Certified Ethical Hacker)",
    name: "CEH Weekday Evening",
    schedule: "Mon-Wed-Fri, 8:00 PM – 10:00 PM IST",
    startDate: "October 20",
    startIsoDate: "2025-10-20",
    mode: "Live Online",
    instructor: "Dr. Sarah Chen",
    seats: 8,
    enrolled: 5,
    level: "Intermediate",
    status: "Open",
    certColor: "text-amber-300",
    certTint: "bg-amber-500/15",
    certBorder: "border-amber-500/30",
    levelColor: "text-amber-300",
    levelTint: "bg-amber-500/10",
    levelBorder: "border-amber-500/30",
    borderColor:
      "border-border/60 hover:border-amber-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.7_0.15_70_/_0.25)]",
    btnClass: "bg-amber-600 hover:bg-amber-500",
    description:
      "Certified Ethical Hacker weekday evening batch covering reconnaissance, scanning, enumeration, system hacking, malware, sniffing, social engineering, and web app hacking.",
    featured: true,
    order: 2,
    published: true,
  },
  {
    certification: "CCNA",
    name: "CCNA Morning Batch",
    schedule: "Tue-Thu, 7:00 AM – 9:00 AM IST",
    startDate: "November 03",
    startIsoDate: "2025-11-03",
    mode: "Live Online",
    instructor: "Raj Patel",
    seats: 15,
    enrolled: 9,
    level: "Beginner",
    status: "Open",
    certColor: "text-cyan-300",
    certTint: "bg-cyan-500/15",
    certBorder: "border-cyan-500/30",
    levelColor: "text-emerald-300",
    levelTint: "bg-emerald-500/10",
    levelBorder: "border-emerald-500/30",
    borderColor:
      "border-border/60 hover:border-cyan-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.7_0.15_220_/_0.25)]",
    btnClass: "bg-cyan-600 hover:bg-cyan-500",
    description:
      "CCNA morning batch covering IP connectivity, IP services, security fundamentals, automation, and programmability. Live instructor-led sessions Tuesday-Thursday mornings.",
    featured: true,
    order: 3,
    published: true,
  },
  {
    certification: "CISSP",
    name: "CISSP Weekend Intensive",
    schedule: "Sat-Sun, 10:00 AM – 1:00 PM IST",
    startDate: "November 09",
    startIsoDate: "2025-11-09",
    mode: "Live Online",
    instructor: "Alex Mercer",
    seats: 5,
    enrolled: 4,
    level: "Advanced",
    status: "Almost Full",
    certColor: "text-rose-300",
    certTint: "bg-rose-500/15",
    certBorder: "border-rose-500/30",
    levelColor: "text-rose-300",
    levelTint: "bg-rose-500/10",
    levelBorder: "border-rose-500/30",
    borderColor:
      "border-border/60 hover:border-rose-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.65_0.2_15_/_0.25)]",
    btnClass: "bg-rose-600 hover:bg-rose-500",
    description:
      "CISSP weekend intensive covering all 8 CBK domains: Security & Risk Management, Asset Security, Security Architecture & Engineering, Communication & Network Security, Identity & Access Management, Security Assessment & Testing, Security Operations, and Software Development Security.",
    featured: true,
    order: 4,
    published: true,
  },
]

async function main() {
  console.log(`\n[seed-batches] Seeding ${BATCHES.length} training batches...`)

  // Idempotent: delete existing seeded rows (matched by certification+name),
  // then create the 4 fresh rows. New batches added via admin API are
  // preserved (different certification/name combos).
  for (const b of BATCHES) {
    await db.trainingBatch.deleteMany({
      where: { certification: b.certification, name: b.name },
    })
  }

  for (const b of BATCHES) {
    await db.trainingBatch.create({ data: b })
    console.log(`  ✓ ${b.certification} — ${b.name}`)
  }

  const total = await db.trainingBatch.count()
  console.log(`\n[seed-batches] Done. Total TrainingBatch rows: ${total}`)
}

main()
  .catch((err) => {
    console.error("[seed-batches] FAILED:", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
