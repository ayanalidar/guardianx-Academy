import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// PATCH /api/admin/site-content/[key] — update a single site content item.
// Body: { value: string, type?: string }
// If the key does not yet exist, it is created (upsert).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { value, type } = body

  if (typeof value !== "string") {
    return NextResponse.json({ error: "value (string) required" }, { status: 400 })
  }

  const updated = await db.siteContent.upsert({
    where: { key },
    update: { value, ...(typeof type === "string" ? { type } : {}) },
    create: { key, value, type: typeof type === "string" ? type : "text" },
  })

  return NextResponse.json({ item: updated })
}
