import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* GET /api/cyber-quiz/attempt/[attemptId]
 * Public endpoint (the attemptId is unguessable). Returns the attempt's
 * score + domain breakdown — used by the results page + progress report.
 * Does NOT reveal correct answers.
 */
export const GET = withErrorHandler(async (_req, { params }: { params: Promise<{ attemptId: string }> }) => {
  const { attemptId } = await params

  const attempt = await db.cyberQuizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      difficulty: true,
      score: true,
      totalQuestions: true,
      percentage: true,
      passed: true,
      domainScores: true,
      completedAt: true,
      certificateId: true,
      guestName: true,
      guestEmail: true,
    },
  })

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }

  let domainScores: Record<string, { correct: number; total: number }> = {}
  try {
    domainScores = JSON.parse(attempt.domainScores || "{}")
  } catch {}

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      difficulty: attempt.difficulty,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      passed: attempt.passed,
      domainScores,
      completedAt: attempt.completedAt?.toISOString() || null,
      certificateId: attempt.certificateId,
      guestName: attempt.guestName,
      guestEmail: attempt.guestEmail,
    },
  })
})
