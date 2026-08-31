import crypto from "crypto"

/**
 * Parent/Guardian Portal — token-based auth helper.
 *
 * Parent accounts live in their own `ParentAccount` table (separate from the
 * main `User` table used by NextAuth). To authenticate subsequent requests
 * (e.g. GET /api/parent) we mint a short HMAC-signed token at login time
 * and verify it on every authenticated parent request.
 *
 * Token format: `<base64url-payload>.<hex-hmac-sha256-signature>`
 */

const SECRET =
  process.env.NEXTAUTH_SECRET || (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: NEXTAUTH_SECRET not set for parent auth.")
    }
    console.warn("WARNING: NEXTAUTH_SECRET not set — using insecure dev fallback for parent auth.")
    return "dev-only-insecure-parent-secret-" + Date.now()
  })()

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

export interface ParentTokenPayload {
  id: string
  email: string
  studentId: string
  issuedAt: number
  expiresAt: number
}

/** Mint a signed parent token. */
export function signParentToken(parent: {
  id: string
  email: string
  studentId: string
}): string {
  const issuedAt = Date.now()
  const payload: ParentTokenPayload = {
    id: parent.id,
    email: parent.email,
    studentId: parent.studentId,
    issuedAt,
    expiresAt: issuedAt + TOKEN_TTL_MS,
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  )
  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("hex")
  return `${payloadB64}.${sig}`
}

/** Verify a signed parent token; returns the payload or null. */
export function verifyParentToken(token?: string | null): ParentTokenPayload | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [payloadB64, sig] = parts
  if (!payloadB64 || !sig) return null

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex")
  // Timing-safe comparison
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"))
  ) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as ParentTokenPayload
    if (!payload?.id || !payload?.studentId) return null
    if (Date.now() > payload.expiresAt) return null
    return payload
  } catch {
    return null
  }
}

/** Extract a parent token from a Request — checks x-parent-token header then
 *  the `parent_token` query param as a fallback. */
export function readParentToken(req: Request): string | null {
  const header = req.headers.get("x-parent-token")
  if (header) return header
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get("parent_token")
    if (q) return q
  } catch {
    // ignore — non-parseable URL
  }
  return null
}
