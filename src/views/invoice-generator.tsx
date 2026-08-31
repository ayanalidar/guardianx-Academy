"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  FileText, Plus, Trash2, Download, Copy, ArrowLeft, Building2,
  User, Mail, Phone, MapPin, Calendar, Hash, DollarSign,
  Calculator, Shield, Award, Sparkles, Printer,
} from "lucide-react"
import { toast } from "sonner"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export function InvoiceGeneratorView() {
  const { navigate } = useAppStore()
  const [invoiceNumber, setInvoiceNumber] = React.useState(`GX-INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`)
  const [issueDate, setIssueDate] = React.useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = React.useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 15)
    return d.toISOString().split("T")[0]
  })

  // Client info
  const [clientName, setClientName] = React.useState("")
  const [clientOrg, setClientOrg] = React.useState("")
  const [clientEmail, setClientEmail] = React.useState("")
  const [clientPhone, setClientPhone] = React.useState("")
  const [clientAddress, setClientAddress] = React.useState("")

  // Line items
  const [items, setItems] = React.useState<LineItem[]>([
    { id: "1", description: "CEH Certification Training Batch (Weekend)", quantity: 1, unitPrice: 25000 },
    { id: "2", description: "Hands-on Cyber Lab Access (31 labs, 3 months)", quantity: 1, unitPrice: 5000 },
  ])

  // Tax & discount
  const [taxRate, setTaxRate] = React.useState(18) // GST 18%
  const [discountRate, setDiscountRate] = React.useState(0)
  const [currency, setCurrency] = React.useState("INR")

  // Notes
  const [notes, setNotes] = React.useState("Payment due within 15 days of invoice date. Late payments subject to 2% monthly interest. All prices are inclusive of applicable taxes unless otherwise stated.")
  const [terms, setTerms] = React.useState("1. Training includes instructor-led sessions, study materials, and lab access.\n2. Certification exam fee is separate unless stated.\n3. Cancellation: 50% refund if cancelled 7+ days before start. No refund within 7 days.\n4. GuardianX Academy is not liable for third-party certification exam outcomes.")

  function addItem() {
    setItems([...items, { id: String(Date.now()), description: "", quantity: 1, unitPrice: 0 }])
  }

  function removeItem(id: string) {
    setItems(items.filter(i => i.id !== id))
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)
  const discountAmount = (subtotal * discountRate) / 100
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  function formatMoney(amount: number) {
    return `${currencySymbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function handlePrint() {
    window.print()
    toast.success("Invoice print dialog opened — save as PDF")
  }

  function handleCopyInvoiceNumber() {
    navigator.clipboard?.writeText(invoiceNumber)
    toast.success("Invoice number copied!")
  }

  return (
    <div className="relative min-h-screen">
      {/* Header bar — hidden on print */}
      <div className="print:hidden border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Admin
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-400" />
                Invoice Generator
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">{invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyInvoiceNumber}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy ID
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-violet-600 hover:bg-violet-500 btn-premium">
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Generate PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        {/* === EDITOR PANEL (hidden on print) === */}
        <div className="print:hidden space-y-6 mb-8">
          {/* Invoice meta */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Hash className="h-4 w-4 text-violet-400" /> Invoice Details</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Invoice Number</Label>
                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs">Issue Date</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-3">
              <div>
                <Label className="text-xs">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                    <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">£ GBP (Pound)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Tax Rate (%)</Label>
                <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Discount (%)</Label>
                <Input type="number" value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))} />
              </div>
            </div>
          </Card>

          {/* Client info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><User className="h-4 w-4 text-cyan-400" /> Client Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Contact Name</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <Label className="text-xs">Organization</Label>
                <Input value={clientOrg} onChange={(e) => setClientOrg(e.target.value)} placeholder="Organization Name" />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Address</Label>
                <Textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Full billing address" rows={2} />
              </div>
            </div>
          </Card>

          {/* Line items */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Calculator className="h-4 w-4 text-amber-400" /> Line Items</h2>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-6">
                    <Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Description" className="text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} placeholder="Qty" className="text-sm" />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} placeholder="Unit Price" className="text-sm" />
                  </div>
                  <div className="col-span-1">
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)} className="text-rose-400 hover:text-rose-300 px-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes & Terms */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-400" /> Notes & Terms</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Payment Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-xs" />
              </div>
              <div>
                <Label className="text-xs">Terms & Conditions</Label>
                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={4} className="text-xs" />
              </div>
            </div>
          </Card>
        </div>

        {/* === INVOICE PREVIEW (visible on screen + print) === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          id="invoice-preview"
          className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden"
          style={{ minHeight: "297mm" }}
        >
          {/* Invoice header with gradient + logo */}
          <div className="relative bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900 text-white p-8 lg:p-10">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
            <div className="relative flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Logo image */}
                <img
                  src="/guardianx-logo-v2.png"
                  alt="GuardianX Academy"
                  className="w-16 h-16 object-contain"
                  style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
                />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">GuardianX Academy</h1>
                  <p className="text-xs text-violet-200 mt-1">Cybersecurity Training & Certification</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-violet-200">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> academy@guardianx.in</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Bengaluru, India</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tracking-tight">INVOICE</div>
                <div className="text-xs text-violet-200 font-mono mt-1">{invoiceNumber}</div>
                <div className="flex items-center gap-2 mt-2 text-[10px]">
                  <Badge className="bg-white/20 text-white border-0">PROFESSIONAL</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To + Dates */}
          <div className="grid sm:grid-cols-2 gap-6 p-8 lg:p-10 border-b border-gray-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Bill To</p>
              <p className="font-semibold text-gray-900">{clientName || "Client Name"}</p>
              {clientOrg && <p className="text-sm text-gray-600">{clientOrg}</p>}
              {clientEmail && <p className="text-xs text-gray-500 mt-1">{clientEmail}</p>}
              {clientPhone && <p className="text-xs text-gray-500">{clientPhone}</p>}
              {clientAddress && <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{clientAddress}</p>}
            </div>
            <div className="sm:text-right">
              <div className="space-y-2">
                <div className="flex sm:justify-end items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Issue Date:</span>
                  <span className="text-xs font-medium">{new Date(issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex sm:justify-end items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Due Date:</span>
                  <span className="text-xs font-medium">{new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="p-8 lg:p-10">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</th>
                  <th className="text-center py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20">Qty</th>
                  <th className="text-right py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 w-32">Unit Price</th>
                  <th className="text-right py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-700">{item.description || "—"}</td>
                    <td className="py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-sm text-gray-600">{formatMoney(item.unitPrice)}</td>
                    <td className="py-3 text-right text-sm font-medium text-gray-900">{formatMoney(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatMoney(subtotal)}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount ({discountRate}%)</span>
                    <span className="text-rose-600">−{formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{taxRate > 0 ? `Tax (${taxRate}%)` : "Tax"}</span>
                  <span className="font-medium">{formatMoney(taxAmount)}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-violet-700">{formatMoney(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="px-8 lg:px-10 pb-6 grid sm:grid-cols-2 gap-6">
            {notes && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Notes</p>
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Terms & Conditions</p>
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{terms}</p>
              </div>
            )}
          </div>

          {/* Footer with trust indicators */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-gray-200 px-8 lg:px-10 py-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Shield className="h-3.5 w-3.5 text-violet-600" /> Verified Training Provider
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Award className="h-3.5 w-3.5 text-violet-600" /> ISO-Aligned Curriculum
                </div>
              </div>
              <div className="text-[10px] text-gray-400">
                academy.guardianx.cloud · academy@guardianx.in · academy@guardianx.cloud
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
