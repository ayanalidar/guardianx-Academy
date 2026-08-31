"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Activity, Server, Database, Zap, Clock,
  CheckCircle2, AlertTriangle, Cpu, HardDrive, Wifi,
} from "lucide-react"

export function PlatformHealthView() {
  const { navigate } = useAppStore()

  const services = [
    { name: "Web Application", status: "operational", latency: 45, icon: Server, color: "text-emerald-300" },
    { name: "Database (Neon PostgreSQL)", status: "operational", latency: 12, icon: Database, color: "text-emerald-300" },
    { name: "Authentication (NextAuth)", status: "operational", latency: 38, icon: Cpu, color: "text-emerald-300" },
    { name: "CMS API", status: "operational", latency: 28, icon: HardDrive, color: "text-emerald-300" },
    { name: "Email Service (Hostinger SMTP)", status: "degraded", latency: 250, icon: Wifi, color: "text-amber-300" },
    { name: "Cyber Range Labs", status: "operational", latency: 120, icon: Zap, color: "text-emerald-300" },
  ]

  const stats = [
    { label: "Uptime (30d)", value: "99.94%", icon: CheckCircle2, color: "text-emerald-300", tint: "bg-emerald-500/10" },
    { label: "Avg Response", value: "82ms", icon: Clock, color: "text-cyan-300", tint: "bg-cyan-500/10" },
    { label: "Error Rate", value: "0.06%", icon: AlertTriangle, color: "text-amber-300", tint: "bg-amber-500/10" },
    { label: "Active Sessions", value: 3, icon: Activity, color: "text-violet-300", tint: "bg-violet-500/10" },
  ]

  const STATUS_BADGE: Record<string, string> = {
    operational: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    degraded: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    down: "bg-rose-500/10 text-rose-300 border-rose-500/30",
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
              <Activity className="h-5 w-5 text-emerald-400" /> Platform Health Monitor
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-xs text-muted-foreground font-mono">LIVE</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("inline-flex p-2 rounded-lg", s.tint)}><s.icon className={cn("h-4 w-4", s.color)} /></div>
                <div><div className="text-xl font-bold">{s.value}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Services */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Service Status</h2>
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("inline-flex p-2 rounded-lg bg-muted/50", s.color)}><s.icon className="h-3.5 w-3.5" /></div>
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">{s.latency}ms</span>
                  <Badge className={cn("text-[9px] border", STATUS_BADGE[s.status])}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Response time chart */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Response Time (last 24h)</h2>
          <div className="flex items-end gap-1 h-32">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = 30 + Math.random() * 60
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t" style={{ height: `${height}%` }} />
                  <span className="text-[8px] text-muted-foreground">{i}h</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* System info */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-3">System Information</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Framework</span><span className="font-medium">Next.js 16</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Database</span><span className="font-medium">PostgreSQL (Neon)</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Auth</span><span className="font-medium">NextAuth v4 (JWT)</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Deployment</span><span className="font-medium">Vercel</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Domain</span><span className="font-medium">academy.guardianx.cloud</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Region</span><span className="font-medium">ap-south-1 (Mumbai)</span></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
