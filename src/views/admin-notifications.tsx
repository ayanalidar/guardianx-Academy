"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Bell, Users, Award, BookOpen, FlaskConical,
  Mail, Shield, AlertCircle, CheckCircle2, Trash2,
} from "lucide-react"

const NOTIF_ICONS: Record<string, any> = {
  enrollment: Users, certificate: Award, course: BookOpen, lab: FlaskConical,
  contact: Mail, exam: Shield, system: AlertCircle,
}

const NOTIF_COLORS: Record<string, string> = {
  enrollment: "text-violet-300", certificate: "text-emerald-300",
  course: "text-cyan-300", lab: "text-amber-300", contact: "text-blue-300",
  exam: "text-rose-300", system: "text-amber-300",
}

// Mock notifications — in production from /api/admin/notifications
const NOTIFICATIONS = [
  { id: 1, type: "enrollment", title: "New Enrollment", message: "Jamie Rivera enrolled in CEH Weekend Batch", time: "2 min ago", read: false },
  { id: 2, type: "certificate", title: "Certificate Issued", message: "GX-CERT-2025-0001 issued to student@academy.guardianx.cloud", time: "15 min ago", read: false },
  { id: 3, type: "contact", title: "New Contact Form Submission", message: "School inquiry from Delhi Public School", time: "1 hour ago", read: false },
  { id: 4, type: "lab", title: "Lab Completed", message: "SQL Injection lab completed by Jamie Rivera", time: "2 hours ago", read: true },
  { id: 5, type: "exam", title: "Exam Submitted", message: "Security+ exam submitted — Score: 85% (PASSED)", time: "3 hours ago", read: true },
  { id: 6, type: "system", title: "System Update", message: "Security headers added to next.config.ts", time: "5 hours ago", read: true },
  { id: 7, type: "enrollment", title: "New Registration", message: "New student registered: test-vapt@academy.guardianx.cloud", time: "8 hours ago", read: true },
]

export function NotificationCenterView() {
  const { navigate } = useAppStore()
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS)
  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  function markAllRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  function markRead(id: number) {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function removeNotif(id: number) {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-400" /> Notification Center
              {unreadCount > 0 && <Badge className="bg-rose-500 text-white border-0 text-[9px]">{unreadCount}</Badge>}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
            <Button size="sm" variant={filter === "unread" ? "default" : "outline"} onClick={() => setFilter("unread")}>Unread ({unreadCount})</Button>
            <Button size="sm" variant="ghost" onClick={markAllRead}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark all read</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        <Card className="overflow-hidden">
          <div className="divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              filtered.map(n => {
                const Icon = NOTIF_ICONS[n.type] || Bell
                const color = NOTIF_COLORS[n.type] || "text-muted-foreground"
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn("flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors", !n.read && "bg-violet-500/5")}
                  >
                    <div className={cn("inline-flex p-2 rounded-lg bg-muted/50 shrink-0", color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => markRead(n.id)}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeNotif(n.id)} className="text-muted-foreground hover:text-rose-400 px-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
