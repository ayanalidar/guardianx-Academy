import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET(_req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    const { credentialId } = await params
    const cred = await db.guardianCredential.findUnique({
      where: { credentialId },
      include: { certification: true },
    })
    if (!cred) return NextResponse.json({ error: "Credential not found", valid: false }, { status: 404 })
    return NextResponse.json({
      valid: cred.status === "valid",
      credential: {
        credentialId: cred.credentialId,
        candidateName: cred.candidateName,
        certificationName: cred.certification.name,
        score: cred.score,
        issueDate: cred.issueDate,
        expiryDate: cred.expiryDate,
        status: cred.status,
        skillsAssessed: JSON.parse(cred.skillsAssessed || "[]"),
        examType: cred.examType,
      }
    })
  } catch (err) {
    console.error("[api/credentials/verify] error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
