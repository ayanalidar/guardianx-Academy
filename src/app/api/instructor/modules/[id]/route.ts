import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// Update a module (instructor only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // module id
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const moduleData = await db.module.findUnique({
    where: { id },
    include: { course: { select: { instructorId: true } } },
  })
  if (!moduleData) return NextResponse.json({ error: "Module not found" }, { status: 404 })
  if (user.role !== "ADMIN" && moduleData.course.instructorId !== user.id) {
    return NextResponse.json({ error: "Not your course" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description } = body
  const updated = await db.module.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    },
  })
  return NextResponse.json({ module: updated })
}

// Delete a module (and all its lessons via cascade)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const moduleData = await db.module.findUnique({
    where: { id },
    include: { course: { select: { instructorId: true } } },
  })
  if (!moduleData) return NextResponse.json({ error: "Module not found" }, { status: 404 })
  if (user.role !== "ADMIN" && moduleData.course.instructorId !== user.id) {
    return NextResponse.json({ error: "Not your course" }, { status: 403 })
  }

  await db.module.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
