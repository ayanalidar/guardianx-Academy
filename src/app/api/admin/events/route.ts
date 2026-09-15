import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* GET /api/admin/events — ADMIN-only. Returns ALL events (incl. unpublished). */
export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const events = await db.event.findMany({
    orderBy: [{ order: "asc" }, { startIsoDate: "asc" }],
  })
  return NextResponse.json({ events, count: events.length })
})

/* POST /api/admin/events — ADMIN-only. Create a new event. */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const { title, slug, type, category, description, longDescription, startDate, startIsoDate, endDate, time, venue, mode, organizer, instructor, capacity, fee, status, imageUrl, tags, featured, order, published } = body

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })
  if (!slug?.trim()) return NextResponse.json({ error: "Slug is required" }, { status: 400 })

  // Check slug uniqueness
  const existing = await db.event.findUnique({ where: { slug: slug.trim() } })
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 400 })

  const event = await db.event.create({
    data: {
      title: title.trim(),
      slug: slug.trim(),
      type: type || "workshop",
      category: category || "General",
      description: description || "",
      longDescription: longDescription || "",
      startDate: startDate || "",
      startIsoDate: startIsoDate || null,
      endDate: endDate || "",
      time: time || "",
      venue: venue || "Online",
      mode: mode || "Live Online",
      organizer: organizer || "GuardianX",
      instructor: instructor || null,
      capacity: Number(capacity) || 100,
      registered: 0,
      fee: fee || "Free",
      status: status || "Open",
      imageUrl: imageUrl || null,
      tags: tags || "",
      featured: Boolean(featured),
      order: Number(order) || 0,
      published: published !== undefined ? Boolean(published) : true,
    },
  })

  return NextResponse.json({ event }, { status: 201 })
})
