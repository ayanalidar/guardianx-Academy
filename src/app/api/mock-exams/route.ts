import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
export const runtime = "nodejs"
export async function GET() {
  try {
    const exams = await db.mockExam.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } })
    const user = await getCurrentUser()
    let attempts: any[] = []
    if (user) {
      attempts = await db.mockExamAttempt.findMany({ where: { userId: user.id }, select: { mockExamId: true, status: true, score: true } })
    }
    return NextResponse.json({ exams: exams.map(e => ({ ...e, questionIds: JSON.parse(e.questionIds || "[]"), userAttempts: attempts.filter(a => a.mockExamId === e.id) })) })
  } catch { return NextResponse.json({ exams: [] }) }
}
