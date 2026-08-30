"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  Shield, BookOpen, FlaskConical, Award, Radio, ChevronRight,
  Flame, Target, Zap, ArrowRight, Terminal, PlayCircle, Sparkles,
  TrendingUp, Activity, Lock, Crown,
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useUser } from "@/hooks/use-user"
import { api } from "@/lib/api"
import { CalendarWidget } from "@/components/platform/calendar-widget"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  ScrollReveal, TextReveal, Stagger, StaggerItem, Counter, CursorGlow,
} from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"

interface CourseListItem {
  id: string; slug: string; title: string; shortName: string; description: string
  category: string; level: string; durationHours: number; rating: number
  studentsCount: number; color: string; thumbnail: string | null
  tags: string; certBody: string
  instructor: { id: string; name: string; title: string | null }
  lessonCount: number; moduleCount: number
  enrollment?: { progress: number; completed: boolean; lastAccessed: string | null; enrolledAt: string } | null
}

interface LiveSessionItem {
  id: string; title: string; description: string | null; roomId: string
  status: string; scheduledAt: string; host: { id: string; name: string; title: string | null }
  memberCount: number; isMember: boolean; isHost: boolean
  course: { id: string; title: string; shortName: string } | null
}

export function DashboardView() {
  const { navigate } = useAppStore()
  const { user, stats, gamification } = useUser()

  const { data: coursesData } = useQuery<{ courses: CourseListItem[] }>({
    queryKey: ["courses", "dashboard"],
    queryFn: () => api("/api/courses?enrolled=true&userId=" + user?.id),
    enabled: !!user,
  })
  const { data: allCourses } = useQuery<{ courses: CourseListItem[] }>({
    queryKey: ["courses", "all"],
    queryFn: () => api("/api/courses"),
  })
  const { data: liveData } = useQuery<{ sessions: LiveSessionItem[] }>({
    queryKey: ["live-sessions"],
    queryFn: () => api("/api/live-sessions?status=live"),
    refetchInterval: 15000,
  })
  const { data: labs } = useQuery<{ labs: any[] }>({
    queryKey: ["labs", "dashboard"],
    queryFn: () => api("/api/labs"),
  })
  const { data: resumeData } = useQuery<{ resume: any }>({
    queryKey: ["me", "resume"],
    queryFn: () => api("/api/me/resume"),
  })
  const { data: recData } = useQuery<{ recommendations: any[] }>({
    queryKey: ["me", "recommendations"],
    queryFn: () => api("/api/me/recommendations"),
  })

  const enrolled = coursesData?.courses ?? []
  const recommendations = recData?.recommendations ?? []
  const liveSessions = liveData?.sessions ?? []
  const completedLabs = labs?.labs?.filter((l) => l.progress?.status === "completed") ?? []
  const resume = resumeData?.resume

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ====================================================
            HERO — greeting + status, dominant
            ==================================================== */}
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.25em]">
              {user?.role?.toUpperCase()} ACCESS · LEVEL {gamification?.level ?? 1}
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] mb-3 text-balance">
            {greeting},{" "}
            <span className="text-gradient-premium">{user?.name?.split(" ")[0]}</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-muted-foreground max-w-xl mb-12">
            {enrolled.length > 0
              ? `You have ${enrolled.length} active course${enrolled.length !== 1 ? "s" : ""} and ${liveSessions.length} live session${liveSessions.length !== 1 ? "s" : ""} in progress.`
              : "Begin your journey. Browse courses and start learning."}
          </p>
        </ScrollReveal>

        {/* ====================================================
            DOMINANT ELEMENT — Current Mission / Continue Learning
            ==================================================== */}
        {resume ? (
          <ScrollReveal delay={0.3}>
            <CurrentMission resume={resume} />
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={0.3}>
            <EmptyMission />
          </ScrollReveal>
        )}

        {/* ====================================================
            SECONDARY ROW — Stats (large, open, no card grid)
            ==================================================== */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Active Courses", value: stats?.enrollments ?? 0, icon: BookOpen, color: "text-violet-300" },
            { label: "Labs Completed", value: stats?.labsDone ?? 0, icon: FlaskConical, color: "text-cyan-300" },
            { label: "Certificates", value: stats?.certificates ?? 0, icon: Award, color: "text-amber-300" },
            { label: "XP Earned", value: gamification?.xp ?? 0, icon: Zap, color: "text-emerald-300" },
          ].map((s, i) => (
            <ScrollReveal key={s.label} delay={0.4 + i * 0.08}>
              <div>
                <s.icon className={cn("h-5 w-5 mb-2", s.color)} />
                <div className="text-4xl font-bold mb-1">
                  <Counter value={s.value} />
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ====================================================
            TWO-COLUMN — Streak/Activity + Calendar
            ==================================================== */}
        <div className="mt-16 grid lg:grid-cols-3 gap-6">
          {/* Streak / Gamification — dominant left */}
          <ScrollReveal className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-8 h-full">
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/8 blur-[80px] rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mb-1">YOUR STREAK</p>
                    <div className="flex items-baseline gap-2">
                      <Flame className="h-8 w-8 text-amber-400" />
                      <span className="text-5xl font-bold">{gamification?.streak ?? 0}</span>
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mb-1">RANK</p>
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-violet-300" />
                      <span className="text-lg font-semibold">{gamification?.rank ?? "Novice"}</span>
                    </div>
                  </div>
                </div>

                {/* Level progress */}
                {gamification?.levelInfo && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Level {gamification.levelInfo.level}</span>
                      <span className="text-violet-300 font-mono">{gamification.levelInfo.currentLevelXp} / {gamification.levelInfo.nextLevelXp} XP</span>
                    </div>
                    <Progress value={gamification.levelInfo.progress} className="h-2" />
                  </div>
                )}

                {/* Mini network viz accent */}
                <div className="mt-6 h-32 -mx-8 -mb-8 opacity-30">
                  <NetworkVisualization variant="minimal" className="w-full h-full" />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Calendar — right */}
          <ScrollReveal delay={0.1}>
            <div className="rounded-2xl border border-border/60 bg-card/30 p-4 h-full">
              <CalendarWidget />
            </div>
          </ScrollReveal>
        </div>

        {/* ====================================================
            LIVE SESSIONS — if any
            ==================================================== */}
        {liveSessions.length > 0 && (
          <ScrollReveal>
            <div className="mt-16">
              <div className="flex items-center gap-2 mb-6">
                <span className="h-2 w-2 rounded-full bg-red-500 pulse-dot" />
                <h2 className="text-2xl font-bold tracking-tight">Live Now</h2>
                <span className="text-xs text-muted-foreground font-mono">{liveSessions.length} SESSION{liveSessions.length !== 1 ? "S" : ""}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveSessions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate({ name: "live" })}
                    className="group cursor-pointer rounded-xl border border-border/60 bg-card/30 p-5 hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Radio className="h-5 w-5 text-red-400" />
                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">LIVE</Badge>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-violet-300 transition-colors line-clamp-1">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.host.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ====================================================
            RECOMMENDED — horizontal scroll feel
            ==================================================== */}
        {recommendations.length > 0 && (
          <ScrollReveal>
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-mono text-violet-400 tracking-[0.3em] mb-1">RECOMMENDED</p>
                  <h2 className="text-2xl font-bold tracking-tight">For you</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate({ name: "catalog" })} className="text-muted-foreground">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.slice(0, 4).map((rec: any, i) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate({ name: "course", courseId: rec.id })}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] rounded-xl border border-border/60 bg-card/30 overflow-hidden mb-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold font-mono text-gradient-premium">{rec.shortName}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium line-clamp-1 group-hover:text-violet-300 transition-colors">{rec.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{rec.level} · {rec.durationHours}h</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ====================================================
            FEATURED COURSES (if no enrollments)
            ==================================================== */}
        {enrolled.length === 0 && allCourses?.courses && (
          <ScrollReveal>
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] mb-1">FEATURED</p>
                  <h2 className="text-2xl font-bold tracking-tight">Start with these</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate({ name: "catalog" })} className="text-muted-foreground">
                  All courses <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allCourses.courses.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate({ name: "course", courseId: c.id })}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] rounded-xl border border-border/60 bg-card/30 overflow-hidden mb-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold font-mono text-gradient-premium">{c.shortName}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium line-clamp-1 group-hover:text-violet-300 transition-colors">{c.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{c.level} · {c.durationHours}h</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   CurrentMission — dominant continue-learning element
   ============================================================ */
function CurrentMission({ resume }: { resume: any }) {
  const { navigate } = useAppStore()
  if (!resume?.course && !resume?.lesson) return <EmptyMission />

  const course = resume.course
  const lesson = resume.lesson

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 cursor-pointer group"
      onClick={() => lesson ? navigate({ name: "lesson", lessonId: lesson.id, courseId: course.id }) : navigate({ name: "course", courseId: course.id })}
    >
      <div className="grid lg:grid-cols-12 gap-0">
        {/* Visual — left, large */}
        <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-cyan-950/20" />
          <div className="absolute inset-0 bg-grid opacity-15" />
          <NetworkVisualization variant="section" className="absolute inset-0 opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl lg:text-7xl font-bold font-mono text-gradient-premium">{course.shortName}</span>
          </div>
        </div>

        {/* Content — right */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle className="h-4 w-4 text-violet-300" />
              <span className="text-[10px] font-mono text-violet-300 tracking-[0.25em]">CONTINUE LEARNING</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em] mb-3 text-balance">
              {lesson ? lesson.title : course.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {course.title}{lesson ? ` · ${lesson.module?.title ?? ""}` : ""}
            </p>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="text-violet-300 font-mono">{course.enrollment?.progress ?? 0}%</span>
              </div>
              <Progress value={course.enrollment?.progress ?? 0} className="h-1.5" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-violet-600 hover:bg-violet-500 btn-premium">
              {lesson ? "Resume Lesson" : "Continue Course"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <span className="text-[10px] text-muted-foreground font-mono">
              {course.enrollment?.completed ? "COMPLETED" : "IN PROGRESS"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyMission() {
  const { navigate } = useAppStore()
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-12 text-center">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="relative z-10">
        <div className="inline-flex p-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 mb-6">
          <Target className="h-8 w-8 text-violet-300" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Ready to begin?</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You haven&apos;t started any courses yet. Browse our catalog and begin your journey.
        </p>
        <Button onClick={() => navigate({ name: "catalog" })} className="bg-violet-600 hover:bg-violet-500 btn-premium">
          Browse Courses <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
