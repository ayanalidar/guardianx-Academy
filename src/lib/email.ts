import { db } from "@/lib/db"

/**
 * Email helper — stub implementation that logs emails to the EmailLog table
 * (in production this would integrate with a real email provider like SES/SendGrid).
 *
 * All emails sent through the platform flow through here so we have a full audit trail.
 */
export interface SendEmailInput {
  to: string
  subject: string
  body: string
  type?: "notification" | "certificate" | "assignment" | "reminder" | "welcome" | "message" | "office_hours"
  userId?: string
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  try {
    // In production: integrate with a real email provider here.
    // For now we log to the database (visible in admin) and to the console.
    console.log(`[EMAIL:${input.type ?? "notification"}] To: ${input.to} | Subject: ${input.subject}`)
    await db.emailLog.create({
      data: {
        toEmail: input.to,
        subject: input.subject,
        body: input.body,
        type: input.type ?? "notification",
        status: "sent",
        userId: input.userId ?? null,
      },
    })
  } catch (err) {
    console.error("sendEmail failed:", err)
  }
}

/** Generate a verification hash for a certificate (tamper-evident). */
export function generateVerificationHash(certificateId: string, userId: string, courseId: string, issuedAt: Date): string {
  // Simple hash combining certificate fields. In production use a signed JWT or HMAC.
  const raw = `${certificateId}|${userId}|${courseId}|${issuedAt.getTime()}|guardianx-secret`
  let h1 = 0xdeadbeef ^ raw.length
  let h2 = 0x41c6ce57 ^ raw.length
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const hash = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(13, "0")
  return `GX-${hash.toUpperCase()}`
}
