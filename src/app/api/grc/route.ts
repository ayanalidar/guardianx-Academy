import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET() {
  try {
    const content = await db.grcContent.findMany({ where: { published: true }, orderBy: { order: "asc" } })
    return NextResponse.json({ content: content.map(c => ({ ...c, relatedCourseIds: JSON.parse(c.relatedCourseIds || "[]") })) })
  } catch { return NextResponse.json({ content: [] }) }
}
