import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"
import { createHmac, timingSafeEqual } from "crypto"
import { getSetting } from "@/lib/settings"

export const runtime = "nodejs"

/* POST /api/payment/verify
 * -----------------------
 * Requires auth. Accepts { orderId, razorpayPaymentId, razorpaySignature }.
 *
 * If RAZORPAY_KEY_SECRET is set: verifies the HMAC SHA-256 signature.
 * If not set: falls back to mock mode (accepts any non-empty values).
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const { orderId, razorpayPaymentId, razorpaySignature } = body as {
    orderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
  }

  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 })
  if (!razorpayPaymentId) return NextResponse.json({ error: "razorpayPaymentId is required" }, { status: 400 })
  if (!razorpaySignature) return NextResponse.json({ error: "razorpaySignature is required" }, { status: 400 })

  // Load the order first — we need razorpayOrderId for signature verification
  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden — order belongs to another user" }, { status: 403 })
  }
  if (order.status === "paid") {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 })
  }

  // --- Signature verification ---
  const keySecret = await getSetting("RAZORPAY_KEY_SECRET")
  if (keySecret) {
    // Real verification: HMAC SHA-256 of `razorpayOrderId|razorpayPaymentId`
    const expected = createHmac("sha256", keySecret)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex")
    const expectedBuf = Buffer.from(expected, "hex")
    const providedBuf = Buffer.from(razorpaySignature, "hex")
    if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 })
    }
  }
  // If keySecret is not set, we're in mock mode — accept any non-empty values

  // Mark order as paid + store payment details
  await db.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      razorpayPaymentId,
      razorpaySignature,
    },
  })

  // Increment coupon usage (if a coupon was applied)
  if (order.couponCode) {
    try {
      await db.coupon.update({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      })
    } catch {
      // ignore — best effort
    }
  }

  // Enroll the student if the order has a course attached
  let enrollment: any = null
  if (order.courseId) {
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: order.courseId } },
    })
    if (existing) {
      enrollment = existing
    } else {
      enrollment = await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: order.courseId,
          lastAccessed: new Date(),
        },
      })
      await db.course.update({
        where: { id: order.courseId },
        data: { studentsCount: { increment: 1 } },
      })

      // Award XP for course_enrolled
      try {
        const { awardXp, awardSpecificAchievement } = await import("@/lib/gamification")
        await awardXp(user.id, "course_enrolled", 25, order.courseId)
        // Spec-mandated: award FIRST_STEP on the user's first paid enrollment
        try {
          await awardSpecificAchievement(user.id, "FIRST_STEP")
        } catch (e) {
          console.error("[payment/verify] FIRST_STEP award failed:", e)
        }
      } catch (e) {
        console.error("[payment/verify] awardXp failed:", e)
      }

      // Send welcome email (best-effort)
      try {
        const { sendEmail } = await import("@/lib/email")
        const enrollUser = await db.user.findUnique({
          where: { id: user.id },
          select: { email: true, name: true },
        })
        const course = await db.course.findUnique({
          where: { id: order.courseId },
          select: { title: true },
        })
        if (enrollUser && course) {
          await sendEmail({
            to: enrollUser.email,
            subject: `📚 Enrolled — ${course.title}`,
            body: `Hi ${enrollUser.name},\n\nYou've successfully enrolled in "${course.title}" on GuardianX Academy.\n\nDive in and start learning. Your journey to becoming a cyber guardian starts now!\n\nThe GuardianX Team`,
            type: "notification",
            userId: user.id,
          })
        }
      } catch (e) {
        console.error("[payment/verify] sendEmail failed:", e)
      }
    }
  }

  return NextResponse.json({ success: true, enrollment })
})
