import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { completed, position } = await req.json()
  const lesson = await db.lesson.findUnique({ where: { id }, include: { module: { select: { courseId: true } } } })
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lesson.module.courseId } },
  })
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 })

  const progress = await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: id } },
    update: { completed: completed ?? undefined, position: position ?? undefined },
    create: { userId: user.id, lessonId: id, completed: completed ?? false, position: position ?? 0 },
  })

  // recompute course progress %
  const courseLessons = await db.lesson.findMany({
    where: { module: { courseId: lesson.module.courseId } },
    select: { id: true },
  })
  const done = await db.lessonProgress.count({
    where: { userId: user.id, lessonId: { in: courseLessons.map((l) => l.id) }, completed: true },
  })
  const pct = courseLessons.length ? Math.round((done / courseLessons.length) * 100) : 0
  await db.enrollment.update({
    where: { userId_courseId: { userId: user.id, courseId: lesson.module.courseId } },
    data: { progress: pct, completed: pct === 100, lastAccessed: new Date() },
  })

  // Auto-issue certificate at 100%
  if (pct === 100) {
    const existing = await db.certificate.findFirst({ where: { userId: user.id, courseId: lesson.module.courseId } })
    if (!existing) {
      await db.certificate.create({
        data: {
          userId: user.id,
          courseId: lesson.module.courseId,
          certificateId: `GX-${Date.now().toString(36).toUpperCase()}`,
          score: pct,
        },
      })
    }
  }

  return NextResponse.json({ progress, courseProgress: pct })
}
