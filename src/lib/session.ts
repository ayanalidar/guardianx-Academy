import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, email: true, name: true, role: true, avatar: true, title: true, bio: true, schoolId: true },
  })
  return user
}

export type SafeUser = Awaited<ReturnType<typeof getCurrentUser>>

/**
 * AuthUser — non-null variant of SafeUser. Returned by `requireRole()` on
 * success. Has every field SafeUser has except `null`.
 */
export type AuthUser = NonNullable<SafeUser>

/**
 * requireRole(roles) — server-side RBAC gate for API routes.
 *
 * - Resolves the current authenticated user via `getCurrentUser()`.
 * - If no session: returns a 401 NextResponse.
 * - If the user's role is not in `roles`: returns a 403 NextResponse.
 * - Otherwise: returns the user (typed as `AuthUser`).
 *
 * Usage in API route handlers:
 *
 *   const user = await requireRole(["ADMIN"])
 *   if (user instanceof NextResponse) return user  // auth/forbidden failed
 *   // ... user is guaranteed to be in one of the allowed roles
 *
 * Multi-role gates (e.g. instructors may also read the instructor list):
 *
 *   const user = await requireRole(["ADMIN", "INSTRUCTOR"])
 *   if (user instanceof NextResponse) return user
 *
 * The `instanceof NextResponse` check is the recommended pattern because
 * `requireRole()` returns a union type `AuthUser | NextResponse` — a plain
 * truthy check would not narrow the type correctly (a NextResponse is also
 * truthy).
 */
export async function requireRole(
  roles: string[]
): Promise<AuthUser | NextResponse> {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return user
}
