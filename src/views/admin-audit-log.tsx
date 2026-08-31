"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Search, Filter, Shield, FileText, User,
  Award, BookOpen, Settings, Download,
} from "lucide-react"

const ACTION_ICONS: Record<string, any> = {
  user_create: User, user_update: Settings, user_delete: User,
  course_create: BookOpen, course_update: BookOpen, course_publish: BookOpen,
  cert_issue: Award, cert_revoke: Award,
  batch_create: FileText, batch_update: FileText,
  exam_create: Shield, exam_submit: Shield,
  settings_change: Settings,
}

const ACTION_COLORS: Record<string, string> = {
  create: "text-emerald-300", update: "text-cyan-300", delete: "text-rose-300",
  publish: "text-violet-300", issue: "text-amber-300", revoke: "text-rose-300",
  change: "text-blue-300", submit: "text-violet-300",
}

// Mock audit log entries — in production from /api/admin/audit-logs
const LOGS = [
  { id: 1, action: "cert_issue", actor: "admin@academy.guardianx.cloud", target: "student@academy.guardianx.cloud", detail: "Issued GX-CERT-2025-0001 (CEH)", timestamp: "2025-08-31T15:30:00Z" },
  { id: 2, action: "course_publish", actor: "admin@academy.guardianx.cloud", target: "Ethical Hacking Fundamentals", detail: "Published course", timestamp: "2025-08-31T14:20:00Z" },
  { id: 3, action: "user_create", actor: "system", target: "raj@academy.guardianx.cloud", detail: "Bulk import — 5 students", timestamp: "2025-08-31T13:15:00Z" },
  { id: 4, action: "settings_change", actor: "admin@academy.guardianx.cloud", target: "platform", detail: "Updated NEXTAUTH_URL", timestamp: "2025-08-31T12:00:00Z" },
  { id: 5, action: "exam_submit", actor: "student@academy.guardianx.cloud", target: "GX Security Analyst Exam", detail: "Score: 85% — PASSED", timestamp: "2025-08-31T11:45:00Z" },
  { id: 6, action: "cert_revoke", actor: "admin@academy.guardianx.cloud", target: "GX-CERT-2025-0003", detail: "Revoked — academic integrity violation", timestamp: "2025-08-30T18:30:00Z" },
  { id: 7, action: "batch_create", actor: "admin@academy.guardianx.cloud", target: "CEH Weekend Batch", detail: "Created batch GX-BATCH-2025-001", timestamp: "2025-08-30T16:00:00Z" },
  { id: 8, action: "course_update", actor: "instructor@academy.guardianx.cloud", target: "Web Application Security", detail: "Updated module 3 lesson 2", timestamp: "2025-08-30T14:30:00Z" },
]

export function AuditLogView() {
  const { navigate } = useAppStore()
  const [search, setSearch] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState("all")

  const filtered = LOGS.filter(l => {
    if (search && !l.actor.includes(search) && !l.target.includes(search) && !l.detail.includes(search)) return false
    if (actionFilter !== "all" && !l.action.startsWith(actionFilter)) return false
    return true
  })

  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-400" /> Audit Log Viewer
            </h1>
          </div>
          <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search actor, target, detail..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="cert">Certificate</SelectItem>
              <SelectItem value="batch">Batch</SelectItem>
              <SelectItem value="exam">Exam</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log entries */}
        <Card className="overflow-hidden">
          <div className="divide-y divide-border/40">
            {filtered.map(log => {
              const Icon = ACTION_ICONS[log.action] || FileText
              const actionType = log.action.split("_")[1] || log.action
              const color = ACTION_COLORS[actionType] || "text-muted-foreground"
              return (
                <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <div className={cn("inline-flex p-2 rounded-lg bg-muted/50 shrink-0", color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-[9px]", color)}>{log.action}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{log.actor}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{log.detail}</p>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Target: <span className="font-mono">{log.target}</span> · {new Date(log.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">No audit log entries found.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
