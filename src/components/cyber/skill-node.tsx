"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Lock, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * SkillNode - single node in a skill-tree visualization. Designed to be
 * placed inside a relatively-positioned container; absolute positioning of
 * each node is the responsibility of the parent layout.
 *
 * Statuses:
 *  - locked       → dimmed, lock icon, not clickable
 *  - available    → pulsing border, ready to start
 *  - in-progress  → animated outer ring (violet)
 *  - completed    → glowing emerald + check icon
 *
 * `connections` are screen-space coordinates (relative to the SVG origin)
 * used to draw connection lines back to a parent or hub node.
 */

export type SkillNodeStatus =
  | "locked"
  | "available"
  | "in-progress"
  | "completed"

export interface SkillNodeConnection {
  x: number
  y: number
}

export interface SkillNodeProps {
  label: string
  status: SkillNodeStatus
  xp?: number
  onClick?: () => void
  connections?: SkillNodeConnection[]
  /** Node position relative to parent (used when rendering inside a tree) */
  position?: { x: number; y: number }
  size?: number
  className?: string
}

const STATUS_CONFIG: Record<
  SkillNodeStatus,
  { ring: string; fill: string; icon: typeof Star; text: string; glow: string }
> = {
  locked: {
    ring: "border-slate-600/30",
    fill: "bg-slate-700/20",
    icon: Lock,
    text: "text-slate-400",
    glow: "",
  },
  available: {
    ring: "border-cyan-400/60",
    fill: "bg-cyan-500/10",
    icon: Star,
    text: "text-cyan-300",
    glow: "shadow-[0_0_18px_-4px_oklch(0.65_0.12_200_/_0.6)]",
  },
  "in-progress": {
    ring: "border-violet-400/70",
    fill: "bg-violet-500/15",
    icon: Zap,
    text: "text-violet-200",
    glow: "shadow-[0_0_24px_-4px_oklch(0.6_0.2_295_/_0.7)]",
  },
  completed: {
    ring: "border-emerald-400/70",
    fill: "bg-emerald-500/15",
    icon: Check,
    text: "text-emerald-300",
    glow: "shadow-[0_0_24px_-4px_oklch(0.7_0.15_155_/_0.7)]",
  },
}

export function SkillNode({
  label,
  status,
  xp,
  onClick,
  connections = [],
  position,
  size = 80,
  className,
}: SkillNodeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const isInteractive = typeof onClick === "function" && status !== "locked"

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.()
    }
  }

  const containerStyle: React.CSSProperties = position
    ? { position: "absolute", left: position.x, top: position.y, width: size, height: size + 28 }
    : { width: size, height: size + 28 }

  // SVG overlay for connection lines (drawn relative to node center)
  const svgOverlay = connections.length > 0 && position ? (
    <svg
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
      width={size}
      height={size + 28}
      style={{ overflow: "visible" }}
    >
      {connections.map((c, i) => {
        const cx = size / 2
        const cy = size / 2
        const dx = c.x - (position.x + cx)
        const dy = c.y - (position.y + cy)
        return (
          <motion.line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + dx}
            y2={cy + dy}
            stroke={
              status === "completed"
                ? "oklch(0.7 0.15 155 / 0.6)"
                : status === "in-progress"
                ? "oklch(0.6 0.2 295 / 0.55)"
                : status === "available"
                ? "oklch(0.65 0.12 200 / 0.4)"
                : "oklch(0.4 0.01 270 / 0.3)"
            }
            strokeWidth={status === "completed" ? 1.6 : 1.2}
            strokeDasharray={status === "locked" ? "3 4" : "0"}
            initial={{ pathLength: prefersReducedMotion ? 1 : 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * i, ease: "easeOut" }}
          />
        )
      })}
    </svg>
  ) : null

  return (
    <div className={cn("relative", className)} style={containerStyle}>
      {svgOverlay}
      <motion.div
        whileHover={isInteractive ? { scale: 1.06 } : undefined}
        whileTap={isInteractive ? { scale: 0.95 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={handleKeyDown}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={`${label} - ${status}${typeof xp === "number" ? `, ${xp} XP` : ""}`}
        aria-disabled={status === "locked"}
        className={cn(
          "relative z-10 flex flex-col items-center justify-center rounded-full border-2 backdrop-blur-sm",
          "transition-colors",
          config.ring,
          config.fill,
          config.text,
          config.glow,
          isInteractive && "cursor-pointer focus-visible:outline-none",
          status === "locked" && "opacity-60"
        )}
        style={{ width: size, height: size }}
      >
        {/* Pulsing border for available nodes */}
        {status === "available" && !prefersReducedMotion && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
            animate={{ scale: [1, 1.18], opacity: [0.7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Animated ring for in-progress */}
        {status === "in-progress" && !prefersReducedMotion && (
          <svg
            aria-hidden
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 100 100"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="oklch(0.6 0.2 295 / 0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="301.6"
              initial={{ strokeDashoffset: 301.6 }}
              animate={{ strokeDashoffset: [301.6, 0, 301.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        )}

        {/* Glow for completed */}
        {status === "completed" && !prefersReducedMotion && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <Icon className="size-5" aria-hidden />

        {typeof xp === "number" && (
          <span className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wider opacity-80">
            {xp}XP
          </span>
        )}
      </motion.div>

      {/* Label below */}
      <p
        className={cn(
          "absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-center font-mono text-[10px] uppercase tracking-wider",
          status === "locked" ? "text-slate-500" : config.text
        )}
      >
        {label}
      </p>
    </div>
  )
}
