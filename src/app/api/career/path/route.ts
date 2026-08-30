import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Career Path Planner — GET user's career path
// POST create / update career path
// ============================================================

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const path = await db.careerPath.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    })

    if (!path) {
      return NextResponse.json({ path: null })
    }

    return NextResponse.json({
      path: {
        ...path,
        recommendedCourses: (() => {
          try {
            return JSON.parse(path.recommendedCourses || "[]")
          } catch {
            return []
          }
        })(),
        recommendedCerts: (() => {
          try {
            return JSON.parse(path.recommendedCerts || "[]")
          } catch {
            return []
          }
        })(),
        recommendedLabs: (() => {
          try {
            return JSON.parse(path.recommendedLabs || "[]")
          } catch {
            return []
          }
        })(),
      },
    })
  } catch (err: any) {
    console.error("[career/path] GET error:", err?.message)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      targetRole,
      currentRole,
      targetSalary,
      recommendedCourses,
      recommendedCerts,
      recommendedLabs,
      estimatedWeeks,
    } = body as {
      targetRole?: string
      currentRole?: string
      targetSalary?: string
      recommendedCourses?: string[]
      recommendedCerts?: string[]
      recommendedLabs?: string[]
      estimatedWeeks?: number
    }

    if (!targetRole) {
      return NextResponse.json({ error: "targetRole is required" }, { status: 400 })
    }

    // Compute initial progress based on existing enrollments + lab completions
    const [enrollments, labProgress] = await Promise.all([
      db.enrollment.findMany({
        where: { userId: user.id },
        select: { courseId: true, completed: true },
      }),
      db.labProgress.findMany({
        where: { userId: user.id, status: "completed" },
        select: { labId: true },
      }),
    ])
    const completedCourses = enrollments.filter((e) => e.completed).map((e) => e.courseId)
    const completedLabs = labProgress.map((l) => l.labId)

    const courses = recommendedCourses || []
    const labs = recommendedLabs || []
    const certs = recommendedCerts || []
    const totalSteps = courses.length + labs.length + certs.length
    const doneSteps =
      courses.filter((c: string) => completedCourses.includes(c)).length +
      labs.filter((l: string) => completedLabs.includes(l)).length
    const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

    const existing = await db.careerPath.findFirst({
      where: { userId: user.id },
    })

    const data = {
      targetRole,
      currentRole: currentRole || "",
      targetSalary: targetSalary || "",
      recommendedCourses: JSON.stringify(courses),
      recommendedCerts: JSON.stringify(certs),
      recommendedLabs: JSON.stringify(labs),
      estimatedWeeks: estimatedWeeks ?? 12,
      progress,
    }

    let path
    if (existing) {
      path = await db.careerPath.update({
        where: { id: existing.id },
        data,
      })
    } else {
      path = await db.careerPath.create({
        data: { userId: user.id, ...data },
      })
    }

    return NextResponse.json({
      path: {
        ...path,
        recommendedCourses: courses,
        recommendedCerts: certs,
        recommendedLabs: labs,
      },
    })
  } catch (err: any) {
    console.error("[career/path] POST error:", err?.message)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
