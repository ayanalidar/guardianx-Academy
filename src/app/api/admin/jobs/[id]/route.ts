import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* Normalize a JSON-array string field. Accepts:
 *   - a real array → JSON.stringify
 *   - a "[...]" JSON string → validated + reused as-is
 *   - a comma/newline separated string → split + JSON.stringify
 *   - undefined / null / empty → fallback (defaults to "[]") */
function normalizeJsonArray(val: unknown, fallback = "[]"): string {
  if (val == null) return fallback
  if (Array.isArray(val)) {
    try { return JSON.stringify(val) } catch { return fallback }
  }
  if (typeof val === "string") {
    const trimmed = val.trim()
    if (!trimmed) return fallback
    if (trimmed.startsWith("[")) {
      try { JSON.parse(trimmed); return trimmed } catch { /* fall through */ }
    }
    const arr = trimmed
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    return JSON.stringify(arr)
  }
  return fallback
}

/* PATCH /api/admin/jobs/[id] — ADMIN-only. Update any fields on a job. */
export const PATCH = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const data: any = {}
  const stringFields = [
    "title", "company", "companyLogo", "location", "type",
    "salary", "description", "requirements", "status",
  ]
  for (const f of stringFields) {
    if (body[f] !== undefined) {
      data[f] = typeof body[f] === "string" ? body[f].trim() : body[f]
      // companyLogo is nullable
      if (f === "companyLogo" && (data[f] === "" || data[f] == null)) data[f] = null
    }
  }
  if (body.remote !== undefined) data.remote = Boolean(body.remote)
  if (body.requiredCerts !== undefined) data.requiredCerts = normalizeJsonArray(body.requiredCerts)
  if (body.requiredSkills !== undefined) data.requiredSkills = normalizeJsonArray(body.requiredSkills)

  const job = await db.job.update({ where: { id }, data })
  return NextResponse.json({ job })
})

/* DELETE /api/admin/jobs/[id] — ADMIN-only. Delete a job. Cascades to
 * applications automatically (JobApplication.onDelete: Cascade). */
export const DELETE = withErrorHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await db.job.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
