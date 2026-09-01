import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { randomBytes } from "crypto"

// Generate a unique school code (e.g. "GXA-7K3M9P")
function generateSchoolCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no confusing chars (0/O, 1/I)
  const random = Array.from(randomBytes(6)).map((b) => chars[b % chars.length]).join("")
  return `GXA-${random}`
}

// POST /api/school/onboard
// Creates a School record (with unique schoolCode) and links it to the current user.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // If the user already has a school, they cannot onboard again
  const existing = await db.user.findUnique({
    where: { id: user.id },
    select: { schoolId: true, school: true },
  })
  if (existing?.schoolId && existing.school) {
    return NextResponse.json({
      school: existing.school,
      message: "You already have a school associated with your account.",
    })
  }

  const body = await req.json()
  const { name, address, city, contactPerson, contactEmail, contactPhone } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "School name is required" }, { status: 400 })
  }
  if (!contactEmail?.trim()) {
    return NextResponse.json({ error: "Contact email is required" }, { status: 400 })
  }

  // Generate a unique school code (retry if collision)
  let schoolCode = generateSchoolCode()
  let attempts = 0
  while (attempts < 5) {
    const collision = await db.school.findUnique({ where: { schoolCode } })
    if (!collision) break
    schoolCode = generateSchoolCode()
    attempts++
  }

  // Create the school and link it to the user in a single transaction
  const school = await db.$transaction(async (tx) => {
    const created = await tx.school.create({
      data: {
        name: name.trim(),
        schoolCode,
        address: address?.trim() || null,
        city: city?.trim() || null,
        contactPerson: contactPerson?.trim() || null,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone?.trim() || null,
      },
    })
    await tx.user.update({
      where: { id: user.id },
      data: { schoolId: created.id },
    })
    return created
  })

  return NextResponse.json({
    school,
    schoolCode: school.schoolCode,
    message: "School onboarded successfully! Share this School Code with your staff so they can log in via the School Portal tab.",
  })
}
