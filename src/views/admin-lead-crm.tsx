"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import {
  ArrowLeft, Users, TrendingUp, FileText, ExternalLink, Mail,
  Phone, Building2, Clock, CheckCircle2, AlertCircle, Filter,
  UserPlus, Search,
} from "lucide-react"
import { toast } from "sonner"

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Converted", "Lost"]
const LEAD_TYPES = ["Individual", "School", "College", "University", "Corporate", "Partner", "Workshop", "CTF", "Webinar"]

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  Contacted: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  Qualified: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  Proposal: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Negotiation: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  Converted: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Lost: "bg-rose-500/10 text-rose-300 border-rose-500/30",
}

export function LeadCrmView() {
  const { navigate } = useAppStore()
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [search, setSearch] = React.useState("")

  // Fetch leads from contact submissions (EmailLog type=notification)
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ["admin-leads", statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("q", search)
      const res = await fetch(`/api/admin/leads?${params}`)
      if (!res.ok) return { leads: [], stats: {} }
      return res.json()
    },
  })

  const leads = leadsData?.leads ?? []
  const stats = leadsData?.stats ?? { total: 0, new: 0, converted: 0, qualified: 0 }

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" /> Lead / CRM Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://docs.google.com/spreadsheets/create" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <FileText className="h-3.5 w-3.5 mr-1.5" /> Export to Google Sheets
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: stats.total || 0, icon: Users, color: "text-violet-300", tint: "bg-violet-500/10" },
            { label: "New", value: stats.new || 0, icon: AlertCircle, color: "text-blue-300", tint: "bg-blue-500/10" },
            { label: "Qualified", value: stats.qualified || 0, icon: CheckCircle2, color: "text-amber-300", tint: "bg-amber-500/10" },
            { label: "Converted", value: stats.converted || 0, icon: TrendingUp, color: "text-emerald-300", tint: "bg-emerald-500/10" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("inline-flex p-2 rounded-lg", s.tint)}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
                <div>
                  <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leads..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Leads table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Organization</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading leads...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No leads found. Contact form submissions appear here.</td></tr>
                ) : (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="border-t border-border/40 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm font-medium">{lead.name || "—"}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{lead.organization || lead.category || "—"}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          {lead.email && <a href={`mailto:${lead.email}`} className="text-violet-300 hover:underline text-xs"><Mail className="h-3 w-3 inline mr-1" />{lead.email}</a>}
                        </div>
                      </td>
                      <td className="py-3 px-4"><Badge variant="outline" className="text-[9px]">{lead.type || "Individual"}</Badge></td>
                      <td className="py-3 px-4"><Badge className={cn("text-[9px] border", STATUS_COLORS[lead.status || "New"] || STATUS_COLORS.New)}>{lead.status || "New"}</Badge></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Google Docs integration note */}
        <Card className="p-5 border-violet-500/20 bg-violet-500/5">
          <div className="flex items-start gap-3">
            <div className="inline-flex p-2 rounded-lg bg-violet-500/10">
              <ExternalLink className="h-4 w-4 text-violet-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Google Docs Integration</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Export leads to Google Sheets for team collaboration, or generate proposal documents from templates.
                Click "Export to Google Sheets" above to create a new spreadsheet with current lead data.
              </p>
              <div className="flex gap-2">
                <a href="https://docs.google.com/spreadsheets/create" target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5 mr-1.5" /> New Google Sheet</Button>
                </a>
                <a href="https://docs.google.com/document/create" target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5 mr-1.5" /> New Google Doc</Button>
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
