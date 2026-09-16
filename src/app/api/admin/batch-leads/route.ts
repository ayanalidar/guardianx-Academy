import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* GET /api/admin/batch-leads — ADMIN-only. Returns the latest batch leads
 * across ALL batches (for push notifications). Limited to 5 most recent.
 */
export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const leads = await db.batchLead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { batch: { select: { name: true } } },
  })

  return NextResponse.json({ leads })
})
