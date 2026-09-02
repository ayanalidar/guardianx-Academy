import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET() {
  try {
    const certs = await db.certification.findMany({ where: { published: true }, orderBy: { order: "asc" } })
    return NextResponse.json({ certifications: certs.map(c => ({ ...c, domains: JSON.parse(c.domains || "[]"), skills: JSON.parse(c.skills || "[]") })) })
  } catch { return NextResponse.json({ certifications: [] }) }
}
