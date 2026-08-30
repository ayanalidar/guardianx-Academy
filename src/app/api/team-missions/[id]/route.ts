import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Team Mission Session detail
// GET:  session detail (mission + members + objectives)
// POST: { action: "join", role? } joins the session as a member
// ============================================================

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await db.teamMissionSession.findUnique({
    where: { id },
    include: {
      mission: true,
      members: {
        include: { user: { select: { id: true, name: true, avatar: true, title: true } } },
      },
    },
  })
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      score: session.score,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      createdAt: session.createdAt,
      mission: {
        id: session.mission.id,
        title: session.mission.title,
        description: session.mission.description,
        scenario: session.mission.scenario,
        maxTeamSize: session.mission.maxTeamSize,
        duration: session.mission.duration,
        difficulty: session.mission.difficulty,
        objectives: JSON.parse(session.mission.objectives || "[]"),
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

  const session = await db.teamMissionSession.findUnique({
    where: { id },
    include: { mission: true, members: true },
  })
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
  if (session.status !== "waiting") {
    return NextResponse.json({ error: "Session is no longer open for joins" }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const role = body?.role ?? "scanner"

  if (session.members.some((m) => m.userId === user.id)) {
    return NextResponse.json({ error: "You are already in this session" }, { status: 400 })
  }
  if (session.members.length >= session.mission.maxTeamSize) {
    return NextResponse.json({ error: "Team is full" }, { status: 400 })
  }

  await db.teamMissionMember.create({
    data: { sessionId: id, userId: user.id, role },
  })

  const updated = await db.teamMissionSession.findUnique({
    where: { id },
    include: {
      mission: true,
      members: { include: { user: { select: { id: true, name: true, avatar: true, title: true } } } },
    },
  })

  return NextResponse.json({
    session: {
      id: updated!.id,
      status: updated!.status,
      score: updated!.score,
      startedAt: updated!.startedAt,
      completedAt: updated!.completedAt,
      createdAt: updated!.createdAt,
      mission: {
        id: updated!.mission.id,
        title: updated!.mission.title,
        description: updated!.mission.description,
        scenario: updated!.mission.scenario,
        maxTeamSize: updated!.mission.maxTeamSize,
        duration: updated!.mission.duration,
        difficulty: updated!.mission.difficulty,
        objectives: JSON.parse(updated!.mission.objectives || "[]"),
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
