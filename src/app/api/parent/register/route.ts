import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { signParentToken } from "@/lib/parent-auth"

export const runtime = "nodejs"

/**
 * Parent/Guardian registration.
 *
 * Links a parent account to an EXISTING student account by the student's
 * email. The student must already be registered on GuardianX (a User with
 * role STUDENT). A single student can have multiple parent/guardian accounts
 * linked (e.g. mother + father).
 *
 * On success: returns a signed parent token + parent profile (same shape as
 * the login response) so the client can immediately enter the portal.
 */

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid parent email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  relationship: z.enum(["parent", "guardian"]).default("parent"),
  studentEmail: z.string().email("Valid student email required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }
    const { name, email, password, phone, relationship, studentEmail } = parsed.data

    // 1) Parent email must not already be used
    const existingParent = await db.parentAccount.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existingParent) {
      return NextResponse.json(
        { error: "A parent account with this email already exists" },
        { status: 409 }
      )
    }

    // 2) The student must exist (look up by email)
    const student = await db.user.findUnique({
      where: { email: studentEmail.toLowerCase() },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!student) {
      return NextResponse.json(
        {
          error:
            "No student found with that email. Ask your student to register on GuardianX first.",
        },
        { status: 404 }
      )
    }
    if (student.role === "INSTRUCTOR" || student.role === "ADMIN" || student.role === "SCHOOL_ADMIN") {
      return NextResponse.json(
        { error: "Linked account is not a student" },
        { status: 400 }
      )
    }

    // 3) Create parent account
    const parent = await db.parentAccount.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash: bcrypt.hashSync(password, 10),
        phone: phone?.trim() || null,
        relationship,
        studentId: student.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        relationship: true,
        studentId: true,
      },
    })

    const token = signParentToken({
      id: parent.id,
      email: parent.email,
      studentId: parent.studentId,
    })

    return NextResponse.json(
      {
        token,
        parent,
        student: { id: student.id, name: student.name, email: student.email },
      },
      { status: 201 }
    )
  } catch (e) {
    console.error("[parent/register]", e)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
