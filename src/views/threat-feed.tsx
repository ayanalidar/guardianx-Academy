"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "@/components/platform/motion-system"
import {
  Radio,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  Search,
  Filter,
  Bug,
  Activity,
  Database,
  Skull,
  AlertTriangle,
  Eye,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

/* ============================================================
   ThreatFeedView — Live threat intelligence dashboard
   ============================================================ */

interface ThreatItem {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  category: string
  source: string
  cve: string | null
  ioc: string | null
  affectedSystems: string
  publishedAt: string
}

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    color: "text-rose-300",
    bg: "bg-rose-500/15",
    border: "border-rose-500/40",
    dot: "bg-rose-400",
    icon: Skull,
  },
  high: {
    label: "High",
    color: "text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
    icon: ShieldAlert,
  },
  medium: {
    label: "Medium",
    color: "text-yellow-300",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/40",
    dot: "bg-yellow-400",
    icon: AlertTriangle,
  },
  low: {
    label: "Low",
    color: "text-cyan-300",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/40",
    dot: "bg-cyan-400",
    icon: Eye,
  },
} as const

const CATEGORY_ICONS: Record<string, any> = {
  malware: Bug,
  vulnerability: ShieldX,
  breach: Database,
  attack: Activity,
  advisory: ShieldCheck,
}

const SEVERITIES = ["all", "critical", "high", "medium", "low"]
const CATEGORIES = [
  "all",
  "malware",
  "vulnerability",
  "breach",
  "attack",
  "advisory",
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function ThreatFeedView() {
  const qc = useQueryClient()
  const [severity, setSeverity] = React.useState("all")
  const [category, setCategory] = React.useState("all")
  const [q, setQ] = React.useState("")

  const { data, isLoading } = useQuery<{ items: ThreatItem[]; total: number }>({
    queryKey: ["threat-feed", severity, category, q],
    queryFn: () => {
      const params = new URLSearchParams()
      if (severity !== "all") params.set("severity", severity)
      if (category !== "all") params.set("category", category)
      if (q) params.set("q", q)
      return api(`/api/threat-feed?${params.toString()}`)
    },
    refetchInterval: 60000, // refresh every minute — "live"
  })

  const items = data?.items ?? []
  const counts = {
    critical: items.filter((i) => i.severity === "critical").length,
    high: items.filter((i) => i.severity === "high").length,
    medium: items.filter((i) => i.severity === "medium").length,
    low: items.filter((i) => i.severity === "low").length,
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-rose-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.25em]">
              LIVE THREAT INTELLIGENCE FEED
            </span>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.03em] mb-3 text-balance">
            Threat <span className="text-gradient-premium">Intelligence</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-muted-foreground max-w-xl mb-8">
            Real-time cybersecurity threat intelligence — vulnerabilities, breaches, malware
            campaigns, and security advisories from across the globe.
          </p>
        </ScrollReveal>

        {/* Severity stats */}
        <ScrollReveal delay={0.25}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {(Object.keys(SEVERITY_CONFIG) as Array<keyof typeof SEVERITY_CONFIG>).map((sev) => {
              const cfg = SEVERITY_CONFIG[sev]
              const Icon = cfg.icon
              return (
                <div
                  key={sev}
                  className={cn(
                    "rounded-xl border bg-card/30 backdrop-blur-sm p-4",
                    cfg.border
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("h-5 w-5", cfg.color)} />
                    <span className={cn("text-2xl font-bold", cfg.color)}>{counts[sev]}</span>
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {cfg.label}
                  </p>
                </div>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={0.3}>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Filter
              </span>
            </div>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s === "all" ? "All severities" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c === "all" ? "All categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search threats, CVEs, IOCs..."
                className="h-9 pl-9 text-xs bg-card border-border/60 focus-visible:ring-rose-500/40"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="border-rose-500/30 text-rose-300 text-[10px]">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
            </div>
          </div>
        </ScrollReveal>

        {/* Threat list */}
        <ScrollReveal delay={0.35}>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-12 text-center">
              <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">No threats match your filters</h3>
              <p className="text-sm text-muted-foreground">
                Adjust severity or category to see more intelligence.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((t, i) => {
                const cfg = SEVERITY_CONFIG[t.severity]
                const CatIcon = CATEGORY_ICONS[t.category] || Activity
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "stagger-item rounded-xl border bg-card/30 backdrop-blur-sm p-5 hover:bg-card/50 transition-colors",
                      cfg.border
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center",
                          cfg.bg,
                          cfg.border
                        )}
                      >
                        <CatIcon className={cn("h-5 w-5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] uppercase", cfg.border, cfg.color)}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full mr-1", cfg.dot)} />
                            {cfg.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {t.category}
                          </Badge>
                          {t.cve && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-violet-500/30 text-violet-300 font-mono"
                            >
                              {t.cve}
                            </Badge>
                          )}
                          <span className="text-[10px] font-mono text-muted-foreground ml-auto flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(t.publishedAt)}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-1.5 text-balance">{t.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-3">
                          {t.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="font-mono">via {t.source}</span>
                          {t.ioc && (
                            <span className="font-mono text-rose-300/80">
                              IOC: {t.ioc.length > 40 ? t.ioc.slice(0, 40) + "…" : t.ioc}
                            </span>
                          )}
                          {t.affectedSystems && (
                            <span className="text-amber-300/80">
                              Affected: {t.affectedSystems}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollReveal>
      </div>
    </div>
  )
}
