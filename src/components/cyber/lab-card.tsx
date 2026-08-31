"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Cpu, Globe, Lock, Network, Server, Wifi, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusDot, type StatusDotStatus } from "./status-dot"

/**
 * LabCard - premium cyber lab mission card used in the labs catalog grid
 * and dashboards. Shows mission title, category, difficulty badge, XP,
 * live status, target IP, and exposed services.
 *
 *  - Difficulty is color-coded (Easy → Insane)
 *  - Status dot pulses for "online"
 *  - Hover lift + soft glow
 *  - Keyboard accessible (Enter / Space to invoke onClick)
 */

export type LabDifficulty = "Easy" | "Medium" | "Hard" | "Insane"
export type LabStatus = "online" | "offline" | "starting"

export interface LabCardProps {
  title: string
  category: string
  difficulty: LabDifficulty
  xp: number
  status?: LabStatus
  ip?: string
  services?: string[]
  onClick?: () => void
  className?: string
}

const DIFFICULTY_CONFIG: Record<
  LabDifficulty,
  { badge: string; label: string; bar: string; ring: string }
> = {
  Easy: {
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    label: "EASY",
    bar: "bg-emerald-400",
    ring: "shadow-[0_0_18px_-6px_oklch(0.7_0.15_155_/_0.6)]",
  },
  Medium: {
    badge: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    label: "MEDIUM",
    bar: "bg-cyan-400",
    ring: "shadow-[0_0_18px_-6px_oklch(0.65_0.12_200_/_0.6)]",
  },
  Hard: {
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    label: "HARD",
    bar: "bg-amber-400",
    ring: "shadow-[0_0_18px_-6px_oklch(0.7_0.15_85_/_0.6)]",
  },
  Insane: {
    badge: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    label: "INSANE",
    bar: "bg-rose-400",
    ring: "shadow-[0_0_18px_-6px_oklch(0.6_0.2_25_/_0.6)]",
  },
}

const STATUS_MAP: Record<LabStatus, { dot: StatusDotStatus; pulse: boolean; label: string }> = {
  online: { dot: "online", pulse: true, label: "ONLINE" },
  offline: { dot: "offline", pulse: false, label: "OFFLINE" },
  starting: { dot: "warning", pulse: true, label: "STARTING" },
}

function serviceIcon(service: string) {
  const s = service.toLowerCase()
  if (s.includes("ssh")) return Lock
  if (s.includes("http")) return Globe
  if (s.includes("ftp") || s.includes("smb")) return Server
  if (s.includes("wifi") || s.includes("rdp")) return Wifi
  if (s.includes("dns") || s.includes("smtp")) return Network
  return Cpu
}

export function LabCard({
  title,
  category,
  difficulty,
  xp,
  status = "online",
  ip,
  services = [],
  onClick,
  className,
}: LabCardProps) {
  const diff = DIFFICULTY_CONFIG[difficulty]
  const statusConf = STATUS_MAP[status]
  const isInteractive = typeof onClick === "function"

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <motion.div
      whileHover={isInteractive ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={`${title} - ${difficulty} - ${statusConf.label}`}
      className={cn(
        "card-premium group relative flex cursor-default flex-col gap-4 rounded-xl p-5",
        isInteractive && "cursor-pointer focus-visible:outline-none",
        className
      )}
    >
      {/* Top-right difficulty banner */}
      <div className="absolute right-0 top-0 h-1 w-full overflow-hidden rounded-t-xl">
        <div className={cn("h-full w-full", diff.bar)} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {category}
          </p>
          <h3 className="mt-1 truncate font-semibold leading-tight text-foreground">
            {title}
          </h3>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider",
            diff.badge,
            diff.ring
          )}
        >
          {diff.label}
        </span>
      </div>

      {/* Meta row - status, ip, xp */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <StatusDot status={statusConf.dot} pulse={statusConf.pulse} label={statusConf.label} size="xs" />
        {ip && (
          <span className="flex items-center gap-1.5 font-mono text-muted-foreground">
            <Network className="size-3.5 text-cyan-400" aria-hidden />
            <span className="text-cyan-200/90">{ip}</span>
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5 font-mono text-amber-300">
          <Zap className="size-3.5" aria-hidden />
          <span className="font-semibold">{xp.toLocaleString()}</span>
          <span className="text-amber-300/60">XP</span>
        </span>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border/40 pt-3">
          {services.map((s) => {
            const Icon = serviceIcon(s)
            return (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-[oklch(0.12_0.01_270)] px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                <Icon className="size-3 text-cyan-400" aria-hidden />
                {s}
              </span>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
