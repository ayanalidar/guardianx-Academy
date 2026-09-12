import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* GET /api/admin/cyber-quiz/certificates
 * ADMIN-only. Returns all issued quiz certificates.
 *
 * Query: q? (search by credentialId / email / candidateName)
 */
export const GET = withErrorHandler(async (req) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const url = new URL(req.url)
  const q = url.searchParams.get("q")

  const where: any = {}
  if (q && q.trim()) {
    where.OR = [
      { credentialId: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { candidateName: { contains: q, mode: "insensitive" } },
    ]
  }

  const certs = await db.cyberQuizCertificate.findMany({
    where,
    orderBy: { issueDate: "desc" },
    take: 200,
    select: {
      id: true,
      credentialId: true,
      candidateName: true,
      email: true,
      difficulty: true,
      score: true,
      totalQuestions: true,
      percentage: true,
      issueDate: true,
      status: true,
      verificationUrl: true,
    },
  })

  return NextResponse.json({ certificates: certs, count: certs.length })
})
