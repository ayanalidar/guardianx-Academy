import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// POST /api/admin/leads/[id]/notes — add a note to a lead
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const { content } = body as { content?: string }
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 })

  const lead = await db.lead.findUnique({ where: { id } })
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  const note = await db.leadNote.create({
    data: {
      leadId: id,
      authorId: currentUser.id,
      content: content.trim(),
    },
  })

  return NextResponse.json({ note }, { status: 201 })
}
