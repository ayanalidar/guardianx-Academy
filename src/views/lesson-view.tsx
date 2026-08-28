"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { colorFor, NOTE_COLORS } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft, ChevronRight, CheckCircle2, StickyNote, FileText, BookOpen,
  PenLine, Trash2, Plus, Save, ChevronUp, ChevronDown, Hash, Clock, Lock,
  Award, AlertCircle, Lightbulb, Terminal,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LessonData {
  lesson: {
    id: string; title: string; type: string; content: string; pdfPages: number
    durationMin: number; preview: boolean; hasAccess: boolean
    module: { id: string; title: string; courseId: string; course: { id: string; title: string; shortName: string; slug: string } }
  }
  quiz: { id: string; title: string; questions: { id: string; text: string; options: string[] }[] } | null
  progress: { completed: boolean; position: number } | null
  prev: { id: string; title: string } | null
  next: { id: string; title: string } | null
}

interface NoteItem {
  id: string; title: string; content: string; color: string; pinned: boolean
  lessonId: string | null; courseId: string | null
  updatedAt: string
  lesson?: { id: string; title: string; module: { course: { id: string; title: string; shortName: string } } } | null
}

export function LessonView() {
  const { view, navigate } = useAppStore()
  const lessonId = view.name === "lesson" ? view.lessonId : ""
  const courseId = view.name === "lesson" ? view.courseId : ""
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<LessonData>({
    queryKey: ["lesson", lessonId],
    queryFn: () => api(`/api/lessons/${lessonId}`),
    enabled: !!lessonId,
  })

  const [page, setPage] = React.useState(1)
  const [notesOpen, setNotesOpen] = React.useState(true)
  const [noteDraft, setNoteDraft] = React.useState("")

  // reset page when lesson changes
  React.useEffect(() => {
    setPage(data?.progress?.position || 1)
  }, [lessonId])

  const { data: notesData } = useQuery<{ notes: NoteItem[] }>({
    queryKey: ["notes", lessonId],
    queryFn: () => api(`/api/notes?lessonId=${lessonId}`),
    enabled: !!lessonId,
  })
  const notes = notesData?.notes ?? []

  const progressMutation = useMutation({
    mutationFn: (body: { completed?: boolean; position?: number }) =>
      api(`/api/lessons/${lessonId}/progress`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["lesson", lessonId] })
      qc.invalidateQueries({ queryKey: ["course", courseId] })
      if (vars.completed) {
        toast.success("Lesson marked complete!")
        qc.invalidateQueries({ queryKey: ["me"] })
      }
    },
  })

  const addNoteMutation = useMutation({
    mutationFn: (body: any) => api("/api/notes", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", lessonId] })
      qc.invalidateQueries({ queryKey: ["notes"] })
      qc.invalidateQueries({ queryKey: ["me"] })
      setNoteDraft("")
      toast.success("Note saved")
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => api(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", lessonId] }),
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/notes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", lessonId] })
      qc.invalidateQueries({ queryKey: ["me"] })
      toast.success("Note deleted")
    },
  })

  const savePosition = React.useCallback(
    (p: number) => {
      progressMutation.mutate({ position: p })
    },
    [progressMutation]
  )

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-[600px] lg:col-span-2" />
        <Skeleton className="h-[600px]" />
      </div>
    )
  }
  if (!data) return null

  const { lesson, quiz, progress, prev, next } = data
  const col = colorFor("emerald")
  const totalPages = Math.max(lesson.pdfPages || 1, lesson.type === "pdf" ? 1 : 1)

  if (!lesson.hasAccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">This lesson is locked</h2>
        <p className="text-sm text-muted-foreground mb-6">Enroll in this course to access all lesson materials.</p>
        <Button onClick={() => navigate({ name: "course", courseId: lesson.module.courseId })}>
          View course
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb / header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <button onClick={() => navigate({ name: "course", courseId: lesson.module.courseId })} className="hover:text-emerald-400 flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> {lesson.module.course.shortName}
          </button>
          <span>/</span>
          <span className="truncate">{lesson.module.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={progress?.completed ? "default" : "outline"}
            size="sm"
            onClick={() => progressMutation.mutate({ completed: !progress?.completed })}
            disabled={progressMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {progress?.completed ? "Completed" : "Mark Complete"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setNotesOpen((o) => !o)}>
            <StickyNote className="h-4 w-4 mr-1.5" /> Notes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px] uppercase">
                {lesson.type === "pdf" ? <><FileText className="h-3 w-3 mr-1" /> Document</> :
                 lesson.type === "reading" ? <><BookOpen className="h-3 w-3 mr-1" /> Reading</> :
                 <><Terminal className="h-3 w-3 mr-1" /> Lab</>}
              </Badge>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.durationMin} min</span>
              {progress?.completed && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Completed</span>}
            </div>
          </div>

          {/* Content tabs */}
          <Tabs defaultValue={lesson.type === "pdf" ? "document" : "reading"}>
            <TabsList>
              <TabsTrigger value="reading"><BookOpen className="h-3.5 w-3.5 mr-1.5" /> Reading</TabsTrigger>
              {lesson.type === "pdf" && (
                <TabsTrigger value="document"><FileText className="h-3.5 w-3.5 mr-1.5" /> Document</TabsTrigger>
              )}
              {quiz && <TabsTrigger value="quiz"><Award className="h-3.5 w-3.5 mr-1.5" /> Quiz</TabsTrigger>}
            </TabsList>

            <TabsContent value="reading">
              <Card className="p-6 lg:p-8">
                <div className="prose-guardianx max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content || "No content available."}</ReactMarkdown>
                </div>
              </Card>
            </TabsContent>

            {lesson.type === "pdf" && (
              <TabsContent value="document">
                <PdfStyleViewer
                  content={lesson.content}
                  title={lesson.title}
                  totalPages={totalPages}
                  page={page}
                  onPageChange={(p) => {
                    setPage(p)
                    savePosition(p)
                  }}
                />
              </TabsContent>
            )}

            {quiz && (
              <TabsContent value="quiz">
                <QuizPanel quiz={quiz} lessonId={lesson.id} />
              </TabsContent>
            )}
          </Tabs>

          {/* Prev/Next */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {prev ? (
              <Button variant="outline" size="sm" onClick={() => navigate({ name: "lesson", lessonId: prev.id, courseId })}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            ) : <div />}
            <span className="text-xs text-muted-foreground font-mono">Page {page}/{totalPages}</span>
            {next ? (
              <Button size="sm" onClick={() => navigate({ name: "lesson", lessonId: next.id, courseId })}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate({ name: "course", courseId })}>
                Finish <CheckCircle2 className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Notes panel */}
        {notesOpen && (
          <div className="space-y-3">
            <Card className="p-4 sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <StickyNote className="h-4 w-4 text-amber-400" /> On-the-Go Notes
                </h3>
                <Badge variant="outline" className="text-[10px]">{notes.length}</Badge>
              </div>

              {/* Quick add */}
              <div className="space-y-2 mb-4">
                <Textarea
                  placeholder="Jot down a quick note, command, or insight..."
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  className="min-h-[80px] text-sm resize-none"
                />
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!noteDraft.trim() || addNoteMutation.isPending}
                  onClick={() => addNoteMutation.mutate({
                    title: noteDraft.slice(0, 40) + (noteDraft.length > 40 ? "..." : ""),
                    content: noteDraft,
                    lessonId,
                    courseId,
                    color: "amber",
                  })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Save Note
                </Button>
              </div>

              <Separator />

              {/* Notes list */}
              <ScrollArea className="h-[400px] pr-3 -mr-3">
                <div className="space-y-2 mt-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      <PenLine className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      No notes yet for this lesson.
                    </div>
                  ) : (
                    notes.map((n) => (
                      <NoteCard
                        key={n.id}
                        note={n}
                        onUpdate={(body) => updateNoteMutation.mutate({ id: n.id, ...body })}
                        onDelete={() => deleteNoteMutation.mutate(n.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function Separator() {
  return <div className="h-px bg-border my-3" />
}

// ---- PDF-style paginated document viewer ----
function PdfStyleViewer({ content, title, totalPages, page, onPageChange }: {
  content: string; title: string; totalPages: number; page: number; onPageChange: (p: number) => void
}) {
  // Split content into pseudo-pages by headings or chunks
  const pages = React.useMemo(() => {
    const blocks = content.split(/\n(?=#{1,3}\s)/).filter(Boolean)
    if (blocks.length <= 1) {
      // split by double newline into chunks of ~3 paragraphs
      const paras = content.split(/\n\n+/)
      const chunks: string[] = []
      for (let i = 0; i < paras.length; i += 3) chunks.push(paras.slice(i, i + 3).join("\n\n"))
      return chunks.length ? chunks : [content]
    }
    return blocks
  }, [content])

  const numPages = Math.max(pages.length, totalPages, 1)
  const current = Math.min(page, numPages)
  const pageContent = pages[current - 1] ?? pages[0] ?? content

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-4 w-4 text-emerald-400" />
          <span className="font-mono truncate max-w-[200px]">{title}.pdf</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-mono px-2">{current} / {numPages}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={current >= numPages} onClick={() => onPageChange(current + 1)}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Page */}
      <div className="relative rounded-lg border border-border bg-[oklch(0.97_0.005_150)] dark:bg-[oklch(0.13_0.015_200)] overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 pointer-events-none" />
        <div className="p-8 lg:p-12 min-h-[500px]">
          <div className="prose-guardianx max-w-none text-[oklch(0.18_0.02_200)] dark:text-[oklch(0.95_0.01_150)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{pageContent}</ReactMarkdown>
          </div>
        </div>
        <div className="px-8 py-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">GuardianX • {title}</span>
          <span className="font-mono">Page {current} of {numPages}</span>
        </div>
      </div>

      {/* Page dots */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: Math.min(numPages, 12) }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={cn("h-1.5 rounded-full transition-all", i + 1 === current ? "w-6 bg-emerald-400" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50")}
          />
        ))}
      </div>
    </div>
  )
}

// ---- Note card ----
function NoteCard({ note, onUpdate, onDelete }: {
  note: NoteItem
  onUpdate: (body: any) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [text, setText] = React.useState(note.content)
  const colorObj = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0]

  React.useEffect(() => setText(note.content), [note.content])

  return (
    <div className={cn("rounded-lg border p-3 transition-all", colorObj.bg, colorObj.border)}>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[60px] text-xs bg-background/50" />
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { onUpdate({ content: text }); setEditing(false) }}>
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setText(note.content); setEditing(false) }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-xs font-medium line-clamp-1">{note.title}</span>
            <div className="flex gap-0.5 shrink-0">
              <button onClick={() => onUpdate({ pinned: !note.pinned })} className="text-muted-foreground hover:text-amber-400 p-0.5">
                <Hash className={cn("h-3 w-3", note.pinned && "text-amber-400")} />
              </button>
              <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-emerald-400 p-0.5">
                <PenLine className="h-3 w-3" />
              </button>
              <button onClick={onDelete} className="text-muted-foreground hover:text-red-400 p-0.5">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{note.content}</p>
          <div className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
            {new Date(note.updatedAt).toLocaleDateString()}
          </div>
        </>
      )}
    </div>
  )
}

// ---- Quiz panel ----
function QuizPanel({ quiz, lessonId }: { quiz: NonNullable<LessonData["quiz"]>; lessonId: string }) {
  const qc = useQueryClient()
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [result, setResult] = React.useState<any>(null)

  const submitMutation = useMutation({
    mutationFn: () => api(`/api/quizzes/${quiz.id}/attempt`, { method: "POST", body: JSON.stringify({ answers }) }),
    onSuccess: (data) => {
      setResult(data)
      setSubmitted(true)
      qc.invalidateQueries({ queryKey: ["me"] })
      if (data.passed) toast.success(`Quiz passed! Score: ${data.score}%`)
      else toast.error(`Quiz not passed. Score: ${data.score}%`)
    },
    onError: (e: any) => toast.error(e.message),
  })

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" /> {quiz.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{quiz.questions.length} questions · 70% to pass</p>
        </div>
        {result && (
          <Badge className={result.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
            Score: {result.score}%
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, qi) => {
          const selected = answers[q.id]
          const correct = result?.breakdown?.find((b: any) => b.questionId === q.id)?.correctIndex
          return (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-mono">{qi + 1}</span>
                <p className="font-medium text-sm">{q.text}</p>
              </div>
              <div className="grid gap-2 pl-8">
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi
                  const isCorrect = submitted && correct === oi
                  const isWrong = submitted && isSelected && correct !== oi
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border text-sm text-left transition-all",
                        isSelected && !submitted && "border-emerald-500/50 bg-emerald-500/10",
                        !isSelected && !submitted && "border-border hover:border-emerald-500/30 hover:bg-accent/30",
                        isCorrect && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                        isWrong && "border-red-500/50 bg-red-500/10 text-red-400",
                        submitted && !isCorrect && !isWrong && "opacity-50"
                      )}
                    >
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono",
                        isSelected ? "border-emerald-500 bg-emerald-500 text-emerald-950" : "border-muted-foreground/40")}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {isWrong && <AlertCircle className="h-4 w-4 text-red-400" />}
                    </button>
                  )
                })}
              </div>
              {submitted && result?.breakdown?.find((b: any) => b.questionId === q.id)?.explanation && (
                <div className="ml-8 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {result.breakdown.find((b: any) => b.questionId === q.id).explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!submitted ? (
        <Button className="w-full mt-6" disabled={!allAnswered || submitMutation.isPending} onClick={() => submitMutation.mutate()}>
          {submitMutation.isPending ? "Submitting..." : "Submit Answers"}
        </Button>
      ) : (
        <Button variant="outline" className="w-full mt-6" onClick={() => { setSubmitted(false); setResult(null); setAnswers({}) }}>
          Retake Quiz
        </Button>
      )}
    </Card>
  )
}
