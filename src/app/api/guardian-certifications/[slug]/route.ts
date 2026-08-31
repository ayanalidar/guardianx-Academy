import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const cert = await db.guardianCertification.findUnique({ where: { slug } })
    if (!cert || !cert.published) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({
      certification: {
        ...cert,
        domains: JSON.parse(cert.domains || "[]"),
        skills: JSON.parse(cert.skills || "[]"),
      }
    })
  } catch (err) {
    console.error("[api/guardian-certifications/[slug]] error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
