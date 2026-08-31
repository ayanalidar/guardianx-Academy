"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * StatusDot - small status indicator dot used in cards, headers, and dashboards.
 *
 * Colors map to standard cyber operations palette:
 *  - online  → emerald (system healthy / target up)
 *  - offline → rose    (target down / connection lost)
 *  - warning → amber   (degraded / pending check)
 *  - idle    → gray    (no data / inactive)
 */

export type StatusDotStatus = "online" | "offline" | "warning" | "idle"

export interface StatusDotProps {
  status: StatusDotStatus
  size?: "xs" | "sm" | "md"
  pulse?: boolean
  label?: string
  className?: string
}

const SIZE_MAP: Record<NonNullable<StatusDotProps["size"]>, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
}

const COLOR_MAP: Record<StatusDotStatus, string> = {
  online: "bg-emerald-400 text-emerald-400",
  offline: "bg-rose-400 text-rose-400",
  warning: "bg-amber-400 text-amber-400",
  idle: "bg-slate-400 text-slate-400",
}

const LABEL_TEXT_MAP: Record<StatusDotStatus, string> = {
  online: "text-emerald-300",
  offline: "text-rose-300",
  warning: "text-amber-300",
  idle: "text-slate-400",
}

export function StatusDot({
  status,
  size = "sm",
  pulse = false,
  label,
  className,
}: StatusDotProps) {
  const shouldPulse = pulse && status === "online"
  const dotSize = SIZE_MAP[size]
  const color = COLOR_MAP[status]

  // Reduced motion preference - disable pulse animation
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      role="status"
      aria-label={label ? `${status}: ${label}` : status}
    >
      <span className={cn("relative inline-flex", dotSize, "items-center justify-center")}>
        {shouldPulse && !prefersReducedMotion && (
          <span
            className={cn(
              "absolute inset-0 rounded-full opacity-60 animate-ping",
              color.split(" ")[1]
            )}
            aria-hidden
          />
        )}
        <span className={cn("relative inline-block rounded-full", dotSize, color)} />
      </span>
      {label && (
        <span
          className={cn(
            "font-mono text-xs uppercase tracking-wider",
            LABEL_TEXT_MAP[status]
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}
