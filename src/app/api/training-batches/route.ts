import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

// GET /api/training-batches — public list of all published training batches.
// No auth required. Returns all fields ordered by `order` then `startDate`.
export const GET = withErrorHandler(async () => {
  const batches = await db.trainingBatch.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { startDate: "asc" }],
  })

  return NextResponse.json({ batches, count: batches.length })
})
