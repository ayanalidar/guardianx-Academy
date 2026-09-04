import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

/**
 * GET /api/credentials/verify/[credentialId]
 *
 * PUBLIC endpoint — no auth required. Anyone (employer, recruiter,
 * registrar) can verify a GuardianX credential by its public
 * `credentialId` (e.g. `GX-CERT-2025-XXXX`).
 *
 * Response shape (always 200 unless server error):
 *   { valid: true,  credential: {...} }  — found + active (status === "valid")
 *   { valid: false, credential: {...} }  — found but revoked / expired / suspended
 *   { valid: false, credential: null   }  — not found
 *
 * `credential` (when present) is safe to display publicly — it contains
 * the candidate name, certification name, score, issue/expiry dates,
 * status, skillsAssessed, and examType. It does NOT leak the user's
 * internal DB id, email, or any PII beyond the candidate name as it
 * appears on the certificate.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    const { credentialId } = await params
    const cred = await db.guardianCredential.findUnique({
      where: { credentialId },
      include: { certification: true },
    })

    if (!cred) {
      return NextResponse.json({ valid: false, credential: null })
    }

    return NextResponse.json({
      valid: cred.status === "valid",
      credential: {
        credentialId: cred.credentialId,
        candidateName: cred.candidateName,
        certificationName: cred.certification.name,
        certificationSlug: cred.certification.slug,
        certificationLevel: cred.certification.level,
        score: cred.score,
        issueDate: cred.issueDate,
        expiryDate: cred.expiryDate,
        status: cred.status, // valid | expired | revoked | suspended
        skillsAssessed: JSON.parse(cred.skillsAssessed || "[]"),
        examType: cred.examType,
        verificationHash: cred.verificationHash,
      },
    })
  } catch (err) {
    console.error("[api/credentials/verify] error:", err)
    return NextResponse.json(
      { valid: false, credential: null, error: "Verification failed" },
      { status: 500 }
    )
  }
}
