import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* POST /api/payment/verify
 * -----------------------
 * Requires auth. Accepts { orderId, razorpayPaymentId, razorpaySignature }.
 *
 * In production, this would verify the HMAC SHA-256 signature using the
 * Razorpay key secret:
 *   const body = `${razorpayOrderId}|${razorpayPaymentId}`
 *   const expected = crypto.createHmac("sha256", KEY_SECRET).update(body).digest("hex")
 *   if (expected !== razorpaySignature) → fail
 *
 * For now (mock mode), we accept any non-empty paymentId/signature and:
 *   1. Mark the Order as "paid".
 *   2. If the Order has a courseId, enroll the student (create Enrollment if
 *      not present, increment Course.studentsCount).
 *   3. Award 25 XP via the gamification engine (course_enrolled).
 *   4. Increment the coupon's usedCount if a coupon was applied.
 *
 * Returns { success: true, enrollment }
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

  // Real signature verification would go here. In mock mode we accept any
  // non-empty values so the flow can be exercised end-to-end.
  // To enable real verification, set RAZORPAY_KEY_SECRET in .env and add:
  //   const crypto = require("crypto")
  //   const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
  //     .update(`${order.razorpayOrderId}|${razorpayPaymentId}`).digest("hex")
  //   if (expected !== razorpaySignature) return 400

  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden — order belongs to another user" }, { status: 403 })
  }
  if (order.status === "paid") {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 })
  }

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
