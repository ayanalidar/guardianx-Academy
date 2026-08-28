import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { awardXp, XP_REWARDS } from "@/lib/gamification"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const lab = await db.lab.findUnique({ where: { slug } })
  if (!lab) return NextResponse.json({ error: "Lab not found" }, { status: 404 })

  const { flag, action } = await req.json()

  // start / hint / submit
  let progress = await db.labProgress.findUnique({ where: { userId_labId: { userId: user.id, labId: lab.id } } })
  if (!progress) {
    progress = await db.labProgress.create({
      data: { userId: user.id, labId: lab.id, status: "in_progress", startedAt: new Date() },
    })
  }

  if (action === "hint") {
    progress = await db.labProgress.update({
      where: { id: progress.id },
      data: { hintsUsed: { increment: 1 } },
    })
    const hints = lab.hints.split("|").filter(Boolean)
    return NextResponse.json({ hint: hints[Math.min(progress.hintsUsed - 1, hints.length - 1)] ?? "No more hints available." })
  }

  if (action === "submit") {
    const correct = flag?.trim() === lab.flag
    let gamification = null
    if (correct && progress.status !== "completed") {
      progress = await db.labProgress.update({
        where: { id: progress.id },
        data: { status: "completed", flagFound: true, completedAt: new Date() },
      })
      // award XP based on difficulty, minus hint penalty (10 per hint used)
      const baseXp = (XP_REWARDS.lab_solved as any)[lab.difficulty] ?? 100
      const xp = Math.max(baseXp - progress.hintsUsed * 10, baseXp / 2)
      gamification = await awardXp(user.id, "lab_solved", xp, lab.id)
    }
    return NextResponse.json({ correct, flag: correct ? lab.flag : null, gamification })
  }

  return NextResponse.json({ progress })
}
