import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await db.event.findUnique({ where: { slug } })
  if (!event || !event.published) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ event })
}
