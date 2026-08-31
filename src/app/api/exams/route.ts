import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
export const runtime = "nodejs"
export async function GET() {
  try {
    const user = await getCurrentUser()
    const exams = await db.exam.findMany({
      where: { status: "published" },
      include: { certification: true },
      orderBy: { createdAt: "asc" },
    })
    let attempts: any[] = []
    if (user) {
      attempts = await db.examAttempt.findMany({
        where: { userId: user.id },
        select: { examId: true, status: true, score: true },
      })
    }
    return NextResponse.json({
      exams: exams.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        duration: e.duration,
        passingScore: e.passingScore,
        maxAttempts: e.maxAttempts,
        questionCount: e.questionCount,
        proctoringEnabled: e.proctoringEnabled,
        certification: e.certification ? { name: e.certification.name, slug: e.certification.slug, level: e.certification.level } : null,
        userAttempts: attempts.filter(a => a.examId === e.id),
      }))
    })
  } catch (err) {
    console.error("[api/exams] error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
