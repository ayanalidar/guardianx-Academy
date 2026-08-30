import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// GET /api/admin/users — list all users with pagination (50/page), search, role filter
export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(req.url)
  const q = url.searchParams.get("q")?.trim() || undefined
  const role = url.searchParams.get("role") || undefined
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
  const pageSize = 50

  const where: { role?: string; OR?: { email?: { contains: string }; name?: { contains: string } }[] } = {}
  if (role && role !== "ALL") where.role = role
  if (q) {
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q } },
    ]
  }

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        title: true,
        bio: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            labProgress: true,
            taughtCourses: true,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      title: u.title,
      bio: u.bio,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      createdAt: u.createdAt,
      enrollmentCount: u._count.enrollments,
      certificateCount: u._count.certificates,
      labProgressCount: u._count.labProgress,
      taughtCoursesCount: u._count.taughtCourses,
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  })
}

// POST /api/admin/users — create a new user (ADMIN only)
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const { name, email, password, role } = body as {
    name?: string
    email?: string
    password?: string
    role?: string
  }

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })
  if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 })
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }
  const validRoles = ["STUDENT", "INSTRUCTOR", "ADMIN", "SCHOOL_ADMIN"]
  const finalRole = validRoles.includes(role ?? "") ? (role as string) : "STUDENT"

  const existing = await db.user.findUnique({ where: { email: email.trim() } })
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  const passwordHash = bcrypt.hashSync(password, 10)
  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      role: finalRole,
      title:
        finalRole === "INSTRUCTOR"
          ? "Security Instructor"
          : finalRole === "ADMIN"
          ? "Platform Administrator"
          : finalRole === "SCHOOL_ADMIN"
          ? "School Administrator"
          : "Student",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      title: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user }, { status: 201 })
}
