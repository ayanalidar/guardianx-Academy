// Backfill InstructorProfile rows for the 2 existing INSTRUCTOR users so the
// public /instructors page actually shows real expertise, certifications,
// years of experience, and a LinkedIn link. Also links any unlinked
// TrainingBatch rows whose `instructor` text matches the instructor's name
// to their `instructorId` so the instructor-detail "Assigned Batches"
// section can list them. Idempotent: upsert profile by userId.

import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

type Profile = {
  name: string
  phone: string | null
  expertise: string[]
  yearsExperience: number
  certifications: string[]
  linkedinUrl: string | null
  maxBatches: number
}

const PROFILES: Profile[] = [
  {
    name: "Dr. Sarah Chen",
    phone: null,
    expertise: ["Offensive Security", "Web Security", "Penetration Testing"],
    yearsExperience: 12,
    certifications: ["CEH", "OSCP", "CISSP"],
    linkedinUrl: "https://www.linkedin.com/in/sarah-chen-security",
    maxBatches: 4,
  },
  {
    name: "Raj Patel",
    phone: null,
    expertise: ["Network Security", "Defensive Security", "Cloud Security"],
    yearsExperience: 8,
    certifications: ["CCNA", "CCNP Security", "GCIA"],
    linkedinUrl: "https://www.linkedin.com/in/raj-patel-netsec",
    maxBatches: 3,
  },
]

async function main() {
  let created = 0
  let updated = 0
  for (const p of PROFILES) {
    const user = await db.user.findFirst({ where: { name: p.name, role: "INSTRUCTOR" } })
    if (!user) {
      console.log(`  ! ${p.name} — INSTRUCTOR user not found, skipping`)
      continue
    }
    const existing = await db.instructorProfile.findUnique({ where: { userId: user.id } })
    if (existing) {
      await db.instructorProfile.update({
        where: { userId: user.id },
        data: {
          expertise: JSON.stringify(p.expertise),
          yearsExperience: p.yearsExperience,
          certifications: JSON.stringify(p.certifications),
          linkedinUrl: p.linkedinUrl,
          maxBatches: p.maxBatches,
          phone: p.phone,
        },
      })
      updated++
      console.log(`  ↻ updated ${p.name} (${user.id})`)
    } else {
      await db.instructorProfile.create({
        data: {
          userId: user.id,
          phone: p.phone,
          expertise: JSON.stringify(p.expertise),
          yearsExperience: p.yearsExperience,
          certifications: JSON.stringify(p.certifications),
          linkedinUrl: p.linkedinUrl,
          maxBatches: p.maxBatches,
        },
      })
      created++
      console.log(`  + created ${p.name} (${user.id})`)
    }
  }
  console.log(`\n[seed-instructor-profiles] Done. ${created} created, ${updated} updated.`)

  // Link any TrainingBatch rows whose `instructor` text matches an instructor's
  // name (case-sensitive) to that instructor's `instructorId`. Only updates
  // rows where `instructorId` is null, so admin-set assignments are preserved.
  console.log("\n[seed-instructor-profiles] Linking TrainingBatch rows by instructor name...")
  let linked = 0
  for (const p of PROFILES) {
    const user = await db.user.findFirst({ where: { name: p.name, role: "INSTRUCTOR" } })
    if (!user) continue
    const result = await db.trainingBatch.updateMany({
      where: { instructor: p.name, instructorId: null },
      data: { instructorId: user.id },
    })
    if (result.count > 0) {
      linked += result.count
      console.log(`  ~ linked ${result.count} batch(es) → ${p.name}`)
    }
  }
  console.log(`[seed-instructor-profiles] Done. ${linked} batch(es) linked.`)
}

main()
  .catch((err) => {
    console.error("[seed-instructor-profiles] FAILED:", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
