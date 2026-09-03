import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const GET = withErrorHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const user = await getCurrentUser()

  const course = await db.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true, title: true, avatar: true, bio: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              durationMin: true,
              order: true,
              preview: true,
              pdfPages: true,
            },
          },
        },
      },
      labs: { select: { id: true, title: true, slug: true, difficulty: true, category: true, points: true } },
      _count: { select: { enrollments: true, discussions: true } },
    },
  })

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  let enrollment: Awaited<ReturnType<typeof db.enrollment.findUnique>> = null
  let lessonProgress: Record<string, { completed: boolean; position: number }> = {}
  if (user) {
    enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    })
    const progress = await db.lessonProgress.findMany({
      where: { userId: user.id, lesson: { module: { courseId: course.id } } },
    })
    for (const p of progress) {
      lessonProgress[p.lessonId] = { completed: p.completed, position: p.position }
    }
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const completedLessons = Object.values(lessonProgress).filter((p) => p.completed).length

  return NextResponse.json({
    course,
    enrollment,
    lessonProgress,
    totalLessons,
    completedLessons,
    progressPct: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
  })
})
