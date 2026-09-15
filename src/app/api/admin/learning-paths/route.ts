import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* GET /api/admin/learning-paths — ADMIN-only. Returns ALL learning paths (incl. unpublished). */
export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const learningPaths = await db.learningPath.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json({ learningPaths, count: learningPaths.length })
})

/* POST /api/admin/learning-paths — ADMIN-only. Create a new learning path. */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const {
    slug, title, subtitle, description, vertical, icon, color, tint,
    difficulty, duration, skillsCount, labsCount, xpReward, careerOutcome,
    skills, courses, order, published, featured,
  } = body

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })
  if (!slug?.trim()) return NextResponse.json({ error: "Slug is required" }, { status: 400 })

  // Check slug uniqueness
  const existing = await db.learningPath.findUnique({ where: { slug: slug.trim() } })
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 400 })

  const learningPath = await db.learningPath.create({
    data: {
      title: title.trim(),
      slug: slug.trim(),
      subtitle: subtitle?.trim() || null,
      description: description || "",
      vertical: vertical || "cyber",
      icon: icon || "Route",
      color: color || "text-violet-300",
      tint: tint || "bg-violet-500/10",
      difficulty: difficulty || "Beginner",
      duration: duration || "12 weeks",
      skillsCount: Number(skillsCount) || 0,
      labsCount: Number(labsCount) || 0,
      xpReward: Number(xpReward) || 5000,
      careerOutcome: careerOutcome?.trim() || null,
      skills: typeof skills === "string" ? skills : JSON.stringify(skills || []),
      courses: typeof courses === "string" ? courses : JSON.stringify(courses || []),
      order: Number(order) || 0,
      published: published !== undefined ? Boolean(published) : true,
      featured: Boolean(featured),
    },
  })

  return NextResponse.json({ learningPath }, { status: 201 })
})
