import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ certificates: [] })
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
    include: { course: { select: { id: true, title: true, shortName: true, slug: true, certBody: true, instructor: { select: { name: true } } } } },
    orderBy: { issuedAt: "desc" },
  })
  return NextResponse.json({ certificates })
}
