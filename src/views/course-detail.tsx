"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { LEVEL_COLORS } from "@/lib/colors"
import { useUser } from "@/hooks/use-user"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Star, Clock, Users, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Circle, PlayCircle,
  FileText, Lock, Award, BarChart3, FlaskConical, MessageSquare, GraduationCap, ShieldCheck,
  PenLine, ThumbsUp, Bookmark, BookmarkCheck, AlertTriangle, Link2,
  ArrowRight, Sparkles, Zap, Target, Globe, Cpu, Layers, Shield, Briefcase, Radio, Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { getCourseImage } from "@/lib/course-images"
import {
} from "@/components/platform/motion-system"

interface Prerequisite {
  id: string
  title: string
  shortName: string
  level: string
  thumbnail: string | null
  completed?: boolean
}

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

// ============================================================
// Upcoming course batches - example static data for the
// auto-rotating batch carousel. Not fetched from API.
// ============================================================
type BatchMode = "Online" | "In-Person" | "Hybrid"

interface CourseBatch {
  name: string
  startDate: string
  schedule: string
  mode: BatchMode
  seatsFilled: number
  seatsTotal: number
  instructor: string
}

const BATCH_MODE_STYLES: Record<BatchMode, { badge: string; icon: typeof Radio }> = {
  Online: {
    badge: "border-cyan-500/30 text-cyan-300 bg-cyan-500/5",
    icon: Radio,
  },
  "In-Person": {
    badge: "border-amber-500/30 text-amber-300 bg-amber-500/5",
    icon: Users,
  },
  Hybrid: {
    badge: "border-violet-500/30 text-violet-300 bg-violet-500/5",
    icon: Layers,
  },
}

const UPCOMING_BATCHES: CourseBatch[] = [
  {
    name: "Batch 2025-A",
    startDate: "Jan 15, 2025",
    schedule: "Mon / Wed / Fri · 7:00 – 9:00 PM IST",
    mode: "Online",
    seatsFilled: 45,
    seatsTotal: 50,
    instructor: "Dr. Sarah Chen",
  },
  {
    name: "Batch 2025-B",
    startDate: "Feb 1, 2025",
    schedule: "Tue / Thu / Sat · 10:00 AM – 12:00 PM IST",
    mode: "Hybrid",
    seatsFilled: 28,
    seatsTotal: 40,
    instructor: "Dr. Marcus Reeves",
  },
  {
    name: "Weekend Intensive",
    startDate: "Feb 8, 2025",
    schedule: "Sat – Sun · 9:00 AM – 1:00 PM IST",
    mode: "Online",
    seatsFilled: 12,
    seatsTotal: 30,
    instructor: "Dr. Sarah Chen",
  },
  {
    name: "Self-Paced Cohort",
    startDate: "Mar 1, 2025",
    schedule: "Flexible schedule · Weekly mentor sync-ups",
    mode: "Online",
    seatsFilled: 95,
    seatsTotal: 100,
    instructor: "Dr. Marcus Reeves",
  },
]

// ============================================================
// BatchCarousel - auto-rotating showcase of upcoming batches
// ============================================================
function BatchCarousel({ onEnroll }: { onEnroll: (batch: CourseBatch) => void }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  // Auto-rotate every 5s; pause on hover/focus
  React.useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % UPCOMING_BATCHES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const goToSlide = (index: number) => {
    setCurrentIndex((index + UPCOMING_BATCHES.length) % UPCOMING_BATCHES.length)
  }
  const goToPrev = () => goToSlide(currentIndex - 1)
  const goToNext = () => goToSlide(currentIndex + 1)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Carousel viewport */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {UPCOMING_BATCHES.map((batch, i) => {
            const modeStyle = BATCH_MODE_STYLES[batch.mode]
            const seatsLeft = batch.seatsTotal - batch.seatsFilled
            const fillPct = Math.round((batch.seatsFilled / batch.seatsTotal) * 100)
            const ModeIcon = modeStyle.icon
            return (
              <div
                key={batch.name}
                className="w-full shrink-0 px-0.5"
                aria-hidden={i !== currentIndex}
                aria-label={`Batch ${i + 1} of ${UPCOMING_BATCHES.length}: ${batch.name}`}
              >
                <div className="relative rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden">
                  {/* Atmospheric accent */}
                  <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />
                  <div className="relative grid lg:grid-cols-12 gap-6 p-6 sm:p-8">
                    {/* Left - batch identity */}
                    <div className="lg:col-span-7">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-mono text-violet-300 tracking-[0.3em]">
                          UPCOMING BATCH
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">
                          {String(i + 1).padStart(2, "0")} / {String(UPCOMING_BATCHES.length).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-balance">
                        {batch.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mb-6">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-mono tracking-wider", modeStyle.badge)}
                        >
                          <ModeIcon className="h-3 w-3 mr-1" />
                          {batch.mode.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono tracking-wider border-border/60 text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {batch.schedule}
                        </Badge>
                      </div>

                      {/* Key facts grid */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border border-border/40 bg-background/40 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar className="h-3 w-3 text-violet-300" />
                            <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">STARTS</span>
                          </div>
                          <div className="text-sm font-semibold">{batch.startDate}</div>
                        </div>
                        <div className="rounded-lg border border-border/40 bg-background/40 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <GraduationCap className="h-3 w-3 text-cyan-300" />
                            <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">INSTRUCTOR</span>
                          </div>
                          <div className="text-sm font-semibold">{batch.instructor}</div>
                        </div>
                      </div>
                    </div>

                    {/* Right - seats + enroll */}
                    <div className="lg:col-span-5 flex flex-col justify-center">
                      <div className="rounded-xl border border-border/40 bg-background/40 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">
                            SEATS AVAILABLE
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 tracking-[0.2em]">
                            {seatsLeft} LEFT
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mb-3">
                          <span className="text-3xl font-bold tabular-nums">{batch.seatsFilled}</span>
                          <span className="text-base text-muted-foreground tabular-nums">/ {batch.seatsTotal}</span>
                          <span className="text-xs text-muted-foreground ml-1">seats filled</span>
                        </div>
                        {/* Capacity bar */}
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              fillPct >= 90 ? "bg-rose-400" : fillPct >= 70 ? "bg-amber-400" : "bg-emerald-400"
                            )}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <Button
                          onClick={() => onEnroll(batch)}
                          className="w-full bg-violet-600 hover:bg-violet-500 btn-premium"
                          size="lg"
                        >
                          Enroll in Batch
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side nav buttons */}
      <button
        type="button"
        onClick={goToPrev}
        aria-label="Previous batch"
        className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/80 backdrop-blur shadow-lg text-foreground hover:bg-violet-600 hover:text-white hover:border-violet-500 transition-all duration-300"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={goToNext}
        aria-label="Next batch"
        className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/80 backdrop-blur shadow-lg text-foreground hover:bg-violet-600 hover:text-white hover:border-violet-500 transition-all duration-300"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {UPCOMING_BATCHES.map((b, i) => (
          <button
            key={b.name}
            type="button"
            onClick={() => goToSlide(i)}
            aria-label={`Go to batch ${i + 1}: ${b.name}`}
            aria-current={i === currentIndex}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              i === currentIndex
                ? "w-8 bg-violet-500"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function CourseDetailView() {
  const { view, navigate } = useAppStore()
  const courseId = view.name === "course" ? view.courseId : ""
  const { user } = useUser()
  const qc = useQueryClient()
  const heroRef = React.useRef(null)

  const { data, isLoading } = useQuery<CourseDetail>({
    queryKey: ["course", courseId],
    queryFn: () => api(`/api/courses/${courseId}`),
    enabled: !!courseId,
  })

  const enrollMutation = useMutation({
    mutationFn: () => api(`/api/courses/${courseId}/enroll`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Enrolled! Redirecting to My Learning…")
      qc.invalidateQueries({ queryKey: ["course", courseId] })
      qc.invalidateQueries({ queryKey: ["courses"] })
      qc.invalidateQueries({ queryKey: ["me"] })
      // Navigate to My Learning so the student can continue from the
      // enrolled-courses list + Recommended Courses section.
      setTimeout(() => navigate({ name: "learning" }), 600)
    },
    onError: (e: any) => toast.error(e.message),
  })

  // Fetch prerequisites for this course
  const { data: prereqData } = useQuery<{ prerequisites: Prerequisite[] }>({
    queryKey: ["course-prerequisites", courseId],
    queryFn: () => api(`/api/courses/${courseId}/enroll`),
    enabled: !!courseId,
  })
  const prerequisites = prereqData?.prerequisites ?? []

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-[800px] rounded-2xl" />
            <Skeleton className="h-[800px] rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null
  const { course, enrollment, lessonProgress, progressPct, totalLessons, completedLessons } = data
  const isEnrolled = !!enrollment

  const goLesson = (lessonId: string) => {
    if (!isEnrolled) {
      toast.error("Enroll in this course to access lessons.")
      return
    }
    navigate({ name: "lesson", lessonId, courseId })
  }

  // Build learning outcomes from longDescription / tags
  const outcomes: string[] = []
  if (course.longDescription) {
    // First two sentences become outcomes preview
    const sentences = course.longDescription.split(/\.\s+/).filter(Boolean).slice(0, 2)
    sentences.forEach((s: string) => outcomes.push(s.trim() + "."))
  }
  if (course.tags) {
    course.tags.split(",").slice(0, 3).forEach((t: string) => outcomes.push("Master " + t.trim().toLowerCase() + " fundamentals and real-world application."))
  }
  // Ensure we have at least 4 outcomes
  while (outcomes.length < 4) {
    outcomes.push("Develop practical, hands-on skills through GuardianX lab exercises.")
  }

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

      <div className="relative z-10">
        {/* ====================================================
            HERO - cinematic course introduction
            ==================================================== */}
        <section ref={heroRef} className="relative overflow-hidden">
          {/* Course hero image */}
          <div className="absolute inset-0">
            <img
              src={getCourseImage(course)}
              alt={course.title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
            <div className="absolute inset-0 bg-grid opacity-10" />
          </div>
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-violet-600/10 blur-[140px] rounded-full" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-cyan-600/5 blur-[140px] rounded-full" />

          {/* Ghost shortName - giant outline text */}
          <div
            style={{ transform: "translateY(0)" }}
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(10rem,30vw,30rem)] font-bold tracking-[-0.08em] text-outline-violet opacity-20 pointer-events-none select-none leading-none whitespace-nowrap"
          >
            {course.shortName}
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Back to catalog */}
            
              <button
                onClick={() => navigate({ name: "catalog" })}
                className="group inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-violet-300 transition-colors tracking-[0.2em] mb-6"
              >
                <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                <span className="uppercase">Back to Catalog</span>
              </button>
            

            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Hero text - col 8 */}
              <div className="lg:col-span-8">
                
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <Badge variant="outline" className={cn("text-[10px] font-mono tracking-[0.3em] uppercase", LEVEL_COLORS[course.level])}>
                      {course.level}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono tracking-[0.3em] uppercase border-border/60">
                      {course.category}
                    </Badge>
                    {course.certBody && (
                      <Badge variant="outline" className="text-[10px] font-mono tracking-[0.3em] uppercase border-violet-500/30 text-violet-300">
                        {course.certBody}
                      </Badge>
                    )}
                    {isEnrolled && (
                      <Badge className="text-[10px] font-mono tracking-[0.3em] uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> ENROLLED
                      </Badge>
                    )}
                  </div>
                

                
                  <p className="text-[10px] font-mono text-violet-300 tracking-[0.3em] mb-4">
                    GUARDIANX · {course.shortName}
                  </p>
                

                
                  <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.04em] text-balance mb-6">
                    {course.title}
                  </h1>
                

                
                  <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed text-balance">
                    {course.description}
                  </p>
                

                {/* Instructor info inline */}
                
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-violet-500/30">
                      <AvatarFallback className="bg-violet-500/10 text-violet-300 text-xs font-mono">
                        {course.instructor.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">INSTRUCTOR</p>
                      <p className="text-sm font-medium">
                        {course.instructor.name}
                        {course.instructor.title && <span className="text-muted-foreground font-normal"> · {course.instructor.title}</span>}
                      </p>
                    </div>
                  </div>
                
              </div>

              {/* Hero right column - enroll / progress card */}
              <div className="lg:col-span-4">
                
                  <Card className="relative overflow-hidden border-border/60 bg-card/50 backdrop-blur-xl p-6">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

                    {isEnrolled ? (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mb-1">YOUR PROGRESS</p>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-bold text-violet-200 tabular-nums">
                              {progressPct}%
                            </span>
                          </div>
                          <Progress value={progressPct} className="h-1.5 bg-muted" />
                          <div className="text-xs text-muted-foreground mt-2 font-mono">
                            {completedLessons} OF {totalLessons} LESSONS COMPLETED
                          </div>
                        </div>

                        {progressPct === 100 && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                            <Award className="h-4 w-4 shrink-0" />
                            <span>Course completed · Certificate issued</span>
                          </div>
                        )}

                        <div>
                          <Button
                            className="w-full btn-premium bg-violet-600 hover:bg-violet-500 text-violet-50 border border-violet-500/30"
                            onClick={() => {
                              for (const m of course.modules) {
                                for (const l of m.lessons) {
                                  if (!lessonProgress[l.id]?.completed) {
                                    goLesson(l.id)
                                    return
                                  }
                                }
                              }
                              goLesson(course.modules[0]?.lessons[0]?.id)
                            }}
                          >
                            <PlayCircle className="h-4 w-4 mr-1.5" /> {progressPct > 0 ? "Continue Learning" : "Start Learning"}
                          </Button>
                        </div>

                        <Button variant="outline" className="w-full border-border/60" onClick={() => navigate({ name: "learning" })}>
                          <BarChart3 className="h-4 w-4 mr-1.5" /> My Dashboard
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="text-center pb-2">
                          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mb-1">ONE-TIME PAYMENT</p>
                          <div className="text-5xl font-bold text-gradient-premium tabular-nums">${course.price}</div>
                        </div>

                        {prerequisites.length > 0 && (
                          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-300 mb-2 tracking-[0.2em] font-mono">
                              <AlertTriangle className="h-3.5 w-3.5" /> PREREQUISITES
                            </div>
                            <div className="space-y-1.5">
                              {prerequisites.map((p) => (
                                <div key={p.id} className="flex items-center gap-2 text-xs">
                                  <Link2 className="h-3 w-3 text-amber-300/70 shrink-0" />
                                  <span className="font-medium truncate flex-1">{p.title}</span>
                                  <Badge variant="outline" className="text-[9px] py-0 h-4 font-mono">{p.shortName}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <Button
                            className="w-full btn-premium bg-violet-600 hover:bg-violet-500 text-violet-50 border border-violet-500/30"
                            onClick={() => {
                              if (!user) {
                                navigate({ name: "login" })
                                return
                              }
                              enrollMutation.mutate()
                            }}
                            disabled={enrollMutation.isPending}
                          >
                            <GraduationCap className="h-4 w-4 mr-1.5" /> {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                          </Button>
                        </div>

                        <BookmarkButton courseId={course.id} />

                        <div className="space-y-2 text-xs text-muted-foreground pt-2">
                          <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Full lifetime access</div>
                          <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-emerald-300" /> PDF study materials</div>
                          <div className="flex items-center gap-2"><Award className="h-3.5 w-3.5 text-emerald-300" /> Certificate of completion</div>
                          <div className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 text-emerald-300" /> Community discussions</div>
                        </div>
                      </div>
                    )}
                  </Card>
                
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            METADATA STRIP - editorial stat tiles, full-width grid
            ==================================================== */}
        <section className="border-y border-border/60 bg-background/40 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
              {[
                { label: "CATEGORY", value: course.category, icon: Layers },
                { label: "LEVEL", value: course.level, icon: Target },
                { label: "DURATION", value: `${course.durationHours}h`, icon: Clock },
                { label: "RATING", value: course.rating.toFixed(1), icon: Star },
                { label: "STUDENTS", value: course.studentsCount.toLocaleString(), icon: Users },
                { label: "MODULES", value: course.modules.length, icon: BookOpen },
                { label: "LESSONS", value: totalLessons, icon: FileText },
              ].map((m, i) => (
                  <div key={m.label} className="group rounded-xl border border-border/40 bg-card/40 p-3 lg:p-4 hover:border-violet-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-mono text-muted-foreground/50 tracking-[0.2em]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <m.icon className="h-3 w-3 text-violet-300/70" />
                    </div>
                    <div className="text-lg lg:text-2xl font-bold tabular-nums">{m.value}</div>
                    <div className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mt-0.5">{m.label}</div>
                  </div>
                
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            LEARNING OUTCOMES - editorial, no cards
            ==================================================== */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-8">
                  
                    <p className="text-[10px] font-mono text-violet-300 tracking-[0.3em] mb-6">01 - OUTCOMES</p>
                  
                  
                    <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-balance">
                      What you&apos;ll
                      <span className="text-gradient-premium"> master.</span>
                    </h2>
                  
                  
                    <p className="text-muted-foreground mt-6 max-w-md leading-relaxed">
                      A focused curriculum engineered for real-world application - every lesson
                      builds toward verifiable, hands-on competence.
                    </p>
                  
                </div>
              </div>

              <div className="lg:col-span-7">
                
                  {outcomes.map((outcome, i) => (
                      <div key={i} className="group flex items-start gap-5 pb-8 border-b border-border/40 last:border-0">
                        <span className="text-[10px] font-mono text-muted-foreground/40 tracking-[0.2em] pt-1">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1">
                          <p className="text-lg lg:text-xl text-foreground/90 leading-relaxed">
                            {outcome}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-violet-300 group-hover:translate-x-1 transition-all shrink-0 mt-1.5" />
                      </div>
                    
                  ))}
                
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            CURRICULUM - premium accordion modules
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
              
                <div>
                  <p className="text-[10px] font-mono text-violet-300 tracking-[0.3em] mb-4">02 - CURRICULUM</p>
                  <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-balance">
                    Modules &amp;
                    <span className="text-muted-foreground/50"> lessons.</span>
                  </h2>
                </div>
              
              
                <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
                  <div>
                    <span className="text-violet-300 font-bold text-lg">{course.modules.length}</span> MODULES
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <span className="text-violet-300 font-bold text-lg">{totalLessons}</span> LESSONS
                  </div>
                  {isEnrolled && (
                    <>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <span className="text-emerald-300 font-bold text-lg">{completedLessons}</span> DONE
                      </div>
                    </>
                  )}
                </div>
              
            </div>

            
              <Accordion type="multiple" defaultValue={[course.modules[0]?.id]} className="space-y-3">
                {course.modules.map((m: any, mi: number) => {
                  const moduleDone = m.lessons.filter((l: any) => lessonProgress[l.id]?.completed).length
                  const modulePct = m.lessons.length > 0 ? (moduleDone / m.lessons.length) * 100 : 0
                  return (
                    <AccordionItem
                      key={m.id}
                      value={m.id}
                      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 backdrop-blur transition-colors hover:border-violet-500/30 data-[state=open]:border-violet-500/40"
                    >
                      <AccordionTrigger className="px-5 lg:px-7 py-5 hover:no-underline hover:bg-violet-500/[0.02]">
                        <div className="flex items-center gap-4 text-left flex-1 min-w-0">
                          <div className="relative shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 font-mono text-sm font-bold text-violet-200">
                              {String(mi + 1).padStart(2, "0")}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base lg:text-lg tracking-tight truncate">{m.title}</div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="font-mono tracking-wider">{m.lessons.length} LESSONS</span>
                              {moduleDone > 0 && (
                                <span className="font-mono tracking-wider text-emerald-300">{moduleDone} DONE</span>
                              )}
                            </div>
                          </div>
                          {/* Mini progress bar */}
                          {isEnrolled && modulePct > 0 && (
                            <div className="hidden sm:block w-20">
                              <div className="text-[9px] font-mono text-muted-foreground text-right mb-1">{Math.round(modulePct)}%</div>
                              <div className="h-1 bg-muted overflow-hidden rounded-full">
                                <div
                                  className={cn("h-full rounded-full transition-all", modulePct === 100 ? "bg-emerald-400" : "bg-violet-400")}
                                  style={{ width: `${modulePct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 lg:px-7 pb-4">
                        <div className="space-y-1 mt-3 border-l border-border/60 ml-6 pl-6">
                          {m.lessons.map((l: any, li: number) => {
                            const Icon = LESSON_ICONS[l.type] ?? FileText
                            const done = lessonProgress[l.id]?.completed
                            const locked = !isEnrolled && !l.preview
                            return (
                              <button
                                key={l.id}
                                onClick={() => goLesson(l.id)}
                                className="group/lesson w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-violet-500/5 text-left transition-colors"
                              >
                                <span className="text-[9px] font-mono text-muted-foreground/40 w-6 shrink-0">
                                  {String(li + 1).padStart(2, "0")}
                                </span>
                                {done ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                                ) : locked ? (
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 group-hover/lesson:text-violet-300 transition-colors" />
                                )}
                                <Icon className={cn("h-4 w-4 shrink-0", done ? "text-emerald-300" : "text-muted-foreground")} />
                                <span className={cn(
                                  "flex-1 text-sm truncate transition-colors",
                                  done ? "text-muted-foreground line-through" : "group-hover/lesson:text-violet-200"
                                )}>
                                  {l.title}
                                </span>
                                {l.preview && !isEnrolled && (
                                  <Badge variant="outline" className="text-[9px] text-emerald-300 border-emerald-500/30 font-mono tracking-wider">FREE</Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground font-mono tracking-wider">{l.durationMin}m</span>
                              </button>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            
          </div>
        </section>

        {/* ====================================================
            PREREQUISITES & TARGET AUDIENCE
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Prerequisites */}
              <div>
                
                  <p className="text-[10px] font-mono text-violet-300 tracking-[0.3em] mb-4">PREREQUISITES</p>
                
                
                  <h3 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-6">
                    What you need before starting.
                  </h3>
                
                
                  <div className="space-y-3">
                    {[
                      { icon: CheckCircle2, text: "Basic understanding of computer networks and TCP/IP", color: "text-emerald-400" },
                      { icon: CheckCircle2, text: "Familiarity with Linux command line fundamentals", color: "text-emerald-400" },
                      { icon: CheckCircle2, text: "Understanding of basic security concepts (CIA triad)", color: "text-emerald-400" },
                      { icon: Circle, text: "No prior certification required - beginner-friendly entry", color: "text-muted-foreground" },
                    ].map((req, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <req.icon className={cn("h-5 w-5 mt-0.5 shrink-0", req.color)} />
                        <span className="text-sm text-muted-foreground leading-relaxed">{req.text}</span>
                      </div>
                    ))}
                  </div>
                

                {/* Prerequisite courses */}
                {prereqData?.prerequisites && prereqData.prerequisites.length > 0 && (
                  
                    <div className="mt-5 pt-6 border-t border-border/40">
                      <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mb-4">RECOMMENDED PRIOR COURSES</p>
                      <div className="space-y-2">
                        {prereqData.prerequisites.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => navigate({ name: "course", courseId: p.id })}
                            className="group w-full flex items-center justify-between p-3 rounded-lg border border-border/60 hover:border-violet-500/40 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              {p.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium group-hover:text-violet-300 transition-colors">{p.title}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{p.shortName}</Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  
                )}
              </div>

              {/* Target Audience */}
              <div>
                
                  <p className="text-[10px] font-mono text-cyan-300 tracking-[0.3em] mb-4">TARGET AUDIENCE</p>
                
                
                  <h3 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-6">
                    Who this course is for.
                  </h3>
                
                
                  <div className="space-y-3">
                    {[
                      { icon: GraduationCap, text: "Aspiring cybersecurity professionals entering the field", color: "text-violet-300" },
                      { icon: Shield, text: "IT professionals transitioning to security roles", color: "text-cyan-300" },
                      { icon: Target, text: "Security analysts seeking industry certification", color: "text-amber-300" },
                      { icon: Users, text: "Students preparing for certification exams", color: "text-emerald-300" },
                      { icon: Briefcase, text: "Professionals needing CEUs or skill verification", color: "text-rose-300" },
                    ].map((aud, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card/20">
                        <aud.icon className={cn("h-5 w-5 mt-0.5 shrink-0", aud.color)} />
                        <span className="text-sm text-muted-foreground leading-relaxed">{aud.text}</span>
                      </div>
                    ))}
                  </div>
                
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            HANDS-ON LABS - dedicated section
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-8" />
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            
              <p className="text-[10px] font-mono text-cyan-300 tracking-[0.3em] mb-4">HANDS-ON LABS</p>
            
            
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
                Practice in a real cyber range.
              </h2>
            
            
              <p className="text-base text-muted-foreground max-w-lg mb-12">
                Every GuardianX course includes hands-on labs with Docker-powered live targets.
                {isEnrolled ? " You're enrolled - launch the lab directly." : " Enroll to access the full lab environment."}
              </p>
            

            {course.labs && course.labs.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {course.labs.map((lab: any) => (
                  <div key={lab.id} className="group h-full">
                      <div
                        className="relative h-full rounded-xl border border-border/60 bg-card/30 p-6 cursor-pointer overflow-hidden"
                        onClick={() => navigate(isEnrolled ? { name: "lab", labSlug: lab.slug } : { name: "login" })}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="inline-flex p-2.5 rounded-lg bg-cyan-500/10">
                            <FlaskConical className="h-5 w-5 text-cyan-300" />
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-mono",
                            lab.difficulty === "Easy" ? "border-emerald-500/30 text-emerald-400" :
                            lab.difficulty === "Medium" ? "border-amber-500/30 text-amber-400" :
                            "border-rose-500/30 text-rose-400"
                          )}>
                            {lab.difficulty.toUpperCase()}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-base mb-2 group-hover:text-violet-300 transition-colors">{lab.title}</h3>
                        <p className="text-xs text-muted-foreground mb-4">{lab.category}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                          <span className="text-[10px] font-mono text-violet-300">{lab.points} XP</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-violet-300 transition-colors">
                            {isEnrolled ? "Launch Lab" : "Enroll to Access"}
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                        {!isEnrolled && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl border border-border/40 bg-card/20">
                <FlaskConical className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Labs for this course are being prepared.</p>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            UPCOMING BATCHES - auto-rotating carousel
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-8" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mb-12 max-w-2xl">
              <p className="text-[10px] font-mono text-violet-300 tracking-[0.3em] mb-4">UPCOMING BATCHES</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
                Choose a cohort that fits.
              </h2>
              <p className="text-base text-muted-foreground">
                New batches start every few weeks. Pick the schedule and mode that works
                for you - slides auto-advance, or use the arrows to browse.
              </p>
            </div>

            <BatchCarousel
              onEnroll={(batch) => {
                if (!user) {
                  navigate({ name: "login" })
                  return
                }
                toast.success(`Enrollment requested for ${batch.name}`, {
                  description: `${batch.startDate} · ${batch.mode} · ${batch.instructor}`,
                })
              }}
            />
          </div>
        </section>

        {/* ====================================================
            INSTRUCTOR - editorial section
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                
                  <p className="text-[10px] font-mono text-cyan-300 tracking-[0.3em] mb-6">03 - INSTRUCTOR</p>
                
                
                  <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-balance mb-6">
                    Learn from a
                    <span className="text-gradient-cyan"> practitioner.</span>
                  </h2>
                
                
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16 border-2 border-cyan-500/30">
                      <AvatarFallback className="bg-cyan-500/10 text-cyan-300 text-base font-mono">
                        {course.instructor.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xl font-bold tracking-tight">{course.instructor.name}</div>
                      <div className="text-sm text-muted-foreground">{course.instructor.title}</div>
                    </div>
                  </div>
                
                {course.instructor.bio && (
                  
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      {course.instructor.bio}
                    </p>
                  
                )}
              </div>

              <div className="lg:col-span-7">
                
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: "COURSES", value: 12, icon: BookOpen, color: "text-violet-300" },
                      { label: "STUDENTS", value: 8400, icon: Users, color: "text-cyan-300" },
                      { label: "RATING", value: "4.9", icon: Star, color: "text-amber-300" },
                    ].map((stat) => (
                      <div key={stat.label} className="border-l border-border/60 pl-4">
                        <stat.icon className={cn("h-4 w-4 mb-2", stat.color)} />
                        <div className="text-3xl font-bold mb-1 tabular-nums">{stat.value}</div>
                        <div className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            ABOUT + LABS - two-column editorial
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12">
              {/* About this course */}
              <div className="lg:col-span-7">
                
                  <p className="text-[10px] font-mono text-violet-300 tracking-[0.3em] mb-6">04 - OVERVIEW</p>
                
                
                  <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-6">
                    About this course.
                  </h2>
                
                
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                    {course.longDescription}
                  </p>
                
                {course.tags && (
                  
                    <div className="flex flex-wrap gap-2 mt-6">
                      {course.tags.split(",").map((t: string) => (
                        <Badge key={t} variant="outline" className="text-xs font-mono tracking-wider border-violet-500/30 text-violet-200 bg-violet-500/5">
                          {t.trim()}
                        </Badge>
                      ))}
                    </div>
                  
                )}
              </div>

              {/* Labs sidebar */}
              <div className="lg:col-span-5">
                {course.labs?.length > 0 ? (
                  
                    <div>
                      <p className="text-[10px] font-mono text-cyan-300 tracking-[0.3em] mb-4">PRACTICE LABS</p>
                      <div className="space-y-2">
                        {course.labs.map((lab: any) => (
                          <button
                            key={lab.id}
                            onClick={() => navigate({ name: "lab", labSlug: lab.slug })}
                            className="group w-full flex items-center justify-between p-4 rounded-xl border border-border/60 hover:border-violet-500/40 hover:bg-violet-500/3 text-left transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate group-hover:text-violet-200 transition-colors">{lab.title}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 font-mono tracking-wider">
                                {lab.category} · {lab.difficulty}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              <Badge variant="outline" className="text-[10px] text-violet-300 border-violet-500/30 font-mono">
                                {lab.points} PTS
                              </Badge>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-violet-300 group-hover:translate-x-1 transition-all" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  
                ) : null}

                {/* Community */}
                
                  <div className="mt-6 p-5 rounded-xl border border-border/60 bg-card/30 backdrop-blur">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <MessageSquare className="h-4 w-4 text-cyan-300" /> Community
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                        {course._count?.discussions ?? 0} THREADS
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {course._count?.enrollments ?? 0} students enrolled and active in discussions.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate({ name: "community" })}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Join Discussion
                    </Button>
                  </div>
                
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            CERTIFICATE PREVIEW
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="w-full h-full opacity-10 bg-grid" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/8 blur-[120px] rounded-full" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            
              <p className="text-[10px] font-mono text-amber-300 tracking-[0.3em] mb-6 text-center">05 - CERTIFICATION</p>
            
            
              <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-balance text-center mb-12">
                Earn a verifiable
                <span className="text-gradient-premium"> certificate.</span>
              </h2>
            

            
              <div className="relative aspect-[1.6/1] max-w-2xl mx-auto rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-background to-background overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-15" />
                <div className="absolute inset-4 border border-violet-500/20 rounded-xl" />
                <div className="absolute top-4 right-4 text-[10px] font-mono text-violet-300/60 tracking-[0.3em]">
                  GUARDIANX · CERTIFIED
                </div>

                <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4">
                    <Award className="h-12 w-12 text-violet-300" />
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] mb-2">CERTIFICATE OF COMPLETION</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">{course.title}</p>
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent my-3" />
                  <p className="text-sm text-muted-foreground">Awarded to <span className="text-foreground font-medium">{user?.name ?? "the bearer"}</span></p>
                  <p className="text-[10px] font-mono text-muted-foreground/60 tracking-[0.2em] mt-4">
                    {course.certBody ?? "GUARDIANX ACADEMY"} · {course.shortName}
                  </p>
                </div>
              </div>
            

            
              <p className="text-center text-sm text-muted-foreground mt-6 max-w-xl mx-auto">
                Complete all modules and pass the final assessment to earn a blockchain-verifiable certificate
                recognized by industry partners.
              </p>
            
          </div>
        </section>

        {/* ====================================================
            REVIEWS
            ==================================================== */}
        <section className="py-20 lg:py-28 border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
              <p className="text-[10px] font-mono text-amber-300 tracking-[0.3em] mb-6">06 - REVIEWS</p>
            
            
              <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-balance mb-12">
                Student voices.
              </h2>
            
            <ReviewsSection courseId={course.id} isEnrolled={isEnrolled} />
          </div>
        </section>

        {/* ====================================================
            FINAL CTA - atmospheric
            ==================================================== */}
        <section className="py-24 lg:py-32 border-t border-border/60 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="w-full h-full opacity-15 bg-grid" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-600/10 blur-[140px] rounded-full" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            
              <p className="text-[10px] font-mono text-violet-300 tracking-[0.3em] mb-6">READY?</p>
            
            
              <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.92] tracking-[-0.04em] text-balance mb-6">
                {isEnrolled ? (
                  <>Continue your <span className="text-gradient-premium">journey.</span></>
                ) : (
                  <>Begin your <span className="text-gradient-premium">ascent.</span></>
                )}
              </h2>
            
            
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
                {isEnrolled
                  ? `You're ${progressPct}% through this course. Keep the momentum going.`
                  : "Join thousands of security professionals mastering their craft on GuardianX."}
              </p>
            
            
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {isEnrolled ? (
                  <Button
                    size="lg"
                    className="btn-premium bg-violet-600 hover:bg-violet-500 text-violet-50 border border-violet-500/30 h-12 px-8 text-base"
                    onClick={() => {
                      for (const m of course.modules) {
                        for (const l of m.lessons) {
                          if (!lessonProgress[l.id]?.completed) {
                            goLesson(l.id)
                            return
                          }
                        }
                      }
                      goLesson(course.modules[0]?.lessons[0]?.id)
                    }}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" /> Continue Learning
                  </Button>
                ) : (
                  <div>
                    <Button
                      size="lg"
                      className="btn-premium bg-violet-600 hover:bg-violet-500 text-violet-50 border border-violet-500/30 h-12 px-8 text-base"
                      onClick={() => {
                        if (!user) {
                          navigate({ name: "login" })
                          return
                        }
                        enrollMutation.mutate()
                      }}
                      disabled={enrollMutation.isPending}
                    >
                      <GraduationCap className="h-5 w-5 mr-2" /> {enrollMutation.isPending ? "Enrolling..." : `Enroll for $${course.price}`}
                    </Button>
                  </div>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 h-12 px-8 text-base"
                  onClick={() => navigate({ name: "catalog" })}
                >
                  Browse Catalog <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            
          </div>
        </section>
      </div>
    </div>
  )
}

// ---- Reviews Section ----
interface Review {
  id: string
  rating: number
  title: string
  content: string
  createdAt: string
  user: { id: string; name: string; title: string | null; avatar: string | null }
}

function ReviewsSection({ courseId, isEnrolled }: { courseId: string; isEnrolled: boolean }) {
  const { user } = useUser()
  const qc = useQueryClient()
  const [showForm, setShowForm] = React.useState(false)
  const [rating, setRating] = React.useState(5)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")

  const { data, isLoading } = useQuery<{ reviews: Review[]; avgRating: number; totalReviews: number; distribution: { star: number; count: number }[] }>({
    queryKey: ["reviews", courseId],
    queryFn: () => api(`/api/courses/${courseId}/reviews`),
  })

  const submitMutation = useMutation({
    mutationFn: () => api(`/api/courses/${courseId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, title, content }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", courseId] })
      setShowForm(false); setTitle(""); setContent(""); setRating(5)
      toast.success("Review submitted! Thanks for your feedback.")
    },
    onError: (e: any) => toast.error(e.message),
  })

  const reviews = data?.reviews ?? []
  const avg = data?.avgRating ?? 0
  const total = data?.totalReviews ?? 0
  const distribution = data?.distribution ?? []
  const myReview = reviews.find((r) => r.user.id === user?.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-baseline gap-3">
          {total > 0 ? (
            <>
              <span className="text-6xl font-bold text-amber-300 tabular-nums leading-none">{avg.toFixed(1)}</span>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("h-4 w-4", s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40")} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-mono tracking-wider">{total} REVIEW{total !== 1 ? "S" : ""}</p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No reviews yet.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEnrolled && !myReview && (
            <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)} className="border-violet-500/40 text-violet-200 hover:bg-violet-500/10">
              <PenLine className="h-3.5 w-3.5 mr-1.5" /> {showForm ? "Cancel" : "Write a Review"}
            </Button>
          )}
          {myReview && (
            <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/30 bg-emerald-500/10 font-mono tracking-wider">
              <CheckCircle2 className="h-3 w-3 mr-1" /> YOU REVIEWED
            </Badge>
          )}
        </div>
      </div>

      {/* Distribution */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 p-5 rounded-xl border border-border/60 bg-card/30 backdrop-blur">
          <div className="flex-1 space-y-1.5">
            {distribution.slice().reverse().map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-xs">
                <span className="w-3 text-muted-foreground font-mono">{d.star}</span>
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${total ? (d.count / total) * 100 : 0}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground font-mono">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        
          <div className="p-5 rounded-xl border border-violet-500/30 bg-violet-500/[0.03] space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Your rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={cn("h-5 w-5", s <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40")} />
                  </button>
                ))}
              </div>
            </div>
            <Input placeholder="Review title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background/50" />
            <Textarea placeholder="Share your experience with this course..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[100px] bg-background/50" />
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-500"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        
      )}

      {/* Reviews list - editorial */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <Star className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 5).map((r) => (
            <div key={r.id} className="group p-5 rounded-xl border border-border/60 bg-card/30 backdrop-blur hover:border-violet-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 shrink-0 border border-amber-500/20">
                    <AvatarFallback className="bg-amber-500/10 text-amber-300 text-xs font-mono">
                      {r.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold">{r.user.name}</span>
                      {r.user.title && <span className="text-[10px] text-muted-foreground font-mono tracking-wider">· {r.user.title}</span>}
                      <div className="flex gap-0.5 ml-auto">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn("h-3 w-3", s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40")} />
                        ))}
                      </div>
                    </div>
                    {r.title && <p className="text-sm font-medium mb-1">{r.title}</p>}
                    {r.content && <p className="text-sm text-muted-foreground leading-relaxed">{r.content}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono tracking-wider">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      {r.user.id === user?.id && <span className="text-emerald-300">· YOUR REVIEW</span>}
                    </div>
                  </div>
                </div>
              </div>
            
          ))}
          {reviews.length > 5 && (
            <p className="text-xs text-center text-muted-foreground py-4 font-mono tracking-wider">
              + {reviews.length - 5} MORE REVIEW{reviews.length - 5 !== 1 ? "S" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Bookmark Button ----
function BookmarkButton({ courseId }: { courseId: string }) {
  const { isBookmarked, toggleAsync, isAuthenticated } = useBookmarks()
  const bookmarked = isBookmarked(courseId)

  if (!isAuthenticated) return null

  return (
    <Button
      variant="outline"
      className="w-full border-border/60 hover:border-amber-500/40 hover:bg-amber-500/5"
      onClick={async () => {
        await toggleAsync(courseId)
        toast.success(bookmarked ? "Removed from wishlist" : "Added to wishlist")
      }}
    >
      {bookmarked ? (
        <><BookmarkCheck className="h-4 w-4 mr-1.5 text-amber-300" /> Bookmarked</>
      ) : (
        <><Bookmark className="h-4 w-4 mr-1.5" /> Add to Wishlist</>
      )}
    </Button>
  )
}
