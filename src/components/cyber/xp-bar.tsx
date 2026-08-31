"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * XPBar - animated experience progress bar with optional level badge.
 * Fills with a violet→cyan gradient and has subtle animated stripes while
 * "active" (still progressing). Used in dashboards, header widgets, and
 * the achievements page.
 */

export interface XPBarProps {
  current: number
  max: number
  level?: number
  showLabel?: boolean
  className?: string
}

export function XPBar({
  current,
  max,
  level,
  showLabel = true,
  className,
}: XPBarProps) {
  const safeMax = Math.max(1, max)
  const safeCurrent = Math.max(0, Math.min(current, safeMax))
  const pct = Math.max(0, Math.min(100, (safeCurrent / safeMax) * 100))

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  return (
    <div
      className={cn("flex w-full items-center gap-3", className)}
      role="progressbar"
      aria-valuenow={Math.round(safeCurrent)}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
      aria-label={`Experience: ${Math.round(safeCurrent)} of ${Math.round(safeMax)}`}
    >
      {typeof level === "number" && (
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md border border-violet-500/40 bg-violet-500/10",
            "font-mono text-sm font-bold text-violet-200 shadow-[0_0_18px_-4px_oklch(0.6_0.2_295_/_0.6)]"
          )}
          aria-hidden
        >
          {level}
        </div>
      )}

      <div className="flex-1">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-border/60 bg-[oklch(0.1_0.008_270)]">
          <motion.div
            className={cn(
              "relative h-full rounded-full",
              "bg-gradient-to-r from-violet-500 via-violet-400 to-cyan-400",
              "shadow-[0_0_12px_-2px_oklch(0.6_0.2_295_/_0.6)]"
            )}
            initial={{ width: prefersReducedMotion ? pct : 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {!prefersReducedMotion && pct > 0 && pct < 100 && (
              <div
                className="progress-active absolute inset-0 opacity-30"
                aria-hidden
              />
            )}
          </motion.div>

          {/* Subtle inner highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20"
          />
        </div>

        {showLabel && (
          <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span className="uppercase tracking-wider">
              {Math.round(safeCurrent).toLocaleString()} XP
            </span>
            <span className="uppercase tracking-wider">
              {Math.round(safeMax).toLocaleString()} XP
              {pct >= 100 ? " · MAX" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
