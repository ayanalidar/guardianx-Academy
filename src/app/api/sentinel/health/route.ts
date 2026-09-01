import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const runtime = "nodejs"
export async function GET() {
  const services: Array<{ name: string; status: string; latency: number; detail?: string }> = []
  const start = Date.now()
  try { await db.$queryRaw`SELECT 1`; services.push({ name: "Database", status: "operational", latency: Date.now() - start }) } catch { services.push({ name: "Database", status: "down", latency: Date.now() - start }) }
  try { const c = await db.user.count(); services.push({ name: "Authentication", status: "operational", latency: Date.now() - start, detail: `${c} users` }) } catch { services.push({ name: "Authentication", status: "degraded", latency: Date.now() - start }) }
  try { const c = await db.course.count(); services.push({ name: "LMS", status: "operational", latency: Date.now() - start, detail: `${c} courses` }) } catch { services.push({ name: "LMS", status: "degraded", latency: Date.now() - start }) }
  try { const c = await db.lab.count(); services.push({ name: "Cyber Labs", status: "operational", latency: Date.now() - start, detail: `${c} labs` }) } catch { services.push({ name: "Cyber Labs", status: "degraded", latency: Date.now() - start }) }
  try { const c = await db.exam.count(); services.push({ name: "Exams", status: "operational", latency: Date.now() - start, detail: `${c} exams` }) } catch { services.push({ name: "Exams", status: "degraded", latency: Date.now() - start }) }
  try { const c = await db.siteContent.count(); services.push({ name: "CMS", status: "operational", latency: Date.now() - start, detail: `${c} items` }) } catch { services.push({ name: "CMS", status: "degraded", latency: Date.now() - start }) }
  try { const c = await db.guardianCredential.count(); services.push({ name: "Certifications", status: "operational", latency: Date.now() - start, detail: `${c} credentials` }) } catch { services.push({ name: "Certifications", status: "degraded", latency: Date.now() - start }) }
  try { const c = await db.lead.count(); services.push({ name: "CRM", status: "operational", latency: Date.now() - start, detail: `${c} leads` }) } catch { services.push({ name: "CRM", status: "degraded", latency: Date.now() - start }) }
  const overall = services.every(s => s.status === "operational") ? "operational" : services.some(s => s.status === "down") ? "down" : "degraded"
  return NextResponse.json({ overall, services, timestamp: new Date().toISOString() })
}
