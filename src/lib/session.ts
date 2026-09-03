import { NextResponse, NextRequest } from "next/server"
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
export type AuthUser = NonNullable<SafeUser>

/**
 * requireRole(roles) — server-side RBAC gate for API routes.
 *
 * Usage:
 *   const user = await requireRole(["ADMIN"])
 *   if (user instanceof NextResponse) return user  // auth/forbidden failed
 *   // ... user is guaranteed to be in one of the allowed roles
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

/**
 * withErrorHandler() — higher-order function that wraps an API route handler
 * with try/catch to prevent Prisma/DB stack traces from leaking to clients.
 *
 * On unhandled errors, returns a generic 500 with no stack trace.
 *
 * Usage:
 *   export const GET = withErrorHandler(async (req) => {
 *     // ... your handler code
 *   })
 *
 *   export const POST = withErrorHandler(async (req) => {
 *     // ... your handler code
 *   })
 *
 * For dynamic route params:
 *   export const PATCH = withErrorHandler(async (req, { params }) => {
 *     const { id } = await params
 *     // ...
 *   })
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args)
    } catch (error: any) {
      // Log the error server-side for debugging
      console.error("[API Error]", error?.message || error)
      // Return a generic 500 — never leak the stack trace
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}
