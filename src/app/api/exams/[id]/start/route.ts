import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

/**
 * POST /api/exams/[id]/start
 * AUTHENTICATED — start a new exam attempt.
 *
 * - Validates the exam exists and is published.
 * - Enforces maxAttempts (count completed attempts).
 * - If a previous attempt is "in-progress", resumes it (returns the existing
 *   attempt + question set so the UI can continue).
 * - Otherwise creates a new ExamAttempt + ProctoringSession and returns
 *   the attempt + the question set (WITHOUT correct answers).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const exam = await db.exam.findUnique({
    where: { id },
    include: {
      questions: {
        select: {
          id: true,
          type: true,
          domain: true,
          skill: true,
          difficulty: true,
          question: true,
          options: true,
          points: true,
          tags: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!exam || exam.status !== "published") {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 })
  }

  // Look for an existing in-progress attempt — resume instead of creating new
  const inProgress = await db.examAttempt.findFirst({
    where: { userId: user.id, examId: exam.id, status: "in-progress" },
    orderBy: { createdAt: "desc" },
  })

  if (inProgress) {
    // Make sure a proctoring session exists for this attempt
    let proctoring = await db.proctoringSession.findUnique({
      where: { examAttemptId: inProgress.id },
    })
    if (!proctoring) {
      proctoring = await db.proctoringSession.create({
        data: {
          examAttemptId: inProgress.id,
          userId: user.id,
        },
      })
    }
    return NextResponse.json({
      attempt: {
        id: inProgress.id,
        status: inProgress.status,
        startedAt: inProgress.startedAt,
        submittedAt: inProgress.submittedAt,
      },
      exam: {
        id: exam.id,
        slug: exam.slug,
        title: exam.title,
        duration: exam.duration,
        passingScore: exam.passingScore,
        proctoringEnabled: exam.proctoringEnabled,
        shuffleQuestions: exam.shuffleQuestions,
        shuffleOptions: exam.shuffleOptions,
      },
      questions: exam.questions.map((q) => ({
        ...q,
        options: safeParse(q.options, [] as string[]),
        tags: safeParse(q.tags, [] as string[]),
      })),
      proctoring,
      resumed: true,
    })
  }

  // Enforce maxAttempts
  const completedCount = await db.examAttempt.count({
    where: {
      userId: user.id,
      examId: exam.id,
      status: { in: ["submitted", "graded", "passed", "failed"] },
    },
  })
  if (completedCount >= exam.maxAttempts) {
    return NextResponse.json(
      {
        error: `Maximum attempts (${exam.maxAttempts}) reached for this exam.`,
      },
      { status: 403 }
    )
  }

  // Create new attempt + proctoring session
  const attempt = await db.examAttempt.create({
    data: {
      examId: exam.id,
      userId: user.id,
      status: "in-progress",
      startedAt: new Date(),
      totalQuestions: exam.questions.length,
    },
  })

  const proctoring = await db.proctoringSession.create({
    data: {
      examAttemptId: attempt.id,
      userId: user.id,
      startedAt: new Date(),
    },
  })

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    },
    exam: {
      id: exam.id,
      slug: exam.slug,
      title: exam.title,
      duration: exam.duration,
      passingScore: exam.passingScore,
      proctoringEnabled: exam.proctoringEnabled,
      shuffleQuestions: exam.shuffleQuestions,
      shuffleOptions: exam.shuffleOptions,
    },
    questions: exam.questions.map((q) => ({
      ...q,
      options: safeParse(q.options, [] as string[]),
      tags: safeParse(q.tags, [] as string[]),
    })),
    proctoring,
    resumed: false,
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
