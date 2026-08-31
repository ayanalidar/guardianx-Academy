import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

/**
 * POST /api/exams/[id]/submit
 * AUTHENTICATED — submit exam answers, calculate score, return result.
 *
 * Body shape:
 *   {
 *     attemptId: string,
 *     answers: Array<{
 *       questionId: string,
 *       selected: number | number[] | "true" | "false" | null
 *     }>,
 *     proctorFlags?: Array<{ type: string; timestamp: number; detail: string }>,
 *     timeSpent?: number  // seconds
 *   }
 *
 * Behaviour:
 *   - Looks up the attempt, verifies ownership + exam match.
 *   - Loads the exam's question bank.
 *   - Grades each answer by comparing to `correctAnswer` (JSON-encoded).
 *   - Persists the answers + proctorFlags + score + status.
 *   - If score >= passingScore: marks attempt "passed" and issues a
 *     GuardianCredential (idempotent — only one credential per attempt).
 *   - Returns the full graded result with per-domain breakdown and the
 *     issued credential (if any).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: examId } = await params
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const attemptId: string | undefined = body?.attemptId
  const answersRaw: any[] = Array.isArray(body?.answers) ? body.answers : []
  const proctorFlags: any[] = Array.isArray(body?.proctorFlags)
    ? body.proctorFlags
    : []
  const timeSpent: number | undefined =
    typeof body?.timeSpent === "number" ? body.timeSpent : undefined

  if (!attemptId) {
    return NextResponse.json(
      { error: "Missing attemptId in body." },
      { status: 400 }
    )
  }

  // Load the attempt and verify ownership + exam match
  const attempt = await db.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { certification: true } } },
  })

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 })
  }
  if (attempt.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }
  if (attempt.examId !== examId) {
    return NextResponse.json(
      { error: "Attempt does not belong to this exam." },
      { status: 400 }
    )
  }
  if (attempt.status !== "in-progress") {
    return NextResponse.json(
      { error: `Attempt already ${attempt.status}.` },
      { status: 400 }
    )
  }

  // Load all questions for this exam
  const questions = await db.questionBank.findMany({
    where: { examId },
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
  })

  const qById = new Map(questions.map((q) => [q.id, q]))

  // Grade each answer
  const gradedAnswers: any[] = []
  let totalCorrect = 0
  let totalEarnedPoints = 0
  let totalPossiblePoints = 0
  const domainStats: Record<
    string,
    { correct: number; total: number; pointsEarned: number; pointsPossible: number }
  > = {}

  for (const ans of answersRaw) {
    const q = qById.get(ans.questionId)
    if (!q) continue
    const correct = isAnswerCorrect(q, ans.selected)
    const earned = correct ? q.points : 0
    totalPossiblePoints += q.points
    totalEarnedPoints += earned
    if (correct) totalCorrect += 1

    // Domain aggregation
    if (!domainStats[q.domain]) {
      domainStats[q.domain] = {
        correct: 0,
        total: 0,
        pointsEarned: 0,
        pointsPossible: 0,
      }
    }
    domainStats[q.domain].total += 1
    domainStats[q.domain].pointsPossible += q.points
    if (correct) {
      domainStats[q.domain].correct += 1
      domainStats[q.domain].pointsEarned += earned
    }

    gradedAnswers.push({
      questionId: q.id,
      selected: ans.selected ?? null,
      correct,
      points: q.points,
      earned,
      domain: q.domain,
      skill: q.skill,
      difficulty: q.difficulty,
      type: q.type,
      question: q.question,
      options: safeParse(q.options, [] as string[]),
      correctAnswer: safeParse(q.correctAnswer, null),
      explanation: q.explanation ?? null,
    })
  }

  // Account for unanswered questions
  for (const q of questions) {
    const answered = gradedAnswers.find((a) => a.questionId === q.id)
    if (!answered) {
      totalPossiblePoints += q.points
      if (!domainStats[q.domain]) {
        domainStats[q.domain] = {
          correct: 0,
          total: 0,
          pointsEarned: 0,
          pointsPossible: 0,
        }
      }
      domainStats[q.domain].total += 1
      domainStats[q.domain].pointsPossible += q.points
      gradedAnswers.push({
        questionId: q.id,
        selected: null,
        correct: false,
        points: q.points,
        earned: 0,
        domain: q.domain,
        skill: q.skill,
        difficulty: q.difficulty,
        type: q.type,
        question: q.question,
        options: safeParse(q.options, [] as string[]),
        correctAnswer: safeParse(q.correctAnswer, null),
        explanation: q.explanation ?? null,
      })
    }
  }

  const totalQuestions = questions.length
  const percentage =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0

  const passingScore = attempt.exam.passingScore
  const passed = percentage >= passingScore
  const newStatus = passed ? "passed" : "failed"

  // Persist attempt update
  await db.examAttempt.update({
    where: { id: attempt.id },
    data: {
      status: newStatus,
      submittedAt: new Date(),
      score: percentage,
      totalQuestions,
      correctAnswers: totalCorrect,
      answers: JSON.stringify(
        gradedAnswers.map((a) => ({
          questionId: a.questionId,
          selected: a.selected,
          correct: a.correct,
          points: a.points,
          earned: a.earned,
          domain: a.domain,
        }))
      ),
      proctorFlags: JSON.stringify(proctorFlags),
      timeSpent,
    },
  })

  // Update the proctoring session — close it
  await db.proctoringSession.updateMany({
    where: { examAttemptId: attempt.id },
    data: { endedAt: new Date() },
  })

  // Issue a credential if passed and a certification is linked
  let credential: any = null
  if (passed && attempt.exam.certificationId) {
    // Idempotent — check whether this attempt already issued a credential
    const existing = await db.guardianCredential.findFirst({
      where: { examAttemptId: attempt.id, userId: user.id },
    })
    if (!existing) {
      const year = new Date().getFullYear()
      const credentialId = await generateUniqueCredentialId(year)
      const verificationHash = generateVerificationHash(
        credentialId,
        user.id,
        attempt.exam.certificationId,
        new Date()
      )
      const validityMonths =
        attempt.exam.certification?.validityPeriod ?? 36
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + validityMonths)
      const skillsAssessed =
        attempt.exam.certification?.skills ?? "[]"

      credential = await db.guardianCredential.create({
        data: {
          credentialId,
          userId: user.id,
          certificationId: attempt.exam.certificationId,
          examAttemptId: attempt.id,
          candidateName: user.name,
          score: percentage,
          skillsAssessed,
          examType: "proctored",
          issueDate: new Date(),
          expiryDate,
          status: "valid",
          verificationHash,
          verificationUrl: `/api/credentials/verify/${credentialId}`,
        },
      })
    } else {
      credential = existing
    }
  }

  // Build the per-domain breakdown for the response
  const domainBreakdown = Object.entries(domainStats).map(
    ([domain, s]) => ({
      domain,
      correct: s.correct,
      total: s.total,
      percentage: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      pointsEarned: s.pointsEarned,
      pointsPossible: s.pointsPossible,
    })
  )

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      status: newStatus,
      score: percentage,
      totalQuestions,
      correctAnswers: totalCorrect,
      timeSpent: timeSpent ?? null,
      submittedAt: new Date().toISOString(),
      passed,
    },
    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
      passingScore,
      duration: attempt.exam.duration,
      certificationId: attempt.exam.certificationId,
      certificationName: attempt.exam.certification?.name ?? null,
    },
    grading: {
      totalEarnedPoints,
      totalPossiblePoints,
      domainBreakdown,
    },
    answers: gradedAnswers,
    credential: credential
      ? {
          id: credential.id,
          credentialId: credential.credentialId,
          certificationId: credential.certificationId,
          candidateName: credential.candidateName,
          score: credential.score,
          issueDate: credential.issueDate,
          expiryDate: credential.expiryDate,
          status: credential.status,
          verificationUrl: credential.verificationUrl,
        }
      : null,
  })
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function isAnswerCorrect(
  q: {
    type: string
    correctAnswer: string
  },
  selected: any
): boolean {
  const correct = safeParse<any>(q.correctAnswer, null)
  if (correct === null) return false

  if (q.type === "multiple") {
    if (!Array.isArray(selected) || !Array.isArray(correct)) return false
    if (selected.length !== correct.length) return false
    const selSorted = [...selected].sort()
    const corrSorted = [...correct].sort()
    return selSorted.every((v, i) => v === corrSorted[i])
  }

  if (q.type === "truefalse") {
    // Stored as index 0/1 OR literal "true"/"false"
    if (typeof correct === "number") {
      return selected === correct
    }
    if (typeof correct === "string") {
      return (
        String(selected).toLowerCase() === correct.toLowerCase()
      )
    }
    return false
  }

  // mcq (default)
  if (typeof correct === "number") {
    return selected === correct
  }
  return false
}

async function generateUniqueCredentialId(year: number): Promise<string> {
  // GX-CERT-YYYY-XXXX
  for (let attempt = 0; attempt < 10; attempt++) {
    const rand = Math.floor(1000 + Math.random() * 9000)
    const id = `GX-CERT-${year}-${rand}`
    const exists = await db.guardianCredential.findUnique({
      where: { credentialId: id },
      select: { id: true },
    })
    if (!exists) return id
  }
  // Fallback — timestamp suffix
  return `GX-CERT-${year}-${Date.now().toString().slice(-6)}`
}

function generateVerificationHash(
  credentialId: string,
  userId: string,
  certificationId: string,
  issueDate: Date
): string {
  const raw = `${credentialId}|${userId}|${certificationId}|${issueDate.getTime()}|guardianx-cert-secret`
  let h1 = 0xdeadbeef ^ raw.length
  let h2 = 0x41c6ce57 ^ raw.length
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
    h1 = (h1 << 13) | (h1 >>> 19)
    h2 = (h2 << 11) | (h2 >>> 21)
  }
  return (
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0")
  )
}
