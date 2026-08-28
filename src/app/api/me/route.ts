import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { levelFromXp, rankTitle } from "@/lib/gamification"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null })

  const [enrollmentCount, completedCount, notesCount, labCount, certCount, attempts, gamified] = await Promise.all([
    db.enrollment.count({ where: { userId: user.id } }),
    db.enrollment.count({ where: { userId: user.id, completed: true } }),
    db.note.count({ where: { userId: user.id } }),
    db.labProgress.count({ where: { userId: user.id, status: "completed" } }),
    db.certificate.count({ where: { userId: user.id } }),
    db.quizAttempt.findMany({ where: { userId: user.id }, select: { score: true } }),
    db.user.findUnique({ where: { id: user.id }, select: { xp: true, level: true, streak: true } }),
  ])

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length)
    : 0

  const xp = gamified?.xp ?? 0
  const levelInfo = levelFromXp(xp)

  return NextResponse.json({
    user,
    stats: {
      enrollments: enrollmentCount,
      completed: completedCount,
      notes: notesCount,
      labsDone: labCount,
      certificates: certCount,
      avgScore,
    },
    gamification: {
      xp,
      level: levelInfo.level,
      streak: gamified?.streak ?? 0,
      rank: rankTitle(levelInfo.level),
      levelInfo,
    },
  })
}
