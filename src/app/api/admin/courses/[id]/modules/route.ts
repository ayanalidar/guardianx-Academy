import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// Create a new module in a course (admin only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // course id
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const course = await db.course.findUnique({ where: { id } })
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  const body = await req.json()
  const { title, description, order } = body
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 })

  const moduleCount = await db.module.count({ where: { courseId: id } })
  const module_ = await db.module.create({
    data: {
      courseId: id,
      title: title.trim(),
      description: description || "",
      order: order !== undefined ? Number(order) : moduleCount,
    },
  })
  return NextResponse.json({ module: module_ })
}
