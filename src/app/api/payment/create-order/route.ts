import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, withErrorHandler } from "@/lib/session"

export const runtime = "nodejs"

/* POST /api/payment/create-order
 * -----------------------------
 * Requires auth. Accepts { courseId, couponCode? } and creates an Order
 * record with status="created". Since we don't have real Razorpay keys yet,
 * we return a MOCK razorpayOrderId — the verify endpoint will accept any
 * paymentId/signature for now. The full flow is ready: when RAZORPAY_KEY_ID
 * and RAZORPAY_KEY_SECRET are added to .env, swap the mock block for a real
 * `razorpay.orders.create()` call.
 *
 * Returns: { orderId, amount, currency, razorpayOrderId, keyId, mock }
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  const { courseId, couponCode } = body as { courseId?: string; couponCode?: string }

  // Resolve the amount: either from a course price, or default to a small
  // test amount so the flow can be exercised end-to-end without a course.
  let amount = 0
  let courseTitle = "Course Enrollment"

  if (courseId) {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, shortName: true, price: true },
    })
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })
    amount = course.price ?? 0
    courseTitle = course.title
  }

  if (amount <= 0) {
    return NextResponse.json(
      { error: "This course is free — no payment required", free: true },
      { status: 400 },
    )
  }

  // Validate + apply coupon (if provided)
  let discount = 0
  let finalAmount = amount
  let appliedCouponCode: string | null = null

  if (couponCode && couponCode.trim()) {
    const code = couponCode.trim()
    const coupon = await db.coupon.findUnique({ where: { code } })
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 })
    }
    if (!coupon.active) {
      return NextResponse.json({ error: "Coupon is no longer active" }, { status: 400 })
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    }
    const now = new Date()
    if (now < coupon.validFrom) {
      return NextResponse.json({ error: "Coupon is not yet valid" }, { status: 400 })
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }
    if (coupon.courseId && coupon.courseId !== courseId) {
      return NextResponse.json({ error: "Coupon not valid for this course" }, { status: 400 })
    }

    if (coupon.type === "percentage") {
      discount = Math.round((amount * coupon.value) / 100 * 100) / 100
    } else {
      // fixed
      discount = Math.min(coupon.value, amount)
    }
    finalAmount = Math.max(0, Math.round((amount - discount) * 100) / 100)
    appliedCouponCode = code
  }

  // Create the Order row. We store finalAmount as the figure the client pays
  // (in INR — Razorpay expects paise but our public API surfaces INR).
  const order = await db.order.create({
    data: {
      userId: user.id,
      courseId: courseId ?? null,
      batchId: null,
      amount,
      currency: "INR",
      status: "created",
      couponCode: appliedCouponCode,
      discount,
      finalAmount,
      // Mock Razorpay order ID — format mimics real Razorpay (order_XXXXX).
      // Replace with a real `razorpay.orders.create()` call once keys are set.
      razorpayOrderId: `order_mock_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    },
  })

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: order.razorpayOrderId,
    amount: finalAmount,
    currency: order.currency,
    courseTitle,
    keyId: process.env.RAZORPAY_KEY_ID ?? null,
    mock: true,
  })
})
