import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()
  if (q.length < 1) return NextResponse.json({ courses: [], labs: [] })

  const [courses, labs] = await Promise.all([
    db.course.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { shortName: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 6,
      select: { id: true, slug: true, title: true, shortName: true, category: true, level: true, color: true },
    }),
    db.lab.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 6,
      select: { id: true, slug: true, title: true, category: true, difficulty: true, points: true, color: true },
    }),
  ])

  return NextResponse.json({ courses, labs })
}
