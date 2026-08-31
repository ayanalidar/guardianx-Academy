import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// GET /api/admin/batches — list all batches (mock data for now)
export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Return mock batch data (in production, fetch from Batch model)
  const batches = [
    { id: "b1", name: "CEH Weekend Batch", cert: "CEH", instructor: "Dr. Sarah Chen", instructorId: "1", schedule: "Sat-Sun 7PM", days: [6,0], time: "7:00 PM - 9:00 PM", mode: "Online", students: 12, capacity: 20, startDate: "2025-10-12", status: "Open" },
    { id: "b2", name: "Security+ Weekday", cert: "Security+", instructor: "Raj Patel", instructorId: "2", schedule: "MWF 8PM", days: [1,3,5], time: "8:00 PM - 10:00 PM", mode: "Online", students: 8, capacity: 20, startDate: "2025-10-20", status: "Open" },
    { id: "b3", name: "CCNA Morning", cert: "CCNA", instructor: "Raj Patel", instructorId: "2", schedule: "Tue-Thu 7AM", days: [2,4], time: "7:00 AM - 9:00 AM", mode: "Online", students: 15, capacity: 25, startDate: "2025-11-03", status: "Open" },
    { id: "b4", name: "CISSP Weekend", cert: "CISSP", instructor: "Alex Mercer", instructorId: "3", schedule: "Sat-Sun 10AM", days: [6,0], time: "10:00 AM - 1:00 PM", mode: "Online", students: 5, capacity: 10, startDate: "2025-11-09", status: "Almost Full" },
    { id: "b5", name: "WAPT Bootcamp", cert: "WAPT", instructor: "Dr. Sarah Chen", instructorId: "1", schedule: "Mon-Fri 6PM", days: [1,2,3,4,5], time: "6:00 PM - 8:00 PM", mode: "On-campus", students: 20, capacity: 25, startDate: "2025-10-15", status: "Open" },
  ]

  return NextResponse.json({ batches, count: batches.length })
}

// POST /api/admin/batches — create a new batch
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const {
    name, cert, instructorId, instructorName,
    startDate, endDate, schedule, days, time, timezone,
    mode, location, capacity, price,
  } = body

  if (!name?.trim()) return NextResponse.json({ error: "Batch name required" }, { status: 400 })
  if (!cert?.trim()) return NextResponse.json({ error: "Certification required" }, { status: 400 })
  if (!startDate) return NextResponse.json({ error: "Start date required" }, { status: 400 })

  // In production, save to Batch model. For now, return the created batch.
  const batch = {
    id: `b${Date.now()}`,
    name: name.trim(),
    cert: cert.trim(),
    instructor: instructorName || "TBD",
    instructorId: instructorId || null,
    startDate,
    endDate: endDate || null,
    schedule: schedule || "",
    days: days || [],
    time: time || "",
    timezone: timezone || "Asia/Kolkata",
    mode: mode || "Online",
    location: location || null,
    capacity: capacity || 20,
    students: 0,
    price: price || 0,
    status: "Open",
  }

  return NextResponse.json({ batch }, { status: 201 })
}
