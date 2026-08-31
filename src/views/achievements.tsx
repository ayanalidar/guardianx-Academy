"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { colorFor } from "@/lib/colors"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Trophy, Flame, Zap, TrendingUp, Award, Lock, Star, Crown, Medal,
  ShieldCheck, BookOpen, GraduationCap, Terminal, Bug, Brain, StickyNote,
  Library, Shield, BookMarked, Target, Sparkles, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ScrollReveal, TextReveal, Stagger, StaggerItem, Counter, CursorGlow,
  BlurReveal,
} from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"

const ICONS: Record<string, any> = {
  Award, BookOpen, GraduationCap, Terminal, Bug, Brain, StickyNote, Library, ShieldCheck, TrendingUp, Flame, Shield, BookMarked, Trophy,
}

const TIER_CONFIG: Record<string, {
  label: string
  order: number
  accent: string // border / glow color
  text: string
  bg: string
  ghost: string
  glyph: string
}> = {
  platinum: {
    label: "Platinum",
    order: 1,
    accent: "oklch(0.78 0.13 195)",
    text: "text-cyan-200",
    bg: "from-cyan-500/15 via-cyan-400/5 to-transparent",
    ghost: "text-cyan-400/15",
    glyph: "◆",
  },
  gold: {
    label: "Gold",
    order: 2,
    accent: "oklch(0.82 0.15 85)",
    text: "text-amber-200",
    bg: "from-amber-500/15 via-amber-400/5 to-transparent",
    ghost: "text-amber-400/15",
    glyph: "★",
  },
  silver: {
    label: "Silver",
    order: 3,
    accent: "oklch(0.78 0.02 270)",
    text: "text-slate-200",
    bg: "from-slate-400/10 via-slate-300/5 to-transparent",
    ghost: "text-slate-300/15",
    glyph: "◇",
  },
  bronze: {
    label: "Bronze",
    order: 4,
    accent: "oklch(0.62 0.12 50)",
    text: "text-orange-200",
    bg: "from-orange-700/15 via-orange-600/5 to-transparent",
    ghost: "text-orange-500/15",
    glyph: "○",
  },
}

interface AchievementData {
  xp: number; level: number; levelInfo: any; rank: string; streak: number
  achievements: { code: string; title: string; description: string; icon: string; color: string; xp: number; tier: string; earned: boolean; earnedAt: string | null }[]
  earnedCount: number; totalCount: number
  activities: { type: string; xp: number; date: string; createdAt: string }[]
  heatmap: { date: string; count: number; xp: number }[]
  leaderboard: { rank: number; id: string; name: string; title: string | null; avatar: string | null; xp: number; level: number; rankTitle: string; isMe: boolean }[]
}

export function AchievementsView() {
  const { navigate } = useAppStore()
  const { data, isLoading } = useQuery<AchievementData>({
    queryKey: ["achievements"],
    queryFn: () => api("/api/achievements"),
  })

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-24 w-2/3 mb-8" />
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        </div>
      </div>
    )
  }
  if (!data) return null

  const { xp, level, levelInfo, rank, streak, achievements, earnedCount, totalCount, activities, heatmap, leaderboard } = data

  // Group by tier (earned first within each tier)
  const tierGroups = (["platinum", "gold", "silver", "bronze"] as const)
    .map((tier) => ({
      tier,
      config: TIER_CONFIG[tier],
      items: achievements
        .filter((a) => a.tier === tier)
        .sort((a, b) => Number(b.earned) - Number(a.earned)),
    }))
    .filter((g) => g.items.length > 0)

  // XP earned from achievements
  const xpFromAchievements = achievements
    .filter((a) => a.earned)
    .reduce((sum, a) => sum + (a.xp || 0), 0)

  // Completion rate
  const completionRate = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-violet-600/6 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-amber-500/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ====================================================
            HEADER - oversized headline + status pill
            ==================================================== */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
            <span className="text-[10px] font-mono text-violet-300/80 tracking-[0.3em]">
              RANK {rank.toUpperCase()} · LEVEL {level}
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.04em] mb-4 text-balance">
            <TextReveal text="Your" />{" "}
            <span className="text-gradient-premium">
              <TextReveal text="achievements." delay={0.2} />
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-muted-foreground max-w-xl mb-12 text-base lg:text-lg leading-relaxed">
            Every milestone is a checkpoint. Every badge, a piece of your story as a defender.
          </p>
        </ScrollReveal>

        {/* ====================================================
            STATS STRIP - border-left editorial, NO cards
            ==================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: "Earned", value: earnedCount, suffix: ` / ${totalCount}`, accent: "border-violet-500/50", color: "text-violet-300", icon: Trophy },
            { label: "XP from achievements", value: xpFromAchievements, accent: "border-cyan-500/50", color: "text-cyan-300", icon: Zap },
            { label: "Completion rate", value: completionRate, suffix: "%", accent: "border-emerald-500/50", color: "text-emerald-300", icon: Target },
            { label: "Day streak", value: streak, accent: "border-amber-500/50", color: "text-amber-300", icon: Flame },
          ].map((s, i) => (
            <ScrollReveal key={s.label} delay={0.4 + i * 0.08}>
              <div className={cn("border-l pl-5", s.accent)}>
                <s.icon className={cn("h-4 w-4 mb-3", s.color)} />
                <div className="text-4xl lg:text-5xl font-bold tracking-[-0.03em] mb-1">
                  <Counter value={s.value} suffix={s.suffix ?? ""} />
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ====================================================
            LEVEL PROGRESS BAR - open, premium
            ==================================================== */}
        <ScrollReveal delay={0.5}>
          <div className="mb-20 max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em]">
                LEVEL {level} PROGRESSION
              </span>
              <span className="text-xs font-mono text-violet-300">
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
              </span>
            </div>
            <Progress value={levelInfo.progress} className="h-1" />
            <div className="mt-2 text-[10px] text-muted-foreground font-mono">
              {levelInfo.nextLevelXp - levelInfo.currentLevelXp} XP TO LEVEL {level + 1}
            </div>
          </div>
        </ScrollReveal>

        {/* ====================================================
            TIER-GROUPED ACHIEVEMENTS - editorial sections
            ==================================================== */}
        <div className="space-y-20">
          {tierGroups.map((group, gi) => (
            <section key={group.tier} id={`tier-${group.tier}`}>
              {/* Tier section header */}
              <ScrollReveal>
                <div className="flex items-end justify-between mb-8 pb-4 border-b border-border/60">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] mb-2">
                      {String(gi + 1).padStart(2, "0")} - TIER {group.config.label.toUpperCase()}
                    </p>
                    <h2 className="flex items-baseline gap-3">
                      <span className={cn("text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.03em]", group.config.text)}>
                        {group.config.label}
                      </span>
                      <span className={cn("text-[clamp(3rem,8vw,6rem)] font-bold leading-none", group.config.ghost)}>
                        {group.config.glyph}
                      </span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums">
                      {group.items.filter((i) => i.earned).length}
                      <span className="text-muted-foreground/40"> / {group.items.length}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">unlocked</div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Staggered grid */}
              <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerChildren={0.06}>
                {group.items.map((a) => (
                  <StaggerItem key={a.code}>
                    <AchievementTile a={a} tier={group.tier} />
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ))}
        </div>

        {/* ====================================================
            ACTIVITY + LEADERBOARD + HEATMAP - sidebar grid
            ==================================================== */}
        <div className="mt-24 grid lg:grid-cols-3 gap-6">
          {/* Heatmap */}
          <ScrollReveal>
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                <h3 className="text-sm font-semibold tracking-tight">Weekly Activity</h3>
              </div>
              <div className="grid grid-cols-7 gap-1.5 mb-3">
                {heatmap.map((d) => {
                  const dayName = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][new Date(d.date + "T00:00:00").getDay()]
                  const intensity = d.count === 0 ? 0 : Math.min(d.count, 4)
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1">
                      <div className="text-[9px] text-muted-foreground font-mono">{dayName}</div>
                      <div
                        className={cn(
                          "w-full aspect-square rounded-md border transition-all",
                          intensity === 0 && "bg-muted/20 border-border",
                          intensity === 1 && "bg-violet-500/20 border-violet-500/30",
                          intensity === 2 && "bg-violet-500/40 border-violet-500/40",
                          intensity === 3 && "bg-violet-500/60 border-violet-500/50",
                          intensity >= 4 && "bg-violet-500/80 border-violet-500/60",
                        )}
                        title={`${d.date}: ${d.count} activities, ${d.xp} XP`}
                      />
                      <div className="text-[9px] text-muted-foreground font-mono">{d.xp}</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-0.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-muted/20" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-violet-500/20" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-violet-500/40" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-violet-500/60" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-violet-500/80" />
                </div>
                <span>More</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Recent XP activity */}
          <ScrollReveal delay={0.1}>
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="h-4 w-4 text-amber-300" />
                <h3 className="text-sm font-semibold tracking-tight">Recent XP</h3>
              </div>
              <ScrollArea className="h-64 pr-2">
                <div className="space-y-2">
                  {activities.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No activity yet. Start learning!</p>
                  ) : (
                    activities.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/40">
                        <ActivityIcon type={a.type} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium capitalize">{a.type.replace(/_/g, " ")}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {new Date(a.createdAt).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
                          </div>
                        </div>
                        <Badge className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">+{a.xp}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </ScrollReveal>

          {/* Mini leaderboard */}
          <ScrollReveal delay={0.2}>
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-semibold tracking-tight">Leaderboard</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground px-2" onClick={() => navigate({ name: "leaderboard" })}>
                  View <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
              <ScrollArea className="h-64 pr-2">
                <div className="space-y-1.5">
                  {leaderboard.map((u) => (
                    <div
                      key={u.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg transition-colors border",
                        u.isMe ? "bg-violet-500/10 border-violet-500/30" : "border-transparent hover:bg-muted/30",
                      )}
                    >
                      <div className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono",
                        u.rank === 1 && "bg-amber-400/20 text-amber-300",
                        u.rank === 2 && "bg-slate-300/20 text-slate-300",
                        u.rank === 3 && "bg-orange-600/20 text-orange-400",
                        u.rank > 3 && "bg-muted text-muted-foreground",
                      )}>
                        {u.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {u.name}
                          {u.isMe && <span className="text-violet-300 ml-1">(You)</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{u.rankTitle}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-violet-300">{u.xp.toLocaleString()}</div>
                        <div className="text-[9px] text-muted-foreground">Lv {u.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   AchievementTile - editorial tile with glow-on-hover
   ============================================================ */
function AchievementTile({ a, tier }: { a: any; tier: string }) {
  const Icon = ICONS[a.icon] ?? Award
  const col = colorFor(a.color)
  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.bronze

  return (
    <CursorGlow
      color={a.earned ? `oklch(0.6 0.2 295 / 0.08)` : "transparent"}
      className="group h-full"
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border bg-card/30 transition-all duration-500",
          a.earned
            ? "border-border/60 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-20px] hover:shadow-violet-500/20 hover:-translate-y-1"
            : "border-dashed border-border/50 opacity-60",
        )}
      >
        {/* Gradient background wash - earned only */}
        {a.earned && (
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", cfg.bg)} />
        )}
        {/* Tier accent corner */}
        <div
          className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-50"
          style={{
            background: `radial-gradient(circle at top right, ${cfg.accent}33, transparent 70%)`,
          }}
        />
        <div className="relative z-10 p-5 flex flex-col h-full">
          {/* Top row: icon + tier badge */}
          <div className="flex items-start justify-between mb-5">
            <div className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform duration-500 group-hover:scale-110",
              a.earned
                ? cn(col.bg, col.border, col.text)
                : "bg-muted/40 border-border text-muted-foreground/50 grayscale",
            )}>
              {a.earned ? (
                <>
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                  {/* glow ring */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `0 0 30px -4px ${cfg.accent}` }} />
                </>
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-mono uppercase tracking-[0.2em] border",
                a.earned ? cn(cfg.text, "border-current/30") : "text-muted-foreground/60 border-border",
              )}
            >
              {cfg.label}
            </Badge>
          </div>

          {/* Title + description */}
          <h4 className={cn(
            "text-base font-semibold tracking-tight mb-1",
            !a.earned && "text-muted-foreground",
          )}>
            {a.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1 line-clamp-2">
            {a.description}
          </p>

          {/* Bottom row: XP + earned date */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <span className={cn(
              "text-xs font-mono flex items-center gap-1",
              a.earned ? "text-emerald-300" : "text-muted-foreground/50",
            )}>
              <Zap className="h-3 w-3" />+{a.xp} XP
            </span>
            {a.earned && a.earnedAt ? (
              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(a.earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-[0.2em]">Locked</span>
            )}
          </div>
        </div>
      </div>
    </CursorGlow>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, any> = {
    lesson_completed: BookOpen,
    lab_solved: Terminal,
    quiz_passed: Brain,
    note_created: StickyNote,
    course_enrolled: BookMarked,
    cert_earned: Award,
  }
  const Icon = map[type] ?? Zap
  const colors: Record<string, string> = {
    lesson_completed: "text-emerald-300 bg-emerald-500/10",
    lab_solved: "text-violet-300 bg-violet-500/10",
    quiz_passed: "text-cyan-300 bg-cyan-500/10",
    note_created: "text-amber-300 bg-amber-500/10",
    course_enrolled: "text-teal-300 bg-teal-500/10",
    cert_earned: "text-orange-300 bg-orange-500/10",
  }
  return (
    <div className={cn("p-1.5 rounded-lg shrink-0", colors[type] ?? "text-muted-foreground bg-muted")}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  )
}
