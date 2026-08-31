import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// GET /api/admin/instructors — list all instructors with their profiles + workload
export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const instructors = await db.user.findMany({
    where: { role: "INSTRUCTOR" },
    include: {
      instructorProfile: true,
      taughtCourses: { select: { id: true, title: true } },
      _count: { select: { taughtCourses: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Count current batches per instructor via live sessions they host
  const instructorIds = instructors.map((i) => i.id)
  const liveSessions = await db.liveSession.groupBy({
    by: ["hostId"],
    where: { hostId: { in: instructorIds }, status: "live" },
    _count: { id: true },
  })
  const liveCountMap = new Map(liveSessions.map((l) => [l.hostId, l._count.id]))

  const result = instructors.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    title: u.title,
    bio: u.bio,
    role: u.role,
    profile: u.instructorProfile
      ? {
          phone: u.instructorProfile.phone,
          expertise: safeParse(u.instructorProfile.expertise, []),
          yearsExperience: u.instructorProfile.yearsExperience,
          certifications: safeParse(u.instructorProfile.certifications, []),
          linkedinUrl: u.instructorProfile.linkedinUrl,
          maxBatches: u.instructorProfile.maxBatches,
        }
      : null,
    currentBatches: liveCountMap.get(u.id) ?? 0,
    taughtCourses: u._count.taughtCourses,
    createdAt: u.createdAt,
  }))

  return NextResponse.json({ instructors: result, count: result.length })
}

// POST /api/admin/instructors — create a new instructor (User + InstructorProfile)
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const {
    name,
    email,
    phone,
    title,
    bio,
    expertise,
    yearsExperience,
    certifications,
    avatar,
    linkedinUrl,
    maxBatches,
    password,
  } = body as {
    name?: string
    email?: string
    phone?: string
    title?: string
    bio?: string
    expertise?: string[]
    yearsExperience?: number
    certifications?: string[]
    avatar?: string
    linkedinUrl?: string
    maxBatches?: number
    password?: string
  }

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })
  if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const existing = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  // Use provided password or default to a secure-ish placeholder (instructor should reset)
  const finalPassword = password && password.length >= 6 ? password : "GuardianX@123"

  const passwordHash = bcrypt.hashSync(finalPassword, 10)

  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: "INSTRUCTOR",
      avatar: avatar?.trim() || null,
      title: title?.trim() || "Security Instructor",
      bio: bio?.trim() || null,
      instructorProfile: {
        create: {
          phone: phone?.trim() || null,
          expertise: JSON.stringify(expertise ?? []),
          yearsExperience: Number(yearsExperience) || 0,
          certifications: JSON.stringify(certifications ?? []),
          linkedinUrl: linkedinUrl?.trim() || null,
          maxBatches: Number(maxBatches) || 3,
        },
      },
    },
    include: { instructorProfile: true },
  })

  return NextResponse.json(
    {
      instructor: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        title: user.title,
        bio: user.bio,
        profile: user.instructorProfile
          ? {
              phone: user.instructorProfile.phone,
              expertise: safeParse(user.instructorProfile.expertise, []),
              yearsExperience: user.instructorProfile.yearsExperience,
              certifications: safeParse(user.instructorProfile.certifications, []),
              linkedinUrl: user.instructorProfile.linkedinUrl,
              maxBatches: user.instructorProfile.maxBatches,
            }
          : null,
        currentBatches: 0,
        taughtCourses: 0,
        createdAt: user.createdAt,
      },
    },
    { status: 201 },
  )
}

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
