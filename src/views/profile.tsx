"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User, Mail, Shield, Award, GraduationCap, FlaskConical, StickyNote,
  Target, TrendingUp, Calendar, LogOut, Trophy, Lock, Zap, Flame,
  BookOpen, Terminal, Bug, Brain, Library, ShieldCheck, BookMarked,
  Activity, ChevronRight, ArrowUpRight,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"
import {
  ScrollReveal, TextReveal, Stagger, StaggerItem, Counter, CursorGlow,
  MagneticButton,
} from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"

const ACHIEVEMENT_ICONS: Record<string, any> = {
  Award, BookOpen, GraduationCap, Terminal, FlaskConical, Bug, Brain, Target,
  StickyNote, Library, ShieldCheck, Shield, TrendingUp, Flame, Zap, Trophy, BookMarked,
}

const TIER_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  bronze: { text: "text-orange-300", bg: "bg-orange-700/10", border: "border-orange-700/40" },
  silver: { text: "text-slate-200", bg: "bg-slate-400/10", border: "border-slate-400/40" },
  gold: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/40" },
  platinum: { text: "text-cyan-200", bg: "bg-cyan-500/10", border: "border-cyan-500/40" },
}

const ACTIVITY_META: Record<string, { icon: any; color: string; label: string }> = {
  lesson_completed: { icon: BookOpen, color: "text-emerald-300", label: "Completed a lesson" },
  lab_solved: { icon: Terminal, color: "text-violet-300", label: "Solved a lab" },
  quiz_passed: { icon: Brain, color: "text-cyan-300", label: "Passed a quiz" },
  note_created: { icon: StickyNote, color: "text-amber-300", label: "Created a note" },
  course_enrolled: { icon: BookMarked, color: "text-teal-300", label: "Enrolled in a course" },
  cert_earned: { icon: Award, color: "text-orange-300", label: "Earned a certificate" },
}

export function ProfileView() {
  const { user, stats, gamification, isLoading } = useUser()
  const { navigate } = useAppStore()
  const { data: achData } = useQuery<{ achievements: any[]; earnedCount: number; totalCount: number; activities: { type: string; xp: number; date: string; createdAt: string }[] }>({
    queryKey: ["achievements"],
    queryFn: () => api("/api/achievements"),
  })

  if (isLoading || !user) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-96 mb-8" />
          <Skeleton className="h-32 mb-8" />
        </div>
      </div>
    )
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const achievements = achData?.achievements ?? []
  const earned = achievements.filter((a) => a.earned).slice(0, 6)
  const activities = achData?.activities ?? []

  // Stats strip — 6 metrics
  const statStrip = [
    { label: "Courses", value: stats?.enrollments ?? 0, accent: "border-violet-500/50", color: "text-violet-300", icon: GraduationCap },
    { label: "Labs", value: stats?.labsDone ?? 0, accent: "border-cyan-500/50", color: "text-cyan-300", icon: FlaskConical },
    { label: "Certs", value: stats?.certificates ?? 0, accent: "border-amber-500/50", color: "text-amber-300", icon: Shield },
    { label: "XP", value: gamification?.xp ?? 0, accent: "border-emerald-500/50", color: "text-emerald-300", icon: Zap },
    { label: "Level", value: gamification?.level ?? 1, accent: "border-rose-500/50", color: "text-rose-300", icon: Trophy },
    { label: "Streak", value: gamification?.streak ?? 0, accent: "border-orange-500/50", color: "text-orange-300", icon: Flame },
  ]

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-violet-600/6 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-cyan-500/4 blur-[120px] rounded-full pointer-events-none" />

      {/* Network viz background accent in header */}
      <div className="absolute top-0 inset-x-0 h-[500px] opacity-25 pointer-events-none overflow-hidden">
        <NetworkVisualization variant="section" className="w-full h-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ====================================================
            HEADER — avatar + oversized name + role
            ==================================================== */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
            <span className="text-[10px] font-mono text-violet-300/80 tracking-[0.3em]">
              {user.role?.toUpperCase()} · {gamification?.rank?.toUpperCase() ?? "NOVICE"}
            </span>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-12 gap-8 items-start mb-20">
          {/* Avatar + identity */}
          <div className="lg:col-span-8">
            <ScrollReveal delay={0.1}>
              <div className="flex items-start gap-6 mb-6">
                <Avatar className="h-24 w-24 lg:h-32 lg:w-32 border-2 border-violet-500/40 rounded-2xl shadow-[0_20px_60px_-20px] shadow-violet-500/30">
                  <AvatarFallback className="bg-violet-500/10 text-violet-200 text-4xl lg:text-5xl font-mono font-bold rounded-2xl h-full">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 pt-2">
                  <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.92] tracking-[-0.04em] mb-2 text-balance">
                    <TextReveal text={user.name} />
                  </h1>
                  {user.title && (
                    <p className="text-base lg:text-lg text-muted-foreground mb-3">{user.title}</p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-violet-500/15 text-violet-200 border border-violet-500/30 font-mono text-[10px] tracking-[0.2em]">
                      {user.role?.toUpperCase()}
                    </Badge>
                    {gamification && (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 bg-emerald-500/5 font-mono">
                        <Zap className="h-3 w-3 mr-1" /> LV {gamification.level} · {gamification.rank}
                      </Badge>
                    )}
                    {gamification && gamification.streak > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-orange-300 font-mono">
                        <Flame className="h-3 w-3" fill="currentColor" /> {gamification.streak}D STREAK
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Email + actions */}
            <ScrollReveal delay={0.2}>
              <div className="flex items-center gap-3 flex-wrap mb-6">
                <a href={`mailto:${user.email}`} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                  <Mail className="h-3.5 w-3.5 group-hover:text-violet-300 transition-colors" />
                  <span className="font-mono">{user.email}</span>
                </a>
              </div>
            </ScrollReveal>

            {/* Bio */}
            {user.bio && (
              <ScrollReveal delay={0.3}>
                <div className="max-w-2xl">
                  <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] mb-3">BIO</p>
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">{user.bio}</p>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Action card */}
          <div className="lg:col-span-4">
            <ScrollReveal delay={0.4}>
              <div className="rounded-2xl border border-border/60 bg-card/30 p-5 space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] mb-2">QUICK ACTIONS</p>
                <Button variant="outline" className="w-full justify-start btn-premium" onClick={() => navigate({ name: "learning" })}>
                  <GraduationCap className="h-4 w-4 mr-2 text-violet-300" /> My Learning
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start btn-premium" onClick={() => navigate({ name: "achievements" })}>
                  <Trophy className="h-4 w-4 mr-2 text-amber-300" /> Achievements
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start btn-premium" onClick={() => navigate({ name: "certificates" })}>
                  <Shield className="h-4 w-4 mr-2 text-cyan-300" /> Certificates
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <div className="pt-2 mt-2 border-t border-border/40">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-rose-300" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ====================================================
            STATS STRIP — border-left editorial, 6 metrics
            ==================================================== */}
        <section className="mb-20">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
              <div>
                <p className="text-[10px] font-mono text-violet-400 tracking-[0.3em] mb-1">01 — STATISTICS</p>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">The numbers</h2>
              </div>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-8">
            {statStrip.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.06}>
                <div className={cn("border-l pl-4", s.accent)}>
                  <s.icon className={cn("h-4 w-4 mb-3", s.color)} />
                  <div className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-1">
                    <Counter value={s.value} />
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ====================================================
            ACHIEVEMENTS PREVIEW — top 6
            ==================================================== */}
        <section className="mb-20">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
              <div>
                <p className="text-[10px] font-mono text-amber-400 tracking-[0.3em] mb-1">02 — ACHIEVEMENTS</p>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Recent badges</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate({ name: "achievements" })}>
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </ScrollReveal>

          {earned.length === 0 ? (
            <ScrollReveal>
              <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
                <Lock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No achievements unlocked yet. Complete lessons and labs to earn badges.</p>
              </div>
            </ScrollReveal>
          ) : (
            <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" staggerChildren={0.07}>
              {earned.map((a) => {
                const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Award
                const tier = TIER_STYLES[a.tier] ?? TIER_STYLES.bronze
                return (
                  <StaggerItem key={a.code}>
                    <CursorGlow color="oklch(0.6 0.2 295 / 0.05)" className="group h-full">
                      <div className={cn(
                        "relative h-full flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card/20 text-center transition-all duration-300 hover:-translate-y-1",
                        tier.border, "hover:shadow-[0_15px_40px_-15px] hover:shadow-violet-500/15",
                      )}>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full border", tier.bg, tier.border)}>
                          <Icon className={cn("h-6 w-6", tier.text)} strokeWidth={1.5} />
                        </div>
                        <div className="text-[11px] font-medium leading-tight line-clamp-2">{a.title}</div>
                        <div className={cn("text-[9px] uppercase tracking-[0.2em] font-mono", tier.text)}>{a.tier}</div>
                        <div className="text-[9px] text-muted-foreground font-mono flex items-center gap-0.5 mt-auto">
                          <Zap className="h-2.5 w-2.5" />+{a.xp}
                        </div>
                      </div>
                    </CursorGlow>
                  </StaggerItem>
                )
              })}
            </Stagger>
          )}
        </section>

        {/* ====================================================
            RECENT ACTIVITY TIMELINE
            ==================================================== */}
        <section>
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
              <div>
                <p className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] mb-1">03 — ACTIVITY</p>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Recent timeline</h2>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">{activities.length} EVENTS</span>
            </div>
          </ScrollReveal>

          {activities.length === 0 ? (
            <ScrollReveal>
              <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent activity. Start learning to populate your timeline.</p>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <div className="relative pl-6">
                {/* Vertical timeline rail */}
                <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/40 via-border to-transparent" />

                <Stagger className="space-y-3" staggerChildren={0.05}>
                  {activities.slice(0, 12).map((a, i) => {
                    const meta = ACTIVITY_META[a.type] ?? { icon: Zap, color: "text-muted-foreground", label: a.type.replace(/_/g, " ") }
                    const Icon = meta.icon
                    return (
                      <StaggerItem key={i}>
                        <div className="relative flex items-start gap-4 group">
                          {/* Node on rail */}
                          <div className="absolute -left-6 top-3 flex items-center justify-center">
                            <div className={cn("h-3 w-3 rounded-full border-2 border-background", meta.color.replace("text-", "bg-"))} />
                          </div>
                          {/* Content */}
                          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/20 hover:bg-card/30 transition-colors">
                            <div className={cn("p-2 rounded-lg bg-muted/30", meta.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium capitalize">{meta.label}</div>
                              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                {new Date(a.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            <Badge className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">+{a.xp} XP</Badge>
                          </div>
                        </div>
                      </StaggerItem>
                    )
                  })}
                </Stagger>
              </div>
            </ScrollReveal>
          )}
        </section>
      </div>
    </div>
  )
}
