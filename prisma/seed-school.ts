// Seed a demo school for institution login — run with: bun run prisma/seed-school.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  console.log("Seeding demo schools...")

  const schools = [
    {
      schoolCode: "GXS-DELHI-001",
      name: "Delhi Public School of Cyber Sciences",
      type: "SCHOOL",
      email: "info@dpscyber.edu.in",
      phone: "+91 11 2345 6789",
      address: "Sector 12, R.K. Puram",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      website: "https://dpscyber.edu.in",
      adminName: "Dr. Anita Sharma",
      adminEmail: "admin@dpscyber.edu.in",
      password: "school123",
      maxStudents: 300,
    },
    {
      schoolCode: "GXC-MUMBAI-002",
      name: "Mumbai Institute of Technology",
      type: "COLLEGE",
      email: "contact@mitcyber.ac.in",
      phone: "+91 22 2654 3210",
      address: "Powai, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      website: "https://mitcyber.ac.in",
      adminName: "Prof. Rajesh Iyer",
      adminEmail: "principal@mitcyber.ac.in",
      password: "college123",
      maxStudents: 1000,
    },
    {
      schoolCode: "GXU-BANGALORE-003",
      name: "Bangalore Cyber Security University",
      type: "UNIVERSITY",
      email: "registrar@bcsu.edu.in",
      phone: "+91 80 2293 9876",
      address: "Jnanabharathi Campus",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      website: "https://bcsu.edu.in",
      adminName: "Dr. Lakshmi Venkatesh",
      adminEmail: "vc@bcsu.edu.in",
      password: "university123",
      maxStudents: 2000,
    },
  ]

  for (const s of schools) {
    const { password, ...rest } = s
    const passwordHash = bcrypt.hashSync(password, 10)
    const existing = await db.school.findUnique({ where: { schoolCode: rest.schoolCode } })
    if (existing) {
      await db.school.update({ where: { id: existing.id }, data: { ...rest, passwordHash } })
      console.log(`  Updated: ${rest.name} (${rest.schoolCode})`)
    } else {
      await db.school.create({ data: { ...rest, passwordHash } })
      console.log(`  Created: ${rest.name} (${rest.schoolCode})`)
    }
  }

  console.log("\nDemo school login credentials:")
  console.log("  School:     GXS-DELHI-001 | admin@dpscyber.edu.in | school123")
  console.log("  College:    GXC-MUMBAI-002 | principal@mitcyber.ac.in | college123")
  console.log("  University: GXU-BANGALORE-003 | vc@bcsu.edu.in | university123")
  console.log("\nDone.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
