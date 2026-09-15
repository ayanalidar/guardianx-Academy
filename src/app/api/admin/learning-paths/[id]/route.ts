import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* PATCH /api/admin/learning-paths/[id] — ADMIN-only. Update any fields on a learning path. */
export const PATCH = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const data: any = {}
  const stringFields = [
    "title", "slug", "subtitle", "description", "vertical", "icon",
    "color", "tint", "difficulty", "duration", "careerOutcome",
  ]
  for (const f of stringFields) {
    if (body[f] !== undefined) data[f] = body[f] === null ? null : String(body[f]).trim()
  }
  // JSON-array fields — accept either a pre-stringified value or an array.
  for (const f of ["skills", "courses"]) {
    if (body[f] !== undefined) {
      data[f] = typeof body[f] === "string" ? body[f] : JSON.stringify(body[f] || [])
    }
  }
  if (body.skillsCount !== undefined) data.skillsCount = Number(body.skillsCount) || 0
  if (body.labsCount !== undefined) data.labsCount = Number(body.labsCount) || 0
  if (body.xpReward !== undefined) data.xpReward = Number(body.xpReward) || 0
  if (body.order !== undefined) data.order = Number(body.order) || 0
  if (body.published !== undefined) data.published = Boolean(body.published)
  if (body.featured !== undefined) data.featured = Boolean(body.featured)

  // Check slug uniqueness if changing
  if (data.slug) {
    const existing = await db.learningPath.findFirst({ where: { slug: data.slug, NOT: { id } } })
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
  }

  const learningPath = await db.learningPath.update({ where: { id }, data })
  return NextResponse.json({ learningPath })
})

/* DELETE /api/admin/learning-paths/[id] — ADMIN-only. Delete a learning path. */
export const DELETE = withErrorHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await db.learningPath.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
