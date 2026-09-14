import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifyAdmins, leadNotificationEmailTemplate } from "@/lib/email"
import { getSetting } from "@/lib/settings"

export const runtime = "nodejs"

/* POST /api/crm/batch-webhook
 *
 * Google Apps Script webhook receiver for per-batch Google Forms.
 * When a batch's Google Form is submitted, the per-batch Apps Script
 * sends the response here with the batchId baked in.
 *
 * Expected body (from the per-batch Apps Script):
 * {
 *   "token": "guardianx-crm-webhook-2025",
 *   "formId": "form-id-from-google",
 *   "lead": {
 *     "batchId": "cmt...",        // baked into the script
 *     "batchName": "CEH Weekend",  // baked into the script
 *     "certification": "CEH",       // baked into the script
 *     "name": "John Doe",
 *     "whatsappNumber": "+91 98765 43210",
 *     "linkedinProfile": "https://linkedin.com/in/johndoe",
 *     "professionalStatus": "Working Professional",
 *     "jobRole": "Software Engineer"
 *   }
 * }
 *
 * Creates a BatchLead record linked to the correct batch.
 * No auth — the webhook URL + token provide security.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

    // Verify webhook token
    // Falls back to the hardcoded token that the Apps Script sends.
    // The user can override by setting CRM_WEBHOOK_SECRET on Vercel.
    const webhookSecret = await getSetting("CRM_WEBHOOK_SECRET") || "guardianx-crm-webhook-2025"
    if (body.token !== webhookSecret) {
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 })
    }

    const lead = body.lead || {}
    if (!lead.batchId) {
      return NextResponse.json({ error: "batchId is required (use the per-batch Apps Script)" }, { status: 400 })
    }
    if (!lead.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!lead.whatsappNumber) {
      return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 })
    }

    // Verify the batch exists
    const batch = await db.trainingBatch.findUnique({
      where: { id: lead.batchId },
      select: { id: true, name: true, certification: true },
    })
    if (!batch) {
      return NextResponse.json({ error: "Batch not found for batchId: " + lead.batchId }, { status: 404 })
    }

    // Create the BatchLead
    const batchLead = await db.batchLead.create({
      data: {
        batchId: batch.id,
        name: String(lead.name).trim(),
        whatsappNumber: String(lead.whatsappNumber).trim(),
        linkedinProfile: lead.linkedinProfile ? String(lead.linkedinProfile).trim() : null,
        professionalStatus: lead.professionalStatus ? String(lead.professionalStatus).trim() : null,
        jobRole: lead.jobRole ? String(lead.jobRole).trim() : null,
        source: "Google Form",
      },
    })

    // --- email notification to admins ---
    await notifyAdmins(
      `New Batch Lead — ${batch.name} (${batch.certification}) — ${lead.name}`,
      leadNotificationEmailTemplate(`Batch Lead — ${batch.name}`, [
        { label: "Name", value: String(lead.name).trim() },
        { label: "WhatsApp", value: String(lead.whatsappNumber).trim() },
        { label: "LinkedIn", value: lead.linkedinProfile ? String(lead.linkedinProfile).trim() : "—" },
        { label: "Status", value: lead.professionalStatus ? String(lead.professionalStatus).trim() : "—" },
        { label: "Job role", value: lead.jobRole ? String(lead.jobRole).trim() : "—" },
        { label: "Batch", value: `${batch.name} (${batch.certification})` },
      ])
    )

    return NextResponse.json({ ok: true, id: batchLead.id }, { status: 201 })
  } catch (error: any) {
    // If it's a unique constraint (duplicate submission), return a friendly error
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Duplicate lead — this form has already been submitted" }, { status: 409 })
    }
    console.error("[batch-webhook] Error:", error?.message || error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
