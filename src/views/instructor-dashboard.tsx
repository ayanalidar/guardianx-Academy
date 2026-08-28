"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { colorFor, LEVEL_COLORS } from "@/lib/colors"
import { useUser } from "@/hooks/use-user"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts"
import {
  Presentation, Users, BookOpen, TrendingUp, Star, Clock, ChevronRight,
  GraduationCap, Award, Activity, ArrowRight, BarChart3, CheckCircle2, LineChart as LineChartIcon,
  Plus, Pencil, Trash2, Save, X, FileText, FolderOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface InstructorCourse {
  id: string; slug: string; title: string; shortName: string; color: string
  level: string; rating: number; studentsCount: number; moduleCount: number
  lessonCount: number; enrollmentCount: number; activeStudents: number
  completedStudents: number; avgProgress: number
  recentStudents: {
    userId: string; progress: number; completed: boolean; lastAccessed: string | null
    enrolledAt: string; user: { id: string; name: string; avatar: string | null; title: string | null }
  }[]
}

export function InstructorDashboardView() {
  const { navigate } = useAppStore()
  const { user } = useUser()
  const { data, isLoading } = useQuery<{ courses: InstructorCourse[]; totals: any }>({
    queryKey: ["instructor", "courses"],
    queryFn: () => api("/api/instructor/courses"),
  })

  if (user && user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    return (
      <Card className="p-12 text-center border-dashed">
        <Presentation className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium mb-1">Instructor access required</p>
        <p className="text-sm text-muted-foreground">This dashboard is for instructors and admins.</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    )
  }

  const courses = data?.courses ?? []
  const totals = data?.totals

  const statCards = [
    { label: "My Courses", value: totals?.courses ?? 0, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Students", value: totals?.students ?? 0, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Completed", value: totals?.completed ?? 0, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Avg Progress", value: `${totals?.avgProgress ?? 0}%`, icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-background to-background p-6 lg:p-8 scanlines">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono">
              <Presentation className="h-3 w-3" /> INSTRUCTOR DASHBOARD
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-cyan-400">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              You're teaching {courses.length} course{courses.length !== 1 ? "s" : ""} with {totals?.students ?? 0} enrolled students. Average course completion is {totals?.avgProgress ?? 0}%.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-center px-5 py-3 rounded-xl border border-cyan-500/20 bg-card/40 backdrop-blur">
              <Users className="h-7 w-7 text-cyan-400 mx-auto mb-1" />
              <div className="text-2xl font-bold font-mono text-cyan-400">{totals?.students ?? 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Students</div>
            </div>
            <div className="text-center px-5 py-3 rounded-xl border border-emerald-500/20 bg-card/40 backdrop-blur">
              <Award className="h-7 w-7 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold font-mono text-emerald-400">{totals?.completed ?? 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5 relative overflow-hidden group card-hover">
            <div className={cn("absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity", s.bg)} />
            <div className="relative z-10">
              <div className={cn("inline-flex p-2 rounded-lg mb-3", s.bg)}>
                <s.icon className={cn("h-5 w-5", s.color)} />
              </div>
              <div className="text-3xl font-bold tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics charts */}
      <AnalyticsCharts />

      {/* Course performance table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" /> Course Performance
            </h2>
            <p className="text-sm text-muted-foreground">Track enrollment and completion across your courses</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No courses assigned yet</p>
            <p className="text-sm text-muted-foreground">Courses you teach will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map((c) => {
              const col = colorFor(c.color)
              return <InstructorCourseCard key={c.id} course={c} col={col} onOpen={() => navigate({ name: "course", courseId: c.id })} />
            })}
          </div>
        )}
      </div>

      {/* Content Editor */}
      <ContentEditor />
    </div>
  )
}

function InstructorCourseCard({ course, col, onOpen }: {
  course: InstructorCourse
  col: ReturnType<typeof colorFor>
  onOpen: () => void
}) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <Card className="overflow-hidden">
      {/* Header row */}
      <div
        className="p-5 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono font-bold", col.bg, col.border, "border", col.text)}>
            {course.shortName.slice(0, 4)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold truncate">{course.title}</h3>
              <Badge variant="outline" className={cn("text-[10px]", LEVEL_COLORS[course.level])}>{course.level}</Badge>
              <Badge variant="outline" className="text-[10px]">{course.moduleCount} modules</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{course.rating}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollmentCount} students</span>
              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.lessonCount} lessons</span>
            </div>
          </div>
          {/* Mini stats */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400 tabular-nums">{course.activeStudents}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400 tabular-nums">{course.completedStudents}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Done</div>
            </div>
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold text-violet-400 tabular-nums">{course.avgProgress}%</div>
              <Progress value={course.avgProgress} className="h-1 mt-0.5" />
            </div>
          </div>
          <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", expanded && "rotate-90")} />
        </div>
      </div>

      {/* Expanded: recent students */}
      {expanded && (
        <div className="border-t border-border bg-muted/20 p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" /> Recent Students
            </h4>
            <Button variant="ghost" size="sm" onClick={onOpen}>
              View course <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          {course.recentStudents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No enrolled students yet.</p>
          ) : (
            <ScrollArea className="h-64 pr-2">
              <div className="space-y-1.5">
                {course.recentStudents.map((s) => (
                  <div key={s.userId} className="flex items-center gap-3 p-2.5 rounded-lg bg-background/50 hover:bg-background transition-colors">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-[10px]">
                        {s.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{s.user.name}</span>
                        {s.completed && (
                          <Badge className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Completed
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{s.user.title}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20">
                        <Progress value={s.progress} className="h-1.5" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-9 text-right">{s.progress}%</span>
                      <span className="text-[10px] text-muted-foreground hidden sm:inline w-20 text-right">
                        {s.lastAccessed ? new Date(s.lastAccessed).toLocaleDateString() : new Date(s.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </Card>
  )
}

// ---- Analytics Charts ----
const CHART_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#f97316", "#ef4444", "#14b8a6"]

function AnalyticsCharts() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["instructor", "analytics"],
    queryFn: () => api("/api/instructor/analytics"),
  })

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    )
  }
  if (!data) return null

  const { enrollmentSeries, courseBreakdown, progressDistribution, totals } = data

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Enrollment over time */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Enrollment Trend
            </h3>
            <p className="text-[10px] text-muted-foreground">Last 30 days</p>
          </div>
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
            {totals.enrollments} total
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={enrollmentSeries} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 190 / 0.3)" />
            <XAxis dataKey="label" tick={{ fill: "#6b7d75", fontSize: 9 }} interval={5} axisLine={{ stroke: "#334155" }} />
            <YAxis tick={{ fill: "#6b7d75", fontSize: 10 }} allowDecimals={false} axisLine={{ stroke: "#334155" }} />
            <Tooltip
              contentStyle={{ background: "oklch(0.2 0.014 195)", border: "1px solid oklch(0.3 0.02 190)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#e8f5ee" }}
            />
            <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#enrollGrad)" name="Enrollments" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Student progress distribution */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-cyan-400" /> Student Progress
            </h3>
            <p className="text-[10px] text-muted-foreground">Distribution across all courses</p>
          </div>
          <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
            Avg {totals.avgProgress}%
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={progressDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 190 / 0.3)" />
            <XAxis dataKey="range" tick={{ fill: "#6b7d75", fontSize: 9 }} axisLine={{ stroke: "#334155" }} />
            <YAxis tick={{ fill: "#6b7d75", fontSize: 10 }} allowDecimals={false} axisLine={{ stroke: "#334155" }} />
            <Tooltip
              contentStyle={{ background: "oklch(0.2 0.014 195)", border: "1px solid oklch(0.3 0.02 190)", borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "oklch(0.3 0.02 190 / 0.2)" }}
            />
            <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
              {progressDistribution.map((_: any, i: number) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Course breakdown */}
      {courseBreakdown.length > 0 && (
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-violet-400" /> Course Breakdown
              </h3>
              <p className="text-[10px] text-muted-foreground">Enrolled vs Active vs Completed per course</p>
            </div>
            <Badge variant="outline" className="text-[10px] text-violet-400 border-violet-500/30">
              {totals.courses} courses
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={courseBreakdown} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 190 / 0.3)" />
              <XAxis dataKey="shortName" tick={{ fill: "#6b7d75", fontSize: 10 }} axisLine={{ stroke: "#334155" }} />
              <YAxis tick={{ fill: "#6b7d75", fontSize: 10 }} allowDecimals={false} axisLine={{ stroke: "#334155" }} />
              <Tooltip
                contentStyle={{ background: "oklch(0.2 0.014 195)", border: "1px solid oklch(0.3 0.02 190)", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "oklch(0.3 0.02 190 / 0.2)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="active" stackId="a" fill="#06b6d4" name="Active" radius={[0, 0, 0, 0]} />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}

// ---- Content Editor (instructors can edit lesson content) ----
function ContentEditor() {
  const { data: coursesData } = useQuery<{ courses: InstructorCourse[] }>({
    queryKey: ["instructor", "courses"],
    queryFn: () => api("/api/instructor/courses"),
  })
  const courses = coursesData?.courses ?? []
  const [selectedCourseId, setSelectedCourseId] = React.useState("")
  const qc = useQueryClient()

  React.useEffect(() => {
    if (!selectedCourseId && courses[0]) setSelectedCourseId(courses[0].id)
  }, [courses, selectedCourseId])

  if (courses.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" /> Content Editor
          </h2>
          <p className="text-sm text-muted-foreground">Add and edit lessons in your courses</p>
        </div>
        {courses.length > 0 && (
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.shortName} — {c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      {selectedCourseId && <CourseModulesEditor courseId={selectedCourseId} />}
    </div>
  )
}

function CourseModulesEditor({ courseId }: { courseId: string }) {
  const qc = useQueryClient()
  const { data } = useQuery<any>({
    queryKey: ["course", courseId],
    queryFn: () => api(`/api/courses/${courseId}`),
  })
  const course = data?.course
  const [editingLesson, setEditingLesson] = React.useState<string | null>(null)
  const [newLessonModuleId, setNewLessonModuleId] = React.useState<string | null>(null)

  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) => api(`/api/instructor/lessons/${lessonId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] })
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] })
      toast.success("Lesson deleted")
    },
    onError: (e: any) => toast.error(e.message),
  })

  if (!course) return <Skeleton className="h-64" />

  return (
    <div className="space-y-4">
      {course.modules.map((m: any, mi: number) => {
        const col = colorFor(course.color)
        return (
          <Card key={m.id} className="overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold", col.bg, col.border, "border", col.text)}>
                  {String(mi + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.lessons.length} lesson{m.lessons.length !== 1 ? "s" : ""}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setNewLessonModuleId(newLessonModuleId === m.id ? null : m.id)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {m.lessons.map((l: any) => (
                <div key={l.id} className="p-3 flex items-center gap-3 hover:bg-accent/20 transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.title}</div>
                    <div className="text-[10px] text-muted-foreground">{l.type} · {l.durationMin}m</div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingLesson(editingLesson === l.id ? null : l.id)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <button
                    onClick={() => { if (confirm(`Delete "${l.title}"?`)) deleteLesson.mutate(l.id) }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete lesson"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {editingLesson && m.lessons.some((l: any) => l.id === editingLesson) && (
                <LessonEditor
                  lessonId={editingLesson}
                  courseId={courseId}
                  onClose={() => setEditingLesson(null)}
                />
              )}
              {newLessonModuleId === m.id && (
                <NewLessonForm moduleId={m.id} courseId={courseId} onClose={() => setNewLessonModuleId(null)} />
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function LessonEditor({ lessonId, courseId, onClose }: { lessonId: string; courseId: string; onClose: () => void }) {
  const qc = useQueryClient()
  const { data } = useQuery<any>({
    queryKey: ["lesson", lessonId],
    queryFn: () => api(`/api/lessons/${lessonId}`),
  })
  const lesson = data?.lesson
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [durationMin, setDurationMin] = React.useState(15)

  React.useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setContent(lesson.content)
      setDurationMin(lesson.durationMin)
    }
  }, [lesson?.id])

  const save = useMutation({
    mutationFn: () => api(`/api/instructor/lessons/${lessonId}`, {
      method: "PATCH",
      body: JSON.stringify({ title, content, durationMin: Number(durationMin) }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] })
      qc.invalidateQueries({ queryKey: ["lesson", lessonId] })
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] })
      toast.success("Lesson saved")
      onClose()
    },
    onError: (e: any) => toast.error(e.message),
  })

  if (!lesson) return <div className="p-4"><Skeleton className="h-32" /></div>

  return (
    <div className="p-4 bg-emerald-500/[0.03] space-y-3 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Pencil className="h-4 w-4 text-emerald-400" />
        <span className="text-sm font-semibold">Edit Lesson</span>
        <Button size="sm" variant="ghost" className="ml-auto h-7" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Lesson content (Markdown supported)..."
        className="min-h-[180px] font-mono text-xs"
      />
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground">Duration (min):</label>
        <Input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="w-24 h-8" />
        <Button size="sm" className="ml-auto" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="h-3.5 w-3.5 mr-1" /> {save.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

function NewLessonForm({ moduleId, courseId, onClose }: { moduleId: string; courseId: string; onClose: () => void }) {
  const qc = useQueryClient()
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState("reading")
  const [content, setContent] = React.useState("")
  const [durationMin, setDurationMin] = React.useState(15)

  const create = useMutation({
    mutationFn: () => api(`/api/instructor/modules/${moduleId}/lessons`, {
      method: "POST",
      body: JSON.stringify({ title, type, content, durationMin: Number(durationMin) }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] })
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] })
      toast.success("Lesson created")
      onClose()
    },
    onError: (e: any) => toast.error(e.message),
  })

  return (
    <div className="p-4 bg-cyan-500/[0.03] space-y-3 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 text-cyan-400" />
        <span className="text-sm font-semibold">New Lesson</span>
        <Button size="sm" variant="ghost" className="ml-auto h-7" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="reading">Reading</SelectItem>
          <SelectItem value="pdf">PDF Document</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Lesson content (Markdown supported)..."
        className="min-h-[120px] font-mono text-xs"
      />
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground">Duration (min):</label>
        <Input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="w-24 h-8" />
        <Button size="sm" className="ml-auto" onClick={() => create.mutate()} disabled={!title.trim() || create.isPending}>
          <Plus className="h-3.5 w-3.5 mr-1" /> {create.isPending ? "Creating..." : "Create Lesson"}
        </Button>
      </div>
    </div>
  )
}
