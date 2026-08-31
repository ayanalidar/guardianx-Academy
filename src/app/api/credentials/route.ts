import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
export const runtime = "nodejs"
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const creds = await db.guardianCredential.findMany({
      where: { userId: user.id },
      include: { certification: true },
      orderBy: { issueDate: "desc" },
    })
    return NextResponse.json({
      credentials: creds.map(c => ({
        ...c,
        skillsAssessed: JSON.parse(c.skillsAssessed || "[]"),
        certification: { name: c.certification.name, slug: c.certification.slug, level: c.certification.level, icon: c.certification.icon, color: c.certification.color },
      }))
    })
  } catch (err) {
    console.error("[api/credentials] error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
