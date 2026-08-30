import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Lab Snapshots & Save States
// GET:  ?labId=... → list user's snapshots for a lab (or all)
// POST: { labId, name, description, state } → create snapshot
// ============================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const labId = searchParams.get("labId")
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where: any = { userId: user.id }
  if (labId) where.labId = labId

  const snapshots = await db.labSnapshot.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { lab: { select: { id: true, title: true, category: true, color: true } } },
  })

  return NextResponse.json({
    snapshots: snapshots.map((s) => ({
      id: s.id,
      labId: s.labId,
      labTitle: s.lab?.title ?? "Unknown lab",
      labCategory: s.lab?.category ?? "",
      labColor: s.lab?.color ?? "violet",
      name: s.name,
      description: s.description,
      state: s.state,
      createdAt: s.createdAt,
    })),
  })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { labId, name, description, state } = body
  if (!labId) return NextResponse.json({ error: "labId required" }, { status: 400 })

  const lab = await db.lab.findUnique({ where: { id: labId }, select: { id: true } })
  if (!lab) return NextResponse.json({ error: "Lab not found" }, { status: 404 })

  const snapshot = await db.labSnapshot.create({
    data: {
      userId: user.id,
      labId,
      name: name?.trim() || `Snapshot ${new Date().toLocaleString()}`,
      description: description ?? "",
      state: typeof state === "string" ? state : JSON.stringify(state ?? {}),
    },
  })

  return NextResponse.json({ snapshot }, { status: 201 })
}
