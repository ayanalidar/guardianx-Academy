import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

// Rate limiting — simple in-memory counter (per IP, per window)
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 registrations per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// Password must be at least 8 chars, contain uppercase, lowercase, and a number
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: passwordSchema,
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }
    const { name, email, password } = parsed.data

    // SECURITY: Always register as STUDENT. Instructor/Admin roles must be
    // assigned by an admin — never self-assigned via the registration API.
    const role = "STUDENT"

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      // SECURITY: Don't reveal that the email exists (prevents enumeration)
      return NextResponse.json(
        { error: "Registration failed. Please try with different details." },
        { status: 400 }
      )
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: bcrypt.hashSync(password, 12), // 12 rounds for better security
        role,
        title: "Student",
      },
      select: { id: true, email: true, name: true, role: true },
    })
    return NextResponse.json({ user })
  } catch (e) {
    console.error("[register]", e)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
