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
  FileText, Plus, Trash2, ArrowLeft, Building2, User, Calendar,
  Target, CheckCircle2, DollarSign, Printer, Sparkles,
  ShieldCheck, Award, GraduationCap, FlaskConical, Trophy,
  BookOpen, Users, ArrowRight, Clock,
} from "lucide-react"
import { toast } from "sonner"

interface Module {
  id: string
  title: string
  description: string
  duration: string
  deliverables: string
}

export function ProposalMakerView() {
  const { navigate } = useAppStore()

  // Proposal meta
  const [proposalNumber, setProposalNumber] = React.useState(`GX-PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`)
  const [proposalDate, setProposalDate] = React.useState(new Date().toISOString().split("T")[0])
  const [validUntil, setValidUntil] = React.useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split("T")[0]
  })

  // Institution info
  const [institutionName, setInstitutionName] = React.useState("")
  const [institutionType, setInstitutionType] = React.useState("School")
  const [contactName, setContactName] = React.useState("")
  const [contactEmail, setContactEmail] = React.useState("")
  const [contactPhone, setContactPhone] = React.useState("")
  const [institutionAddress, setInstitutionAddress] = React.useState("")

  // Proposal details
  const [proposalTitle, setProposalTitle] = React.useState("Cybersecurity Training Partnership Proposal")
  const [programDuration, setProgramDuration] = React.useState("12 weeks")
  const [deliveryMode, setDeliveryMode] = React.useState("Hybrid")
  const [targetAudience, setTargetAudience] = React.useState("Students (Grades 9-12)")

  // Executive summary
  const [executiveSummary, setExecutiveSummary] = React.useState(
    "GuardianX Academy proposes a comprehensive cybersecurity training partnership designed to equip your students with practical, industry-relevant skills. Our instructor-led training combines live lectures, hands-on labs, and certification preparation to create job-ready cybersecurity professionals."
  )

  // Objectives
  const [objectives, setObjectives] = React.useState([
    "Build foundational cybersecurity knowledge aligned with academic curriculum",
    "Provide hands-on practice through 31 Docker-powered cyber labs",
    "Prepare students for industry-recognized certifications (CEH, Security+, CCNA)",
    "Develop practical skills through real-world scenarios and CTF challenges",
    "Issue verifiable GuardianX credentials upon successful completion",
  ])

  // Modules
  const [modules, setModules] = React.useState<Module[]>([
    { id: "1", title: "Cybersecurity Fundamentals", description: "Introduction to security principles, threats, and defenses", duration: "2 weeks", deliverables: "8 live sessions + 5 labs + quiz" },
    { id: "2", title: "Network Security", description: "Network protocols, firewalls, IDS/IPS, and secure architecture", duration: "3 weeks", deliverables: "12 live sessions + 8 labs + assessment" },
    { id: "3", title: "Web Application Security", description: "OWASP Top 10, SQL injection, XSS, and secure coding", duration: "3 weeks", deliverables: "12 live sessions + 10 labs + CTF" },
    { id: "4", title: "Capstone Project & Certification", description: "Real-world assessment, mock exam, and GuardianX certification", duration: "4 weeks", deliverables: "Capstone lab + proctored exam + credential" },
  ])

  // Pricing
  const [currency, setCurrency] = React.useState("INR")
  const [perStudentPrice, setPerStudentPrice] = React.useState(5000)
  const [studentCount, setStudentCount] = React.useState(50)
  const [labAccessFee, setLabAccessFee] = React.useState(25000)
  const [instructorFee, setInstructorFee] = React.useState(40000)
  const [discountRate, setDiscountRate] = React.useState(10)

  const studentTotal = perStudentPrice * studentCount
  const subtotal = studentTotal + labAccessFee + instructorFee
  const discountAmount = (subtotal * discountRate) / 100
  const total = subtotal - discountAmount
  const currencySymbol = currency === "INR" ? "₹" : "$"
  const fmt = (a: number) => `${currencySymbol}${a.toLocaleString("en-IN")}`

  // Why GuardianX
  const [whyUs, setWhyUs] = React.useState([
    { icon: "ShieldCheck", title: "Expert Instructors", desc: "Learn from certified cybersecurity professionals with 10+ years of industry experience." },
    { icon: "FlaskConical", title: "Hands-on Labs", desc: "31 Docker-powered cyber labs with real vulnerable environments, not simulations." },
    { icon: "Award", title: "Verifiable Credentials", desc: "GuardianX certifications with public verification — employers can validate any credential." },
    { icon: "Trophy", title: "CTF Arena", desc: "Competitive capture-the-flag challenges to test skills against real scenarios." },
  ])

  function addObjective() {
    setObjectives([...objectives, ""])
  }

  function updateObjective(index: number, value: string) {
    setObjectives(objectives.map((o, i) => i === index ? value : o))
  }

  function removeObjective(index: number) {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  function addModule() {
    setModules([...modules, { id: String(Date.now()), title: "", description: "", duration: "", deliverables: "" }])
  }

  function removeModule(id: string) {
    setModules(modules.filter(m => m.id !== id))
  }

  function updateModule(id: string, field: keyof Module, value: string) {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  function handlePrint() {
    window.print()
    toast.success("Proposal print dialog opened — save as PDF")
  }

  const iconMap: Record<string, any> = { ShieldCheck, FlaskConical, Award, Trophy, BookOpen, Users, Target, GraduationCap }

  return (
    <div className="relative min-h-screen">
      {/* Header bar */}
      <div className="print:hidden border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Admin
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                Proposal Maker
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">{proposalNumber}</p>
            </div>
          </div>
          <Button size="sm" onClick={handlePrint} className="bg-cyan-600 hover:bg-cyan-500 btn-premium">
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Generate PDF
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        {/* === EDITOR PANEL === */}
        <div className="print:hidden space-y-6 mb-8">
          {/* Meta */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Proposal Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Proposal Number</Label><Input value={proposalNumber} onChange={(e) => setProposalNumber(e.target.value)} className="font-mono text-sm" /></div>
              <div><Label className="text-xs">Date</Label><Input type="date" value={proposalDate} onChange={(e) => setProposalDate(e.target.value)} /></div>
              <div><Label className="text-xs">Valid Until</Label><Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
              <div><Label className="text-xs">Proposal Title</Label><Input value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} /></div>
            </div>
          </Card>

          {/* Institution info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Institution Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Institution Name</Label><Input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="e.g. Delhi Public School" /></div>
              <div>
                <Label className="text-xs">Institution Type</Label>
                <Select value={institutionType} onValueChange={setInstitutionType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="School">School (K-12)</SelectItem><SelectItem value="College">College</SelectItem><SelectItem value="University">University</SelectItem><SelectItem value="Corporate">Corporate</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Contact Name</Label><Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Principal / Director / HR" /></div>
              <div><Label className="text-xs">Contact Email</Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
              <div><Label className="text-xs">Contact Phone</Label><Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></div>
              <div><Label className="text-xs">Address</Label><Input value={institutionAddress} onChange={(e) => setInstitutionAddress(e.target.value)} /></div>
            </div>
          </Card>

          {/* Program details */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Program Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Program Duration</Label><Input value={programDuration} onChange={(e) => setProgramDuration(e.target.value)} /></div>
              <div>
                <Label className="text-xs">Delivery Mode</Label>
                <Select value={deliveryMode} onValueChange={setDeliveryMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="On-campus">On-campus</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label className="text-xs">Target Audience</Label><Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Executive Summary</Label><Textarea value={executiveSummary} onChange={(e) => setExecutiveSummary(e.target.value)} rows={3} className="text-xs" /></div>
            </div>
          </Card>

          {/* Objectives */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold">Learning Objectives</h2><Button size="sm" variant="outline" onClick={addObjective}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></div>
            <div className="space-y-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={obj} onChange={(e) => updateObjective(i, e.target.value)} className="text-sm" placeholder="Objective..." />
                  <Button size="sm" variant="ghost" onClick={() => removeObjective(i)} className="text-rose-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Modules */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold">Program Modules</h2><Button size="sm" variant="outline" onClick={addModule}><Plus className="h-3.5 w-3.5 mr-1" /> Add Module</Button></div>
            <div className="space-y-3">
              {modules.map((m) => (
                <div key={m.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input value={m.title} onChange={(e) => updateModule(m.id, "title", e.target.value)} placeholder="Module title" className="text-sm font-medium" />
                    <Input value={m.duration} onChange={(e) => updateModule(m.id, "duration", e.target.value)} placeholder="Duration" className="text-sm w-32" />
                    <Button size="sm" variant="ghost" onClick={() => removeModule(m.id)} className="text-rose-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <Input value={m.description} onChange={(e) => updateModule(m.id, "description", e.target.value)} placeholder="Description" className="text-xs" />
                  <Input value={m.deliverables} onChange={(e) => updateModule(m.id, "deliverables", e.target.value)} placeholder="Deliverables (e.g. 8 sessions + 5 labs)" className="text-xs" />
                </div>
              ))}
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-3">Pricing</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label className="text-xs">Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INR">₹ INR</SelectItem><SelectItem value="USD">$ USD</SelectItem></SelectContent></Select></div>
              <div><Label className="text-xs">Per Student Price</Label><Input type="number" value={perStudentPrice} onChange={(e) => setPerStudentPrice(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Student Count</Label><Input type="number" value={studentCount} onChange={(e) => setStudentCount(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Lab Access Fee</Label><Input type="number" value={labAccessFee} onChange={(e) => setLabAccessFee(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Instructor Fee</Label><Input type="number" value={instructorFee} onChange={(e) => setInstructorFee(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Discount (%)</Label><Input type="number" value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))} /></div>
            </div>
          </Card>
        </div>

        {/* === PROPOSAL PREVIEW === */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} id="proposal-preview" className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden" style={{ minHeight: "297mm" }}>
          {/* Cover page */}
          <div className="relative bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900 text-white p-8 lg:p-12">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <img src="/guardianx-logo-v2.png" alt="GuardianX" className="w-16 h-16 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" }} />
                <div>
                  <h1 className="text-2xl font-bold">GuardianX Academy</h1>
                  <p className="text-xs text-violet-200">Cybersecurity Training & Certification</p>
                </div>
              </div>
              <div className="mt-12 mb-8">
                <Badge className="bg-white/20 text-white border-0 mb-3">PARTNERSHIP PROPOSAL</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">{proposalTitle}</h2>
                <p className="text-sm text-violet-200 mt-3">Prepared for {institutionName || "your institution"}</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 rounded-lg p-3"><p className="text-[10px] text-violet-200 uppercase">Proposal #</p><p className="font-mono text-sm">{proposalNumber}</p></div>
                <div className="bg-white/10 rounded-lg p-3"><p className="text-[10px] text-violet-200 uppercase">Date</p><p className="text-sm">{new Date(proposalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                <div className="bg-white/10 rounded-lg p-3"><p className="text-[10px] text-violet-200 uppercase">Valid Until</p><p className="text-sm">{new Date(validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
              </div>
            </div>
          </div>

          {/* Institution + Program summary */}
          <div className="p-8 lg:p-10 grid sm:grid-cols-2 gap-8 border-b border-gray-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Prepared For</p>
              <p className="font-semibold">{institutionName || "Institution Name"}</p>
              <p className="text-sm text-gray-600">{institutionType}</p>
              {contactName && <p className="text-xs text-gray-500 mt-1">{contactName}</p>}
              {contactEmail && <p className="text-xs text-gray-500">{contactEmail}</p>}
              {contactPhone && <p className="text-xs text-gray-500">{contactPhone}</p>}
              {institutionAddress && <p className="text-xs text-gray-500 mt-1">{institutionAddress}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Program Overview</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{programDuration}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery Mode</span><span className="font-medium">{deliveryMode}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Target Audience</span><span className="font-medium">{targetAudience}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Students</span><span className="font-medium">{studentCount}</span></div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-8 lg:p-10 border-b border-gray-200">
            <h3 className="text-lg font-bold mb-3">Executive Summary</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{executiveSummary}</p>
          </div>

          {/* Objectives */}
          <div className="p-8 lg:p-10 border-b border-gray-200">
            <h3 className="text-lg font-bold mb-4">Learning Objectives</h3>
            <div className="space-y-2">
              {objectives.filter(o => o.trim()).map((obj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="p-8 lg:p-10 border-b border-gray-200">
            <h3 className="text-lg font-bold mb-4">Program Curriculum</h3>
            <div className="space-y-3">
              {modules.map((m, i) => (
                <div key={m.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-violet-600 text-white text-xs font-bold">{i + 1}</span>
                      <h4 className="font-semibold text-sm">{m.title || "Module"}</h4>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono">{m.duration}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 ml-8">{m.description}</p>
                  {m.deliverables && <p className="text-[10px] text-gray-400 ml-8 mt-1">Deliverables: {m.deliverables}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Why GuardianX */}
          <div className="p-8 lg:p-10 border-b border-gray-200">
            <h3 className="text-lg font-bold mb-4">Why GuardianX?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {whyUs.map((w, i) => {
                const Icon = iconMap[w.icon] || ShieldCheck
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="inline-flex p-2 rounded-lg bg-violet-100"><Icon className="h-4 w-4 text-violet-600" /></div>
                    <div><h4 className="font-semibold text-sm">{w.title}</h4><p className="text-xs text-gray-600">{w.desc}</p></div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-8 lg:p-10 border-b border-gray-200">
            <h3 className="text-lg font-bold mb-4">Investment</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 text-sm text-gray-600">Training Fee ({studentCount} students × {fmt(perStudentPrice)})</td><td className="py-2 text-right text-sm font-medium">{fmt(studentTotal)}</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-sm text-gray-600">Cyber Lab Access (31 labs, {programDuration})</td><td className="py-2 text-right text-sm font-medium">{fmt(labAccessFee)}</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-sm text-gray-600">Instructor & Material Fee</td><td className="py-2 text-right text-sm font-medium">{fmt(instructorFee)}</td></tr>
                {discountRate > 0 && <tr className="border-b border-gray-100"><td className="py-2 text-sm text-gray-600">Discount ({discountRate}%)</td><td className="py-2 text-right text-sm text-rose-600">−{fmt(discountAmount)}</td></tr>}
                <tr className="border-t-2 border-gray-300"><td className="py-3 font-bold">Total Investment</td><td className="py-3 text-right font-bold text-lg text-violet-700">{fmt(total)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-gray-200 px-8 lg:px-10 py-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><ShieldCheck className="h-3.5 w-3.5 text-violet-600" /> Verified Training Provider</div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><Award className="h-3.5 w-3.5 text-violet-600" /> ISO-Aligned Curriculum</div>
              </div>
              <div className="text-[10px] text-gray-400">academy.guardianx.cloud · academy@guardianx.in · academy@guardianx.cloud</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
