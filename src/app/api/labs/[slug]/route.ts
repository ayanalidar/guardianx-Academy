import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lab = await db.lab.findUnique({ where: { slug } })
  if (!lab) return NextResponse.json({ error: "Lab not found" }, { status: 404 })

  const user = await getCurrentUser()
  let progress = null
  if (user) {
    progress = await db.labProgress.findUnique({ where: { userId_labId: { userId: user.id, labId: lab.id } } })
  }

  // Don't leak the flag in listing but do expose for the lab detail (lab is interactive)
  return NextResponse.json({ lab, progress })
}
