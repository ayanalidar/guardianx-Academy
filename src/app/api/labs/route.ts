import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const difficulty = searchParams.get("difficulty")
  const q = searchParams.get("q")

  const where: any = { published: true }
  if (category && category !== "All") where.category = category
  if (difficulty && difficulty !== "All") where.difficulty = difficulty
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
    ]
  }

  const user = await getCurrentUser()
  const labs = await db.lab.findMany({
    where,
    orderBy: [{ difficulty: "asc" }, { points: "asc" }],
  })

  let progressMap: Record<string, any> = {}
  if (user) {
    const progress = await db.labProgress.findMany({ where: { userId: user.id } })
    progressMap = Object.fromEntries(progress.map((p) => [p.labId, p]))
  }

  return NextResponse.json({
    labs: labs.map((l) => ({
      ...l,
      progress: progressMap[l.id] ?? null,
    })),
  })
}
