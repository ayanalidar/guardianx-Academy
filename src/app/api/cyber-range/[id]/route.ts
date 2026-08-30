import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Cyber Range Session detail
// GET:  session detail (range + members)
// POST: { role } join the session
// ============================================================

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await db.cyberRangeSession.findUnique({
    where: { id },
    include: {
      range: true,
      members: { include: { user: { select: { id: true, name: true, avatar: true, title: true } } } },
    },
  })
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      createdAt: session.createdAt,
      range: {
        id: session.range.id,
        name: session.range.name,
        description: session.range.description,
        topology: JSON.parse(session.range.topology || "{}"),
        machines: JSON.parse(session.range.machines || "[]"),
        maxUsers: session.range.maxUsers,
        difficulty: session.range.difficulty,
        duration: session.range.duration,
      },
      members: session.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        avatar: m.user.avatar,
        title: m.user.title,
        role: m.role,
        isMe: m.userId === user.id,
      })),
      isMember: session.members.some((m) => m.userId === user.id),
      isLeader: session.leaderId === user.id,
    },
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await db.cyberRangeSession.findUnique({
    where: { id },
    include: { range: true, members: true },
  })
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
  if (session.status !== "waiting") {
    return NextResponse.json({ error: "Session is no longer open for joins" }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const role = body?.role ?? "attacker"

  if (session.members.some((m) => m.userId === user.id)) {
    return NextResponse.json({ error: "You are already in this session" }, { status: 400 })
  }
  if (session.members.length >= session.range.maxUsers) {
    return NextResponse.json({ error: "Range is full" }, { status: 400 })
  }

  await db.cyberRangeMember.create({
    data: { sessionId: id, userId: user.id, role },
  })

  const updated = await db.cyberRangeSession.findUnique({
    where: { id },
    include: {
      range: true,
      members: { include: { user: { select: { id: true, name: true, avatar: true, title: true } } } },
    },
  })

  return NextResponse.json({
    session: {
      id: updated!.id,
      status: updated!.status,
      startedAt: updated!.startedAt,
      endedAt: updated!.endedAt,
      createdAt: updated!.createdAt,
      range: {
        id: updated!.range.id,
        name: updated!.range.name,
        description: updated!.range.description,
        topology: JSON.parse(updated!.range.topology || "{}"),
        machines: JSON.parse(updated!.range.machines || "[]"),
        maxUsers: updated!.range.maxUsers,
        difficulty: updated!.range.difficulty,
        duration: updated!.range.duration,
      },
      members: updated!.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        avatar: m.user.avatar,
        title: m.user.title,
        role: m.role,
        isMe: m.userId === user.id,
      })),
      isMember: true,
      isLeader: updated!.leaderId === user.id,
    },
  })
}
