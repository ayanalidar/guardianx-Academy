import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"

/**
 * Public contact form endpoint.
 * Saves the message as an EmailLog (type: "notification") and
 * sends a confirmation email back to the submitter.
 *
 * No auth required — this is a public form.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, category, message } = await req.json()

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      )
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    // Length limits
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "One or more fields exceed the maximum length." },
        { status: 400 }
      )
    }

    const validCategories = ["general", "partnership", "courses", "technical", "careers"]
    const safeCategory = validCategories.includes(category) ? category : "general"

    const fullSubject = `[Contact: ${safeCategory}] ${subject}`
    const fullBody = `Name: ${name}\nEmail: ${email}\nCategory: ${safeCategory}\nSubject: ${subject}\n\nMessage:\n${message}`

    // Log to EmailLog table (so admins can see all contact submissions)
    await db.emailLog.create({
      data: {
        toEmail: "hello@guardianx.io",
        subject: fullSubject,
        body: fullBody,
        type: "notification",
        status: "sent",
      },
    })

    // Send confirmation email to the submitter
    await sendEmail({
      to: email,
      subject: `✓ We received your message — GuardianX Academy`,
      body: `Hi ${name},\n\nThank you for reaching out to GuardianX Academy! We've received your message:\n\n"${subject}"\n\nOur team will review your inquiry and respond within 24 hours.\n\nCategory: ${safeCategory}\n\nBest regards,\nThe GuardianX Team\n\nguardianx.io`,
      type: "notification",
    })

    return NextResponse.json({ ok: true, message: "Message sent successfully" })
  } catch (err: any) {
    console.error("Contact form error:", err)
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    )
  }
}
