"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useUser } from "@/hooks/use-user"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User, Mail, Shield, Award, GraduationCap, FlaskConical, StickyNote,
  Target, TrendingUp, Calendar, Settings, LogOut, Edit3, Trophy, Lock, Zap,
  BookOpen, Terminal, Bug, Brain, Library, ShieldCheck, Flame, BookMarked,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useAppStore } from "@/store/app-store"
import { LEVEL_COLORS, colorFor } from "@/lib/colors"
import { cn } from "@/lib/utils"

const ACHIEVEMENT_ICONS: Record<string, any> = {
  Award, BookOpen, GraduationCap, Terminal, FlaskConical, Bug, Brain, Target,
  StickyNote, Library, ShieldCheck, Shield, TrendingUp, Flame, Zap, Trophy, BookMarked,
}

const TIER_STYLES: Record<string, string> = {
  bronze: "ring-amber-700/40 bg-amber-700/10 text-amber-600",
  silver: "ring-slate-400/40 bg-slate-400/10 text-slate-300",
  gold: "ring-amber-400/40 bg-amber-400/10 text-amber-400",
  platinum: "ring-cyan-300/40 bg-cyan-300/10 text-cyan-300",
}

export function ProfileView() {
  const { user, stats, gamification, isLoading } = useUser()
  const { navigate } = useAppStore()
  const { data: achData } = useQuery<{ achievements: any[]; earnedCount: number; totalCount: number }>({
    queryKey: ["achievements"],
    queryFn: () => api("/api/achievements"),
  })

  if (isLoading || !user) {
    return <Skeleton className="h-96" />
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const achievements = achData?.achievements ?? []
  const earned = achievements.filter((a) => a.earned)

  const statCards = [
    { label: "Courses Enrolled", value: stats?.enrollments ?? 0, icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Courses Completed", value: stats?.completed ?? 0, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Labs Solved", value: stats?.labsDone ?? 0, icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Notes Created", value: stats?.notes ?? 0, icon: StickyNote, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Certificates", value: stats?.certificates ?? 0, icon: Shield, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Avg Quiz Score", value: `${stats?.avgScore ?? 0}%`, icon: Target, color: "text-rose-400", bg: "bg-rose-500/10" },
  ]

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="overflow-hidden relative">
        <div className="h-32 bg-gradient-to-br from-emerald-950/50 via-background to-cyan-950/30 relative scanlines">
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background rounded-xl">
                <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-2xl font-mono rounded-xl h-full">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {user.name}
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{user.role}</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">{user.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" /> {user.email}
                </p>
                {gamification && (
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                      <Zap className="h-3 w-3 mr-1" /> Lv {gamification.level} · {gamification.rank}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">{gamification.xp.toLocaleString()} XP</span>
                    {gamification.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
                        <Flame className="h-3 w-3" fill="currentColor" /> {gamification.streak}d streak
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              <Button variant="outline" size="sm" onClick={() => navigate({ name: "learning" })}>
                <GraduationCap className="h-4 w-4 mr-1.5" /> My Learning
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
              </Button>
            </div>
          </div>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">{user.bio}</p>
          )}
        </div>
      </Card>

      {/* Stats grid */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" /> Your Stats
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="p-5 flex items-center gap-4 card-hover">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" /> Achievements
          </h2>
          <Badge variant="outline" className="text-xs">
            {earned.length} / {achievements.length} unlocked
          </Badge>
        </div>
        {earned.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Lock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No achievements unlocked yet. Complete lessons and labs to earn badges!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {earned.map((a) => {
              const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Award
              const tier = TIER_STYLES[a.tier] ?? TIER_STYLES.bronze
              return (
                <div
                  key={a.code}
                  className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl ring-1 border border-transparent text-center group cursor-default hover-lift", tier)}
                  title={a.description}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[10px] font-medium leading-tight line-clamp-2">{a.title}</div>
                  <div className="text-[8px] uppercase tracking-wider opacity-70">{a.tier}</div>
                </div>
              )
            })}
            {/* Show locked placeholders for remaining */}
            {achievements.filter((a) => !a.earned).slice(0, Math.max(0, 6 - earned.length)).map((a) => (
              <div
                key={a.code}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-dashed border-border opacity-40 text-center"
                title={`Locked: ${a.description}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-[10px] font-medium leading-tight line-clamp-2 text-muted-foreground">{a.title}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate({ name: "achievements" })}>
            View all achievements <Trophy className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Browse Courses", icon: GraduationCap, view: { name: "catalog" } as const, color: "text-emerald-400" },
          { label: "Practice Labs", icon: FlaskConical, view: { name: "labs" } as const, color: "text-cyan-400" },
          { label: "Join Live", icon: Award, view: { name: "live" } as const, color: "text-amber-400" },
          { label: "My Notes", icon: StickyNote, view: { name: "notes" } as const, color: "text-violet-400" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.view)}>
            <Card className="p-4 flex items-center gap-3 card-hover h-full">
              <a.icon className={`h-5 w-5 ${a.color}`} />
              <span className="text-sm font-medium">{a.label}</span>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
