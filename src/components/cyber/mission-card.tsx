"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Clock, Crosshair, Play, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FlagInput } from "./flag-input"
import { StatusDot } from "./status-dot"

/**
 * MissionCard — cinematic "current mission" card for dashboards. Shows the
 * active objective, difficulty, time elapsed, XP reward, a flag capture
 * input, and a primary CTA to launch the lab environment.
 *
 * Visual treatment: dark cinematic surface with violet glow + scanlines.
 */

export interface MissionCardProps {
  title: string
  objective: string
  difficulty: string
  xp: number
  timeElapsed?: string
  flagPlaceholder?: string
  onSubmit?: (flag: string) => void
  onLaunch?: () => void
  className?: string
  /** Optional submission state */
  submitting?: boolean
  result?: "correct" | "incorrect" | null
}

export function MissionCard({
  title,
  objective,
  difficulty,
  xp,
  timeElapsed,
  flagPlaceholder = "GX{________________}",
  onSubmit,
  onLaunch,
  className,
  submitting = false,
  result = null,
}: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "card-premium relative flex flex-col gap-5 rounded-2xl p-6 scanlines",
        "glow-soft",
        className
      )}
    >
      {/* Decorative top corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.6 0.2 295 / 0.4), transparent 70%)",
        }}
      />

      {/* Header — live status + difficulty */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusDot status="online" pulse size="sm" label="ACTIVE" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Current Mission
          </span>
        </div>
        <span
          className={cn(
            "rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-violet-300",
            "shadow-[0_0_18px_-6px_oklch(0.6_0.2_295_/_0.6)]"
          )}
        >
          {difficulty}
        </span>
      </div>

      {/* Title + objective */}
      <div className="space-y-2">
        <h3 className="text-balance text-xl font-semibold leading-tight text-foreground">
          {title}
        </h3>
        <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <Target className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden />
          <span>{objective}</span>
        </p>
      </div>

      {/* Meta row — time elapsed + XP */}
      <div className="grid grid-cols-2 gap-3">
        {timeElapsed && (
          <div className="rounded-lg border border-border/40 bg-[oklch(0.1_0.008_270)] px-3 py-2">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3 text-cyan-400" aria-hidden />
              Elapsed
            </p>
            <p
              className="mt-1 font-mono text-base font-semibold tabular-nums text-cyan-100"
              style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            >
              {timeElapsed}
            </p>
          </div>
        )}
        <div className="rounded-lg border border-border/40 bg-[oklch(0.1_0.008_270)] px-3 py-2">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Zap className="size-3 text-amber-400" aria-hidden />
            Reward
          </p>
          <p className="mt-1 font-mono text-base font-semibold tabular-nums text-amber-300">
            +{xp.toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Flag capture */}
      <FlagInput
        placeholder={flagPlaceholder.replace(/^GX\{/, "").replace(/\}$/, "")}
        onSubmit={onSubmit}
        loading={submitting}
        result={result}
        label="Capture the flag"
      />

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border/40 pt-4">
        <Button
          variant="outline"
          className="flex-1 gap-2 border-violet-500/40 bg-violet-500/5 text-violet-200 hover:bg-violet-500/15 hover:text-violet-100"
          onClick={onLaunch}
        >
          <Crosshair className="size-4" aria-hidden />
          Launch Lab
        </Button>
        <Button variant="ghost" size="icon" aria-label="Replay mission briefing">
          <Play className="size-4" aria-hidden />
        </Button>
      </div>
    </motion.div>
  )
}
