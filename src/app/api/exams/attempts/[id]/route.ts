import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

/**
 * GET /api/exams/attempts/[id]
 * AUTHENTICATED — attempt details with persisted answers + grading breakdown.
 * Verifies ownership before returning data.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const attempt = await db.examAttempt.findUnique({
    where: { id },
    include: {
      exam: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          duration: true,
          passingScore: true,
          questionType: true,
          proctoringEnabled: true,
          certificationId: true,
          certification: {
            select: {
              id: true,
              slug: true,
              name: true,
              level: true,
              icon: true,
              color: true,
              validityPeriod: true,
            },
          },
        },
      },
    },
  })

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 })
  }
  if (attempt.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  // For graded attempts, also pull the full question set so the UI can render
  // the answer review (correct answer, explanation, etc.)
  let questions: any[] = []
  if (["submitted", "graded", "passed", "failed"].includes(attempt.status)) {
    const qs = await db.questionBank.findMany({
      where: { examId: attempt.examId },
      select: {
        id: true,
        type: true,
        domain: true,
        skill: true,
        difficulty: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        points: true,
      },
      orderBy: { createdAt: "asc" },
    })
    questions = qs.map((q) => ({
      ...q,
      options: safeParse(q.options, [] as string[]),
      correctAnswer: safeParse(q.correctAnswer, null),
    }))
  }

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      examId: attempt.examId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      answers: safeParse(attempt.answers, []),
      proctorFlags: safeParse(attempt.proctorFlags, []),
      timeSpent: attempt.timeSpent,
      createdAt: attempt.createdAt,
    },
    exam: attempt.exam,
    questions,
  })
}

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
