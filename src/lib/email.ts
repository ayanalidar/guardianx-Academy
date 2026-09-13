import nodemailer from "nodemailer"

/**
 * GuardianX email service — sends transactional emails via SMTP.
 *
 * Configuration via env vars:
 *   SMTP_HOST       — e.g. "smtp.hostinger.com"
 *   SMTP_PORT       — e.g. 465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER       — full email address, e.g. "noreply@academy.guardianx.cloud"
 *   SMTP_PASSWORD   — the mailbox password
 *   EMAIL_FROM      — sender display, e.g. "GuardianX Academy <noreply@academy.guardianx.cloud>"
 *   EMAIL_TO_ADMINS — comma-separated admin notification emails, e.g. "admin@academy.guardianx.cloud"
 *
 * If SMTP vars are not set, emails are silently skipped (the app still works,
 * just no email notifications). This is intentional — dev environments don't
 * need email, and production can set the vars when ready.
 */

let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "465", 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  if (!host || !user || !pass) return null
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
  return _transporter
}

export function isEmailConfigured(): boolean {
  return !!getTransporter()
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<boolean> {
  const t = getTransporter()
  if (!t) {
    console.warn("[email] SMTP not configured — skipping email to:", to)
    return false
  }
  try {
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@guardianx.cloud"
    await t.sendMail({ from, to, subject, html, text: text || html.replace(/<[^>]*>/g, "") })
    return true
  } catch (err) {
    console.error("[email] Failed to send email:", err)
    return false
  }
}

/**
 * Send a notification email to the admin team when a new lead comes in.
 * Uses EMAIL_TO_ADMINS env var (comma-separated list).
 */
export async function notifyAdmins(subject: string, html: string): Promise<boolean> {
  const recipients = process.env.EMAIL_TO_ADMINS
  if (!recipients) return false
  return sendEmail({ to: recipients, subject, html })
}

/**
 * Generate a magic-link email HTML template.
 */
export function magicLinkEmailTemplate(name: string, link: string): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; padding: 40px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Guardian<span style="color: #a78bfa;">X</span> Academy</h1>
    <p style="color: #6b7280; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px;">Secure · Learn · Defend</p>
  </div>
  <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 16px;">Sign in to GuardianX</h2>
  <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
  <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">Click the button below to sign in to your GuardianX Academy account. This link expires in 24 hours and can only be used once.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Sign in to GuardianX</a>
  </div>
  <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">If you didn't request this login link, you can safely ignore this email. Your account is safe.</p>
  <hr style="border: none; border-top: 1px solid #1f2937; margin: 32px 0;" />
  <p style="color: #4b5563; font-size: 11px;">GuardianX Academy · Cyber Security Training in India<br>academy.guardianx.cloud</p>
</div>
`
}

/**
 * Generate a lead notification email HTML template.
 */
export function leadNotificationEmailTemplate(type: string, fields: { label: string; value: string }[]): string {
  const rows = fields.map(f => `<tr><td style="color: #6b7280; font-size: 12px; padding: 4px 0; text-transform: uppercase; letter-spacing: 0.1em;">${f.label}</td><td style="color: #ffffff; font-size: 14px; padding: 4px 0 4px 16px;">${f.value}</td></tr>`).join("")
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; padding: 40px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Guardian<span style="color: #a78bfa;">X</span> Academy</h1>
  </div>
  <h2 style="color: #a78bfa; font-size: 18px; margin-bottom: 16px;">New ${type}</h2>
  <table style="width: 100%; border-collapse: collapse;">${rows}</table>
  <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">View this lead in the admin panel at academy.guardianx.cloud</p>
</div>
`
}
