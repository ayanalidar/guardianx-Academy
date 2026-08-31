"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * RankBadge - color-coded rank indicator that reflects the GuardianX
 * progression hierarchy:
 *
 *   RECRUIT → ANALYST → HUNTER → OPERATOR → SPECIALIST →
 *   SENTINEL → GUARDIAN → ELITE GUARDIAN
 *
 * Each rank carries a distinct color identity. "ELITE GUARDIAN" uses a
 * shimmering gradient treatment reserved for the top tier.
 */

export type RankName =
  | "RECRUIT"
  | "ANALYST"
  | "HUNTER"
  | "OPERATOR"
  | "SPECIALIST"
  | "SENTINEL"
  | "GUARDIAN"
  | "ELITE GUARDIAN"

export interface RankBadgeProps {
  rank: string
  level?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

interface RankConfig {
  text: string
  border: string
  bg: string
  glow: string
}

const RANK_CONFIG: Record<RankName, RankConfig> = {
  RECRUIT: {
    text: "text-slate-300",
    border: "border-slate-500/40",
    bg: "bg-slate-500/10",
    glow: "shadow-[0_0_0_0_rgba(0,0,0,0)]",
  },
  ANALYST: {
    text: "text-cyan-200",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    glow: "shadow-[0_0_18px_-4px_oklch(0.65_0.12_200_/_0.6)]",
  },
  HUNTER: {
    text: "text-blue-200",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    glow: "shadow-[0_0_18px_-4px_oklch(0.55_0.18_260_/_0.55)]",
  },
  OPERATOR: {
    text: "text-violet-200",
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    glow: "shadow-[0_0_18px_-4px_oklch(0.6_0.2_295_/_0.6)]",
  },
  SPECIALIST: {
    text: "text-amber-200",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    glow: "shadow-[0_0_18px_-4px_oklch(0.7_0.15_85_/_0.6)]",
  },
  SENTINEL: {
    text: "text-emerald-200",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    glow: "shadow-[0_0_18px_-4px_oklch(0.7_0.15_155_/_0.6)]",
  },
  GUARDIAN: {
    text: "text-rose-200",
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    glow: "shadow-[0_0_18px_-4px_oklch(0.6_0.2_25_/_0.6)]",
  },
  "ELITE GUARDIAN": {
    text: "text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-cyan-200 to-rose-200",
    border: "border-violet-400/50",
    bg: "bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-rose-500/10",
    glow: "shadow-[0_0_24px_-4px_oklch(0.6_0.2_295_/_0.7)]",
  },
}

const SIZE_MAP: Record<NonNullable<RankBadgeProps["size"]>, { badge: string; text: string }> = {
  sm: { badge: "px-2 py-0.5 gap-1.5", text: "text-[10px]" },
  md: { badge: "px-3 py-1 gap-2", text: "text-xs" },
  lg: { badge: "px-4 py-1.5 gap-2", text: "text-sm" },
}

function normalizeRank(rank: string): RankName {
  const upper = rank.trim().toUpperCase()
  if (upper in RANK_CONFIG) return upper as RankName
  // Loose match - contains
  if (upper.includes("ELITE")) return "ELITE GUARDIAN"
  if (upper.includes("GUARDIAN")) return "GUARDIAN"
  if (upper.includes("SENTINEL")) return "SENTINEL"
  if (upper.includes("SPECIALIST")) return "SPECIALIST"
  if (upper.includes("OPERATOR")) return "OPERATOR"
  if (upper.includes("HUNTER")) return "HUNTER"
  if (upper.includes("ANALYST")) return "ANALYST"
  return "RECRUIT"
}

export function RankBadge({
  rank,
  level,
  size = "md",
  className,
}: RankBadgeProps) {
  const rankName = normalizeRank(rank)
  const config = RANK_CONFIG[rankName]
  const sizeConfig = SIZE_MAP[size]
  const isElite = rankName === "ELITE GUARDIAN"

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const content = (
    <span
      className={cn(
        "font-mono font-semibold uppercase tracking-[0.15em]",
        config.text,
        sizeConfig.text
      )}
    >
      {rankName}
    </span>
  )

  return (
    <motion.span
      className={cn(
        "inline-flex items-center rounded-md border backdrop-blur-sm",
        sizeConfig.badge,
        config.border,
        config.bg,
        config.glow,
        className
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="img"
      aria-label={`Rank: ${rankName}${typeof level === "number" ? `, level ${level}` : ""}`}
    >
      {typeof level === "number" && (
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-sm bg-white/10 font-mono text-[10px] font-bold text-foreground/90",
            isElite && "bg-white/20"
          )}
          aria-hidden
        >
          {level}
        </span>
      )}
      {isElite ? (
        <span className="text-gradient-shimmer">{content}</span>
      ) : (
        content
      )}
    </motion.span>
  )
}
