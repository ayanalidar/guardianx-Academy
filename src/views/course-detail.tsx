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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Star, Clock, Users, BookOpen, ChevronLeft, CheckCircle2, Circle, PlayCircle,
  FileText, Lock, Award, BarChart3, FlaskConical, MessageSquare, GraduationCap, ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

interface CourseDetail {
  course: any
  enrollment: any
  lessonProgress: Record<string, { completed: boolean; position: number }>
  totalLessons: number
  completedLessons: number
  progressPct: number
}

const LESSON_ICONS: Record<string, any> = {
  reading: FileText,
  pdf: FileText,
  video: PlayCircle,
  lab: FlaskConical,
}

export function CourseDetailView() {
  const { view, navigate } = useAppStore()
  const courseId = view.name === "course" ? view.courseId : ""
  const { user } = useUser()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<CourseDetail>({
    queryKey: ["course", courseId],
    queryFn: () => api(`/api/courses/${courseId}`),
    enabled: !!courseId,
  })

  const enrollMutation = useMutation({
    mutationFn: () => api(`/api/courses/${courseId}/enroll`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Enrolled! Start learning now.")
      qc.invalidateQueries({ queryKey: ["course", courseId] })
      qc.invalidateQueries({ queryKey: ["courses"] })
      qc.invalidateQueries({ queryKey: ["me"] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!data) return null
  const { course, enrollment, lessonProgress, progressPct, totalLessons, completedLessons } = data
  const col = colorFor(course.color)
  const isEnrolled = !!enrollment

  const goLesson = (lessonId: string) => {
    if (!isEnrolled) {
      toast.error("Enroll in this course to access lessons.")
      return
    }
    navigate({ name: "lesson", lessonId, courseId })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ name: "catalog" })} className="text-muted-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to catalog
      </Button>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-2xl border ${col.border} bg-gradient-to-br ${col.gradient} p-6 lg:p-8`}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`text-xs ${LEVEL_COLORS[course.level]}`}>{course.level}</Badge>
              <Badge variant="outline" className="text-xs">{course.category}</Badge>
              <Badge variant="outline" className="text-xs">{course.certBody}</Badge>
              {isEnrolled && (
                <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Enrolled
                </Badge>
              )}
            </div>
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${col.bg} ${col.border} border font-mono font-bold text-2xl ${col.text}`}>
                {course.shortName}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400 fill-amber-400" />{course.rating}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.studentsCount.toLocaleString()} students</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.durationHours} hours</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{totalLessons} lessons</span>
            </div>
          </div>

          {/* Enroll / progress card */}
          <Card className="p-5 bg-card/80 backdrop-blur border-border/50">
            {isEnrolled ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className={`text-sm font-bold ${col.text}`}>{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {completedLessons} of {totalLessons} lessons completed
                  </div>
                </div>
                {progressPct === 100 ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    <Award className="h-4 w-4" /> Course completed! Certificate issued.
                  </div>
                ) : null}
                <Button className="w-full" onClick={() => {
                  // go to first incomplete lesson
                  for (const m of course.modules) {
                    for (const l of m.lessons) {
                      if (!lessonProgress[l.id]?.completed) {
                        goLesson(l.id)
                        return
                      }
                    }
                  }
                  goLesson(course.modules[0]?.lessons[0]?.id)
                }}>
                  <PlayCircle className="h-4 w-4 mr-1.5" /> {progressPct > 0 ? "Continue" : "Start Learning"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate({ name: "learning" })}>
                  <BarChart3 className="h-4 w-4 mr-1.5" /> My Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${col.text}`}>${course.price}</div>
                  <div className="text-xs text-muted-foreground">one-time payment</div>
                </div>
                <Button className="w-full" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
                  <GraduationCap className="h-4 w-4 mr-1.5" /> {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                </Button>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Full lifetime access</div>
                  <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-emerald-400" /> PDF study materials</div>
                  <div className="flex items-center gap-2"><Award className="h-3.5 w-3.5 text-emerald-400" /> Certificate of completion</div>
                  <div className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> Community discussions</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Curriculum */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" /> Course Curriculum
            </h2>
            <p className="text-sm text-muted-foreground">{course.modules.length} modules · {totalLessons} lessons</p>
          </div>
          <Accordion type="multiple" defaultValue={[course.modules[0]?.id]} className="space-y-3">
            {course.modules.map((m: any, mi: number) => {
              const moduleDone = m.lessons.filter((l: any) => lessonProgress[l.id]?.completed).length
              return (
                <AccordionItem key={m.id} value={m.id} className="border border-border rounded-xl overflow-hidden bg-card/50">
                  <AccordionTrigger className="px-5 hover:no-underline hover:bg-accent/30">
                    <div className="flex items-center gap-3 text-left flex-1">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${col.bg} ${col.text} font-mono text-sm font-bold`}>
                        {String(mi + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{m.title}</div>
                        <div className="text-xs text-muted-foreground">{m.lessons.length} lessons · {moduleDone} done</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-3">
                    <div className="space-y-1 mt-2">
                      {m.lessons.map((l: any) => {
                        const Icon = LESSON_ICONS[l.type] ?? FileText
                        const done = lessonProgress[l.id]?.completed
                        const locked = !isEnrolled && !l.preview
                        return (
                          <button
                            key={l.id}
                            onClick={() => goLesson(l.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 text-left group transition-colors"
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : locked ? (
                              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <Icon className={`h-4 w-4 shrink-0 ${done ? "text-emerald-400" : "text-muted-foreground"}`} />
                            <span className="flex-1 text-sm truncate group-hover:text-emerald-400 transition-colors">{l.title}</span>
                            {l.preview && !isEnrolled && (
                              <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">FREE</Badge>
                            )}
                            <span className="text-xs text-muted-foreground font-mono">{l.durationMin}m</span>
                          </button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {/* Description */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-400" /> About this course</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{course.longDescription}</p>
            {course.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {course.tags.split(",").map((t: string) => (
                  <Badge key={t} variant="outline" className="text-xs">{t.trim()}</Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar: instructor + labs */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" /> Instructor
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 border border-emerald-500/20">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-400">
                  {course.instructor.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{course.instructor.name}</div>
                <div className="text-xs text-muted-foreground">{course.instructor.title}</div>
              </div>
            </div>
            {course.instructor.bio && (
              <p className="text-xs text-muted-foreground leading-relaxed">{course.instructor.bio}</p>
            )}
          </Card>

          {course.labs?.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-violet-400" /> Practice Labs
              </h3>
              <div className="space-y-2">
                {course.labs.map((lab: any) => (
                  <button
                    key={lab.id}
                    onClick={() => navigate({ name: "lab", labSlug: lab.slug })}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-violet-500/30 hover:bg-violet-500/5 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{lab.title}</div>
                      <div className="text-xs text-muted-foreground">{lab.category} · {lab.difficulty}</div>
                    </div>
                    <Badge variant="outline" className="text-xs text-violet-400 border-violet-500/30">{lab.points}pts</Badge>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" /> Community
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {course._count?.discussions ?? 0} discussions · {course._count?.enrollments ?? 0} students enrolled
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate({ name: "community" })}>
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Join Discussion
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
