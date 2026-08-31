import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

/**
 * GET /api/exams/attempts
 * AUTHENTICATED — list the current user's exam attempts.
 */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const attempts = await db.examAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      exam: {
        select: {
          id: true,
          slug: true,
          title: true,
          passingScore: true,
          certificationId: true,
          certification: { select: { name: true, slug: true, icon: true, color: true } },
        },
      },
    },
    take: 100,
  })

  return NextResponse.json({
    attempts: attempts.map((a) => ({
      id: a.id,
      examId: a.examId,
      status: a.status,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      score: a.score,
      totalQuestions: a.totalQuestions,
      correctAnswers: a.correctAnswers,
      timeSpent: a.timeSpent,
      createdAt: a.createdAt,
      exam: a.exam,
    })),
  })
}
