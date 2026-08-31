import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// GET /api/cms/[page] — public. Returns all content for a page.
// Shape: { page, sections: { [section]: { [key]: value } } }
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params

  const items = await db.siteContent.findMany({
    where: { page },
    orderBy: [{ section: "asc" }, { key: "asc" }],
  })

  const sections: Record<string, Record<string, any>> = {}
  let updatedAt: Date | null = null
  for (const it of items) {
    if (!sections[it.section]) sections[it.section] = {}
    sections[it.section][it.key] = it.value
    if (!updatedAt || it.updatedAt > updatedAt) updatedAt = it.updatedAt
  }

  return NextResponse.json({
    page,
    sections,
    updatedAt: updatedAt?.toISOString() ?? null,
  })
}

// PUT /api/cms/[page] — admin only. Batch upsert content for a page.
// Body: { items: [{ section, key, value }, ...] }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { page } = await params

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const items: Array<{ section: string; key: string; value: any }> = body?.items
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items[] is required" }, { status: 400 })
  }

  // Validate each item
  for (const it of items) {
    if (!it.section || !it.key || it.value === undefined) {
      return NextResponse.json(
        { error: "Each item must have section, key, value" },
        { status: 400 }
      )
    }
  }

  // Run upserts sequentially (Neon has connection limits; avoids deadlocks on the unique index)
  const results = []
  for (const it of items) {
    const created = await db.siteContent.upsert({
      where: { page_section_key: { page, section: it.section, key: it.key } },
      create: { page, section: it.section, key: it.key, value: it.value, updatedBy: user.id },
      update: { value: it.value, updatedBy: user.id },
    })
    results.push(created)
  }

  return NextResponse.json({ count: results.length, page })
}
