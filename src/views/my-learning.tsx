"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { useUser } from "@/hooks/use-user"
import { colorFor, LEVEL_COLORS } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap, BookOpen, Award, Clock, ChevronRight, TrendingUp,
  CheckCircle2, PlayCircle, Flame, Target, BarChart3,
} from "lucide-react"

interface CourseItem {
  id: string; slug: string; title: string; shortName: string; description: string
  category: string; level: string; durationHours: number; rating: number
  studentsCount: number; color: string; thumbnail: string | null
  instructor: { id: string; name: string; title: string | null }
  lessonCount: number; moduleCount: number
  enrollment?: { progress: number; completed: boolean; lastAccessed: string | null; enrolledAt: string } | null
}

export function MyLearningView() {
  const { navigate } = useAppStore()
  const { user } = useUser()
  const { data, isLoading } = useQuery<{ courses: CourseItem[] }>({
    queryKey: ["courses", "enrolled", user?.id],
    queryFn: () => api(`/api/courses?enrolled=true&userId=${user?.id}`),
    enabled: !!user,
  })

  const courses = data?.courses ?? []
  const inProgress = courses // we don't store progress in listing; treat all as in-progress
  const completed = courses.filter((_, i) => i === -1) // placeholder; full progress shown on course detail

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-emerald-400" /> My Learning
        </h1>
        <p className="text-muted-foreground mt-1">Track your progress across all enrolled courses.</p>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No enrollments yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Browse our catalog and start your cyber security journey.</p>
          <Button onClick={() => navigate({ name: "catalog" })}>
            <BookOpen className="h-4 w-4 mr-1.5" /> Explore Courses
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => {
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
                <Card className="p-5 card-hover overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${col.gradient} opacity-30`} />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
                    {c.thumbnail ? (
                      <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-border">
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      </div>
                    ) : (
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${col.bg} ${col.border} border font-mono font-bold text-xl ${col.text}`}>
                        {c.shortName}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">{c.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[c.level]}`}>{c.level}</Badge>
                        {completed && <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Completed</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{c.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.lessonCount} lessons</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.durationHours}h</span>
                        <span>by {c.instructor.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className={`text-xs font-mono font-bold ${progress > 0 ? col.text : "text-muted-foreground"}`}>{progress}%</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                        <PlayCircle className="h-3.5 w-3.5" />
                        {progress > 0 ? "Continue" : "Start"}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400 transition-colors hidden sm:block self-center" />
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats overview */}
      <div className="grid sm:grid-cols-3 gap-4 pt-4">
        <Card className="p-5">
          <Flame className="h-6 w-6 text-orange-400 mb-2" />
          <div className="text-2xl font-bold">{courses.length}</div>
          <div className="text-xs text-muted-foreground">Active Courses</div>
        </Card>
        <Card className="p-5">
          <Target className="h-6 w-6 text-violet-400 mb-2" />
          <div className="text-2xl font-bold">{courses.reduce((a, c) => a + c.lessonCount, 0)}</div>
          <div className="text-xs text-muted-foreground">Total Lessons</div>
        </Card>
        <Card className="p-5">
          <BarChart3 className="h-6 w-6 text-emerald-400 mb-2" />
          <div className="text-2xl font-bold">{courses.reduce((a, c) => a + c.durationHours, 0)}h</div>
          <div className="text-xs text-muted-foreground">Study Content</div>
        </Card>
      </div>
    </div>
  )
}
