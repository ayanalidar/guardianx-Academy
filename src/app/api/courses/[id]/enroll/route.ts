import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const course = await db.course.findUnique({ where: { id } })
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: id } },
  })
  if (existing) return NextResponse.json({ enrollment: existing })

  const enrollment = await db.enrollment.create({
    data: { userId: user.id, courseId: id, lastAccessed: new Date() },
  })
  await db.course.update({
    where: { id },
    data: { studentsCount: { increment: 1 } },
  })
  return NextResponse.json({ enrollment })
}
