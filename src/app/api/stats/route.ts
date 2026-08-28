import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const totalCourses = await db.course.count()
  const totalStudents = await db.user.count({ where: { role: "STUDENT" } })
  const totalLabs = await db.lab.count()
  const totalEnrollments = await db.enrollment.count()
  const totalLabsCompleted = await db.labProgress.count({ where: { status: "completed" } })
  const totalCertificates = await db.certificate.count()

  return NextResponse.json({
    totalCourses,
    totalStudents,
    totalLabs,
    totalEnrollments,
    totalLabsCompleted,
    totalCertificates,
  })
}
