import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

/** Guard helper for school-admin access. */
async function schoolAdminGuard() {
  const user = await getCurrentUser()
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  if (user.role !== "SCHOOL_ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden — SCHOOL_ADMIN only" }, { status: 403 }) }
  }
  if (!user.schoolId) {
    return { error: NextResponse.json({ error: "No school linked to this account" }, { status: 403 }) }
  }
  return { user, schoolId: user.schoolId }
}

export async function GET() {
  const guard = await schoolAdminGuard()
  if ("error" in guard) return guard.error
  const { schoolId } = guard

  // Get all batches in school
  const batches = await db.batch.findMany({
    where: { schoolId },
    select: { id: true, name: true, status: true, courseIds: true },
  })

  // Build course -> batches map
  const courseToBatches = new Map<string, { id: string; name: string; status: string }[]>()
  const allCourseIds = new Set<string>()
  for (const b of batches) {
    for (const cid of b.courseIds.split(",").map((s) => s.trim()).filter(Boolean)) {
      allCourseIds.add(cid)
      const arr = courseToBatches.get(cid) || []
      arr.push({ id: b.id, name: b.name, status: b.status })
      courseToBatches.set(cid, arr)
    }
  }

  if (allCourseIds.size === 0) {
    return NextResponse.json({ courses: [], count: 0 })
  }

  // Fetch course details
  const courses = await db.course.findMany({
    where: { id: { in: Array.from(allCourseIds) } },
    select: {
      id: true,
      title: true,
      shortName: true,
      level: true,
      thumbnail: true,
      color: true,
      category: true,
      durationHours: true,
      studentsCount: true,
    },
  })

  // Compute enrollments within the school per course
  const studentMembers = await db.schoolMember.findMany({
    where: { schoolId, role: "STUDENT" },
    select: { userId: true },
  })
  const studentUserIds = studentMembers.map((m) => m.userId)

  const schoolEnrollments = studentUserIds.length
    ? await db.enrollment.groupBy({
        by: ["courseId"],
        where: { userId: { in: studentUserIds }, courseId: { in: Array.from(allCourseIds) } },
        _count: { _all: true },
      })
    : []
  const enrollMap = new Map<string, number>()
  for (const e of schoolEnrollments) enrollMap.set(e.courseId, e._count._all)

  const result = courses.map((c) => ({
    ...c,
    batches: courseToBatches.get(c.id) || [],
    batchCount: (courseToBatches.get(c.id) || []).length,
    schoolEnrollmentCount: enrollMap.get(c.id) || 0,
  }))

  return NextResponse.json({
    courses: result,
    count: result.length,
  })
}
