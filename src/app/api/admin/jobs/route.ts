import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* GET /api/admin/jobs — ADMIN-only. Returns ALL jobs (incl. draft/closed)
 * with the poster's name + the application count for each job. */
export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const jobs = await db.job.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      postedBy: { select: { id: true, name: true, email: true } },
      _count: { select: { applications: true } },
    },
  })

  const serialized = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    companyLogo: j.companyLogo,
    location: j.location,
    remote: j.remote,
    type: j.type,
    salary: j.salary,
    description: j.description,
    requirements: j.requirements,
    requiredCerts: j.requiredCerts,
    requiredSkills: j.requiredSkills,
    postedById: j.postedById,
    postedBy: j.postedBy ? { id: j.postedBy.id, name: j.postedBy.name, email: j.postedBy.email } : null,
    status: j.status,
    applicationCount: j._count.applications,
    createdAt: j.createdAt.toISOString(),
  }))

  return NextResponse.json({ jobs: serialized, count: serialized.length })
})

/* POST /api/admin/jobs — ADMIN-only. Create a new job. The postedById is
 * always forced to the current admin's id (never trust the client). */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const {
    title, company, companyLogo, location, remote, type, salary,
    description, requirements, requiredCerts, requiredSkills, status,
  } = body

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })
  if (!company?.trim()) return NextResponse.json({ error: "Company is required" }, { status: 400 })
  if (!location?.trim()) return NextResponse.json({ error: "Location is required" }, { status: 400 })

  // Normalize JSON-array string fields
  const normalizeJsonArray = (val: unknown, fallback = "[]"): string => {
    if (val == null) return fallback
    if (Array.isArray(val)) {
      try { return JSON.stringify(val) } catch { return fallback }
    }
    if (typeof val === "string") {
      const trimmed = val.trim()
      if (!trimmed) return fallback
      // Already a JSON array string?
      if (trimmed.startsWith("[")) {
        try { JSON.parse(trimmed); return trimmed } catch { /* fall through */ }
      }
      // Comma / newline separated → convert to JSON array
      const arr = trimmed
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
      return JSON.stringify(arr)
    }
    return fallback
  }

  const job = await db.job.create({
    data: {
      title: title.trim(),
      company: company.trim(),
      companyLogo: companyLogo?.trim() || null,
      location: location.trim(),
      remote: Boolean(remote),
      type: type || "full-time",
      salary: salary ?? "",
      description: description ?? "",
      requirements: requirements ?? "",
      requiredCerts: normalizeJsonArray(requiredCerts),
      requiredSkills: normalizeJsonArray(requiredSkills),
      postedById: user.id,
      status: status || "active",
    },
  })

  return NextResponse.json({ job }, { status: 201 })
})
