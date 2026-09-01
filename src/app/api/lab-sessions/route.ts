import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import crypto from "crypto"
export const runtime = "nodejs"
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const sessions = await db.labSession.findMany({ where: { userId: user.id }, include: { lab: { select: { title: true, category: true, difficulty: true } } }, orderBy: { createdAt: "desc" } }); return NextResponse.json({ sessions }) } catch { return NextResponse.json({ sessions: [] }) }
}
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { labId } = await req.json()
  if (!labId) return NextResponse.json({ error: "Lab ID required" }, { status: 400 })
  const lab = await db.lab.findUnique({ where: { id: labId } })
  if (!lab) return NextResponse.json({ error: "Lab not found" }, { status: 404 })
  const existing = await db.labSession.findFirst({ where: { labId, userId: user.id, status: { in: ["starting", "active"] } } })
  if (existing) return NextResponse.json({ session: existing, message: "Session already active" })
  const dynamicFlag = `GX{${crypto.randomBytes(8).toString("hex")}}`
  const sessionIp = `10.10.${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}`
  const sessionPort = String(22 + Math.floor(Math.random()*10))
  const expiresAt = new Date(Date.now() + 2*60*60*1000)
  const session = await db.labSession.create({ data: { labId, userId: user.id, status: "active", sessionIp, sessionPort, dynamicFlag, expiresAt } })
  return NextResponse.json({ session, lab: { title: lab.title, category: lab.category } }, { status: 201 })
}
