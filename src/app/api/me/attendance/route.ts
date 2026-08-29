import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // All course IDs the student is enrolled in
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    select: { courseId: true },
  })
  const courseIds = enrollments.map((e) => e.courseId)

  const records = await db.attendanceRecord.findMany({
    where: { userId: user.id, courseId: { in: courseIds } },
    include: {
      course: { select: { id: true, title: true, shortName: true, color: true } },
    },
    orderBy: [{ date: "desc" }, { recordedAt: "desc" }],
    take: 200,
  })

  const present = records.filter((r) => r.status === "present").length
  const absent = records.filter((r) => r.status === "absent").length
  const late = records.filter((r) => r.status === "late").length
  const excused = records.filter((r) => r.status === "excused").length
  const totalSessions = records.length
  // Attendance rate = (present + late) / total — "excused" doesn't count against the student
  const attendanceRate =
    totalSessions > 0 ? Math.round(((present + late) / totalSessions) * 100) : 0

  // Per-course breakdown
  const perCourseMap = new Map<
    string,
    {
      course: { id: string; title: string; shortName: string; color: string }
      total: number
      present: number
      absent: number
      late: number
      excused: number
    }
  >()
  for (const r of records) {
    const c = r.course
    if (!perCourseMap.has(c.id)) {
      perCourseMap.set(c.id, {
        course: { id: c.id, title: c.title, shortName: c.shortName, color: c.color },
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      })
    }
    const entry = perCourseMap.get(c.id)!
    entry.total++
    if (r.status === "present") entry.present++
    else if (r.status === "absent") entry.absent++
    else if (r.status === "late") entry.late++
    else if (r.status === "excused") entry.excused++
  }

  return NextResponse.json({
    stats: {
      totalSessions,
      present,
      absent,
      late,
      excused,
      attendanceRate,
    },
    perCourse: Array.from(perCourseMap.values()),
    recent: records.slice(0, 20),
  })
}
