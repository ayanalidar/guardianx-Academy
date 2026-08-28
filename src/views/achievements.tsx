"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { colorFor } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Trophy, Flame, Zap, TrendingUp, Award, Lock, Star, Crown, Medal,
  ShieldCheck, BookOpen, GraduationCap, Terminal, Bug, Brain, StickyNote,
  Library, Shield, BookMarked, Target, Sparkles, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ICONS: Record<string, any> = {
  Award, BookOpen, GraduationCap, Terminal, Bug, Brain, StickyNote, Library, ShieldCheck, TrendingUp, Flame, Shield, BookMarked, Trophy,
}

const TIER_STYLES: Record<string, { ring: string; bg: string; text: string; label: string }> = {
  bronze: { ring: "ring-amber-700/40", bg: "bg-amber-700/10", text: "text-amber-600", label: "Bronze" },
  silver: { ring: "ring-slate-400/40", bg: "bg-slate-400/10", text: "text-slate-300", label: "Silver" },
  gold: { ring: "ring-amber-400/40", bg: "bg-amber-400/10", text: "text-amber-400", label: "Gold" },
  platinum: { ring: "ring-cyan-300/40", bg: "bg-cyan-300/10", text: "text-cyan-300", label: "Platinum" },
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
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }
  if (!data) return null

  const { xp, level, levelInfo, rank, streak, achievements, earnedCount, totalCount, activities, heatmap, leaderboard } = data
  const earned = achievements.filter((a) => a.earned)
  const locked = achievements.filter((a) => !a.earned)
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className="space-y-6">
      {/* Header / hero */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-background to-background p-6 lg:p-8 scanlines">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 grid lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <Trophy className="h-3 w-3" /> RANK: {rank.toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 font-bold text-2xl text-emerald-400 font-mono">
                  {level}
                </div>
                <Crown className="absolute -top-2 -right-2 h-5 w-5 text-amber-400 drop-shadow" />
              </div>
              Level {level} · {rank}
            </h1>
            <div className="max-w-md">
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className="text-muted-foreground">{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP</span>
                <span className="text-emerald-400 font-mono text-xs">{levelInfo.progress}%</span>
              </div>
              <Progress value={levelInfo.progress} className="h-2.5" />
              <div className="text-xs text-muted-foreground mt-1.5">{levelInfo.nextLevelXp - levelInfo.currentLevelXp} XP to level {level + 1}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-card/60 backdrop-blur">
              <Flame className="h-5 w-5 text-orange-400 mb-2" />
              <div className="text-2xl font-bold tabular-nums">{streak}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Day Streak</div>
            </Card>
            <Card className="p-4 bg-card/60 backdrop-blur">
              <Zap className="h-5 w-5 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold tabular-nums">{xp.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total XP</div>
            </Card>
            <Card className="p-4 bg-card/60 backdrop-blur col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Medal className="h-5 w-5 text-amber-400" />
                <span className="text-xs text-muted-foreground">{earnedCount}/{totalCount} earned</span>
              </div>
              <Progress value={totalCount ? (earnedCount / totalCount) * 100 : 0} className="h-1.5" />
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1.5">Achievements</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Achievements grid */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-400" /> Achievements</h2>
            <p className="text-sm text-muted-foreground">{earnedCount} of {totalCount} unlocked</p>
          </div>

          {earned.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Unlocked</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {earned.map((a) => <AchievementCard key={a.code} a={a} />)}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mt-4">Locked</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {locked.map((a) => <AchievementCard key={a.code} a={a} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right column: activity + leaderboard */}
        <div className="space-y-4">
          {/* Weekly activity heatmap */}
          <Card className="p-5">
            <h3 className="font-semibold flex items-center gap-2 text-sm mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Weekly Activity
            </h3>
            <div className="grid grid-cols-7 gap-1.5">
              {heatmap.map((d, i) => {
                const dayName = dayNames[new Date(d.date + "T00:00:00").getDay()]
                const intensity = d.count === 0 ? 0 : Math.min(d.count, 4)
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1">
                    <div className="text-[9px] text-muted-foreground font-mono">{dayName}</div>
                    <div
                      className={cn(
                        "w-full aspect-square rounded-md border transition-all",
                        intensity === 0 && "bg-muted/30 border-border",
                        intensity === 1 && "bg-emerald-500/20 border-emerald-500/30",
                        intensity === 2 && "bg-emerald-500/40 border-emerald-500/40",
                        intensity === 3 && "bg-emerald-500/60 border-emerald-500/50",
                        intensity >= 4 && "bg-emerald-500/80 border-emerald-500/60",
                      )}
                      title={`${d.date}: ${d.count} activities, ${d.xp} XP`}
                    />
                    <div className="text-[9px] text-muted-foreground font-mono">{d.xp}</div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-muted/30" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/20" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/60" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
              </div>
              <span>More</span>
            </div>
          </Card>

          {/* Recent activity */}
          <Card className="p-5">
            <h3 className="font-semibold flex items-center gap-2 text-sm mb-3">
              <Zap className="h-4 w-4 text-amber-400" /> Recent XP
            </h3>
            <ScrollArea className="h-48 pr-2">
              <div className="space-y-2">
                {activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No activity yet. Start learning!</p>
                ) : (
                  activities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <ActivityIcon type={a.type} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium capitalize">{a.type.replace(/_/g, " ")}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(a.createdAt).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}</div>
                      </div>
                      <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">+{a.xp}</Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Leaderboard */}
          <Card className="p-5">
            <h3 className="font-semibold flex items-center gap-2 text-sm mb-3">
              <Crown className="h-4 w-4 text-amber-400" /> Leaderboard
            </h3>
            <ScrollArea className="h-64 pr-2">
              <div className="space-y-1.5">
                {leaderboard.map((u) => (
                  <div
                    key={u.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-colors",
                      u.isMe ? "bg-emerald-500/10 border border-emerald-500/30" : "hover:bg-muted/30",
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono",
                      u.rank === 1 && "bg-amber-400/20 text-amber-400",
                      u.rank === 2 && "bg-slate-300/20 text-slate-300",
                      u.rank === 3 && "bg-orange-600/20 text-orange-500",
                      u.rank > 3 && "bg-muted text-muted-foreground",
                    )}>
                      {u.rank}
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{u.name} {u.isMe && <span className="text-emerald-400">(You)</span>}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{u.rankTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400">{u.xp.toLocaleString()}</div>
                      <div className="text-[9px] text-muted-foreground">Lv {u.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AchievementCard({ a }: { a: any }) {
  const Icon = ICONS[a.icon] ?? Award
  const col = colorFor(a.color)
  const tier = TIER_STYLES[a.tier] ?? TIER_STYLES.bronze
  return (
    <Card className={cn(
      "p-4 relative overflow-hidden transition-all group",
      a.earned ? cn("ring-1", tier.ring, "border-transparent") : "opacity-70",
    )}>
      {a.earned && <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", col.bg)} />}
      <div className="relative z-10 flex items-start gap-3">
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-110",
          a.earned ? cn(col.bg, col.border, col.text) : "bg-muted/50 border-border text-muted-foreground",
        )}>
          {a.earned ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className={cn("text-sm font-semibold truncate", !a.earned && "text-muted-foreground")}>{a.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.description}</p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("text-[9px] uppercase", tier.text, "border-current/30")}>{tier.label}</Badge>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5" />+{a.xp}
            </span>
          </div>
        </div>
      </div>
      {a.earned && a.earnedAt && (
        <div className="relative z-10 mt-2 pt-2 border-t border-border/50 text-[9px] text-muted-foreground font-mono">
          Earned {new Date(a.earnedAt).toLocaleDateString()}
        </div>
      )}
    </Card>
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
    lesson_completed: "text-emerald-400 bg-emerald-500/10",
    lab_solved: "text-violet-400 bg-violet-500/10",
    quiz_passed: "text-cyan-400 bg-cyan-500/10",
    note_created: "text-amber-400 bg-amber-500/10",
    course_enrolled: "text-teal-400 bg-teal-500/10",
    cert_earned: "text-orange-400 bg-orange-500/10",
  }
  return (
    <div className={cn("p-1.5 rounded-lg shrink-0", colors[type] ?? "text-muted-foreground bg-muted")}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  )
}
