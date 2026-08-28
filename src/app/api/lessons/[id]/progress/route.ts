import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { awardXp } from "@/lib/gamification"

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

  // fetch existing progress to detect transition
  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: id } },
  })
  const wasCompleted = existing?.completed ?? false
  const nowCompleted = completed ?? wasCompleted

  const progress = await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: id } },
    update: { completed: nowCompleted, position: position ?? existing?.position ?? 0 },
    create: { userId: user.id, lessonId: id, completed: nowCompleted, position: position ?? 0 },
  })

  // award XP only on transition from incomplete -> complete
  let xpAwarded: { newAchievements: any[]; leveledUp: boolean; newLevel: number } | null = null
  if (nowCompleted && !wasCompleted) {
    xpAwarded = await awardXp(user.id, "lesson_completed", 15, lesson.id)
  }

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

  // Auto-issue certificate at 100% + award cert XP
  if (pct === 100) {
    const existingCert = await db.certificate.findFirst({ where: { userId: user.id, courseId: lesson.module.courseId } })
    if (!existingCert) {
      await db.certificate.create({
        data: {
          userId: user.id,
          courseId: lesson.module.courseId,
          certificateId: `GX-${Date.now().toString(36).toUpperCase()}`,
          score: pct,
        },
      })
      xpAwarded = await awardXp(user.id, "cert_earned", 300, lesson.module.courseId)
      // notify about certificate
      const course = await db.course.findUnique({ where: { id: lesson.module.courseId }, select: { title: true } })
      const { notifyCertificate } = await import("@/lib/notifications")
      await notifyCertificate(user.id, course?.title ?? "Course", lesson.module.courseId)
    }
  }

  return NextResponse.json({ progress, courseProgress: pct, gamification: xpAwarded })
}
