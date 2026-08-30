import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Course Prerequisites Visualizer
// GET: all courses with their prerequisites (for graph viz)
// ============================================================

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const courses = await db.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      shortName: true,
      category: true,
      level: true,
      durationHours: true,
      color: true,
      prerequisiteIds: true,
      studentsCount: true,
      rating: true,
      description: true,
    },
    orderBy: { shortName: "asc" },
  })

  const courseMap = new Map(courses.map((c) => [c.id, c]))

  const nodes = courses.map((c) => ({
    id: c.id,
    title: c.title,
    shortName: c.shortName,
    category: c.category,
    level: c.level,
    durationHours: c.durationHours,
    color: c.color,
    studentsCount: c.studentsCount,
    rating: c.rating,
    description: c.description,
    prerequisiteCount: c.prerequisiteIds
      ? c.prerequisiteIds.split(",").map((s) => s.trim()).filter(Boolean).length
      : 0,
  }))

  // Edges: each edge is prerequisite -> course (meaning "take prereq first")
  const edges: { from: string; to: string }[] = []
  for (const c of courses) {
    if (!c.prerequisiteIds) continue
    const ids = c.prerequisiteIds.split(",").map((s) => s.trim()).filter(Boolean)
    for (const pid of ids) {
      // Only include edges that point at known courses
      if (courseMap.has(pid)) {
        edges.push({ from: pid, to: c.id })
      }
    }
  }

  // Compute category list for legend
  const categories = Array.from(new Set(courses.map((c) => c.category))).sort()

  return NextResponse.json({
    nodes,
    edges,
    categories,
  })
}
