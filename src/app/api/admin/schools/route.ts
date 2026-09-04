import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* GET /api/admin/schools — ADMIN only.
 * Returns a minimal list of all schools for use in admin dropdowns
 * (e.g. the Institution filter in the Generate Report dialog on the
 * Student Progress admin page).
 *
 * Returns: { schools: [{ id, name, type, city }] } */
export const GET = withErrorHandler(async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const schools = await db.school.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ schools, count: schools.length })
})
