import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Lab Snapshot detail
// GET:    load snapshot
// DELETE: delete snapshot (owner only)
// ============================================================

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snap = await db.labSnapshot.findUnique({
    where: { id },
    include: { lab: { select: { id: true, title: true, category: true, color: true } } },
  })
  if (!snap) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 })
  if (snap.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json({
    snapshot: {
      id: snap.id,
      labId: snap.labId,
      labTitle: snap.lab?.title ?? "Unknown lab",
      labCategory: snap.lab?.category ?? "",
      labColor: snap.lab?.color ?? "violet",
      name: snap.name,
      description: snap.description,
      state: snap.state,
      createdAt: snap.createdAt,
    },
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snap = await db.labSnapshot.findUnique({ where: { id }, select: { userId: true } })
  if (!snap) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 })
  if (snap.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await db.labSnapshot.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
