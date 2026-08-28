"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Shield, BookOpen, GraduationCap, FlaskConical, Award, StickyNote,
  Radio, TrendingUp, Clock, ChevronRight, Flame, Target, Zap, Users,
  ArrowRight, Terminal, Lock, CheckCircle2, PlayCircle, Sparkles,
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
  const { data: platformStats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api("/api/stats"),
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
  const featured = allCourses?.courses?.slice(0, 4) ?? []
  const recommendations = recData?.recommendations ?? []
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

      {/* Continue where you left off */}
      {resumeData?.resume && <ResumeCard resume={resumeData.resume} />}

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
                const progress = c.enrollment?.progress ?? 0
                const completed = c.enrollment?.completed ?? false
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate({ name: "course", courseId: c.id })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate({ name: "course", courseId: c.id }) } }}
                    className="w-full text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-xl"
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
                            {completed && <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Done</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.durationHours}h</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.lessonCount} lessons</span>
                            <span>by {c.instructor.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-1.5" />
                            <span className={`text-xs font-mono ${progress > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>{progress}%</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </Card>
                  </div>
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

          {/* Gamification / streak widget */}
          {gamification && (
            <Card className="p-4 bg-gradient-to-br from-emerald-950/30 to-transparent border-emerald-500/20 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" fill={gamification.streak > 0 ? "currentColor" : "none"} /> Daily Streak
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Lv {gamification.level}</Badge>
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-bold text-orange-400 tabular-nums leading-none">{gamification.streak}</span>
                  <span className="text-xs text-muted-foreground mb-1">day{gamification.streak !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${i < Math.min(gamification.streak, 7) ? "bg-orange-400" : "bg-muted"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-muted-foreground">{gamification.rank}</span>
                  <span className="text-emerald-400 font-mono">{gamification.xp.toLocaleString()} XP</span>
                </div>
                <Button size="sm" variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => navigate({ name: "achievements" })}>
                  <Award className="h-3.5 w-3.5 mr-1" /> View Achievements
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recommended for you */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" /> Recommended For You
              </h2>
              <p className="text-sm text-muted-foreground">Based on your progress and interests</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "catalog" })}>
              Browse all <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((c) => {
              const col = colorFor(c.color)
              return (
                <div
                  key={c.id}
                  onClick={() => navigate({ name: "course", courseId: c.id })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate({ name: "course", courseId: c.id }) } }}
                  className="text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-xl"
                >
                  <Card className="overflow-hidden card-hover h-full flex flex-col">
                    <div className={`relative h-20 bg-gradient-to-br ${col.gradient} flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-grid opacity-40" />
                      <span className={`relative font-mono font-bold text-xl ${col.text}`}>{c.shortName}</span>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[8px] font-mono border border-violet-500/30">
                        {c.score}% match
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-semibold text-xs mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">{c.title}</h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 flex-1">{c.description}</p>
                      {c.reasons && c.reasons.length > 0 && (
                        <div className="space-y-0.5 mb-2">
                          {c.reasons.map((r: string, i: number) => (
                            <div key={i} className="flex items-center gap-1 text-[9px] text-violet-400">
                              <Sparkles className="h-2 w-2" /> {r}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-2 border-t border-border">
                        <span className="flex items-center gap-0.5"><span className="text-amber-400">★</span>{c.rating}</span>
                        <span>{c.durationHours}h</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

// ---- Continue where you left off ----
function ResumeCard({ resume }: { resume: any }) {
  const { navigate } = useAppStore()
  const col = colorFor(resume.courseColor || "emerald")
  const LESSON_ICONS: Record<string, any> = { reading: BookOpen, pdf: BookOpen, video: PlayCircle, lab: Terminal }
  const Icon = LESSON_ICONS[resume.lessonType] ?? BookOpen

  return (
    <Card
      className="p-5 lg:p-6 relative overflow-hidden border-emerald-500/30 cursor-pointer group animate-fade-in-up"
      onClick={() => navigate({ name: "lesson", lessonId: resume.lessonId, courseId: resume.courseId })}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${col.gradient} opacity-20`} />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative shrink-0">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${col.bg} ${col.border} border`}>
            <PlayCircle className={`h-7 w-7 ${col.text}`} />
          </div>
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-emerald-950">
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {resume.reason === "in-progress" ? "Continue" : "Start Next"}
            </span>
            <span className={`text-[10px] font-mono ${col.text}`}>{resume.courseShortName}</span>
            <span className="text-[10px] text-muted-foreground">· {resume.moduleTitle}</span>
          </div>
          <h3 className="font-semibold text-base sm:text-lg group-hover:text-emerald-400 transition-colors line-clamp-1">
            {resume.lessonTitle}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Icon className="h-3 w-3" />{resume.lessonType}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{resume.durationMin} min</span>
            <span className="truncate">{resume.courseTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-emerald-950 text-xs font-medium group-hover:bg-emerald-400 transition-colors">
            <PlayCircle className="h-3.5 w-3.5" /> Resume
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Card>
  )
}
