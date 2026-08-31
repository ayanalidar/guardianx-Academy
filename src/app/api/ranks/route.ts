import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

/**
 * GET /api/ranks
 * Public — returns all 8 rank tiers ordered by level.
 */
export async function GET() {
  try {
    const ranks = await db.rank.findMany({
      orderBy: { level: "asc" },
    })

    return NextResponse.json({ ranks, count: ranks.length })
  } catch (err) {
    console.error("[api/ranks] GET error:", err)
    return NextResponse.json(
      { error: "Failed to fetch ranks" },
      { status: 500 }
    )
  }
}
