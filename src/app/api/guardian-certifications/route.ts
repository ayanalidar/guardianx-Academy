import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET() {
  try {
    const certs = await db.guardianCertification.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
    })
    const data = certs.map(c => ({
      ...c,
      domains: safeParseArray(c.domains),
      skills: safeParseArray(c.skills),
    }))
    return NextResponse.json({ certifications: data })
  } catch (err) {
    console.error("[api/guardian-certifications] GET error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
function safeParseArray(raw: string): string[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] }
}
