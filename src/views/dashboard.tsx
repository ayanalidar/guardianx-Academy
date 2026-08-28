"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Shield, BookOpen, GraduationCap, FlaskConical, Award, StickyNote,
  Radio, TrendingUp, Clock, ChevronRight, Flame, Target, Zap, Users,
  ArrowRight, Terminal, Lock,
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useUser } from "@/hooks/use-user"
import { api } from "@/lib/api"
import { colorFor, LEVEL_COLORS } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface CourseListItem {
  id: string; slug: string; title: string; shortName: string; description: string
  category: string; level: string; durationHours: number; rating: number
  studentsCount: number; color: string; tags: string; certBody: string
  instructor: { id: string; name: string; title: string | null }
  lessonCount: number; moduleCount: number
}

interface LiveSessionItem {
  id: string; title: string; description: string | null; roomId: string
  status: string; scheduledAt: string; host: { id: string; name: string; title: string | null }
  memberCount: number; isMember: boolean; isHost: boolean
  course: { id: string; title: string; shortName: string } | null
}

export function DashboardView() {
  const { navigate } = useAppStore()
  const { user, stats } = useUser()

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
  const { data: platformStats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api("/api/stats"),
  })

  const enrolled = coursesData?.courses ?? []
  const featured = allCourses?.courses?.slice(0, 4) ?? []
  const liveSessions = liveData?.sessions ?? []
  const completedLabs = labs?.labs?.filter((l) => l.progress?.status === "completed") ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const statCards = [
    { label: "Enrolled Courses", value: stats?.enrollments ?? 0, icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Completed", value: stats?.completed ?? 0, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Labs Solved", value: stats?.labsDone ?? 0, icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Avg Quiz Score", value: `${stats?.avgScore ?? 0}%`, icon: Target, color: "text-violet-400", bg: "bg-violet-500/10" },
  ]

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-950/40 via-background to-background p-6 lg:p-8 scanlines">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              {user?.role?.toUpperCase()} ACCESS GRANTED
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {greeting}, <span className="text-gradient-emerald">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Continue your journey to becoming a certified cyber security professional. You have {enrolled.length} active course{enrolled.length !== 1 ? "s" : ""} and {liveSessions.length} live session{liveSessions.length !== 1 ? "s" : ""} in progress.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => navigate({ name: "catalog" })} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
                <BookOpen className="h-4 w-4 mr-1.5" /> Browse Courses
              </Button>
              <Button variant="outline" onClick={() => navigate({ name: "labs" })}>
                <Terminal className="h-4 w-4 mr-1.5" /> Practice Labs
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center gap-2 px-6 py-4 rounded-xl border border-emerald-500/20 bg-card/40 backdrop-blur">
            <div className="relative">
              <Shield className="h-16 w-16 text-emerald-400" strokeWidth={1} />
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-emerald-400">{stats?.certificates ?? 0}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Certificates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5 relative overflow-hidden group card-hover">
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${s.bg} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />
            <div className="relative z-10">
              <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="text-3xl font-bold tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Continue learning + Live sessions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" /> Continue Learning
              </h2>
              <p className="text-sm text-muted-foreground">Pick up where you left off</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "learning" })}>
              View all <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {enrolled.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
              <Button onClick={() => navigate({ name: "catalog" })}>
                <BookOpen className="h-4 w-4 mr-1.5" /> Explore Catalog
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrolled.slice(0, 4).map((c) => {
                const col = colorFor(c.color)
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate({ name: "course", courseId: c.id })}
                    className="w-full text-left group"
                  >
                    <Card className="p-4 card-hover overflow-hidden relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${col.gradient} opacity-50`} />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${col.bg} ${col.border} border font-mono font-bold ${col.text}`}>
                          {c.shortName.slice(0, 4)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{c.title}</h3>
                            <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[c.level]}`}>{c.level}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.durationHours}h</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.lessonCount} lessons</span>
                            <span>by {c.instructor.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={0} className="h-1.5" />
                            <span className="text-xs text-muted-foreground font-mono">0%</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </Card>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Live sessions sidebar */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-400" /> Live Now
            </h2>
            <p className="text-sm text-muted-foreground">Active workshops</p>
          </div>

          {liveSessions.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <Radio className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No live sessions right now.</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate({ name: "live" })}>
                Schedule one <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveSessions.slice(0, 3).map((s) => (
                <button key={s.id} onClick={() => navigate({ name: "live" })} className="w-full text-left">
                  <Card className="p-4 card-hover border-red-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-mono rounded-bl-lg flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 pulse-dot" /> LIVE
                    </div>
                    <div className="font-semibold text-sm mb-1 pr-12">{s.title}</div>
                    <div className="text-xs text-muted-foreground mb-2">by {s.host.name}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{s.memberCount} attending</span>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}

          <Card className="p-4 bg-gradient-to-br from-violet-950/30 to-transparent border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium">Daily Challenge</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Solve a new lab every day to keep your streak alive.</p>
            <Button size="sm" variant="outline" className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10" onClick={() => navigate({ name: "labs" })}>
              <Flame className="h-3.5 w-3.5 mr-1" /> Start Challenge
            </Button>
          </Card>
        </div>
      </div>

      {/* Featured courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> Featured Certifications
            </h2>
            <p className="text-sm text-muted-foreground">Top-rated courses to advance your career</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate({ name: "catalog" })}>
            All courses <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((c) => {
            const col = colorFor(c.color)
            return (
              <button key={c.id} onClick={() => navigate({ name: "course", courseId: c.id })} className="text-left group">
                <Card className="overflow-hidden card-hover h-full">
                  <div className={`relative h-24 bg-gradient-to-br ${col.gradient} flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <span className={`relative font-mono font-bold text-2xl ${col.text}`}>{c.shortName}</span>
                    <Badge variant="outline" className={`absolute top-2 right-2 text-[10px] ${LEVEL_COLORS[c.level]}`}>{c.level}</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">{c.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-8">{c.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="text-amber-400">★</span> {c.rating}
                      </span>
                      <span>{c.studentsCount.toLocaleString()} students</span>
                    </div>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>
      </div>

      {/* Platform stats footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: platformStats?.totalCourses ?? "-", icon: BookOpen, color: "text-emerald-400" },
          { label: "Active Students", value: platformStats?.totalStudents ?? "-", icon: Users, color: "text-cyan-400" },
          { label: "Practice Labs", value: platformStats?.totalLabs ?? "-", icon: Terminal, color: "text-violet-400" },
          { label: "Certs Issued", value: platformStats?.totalCertificates ?? "-", icon: Award, color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <s.icon className={`h-8 w-8 ${s.color}`} strokeWidth={1.5} />
            <div>
              <div className="text-xl font-bold tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
