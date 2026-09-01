import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET() {
  try {
    const events = await db.event.findMany({ where: { published: true }, orderBy: { startDate: "asc" } })
    return NextResponse.json({ events })
  } catch { return NextResponse.json({ events: [] }) }
}
