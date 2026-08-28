import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()
  if (q.length < 1) return NextResponse.json({ courses: [], labs: [], notes: [] })

  const user = await getCurrentUser()

  const [courses, labs, notes] = await Promise.all([
    db.course.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { shortName: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 6,
      select: { id: true, slug: true, title: true, shortName: true, category: true, level: true, color: true },
    }),
    db.lab.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 6,
      select: { id: true, slug: true, title: true, category: true, difficulty: true, points: true, color: true },
    }),
    user
      ? db.note.findMany({
          where: {
            userId: user.id,
            OR: [
              { title: { contains: q } },
              { content: { contains: q } },
            ],
          },
          take: 6,
          include: {
            lesson: { select: { id: true, title: true, module: { select: { course: { select: { id: true, shortName: true } } } } } },
          },
        })
      : Promise.resolve([]),
  ])

  return NextResponse.json({
    courses,
    labs,
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      color: n.color,
      lessonId: n.lessonId,
      courseId: n.courseId,
      lesson: n.lesson
        ? {
            id: n.lesson.id,
            title: n.lesson.title,
            courseId: n.lesson.module.course.id,
            courseShortName: n.lesson.module.course.shortName,
          }
        : null,
    })),
  })
}
