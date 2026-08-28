"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { useUser } from "@/hooks/use-user"
import { colorFor, LEVEL_COLORS, DIFFICULTY_COLORS } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Crown, Trophy, Medal, Flame, Zap, Clock, Target, Users, TrendingUp,
  BookOpen, Terminal, Award, Star, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function LeaderboardView() {
  const { user } = useUser()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-background to-background p-6 lg:p-8 scanlines">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono">
              <Crown className="h-3 w-3" /> GLOBAL LEADERBOARDS
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Top <span className="text-gradient-emerald">Guardians</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Compete with learners worldwide. Climb the ranks by solving labs, completing courses, and earning certifications.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-center px-5 py-3 rounded-xl border border-amber-500/20 bg-card/40 backdrop-blur">
              <Trophy className="h-7 w-7 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold font-mono text-amber-400">10</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Top Rank</div>
            </div>
            <div className="text-center px-5 py-3 rounded-xl border border-emerald-500/20 bg-card/40 backdrop-blur">
              <Flame className="h-7 w-7 text-orange-400 mx-auto mb-1" />
              <div className="text-2xl font-bold font-mono text-orange-400">Live</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Updated</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="labs">
        <TabsList>
          <TabsTrigger value="labs">
            <Terminal className="h-3.5 w-3.5 mr-1.5" /> Lab Champions
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Course Leaders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="labs" className="mt-4">
          <LabLeaderboards currentUserId={user?.id} />
        </TabsContent>

        <TabsContent value="courses" className="mt-4">
          <CourseLeaderboards currentUserId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---- Lab Leaderboards ----
function LabLeaderboards({ currentUserId }: { currentUserId?: string }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["lab-leaderboard"],
    queryFn: () => api("/api/labs/leaderboard"),
  })

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Trophy} label="Total Solves" value={data.totalSolves} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={Users} label="Active Solvers" value={data.activeSolvers} color="text-cyan-400" bg="bg-cyan-500/10" />
        <StatCard icon={Zap} label="Top XP" value={data.topSolvers[0]?.user?.xp?.toLocaleString() ?? 0} color="text-violet-400" bg="bg-violet-500/10" />
        <StatCard icon={Clock} label="Fastest Solve" value={data.fastestSolvers[0] ? formatDuration(data.fastestSolvers[0].fastestMs) : "—"} color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Solvers */}
        <Card className="p-5">
          <h3 className="font-semibold flex items-center gap-2 text-sm mb-4">
            <Trophy className="h-4 w-4 text-amber-400" /> Top Solvers
            <span className="text-[10px] text-muted-foreground font-normal ml-auto">by labs solved</span>
          </h3>
          <LeaderboardList
            entries={data.topSolvers.map((s: any) => ({
              rank: s.rank,
              user: s.user,
              isMe: s.user.id === currentUserId,
              primary: `${s.labsSolved} labs`,
              secondary: `${s.totalPoints.toLocaleString()} pts`,
              tertiary: s.fastestMs ? `⚡ ${formatDuration(s.fastestMs)}` : null,
            }))}
          />
        </Card>

        {/* Fastest Solvers */}
        <Card className="p-5">
          <h3 className="font-semibold flex items-center gap-2 text-sm mb-4">
            <Zap className="h-4 w-4 text-cyan-400" /> Fastest Solves
            <span className="text-[10px] text-muted-foreground font-normal ml-auto">single-lab time</span>
          </h3>
          <LeaderboardList
            entries={data.fastestSolvers.map((s: any) => ({
              rank: s.rank,
              user: s.user,
              isMe: s.user.id === currentUserId,
              primary: formatDuration(s.fastestMs),
              secondary: `${s.labsSolved} labs`,
              tertiary: s.fastestLab ? `📍 ${s.fastestLab.slice(0, 20)}` : null,
            }))}
          />
        </Card>
      </div>

      {/* Per-lab leaderboards */}
      {data.labLeaderboards.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold flex items-center gap-2 text-sm mb-4">
            <Target className="h-4 w-4 text-violet-400" /> Lab Records
            <span className="text-[10px] text-muted-foreground font-normal ml-auto">fastest solve per lab</span>
          </h3>
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-2">
              {data.labLeaderboards.map((lb: any) => (
                <div key={lb.lab.id} className="p-3 rounded-lg border border-border hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{lb.lab.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={cn("text-[9px]", DIFFICULTY_COLORS[lb.lab.difficulty])}>{lb.lab.difficulty}</Badge>
                        <span className="text-[10px] text-muted-foreground">{lb.lab.category}</span>
                        <span className="text-[10px] text-violet-400 font-mono">{lb.lab.points}pts</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400">{lb.totalSolves}</div>
                      <div className="text-[9px] text-muted-foreground">solves</div>
                    </div>
                  </div>
                  {lb.fastest.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                      <Clock className="h-3 w-3 text-cyan-400 shrink-0" />
                      {lb.fastest.map((f: any, i: number) => (
                        <div key={i} className="flex items-center gap-1 text-[10px]">
                          {i > 0 && <span className="text-muted-foreground/50">·</span>}
                          <span className="text-muted-foreground">{f.user.name.split(" ")[0]}</span>
                          <span className="font-mono text-cyan-400">{formatDuration(f.timeSpentMs)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}

// ---- Course Leaderboards ----
function CourseLeaderboards({ currentUserId }: { currentUserId?: string }) {
  const { navigate } = useAppStore()
  const { data, isLoading } = useQuery<any>({
    queryKey: ["course-leaderboard"],
    queryFn: () => api("/api/courses/leaderboard"),
  })

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Award} label="Completions" value={data.totalCompletions} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={Users} label="Active Learners" value={data.activeLearners} color="text-cyan-400" bg="bg-cyan-500/10" />
        <StatCard icon={Trophy} label="Top Learner" value={data.topLearners[0]?.coursesCompleted ?? 0} color="text-amber-400" bg="bg-amber-500/10" suffix=" courses" />
        <StatCard icon={Star} label="Top Course" value={data.popularCourses[0]?.studentsCount?.toLocaleString() ?? 0} color="text-violet-400" bg="bg-violet-500/10" suffix=" students" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Learners */}
        <Card className="p-5">
          <h3 className="font-semibold flex items-center gap-2 text-sm mb-4">
            <Crown className="h-4 w-4 text-amber-400" /> Top Learners
            <span className="text-[10px] text-muted-foreground font-normal ml-auto">by courses completed</span>
          </h3>
          <LeaderboardList
            entries={data.topLearners.map((l: any) => ({
              rank: l.rank,
              user: l.user,
              isMe: l.user.id === currentUserId,
              primary: `${l.coursesCompleted} courses`,
              secondary: `${l.certificates} certs`,
              tertiary: `${l.categoriesCovered} categories`,
            }))}
          />
        </Card>

        {/* Most Popular Courses */}
        <Card className="p-5">
          <h3 className="font-semibold flex items-center gap-2 text-sm mb-4">
            <TrendingUp className="h-4 w-4 text-violet-400" /> Most Popular
            <span className="text-[10px] text-muted-foreground font-normal ml-auto">by enrollment</span>
          </h3>
          <ScrollArea className="h-[360px] pr-2">
            <div className="space-y-2">
              {data.popularCourses.map((c: any) => {
                const col = colorFor(c.color)
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate({ name: "course", courseId: c.id })}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-emerald-500/30 hover:bg-accent/30 transition-colors text-left group"
                  >
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold", col.bg, col.border, "border", col.text)}>
                      {c.shortName.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{c.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={cn("text-[9px]", LEVEL_COLORS[c.level])}>{c.level}</Badge>
                        <span className="text-[10px] text-muted-foreground">{c.enrollments} enrolled</span>
                        <span className="text-[10px] text-emerald-400">{c.completionRate}% done</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                        <Star className="h-3 w-3 fill-amber-400" /> {c.rating}
                      </div>
                      <div className="text-[9px] text-muted-foreground">{c.completions} finished</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 shrink-0" />
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

// ---- Shared components ----
function StatCard({ icon: Icon, label, value, color, bg, suffix }: {
  icon: any; label: string; value: any; color: string; bg: string; suffix?: string
}) {
  return (
    <Card className="p-4 relative overflow-hidden">
      <div className={cn("absolute -right-3 -top-3 h-16 w-16 rounded-full blur-2xl opacity-40", bg)} />
      <div className="relative z-10">
        <div className={cn("inline-flex p-1.5 rounded-lg mb-2", bg)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div className="text-xl font-bold tabular-nums">{value}{suffix}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </Card>
  )
}

function LeaderboardList({ entries }: { entries: any[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground">
        <Trophy className="h-6 w-6 mx-auto mb-2 opacity-50" />
        No entries yet. Be the first!
      </div>
    )
  }
  return (
    <ScrollArea className="h-[360px] pr-2">
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <div
            key={entry.user.id}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
              entry.isMe
                ? "bg-emerald-500/10 border border-emerald-500/30"
                : "hover:bg-accent/30 border border-transparent",
            )}
          >
            <RankBadge rank={entry.rank} />
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={cn("text-[10px]", entry.isMe ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground")}>
                {entry.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {entry.user.name}
                {entry.isMe && <span className="text-emerald-400 ml-1">(You)</span>}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="text-cyan-400 font-mono">Lv {entry.user.level}</span>
                <span>·</span>
                <span>{entry.user.title || "Learner"}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-emerald-400 tabular-nums">{entry.primary}</div>
              <div className="text-[10px] text-muted-foreground">{entry.secondary}</div>
              {entry.tertiary && <div className="text-[9px] text-cyan-400 font-mono">{entry.tertiary}</div>}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: "bg-amber-400/20 text-amber-400 border-amber-400/40",
    2: "bg-slate-300/20 text-slate-300 border-slate-300/40",
    3: "bg-orange-600/20 text-orange-500 border-orange-600/40",
  }
  const icons: Record<number, any> = { 1: Crown, 2: Medal, 3: Medal }
  const Icon = icons[rank]
  return (
    <div className={cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono border",
      styles[rank] ?? "bg-muted text-muted-foreground border-border",
    )}>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : rank}
    </div>
  )
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
