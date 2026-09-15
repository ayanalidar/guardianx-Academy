import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* PATCH /api/admin/events/[id] — ADMIN-only. Update an event. */
export const PATCH = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const data: any = {}
  const fields = ["title","slug","type","category","description","longDescription","startDate","startIsoDate","endDate","time","venue","mode","organizer","instructor","capacity","fee","status","imageUrl","tags"]
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = typeof body[f] === "string" ? body[f].trim() : body[f]
  }
  if (body.featured !== undefined) data.featured = Boolean(body.featured)
  if (body.order !== undefined) data.order = Number(body.order)
  if (body.published !== undefined) data.published = Boolean(body.published)
  if (body.registered !== undefined) data.registered = Number(body.registered)

  // Check slug uniqueness if changing
  if (data.slug) {
    const existing = await db.event.findFirst({ where: { slug: data.slug, NOT: { id } } })
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
  }

  const event = await db.event.update({ where: { id }, data })
  return NextResponse.json({ event })
})

/* DELETE /api/admin/events/[id] — ADMIN-only. Delete an event. */
export const DELETE = withErrorHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await db.event.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
