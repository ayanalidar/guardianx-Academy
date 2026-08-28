import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const level = searchParams.get("level")
  const q = searchParams.get("q")
  const enrolledOnly = searchParams.get("enrolled") === "true"
  const userIdParam = searchParams.get("userId")

  const currentUser = await getCurrentUser()
  const userId = userIdParam || currentUser?.id

  const where: any = { published: true }
  if (category && category !== "All") where.category = category
  if (level && level !== "All") where.level = level
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { shortName: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
    ]
  }
  if (enrolledOnly) {
    if (!userId) return NextResponse.json({ courses: [] })
    where.enrollments = { some: { userId } }
  }

  const courses = await db.course.findMany({
    where,
    include: {
      instructor: { select: { id: true, name: true, title: true, avatar: true } },
      modules: { select: { id: true, lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } },
      ...(enrolledOnly && userId
        ? { enrollments: { where: { userId }, select: { progress: true, completed: true, lastAccessed: true, enrolledAt: true } } }
        : {}),
    },
    orderBy: enrolledOnly ? { enrollments: { _count: "desc" } } : { studentsCount: "desc" },
  })

  const result = courses.map((c) => {
    const lessonCount = c.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const enrollment = enrolledOnly ? c.enrollments?.[0] : null
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      shortName: c.shortName,
      description: c.description,
      category: c.category,
      level: c.level,
      durationHours: c.durationHours,
      price: c.price,
      rating: c.rating,
      studentsCount: c.studentsCount,
      color: c.color,
      tags: c.tags,
      certBody: c.certBody,
      instructor: c.instructor,
      lessonCount,
      moduleCount: c.modules.length,
      enrollment: enrollment
        ? {
            progress: enrollment.progress,
            completed: enrollment.completed,
            lastAccessed: enrollment.lastAccessed,
            enrolledAt: enrollment.enrolledAt,
          }
        : null,
    }
  })

  return NextResponse.json({ courses: result })
}
