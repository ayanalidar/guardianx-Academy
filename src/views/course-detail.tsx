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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Star, Clock, Users, BookOpen, ChevronLeft, CheckCircle2, Circle, PlayCircle,
  FileText, Lock, Award, BarChart3, FlaskConical, MessageSquare, GraduationCap, ShieldCheck,
  PenLine, ThumbsUp, Bookmark, BookmarkCheck,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useBookmarks } from "@/hooks/use-bookmarks"

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
              {course.thumbnail ? (
                <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-border">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
              ) : (
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${col.bg} ${col.border} border font-mono font-bold text-2xl ${col.text}`}>
                  {course.shortName}
                </div>
              )}
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
                <BookmarkButton courseId={course.id} />
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

          {/* Reviews */}
          <ReviewsSection courseId={course.id} isEnrolled={isEnrolled} />
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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" fill="currentColor" /> Student Reviews</h3>
        {isEnrolled && !myReview && (
          <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
            <PenLine className="h-3.5 w-3.5 mr-1.5" /> {showForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
        {myReview && (
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 className="h-3 w-3 mr-1" /> You reviewed this
          </Badge>
        )}
      </div>

      {/* Rating summary */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-5 p-4 rounded-lg bg-muted/30">
        <div className="text-center">
          <div className="text-4xl font-bold text-amber-400 tabular-nums">{avg.toFixed(1)}</div>
          <div className="flex gap-0.5 justify-center my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40")} />
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground">{total} review{total !== 1 ? "s" : ""}</div>
        </div>
        <div className="flex-1 w-full space-y-1">
          {distribution.slice().reverse().map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground font-mono">{d.star}</span>
              <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${total ? (d.count / total) * 100 : 0}%` }} />
              </div>
              <span className="w-6 text-right text-muted-foreground font-mono">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mb-5 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] space-y-3 animate-fade-in-up">
          <div className="flex items-center gap-2">
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
          <Input placeholder="Review title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Share your experience with this course..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[100px]" />
          <Button size="sm" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <Star className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.slice(0, 5).map((r) => (
            <div key={r.id} className="p-3 rounded-lg border border-border hover:border-emerald-500/20 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-amber-500/10 text-amber-400 text-[10px]">
                    {r.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-medium">{r.user.name}</span>
                    {r.user.title && <span className="text-[10px] text-muted-foreground">· {r.user.title}</span>}
                    <div className="flex gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("h-3 w-3", s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40")} />
                      ))}
                    </div>
                  </div>
                  {r.title && <p className="text-sm font-medium mb-0.5">{r.title}</p>}
                  {r.content && <p className="text-xs text-muted-foreground leading-relaxed">{r.content}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    {r.user.id === user?.id && <span className="text-emerald-400">· Your review</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {reviews.length > 5 && (
            <p className="text-xs text-center text-muted-foreground py-2">+ {reviews.length - 5} more review{reviews.length - 5 !== 1 ? "s" : ""}</p>
          )}
        </div>
      )}
    </Card>
  )
}

// ---- Bookmark Button ----
function BookmarkButton({ courseId }: { courseId: string }) {
  const { isBookmarked, toggleAsync } = useBookmarks()
  const bookmarked = isBookmarked(courseId)

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={async () => {
        await toggleAsync(courseId)
        toast.success(bookmarked ? "Removed from wishlist" : "Added to wishlist")
      }}
    >
      {bookmarked ? (
        <><BookmarkCheck className="h-4 w-4 mr-1.5 text-amber-400" /> Bookmarked</>
      ) : (
        <><Bookmark className="h-4 w-4 mr-1.5" /> Add to Wishlist</>
      )}
    </Button>
  )
}
