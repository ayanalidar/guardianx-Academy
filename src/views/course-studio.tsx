"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useUser } from "@/hooks/use-user"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Rocket,
  FileText,
  FileVideo,
  FileCode2,
  FlaskConical,
  Pencil,
  Eye,
  Code2,
  Layers,
  Clock,
  GripVertical,
  CheckCircle2,
  CircleDot,
  Sparkles,
  Settings2,
  ArrowLeft,
  RefreshCw,
  Copy,
  Download,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Types - mirror the API's config shape
// ---------------------------------------------------------------------------
type LessonType = "reading" | "pdf" | "video" | "lab"

interface LessonCfg {
  id: string
  title: string
  type: LessonType
  content: string
  pdfUrl?: string | null
  pdfPages?: number
  durationMin: number
  preview: boolean
}

interface ModuleCfg {
  id: string
  title: string
  description?: string
  lessons: LessonCfg[]
}

interface CourseConfig {
  version: number
  title: string
  shortName: string
  description: string
  longDescription: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  durationHours: number
  price: number
  color: string
  tags: string[]
  certBody: string | null
  thumbnail: string | null
  modules: ModuleCfg[]
}

const COURSE_COLORS = [
  "violet",
  "emerald",
  "cyan",
  "amber",
  "rose",
  "fuchsia",
  "teal",
]

const LESSON_TYPE_META: Record<
  LessonType,
  { label: string; icon: any; color: string }
> = {
  reading: { label: "Reading", icon: FileText, color: "text-violet-400" },
  pdf: { label: "PDF Material", icon: FileText, color: "text-cyan-400" },
  video: { label: "Video", icon: FileVideo, color: "text-amber-400" },
  lab: { label: "Lab", icon: FlaskConical, color: "text-emerald-400" },
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------
export function CourseStudioView() {
  const { user } = useUser()
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null)

  if (!user) {
    return (
      <Card className="p-12 text-center border-dashed">
        <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium mb-1">Sign in to access the Course Studio</p>
        <p className="text-sm text-muted-foreground">
          You need a GuardianX account to author courses.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {selectedCourseId ? (
        <EditorView
          courseId={selectedCourseId}
          onBack={() => setSelectedCourseId(null)}
        />
      ) : (
        <ListView onOpen={setSelectedCourseId} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// List view - show all authored courses
// ---------------------------------------------------------------------------
function ListView({ onOpen }: { onOpen: (id: string) => void }) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<any>({
    queryKey: ["course-studio-list"],
    queryFn: () => api("/api/course-studio"),
  })

  const [createOpen, setCreateOpen] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState("")
  const [newDesc, setNewDesc] = React.useState("")
  const [newCategory, setNewCategory] = React.useState("Certification")
  const [newLevel, setNewLevel] = React.useState<"Beginner" | "Intermediate" | "Advanced">("Beginner")

  const createMutation = useMutation({
    mutationFn: () =>
      api<{ course: any }>("/api/course-studio", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          level: newLevel,
        }),
      }),
    onSuccess: (data) => {
      toast.success("Draft created - start building!")
      qc.invalidateQueries({ queryKey: ["course-studio-list"] })
      setCreateOpen(false)
      setNewTitle("")
      setNewDesc("")
      setNewCategory("Certification")
      setNewLevel("Beginner")
      onOpen(data.course.id)
    },
    onError: (e: any) => toast.error(e.message || "Failed to create course"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/course-studio/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Course draft deleted")
      qc.invalidateQueries({ queryKey: ["course-studio-list"] })
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  })

  const courses = data?.courses ?? []
  const totals = data?.totals

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-card to-card p-6 lg:p-8 scanlines">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="glow-orb h-48 w-48 bg-violet-600/30"
          style={{ top: "-20%", right: "-5%" }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-mono">
              <Sparkles className="h-3 w-3" /> COURSE AUTHORING STUDIO
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Build your <span className="text-gradient-premium">cyber curriculum</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Design modules, craft lessons, and publish production-ready
              courses - visually, with a JSON-configurable backbone.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-violet-600 hover:bg-violet-500 btn-premium"
          >
            <Plus className="h-4 w-4 mr-2" /> New Draft
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Total" value={totals?.total ?? 0} color="text-violet-400" />
        <StatPill label="Drafts" value={totals?.drafts ?? 0} color="text-cyan-400" />
        <StatPill label="In Review" value={totals?.review ?? 0} color="text-amber-400" />
        <StatPill label="Published" value={totals?.published ?? 0} color="text-emerald-400" />
      </div>

      {/* AI Course Generator */}
      <AICourseGenerator />

      {/* Course grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="bg-card shadow-lg p-12 text-center border-dashed">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No course drafts yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first draft to start building.
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Draft
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c: any) => (
            <CourseCard
              key={c.id}
              course={c}
              onOpen={() => onOpen(c.id)}
              onDelete={() => deleteMutation.mutate(c.id)}
              deleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New course draft</DialogTitle>
            <DialogDescription>
              Pick a title and basic metadata. You can refine everything
              inside the studio editor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input
                placeholder="e.g. Certified Ethical Hacker - CEH v13"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Short description</Label>
              <Textarea
                rows={3}
                placeholder="A one-line description of what students will learn"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="Certification"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={newLevel}
                  onValueChange={(v: any) => setNewLevel(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || newTitle.trim().length < 3}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {createMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> Create Draft
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="bg-card shadow-lg p-4 flex items-center justify-between">
      <div>
        <div className={cn("text-2xl font-bold tabular-nums", color)}>{value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      </div>
      <Layers className={cn("h-5 w-5", color)} />
    </Card>
  )
}

function CourseCard({
  course,
  onOpen,
  onDelete,
  deleting,
}: {
  course: any
  onOpen: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const statusMeta: Record<string, { color: string; label: string }> = {
    draft: { color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", label: "Draft" },
    review: { color: "text-amber-400 border-amber-500/30 bg-amber-500/10", label: "In Review" },
    published: { color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", label: "Published" },
  }
  const s = statusMeta[course.status] || statusMeta.draft
  return (
    <Card className="bg-card shadow-lg overflow-hidden group card-hover">
      <div
        className={cn(
          "h-24 bg-gradient-to-br relative",
          "from-violet-500/20 to-fuchsia-500/10"
        )}
      >
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px]", s.color)}>
            {s.label}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-3">
          <span className="text-xs font-mono text-violet-300/80 uppercase">
            {course.shortName || "CRS"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate mb-1">{course.title}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {course.category} · {course.level}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" /> {course.moduleCount} modules
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> {course.lessonCount} lessons
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            onClick={onOpen}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Open
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Updated {new Date(course.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Editor view - three-pane visual builder
// ---------------------------------------------------------------------------
function EditorView({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const qc = useQueryClient()
  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["course-studio", courseId],
    queryFn: () => api(`/api/course-studio/${courseId}`),
    enabled: !!courseId,
  })

  // Local working copy of the config (so the editor feels instant)
  const [config, setConfig] = React.useState<CourseConfig | null>(null)
  const [title, setTitle] = React.useState("")
  const [status, setStatus] = React.useState<string>("draft")
  const [version, setVersion] = React.useState(1)

  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = React.useState<string | null>(null)
  const [rightTab, setRightTab] = React.useState<"preview" | "json" | "settings">("preview")
  const [dirty, setDirty] = React.useState(false)
  const [publishOpen, setPublishOpen] = React.useState(false)

  // Sync server data → local state once
  React.useEffect(() => {
    if (data?.course) {
      const cfg = (data.course.config || {}) as CourseConfig
      setConfig(cfg)
      setTitle(data.course.title)
      setStatus(data.course.status)
      setVersion(data.course.version)
      setDirty(false)
      // Auto-select first module/lesson
      if (cfg.modules?.length && !selectedModuleId) {
        setSelectedModuleId(cfg.modules[0].id)
        if (cfg.modules[0].lessons?.length && !selectedLessonId) {
          setSelectedLessonId(cfg.modules[0].lessons[0].id)
        }
      }
    }
  }, [data])

  const patchMutation = useMutation({
    mutationFn: (patch: any) =>
      api(`/api/course-studio/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: (res) => {
      setDirty(false)
      setStatus(res.course.status)
      setVersion(res.course.version)
      qc.invalidateQueries({ queryKey: ["course-studio-list"] })
      toast.success("Saved")
    },
    onError: (e: any) => toast.error(e.message || "Save failed"),
  })

  const publishMutation = useMutation({
    mutationFn: () =>
      api(`/api/course-studio/${courseId}`, {
        method: "POST",
        body: JSON.stringify({ force: true }),
      }),
    onSuccess: (res: any) => {
      toast.success(
        `Published! ${res.moduleCount} modules · ${res.lessonCount} lessons · v${res.version}`
      )
      setPublishOpen(false)
      setStatus("published")
      setVersion(res.version)
      qc.invalidateQueries({ queryKey: ["course-studio", courseId] })
      qc.invalidateQueries({ queryKey: ["course-studio-list"] })
    },
    onError: (e: any) => {
      toast.error(e.message || "Publish failed")
      setPublishOpen(false)
    },
  })

  // ----- Mutators on the local config -----
  const updateConfig = React.useCallback(
    (updater: (prev: CourseConfig) => CourseConfig) => {
      setConfig((prev) => (prev ? updater(prev) : prev))
      setDirty(true)
    },
    []
  )

  const handleSave = () => {
    if (!config) return
    patchMutation.mutate({ config, title })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid lg:grid-cols-[280px_1fr_320px] gap-4">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (isError || !config) {
    return (
      <Card className="p-8 text-center border-rose-500/30">
        <p className="font-medium text-rose-400 mb-2">Failed to load course</p>
        <p className="text-sm text-muted-foreground mb-4">
          {(error as Error)?.message}
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to list
        </Button>
      </Card>
    )
  }

  const selectedModule = config.modules.find((m) => m.id === selectedModuleId) || null
  const selectedLesson =
    selectedModule?.lessons.find((l) => l.id === selectedLessonId) || null

  const totalLessons = config.modules.reduce(
    (a, m) => a + m.lessons.length,
    0
  )

  // ----- Module / lesson operations -----
  const addModule = () => {
    const m: ModuleCfg = {
      id: uid("m"),
      title: `Module ${config.modules.length + 1}`,
      description: "",
      lessons: [],
    }
    updateConfig((prev) => ({ ...prev, modules: [...prev.modules, m] }))
    setSelectedModuleId(m.id)
    setSelectedLessonId(null)
  }

  const deleteModule = (id: string) => {
    updateConfig((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== id),
    }))
    if (selectedModuleId === id) {
      setSelectedModuleId(null)
      setSelectedLessonId(null)
    }
  }

  const moveModule = (id: string, dir: -1 | 1) => {
    updateConfig((prev) => {
      const idx = prev.modules.findIndex((m) => m.id === id)
      if (idx < 0) return prev
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= prev.modules.length) return prev
      const arr = [...prev.modules]
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      return { ...prev, modules: arr }
    })
  }

  const addLesson = (moduleId: string) => {
    const l: LessonCfg = {
      id: uid("l"),
      title: "New Lesson",
      type: "reading",
      content: "",
      durationMin: 15,
      preview: false,
    }
    updateConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, l] } : m
      ),
    }))
    setSelectedModuleId(moduleId)
    setSelectedLessonId(l.id)
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    updateConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      ),
    }))
    if (selectedLessonId === lessonId) setSelectedLessonId(null)
  }

  const moveLesson = (moduleId: string, lessonId: string, dir: -1 | 1) => {
    updateConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.id !== moduleId) return m
        const idx = m.lessons.findIndex((l) => l.id === lessonId)
        if (idx < 0) return m
        const newIdx = idx + dir
        if (newIdx < 0 || newIdx >= m.lessons.length) return m
        const arr = [...m.lessons]
        ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
        return { ...m, lessons: arr }
      }),
    }))
  }

  const updateModule = (moduleId: string, patch: Partial<ModuleCfg>) => {
    updateConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, ...patch } : m
      ),
    }))
  }

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    patch: Partial<LessonCfg>
  ) => {
    updateConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...patch } : l
              ),
            }
          : m
      ),
    }))
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setDirty(true)
                }}
                className="h-8 w-full sm:w-72 font-semibold text-base px-2"
              />
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  status === "published"
                    ? "text-emerald-400 border-emerald-500/30"
                    : status === "review"
                    ? "text-amber-400 border-amber-500/30"
                    : "text-cyan-400 border-cyan-500/30"
                )}
              >
                {status} · v{version}
              </Badge>
              {dirty && (
                <Badge variant="outline" className="text-[10px] text-amber-300">
                  <CircleDot className="h-2.5 w-2.5 mr-1 animate-pulse" /> unsaved
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {config.modules.length} modules · {totalLessons} lessons ·{" "}
              {config.durationHours}h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={patchMutation.isPending || !dirty}
            className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save
          </Button>
          <Button
            size="sm"
            onClick={() => setPublishOpen(true)}
            disabled={publishMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500 btn-premium"
          >
            <Rocket className="h-3.5 w-3.5 mr-1.5" />
            {publishMutation.isPending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Three-pane editor */}
      <div className="grid lg:grid-cols-[300px_1fr_340px] gap-4">
        {/* LEFT - outline */}
        <Card className="bg-card shadow-lg p-3 flex flex-col max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between px-2 py-2 mb-1">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" /> Outline
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-violet-300 hover:bg-violet-500/10"
              onClick={addModule}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Module
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {config.modules.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No modules yet.
                <br />
                Click <b>+ Module</b> to start.
              </div>
            )}
            {config.modules.map((m, mIdx) => {
              const expanded = selectedModuleId === m.id
              return (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-lg border transition-colors",
                    expanded
                      ? "border-violet-500/40 bg-violet-500/5"
                      : "border-border hover:border-violet-500/20"
                  )}
                >
                  <div className="flex items-center gap-1 px-2 py-2">
                    <button
                      onClick={() =>
                        setSelectedModuleId(expanded ? null : m.id)
                      }
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-muted-foreground">
                          M{mIdx + 1}
                        </div>
                        <div className="text-sm font-medium truncate">
                          {m.title || "Untitled"}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => moveModule(m.id, -1)}
                        disabled={mIdx === 0}
                        className="p-1 rounded hover:bg-accent disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveModule(m.id, 1)}
                        disabled={mIdx === config.modules.length - 1}
                        className="p-1 rounded hover:bg-accent disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteModule(m.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-400"
                        title="Delete module"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div className="px-2 pb-2 space-y-1 border-t border-border/60 mt-1 pt-2">
                      {m.lessons.length === 0 && (
                        <div className="text-[10px] text-muted-foreground text-center py-2">
                          No lessons yet
                        </div>
                      )}
                      {m.lessons.map((l, lIdx) => {
                        const meta = LESSON_TYPE_META[l.type]
                        const Icon = meta.icon
                        const active = selectedLessonId === l.id
                        return (
                          <div
                            key={l.id}
                            className={cn(
                              "group flex items-center gap-1 px-1.5 py-1 rounded text-xs",
                              active
                                ? "bg-violet-500/15 text-violet-200"
                                : "hover:bg-accent/40"
                            )}
                          >
                            <button
                              onClick={() => {
                                setSelectedModuleId(m.id)
                                setSelectedLessonId(l.id)
                              }}
                              className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                            >
                              <Icon className={cn("h-3 w-3 shrink-0", meta.color)} />
                              <span className="truncate">
                                <span className="text-muted-foreground mr-1">
                                  {lIdx + 1}.
                                </span>
                                {l.title || "Untitled"}
                              </span>
                              {l.preview && (
                                <Badge
                                  variant="outline"
                                  className="text-[8px] py-0 px-1 ml-1 text-amber-300"
                                >
                                  FREE
                                </Badge>
                              )}
                            </button>
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                              <button
                                onClick={() => moveLesson(m.id, l.id, -1)}
                                disabled={lIdx === 0}
                                className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                              >
                                <ChevronUp className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => moveLesson(m.id, l.id, 1)}
                                disabled={lIdx === m.lessons.length - 1}
                                className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                              >
                                <ChevronDown className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => deleteLesson(m.id, l.id)}
                                className="p-0.5 rounded hover:bg-rose-500/10 text-rose-400"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full h-7 text-[11px] text-violet-300 hover:bg-violet-500/10"
                        onClick={() => addLesson(m.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Lesson
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* CENTER - editor */}
        <Card className="bg-card shadow-lg p-5 max-h-[80vh] overflow-y-auto">
          {!selectedModule ? (
            <EmptyEditor
              icon={Layers}
              title="Select a module"
              sub="Pick a module from the outline to edit its title, description, and lessons."
            />
          ) : !selectedLesson ? (
            <ModuleEditor
              module={selectedModule}
              onUpdate={(patch) => updateModule(selectedModule.id, patch)}
              onAddLesson={() => addLesson(selectedModule.id)}
            />
          ) : (
            <LessonEditor
              module={selectedModule}
              lesson={selectedLesson}
              onUpdateLesson={(patch) =>
                updateLesson(selectedModule.id, selectedLesson.id, patch)
              }
              onBackToModule={() => setSelectedLessonId(null)}
            />
          )}
        </Card>

        {/* RIGHT - preview / json / settings */}
        <Card className="bg-card shadow-lg p-0 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex border-b border-border">
            <TabBtn
              active={rightTab === "preview"}
              onClick={() => setRightTab("preview")}
              icon={Eye}
              label="Preview"
            />
            <TabBtn
              active={rightTab === "json"}
              onClick={() => setRightTab("json")}
              icon={Code2}
              label="JSON"
            />
            <TabBtn
              active={rightTab === "settings"}
              onClick={() => setRightTab("settings")}
              icon={Settings2}
              label="Settings"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {rightTab === "preview" && (
              <PreviewPane
                config={config}
                selectedModuleId={selectedModuleId}
                selectedLessonId={selectedLessonId}
              />
            )}
            {rightTab === "json" && (
              <JsonPane
                config={config}
                onImport={(cfg) => {
                  setConfig(cfg)
                  setDirty(true)
                  toast.success("Config imported from JSON")
                }}
              />
            )}
            {rightTab === "settings" && (
              <SettingsPane
                config={config}
                onUpdate={(patch) => {
                  updateConfig((prev) => ({ ...prev, ...patch }))
                }}
              />
            )}
          </div>
          {/* Publish footer */}
          <div className="border-t border-border p-3 bg-card/50">
            <Button
              onClick={() => setPublishOpen(true)}
              disabled={publishMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 btn-premium"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {publishMutation.isPending ? "Publishing…" : "Publish Course"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              {status === "published"
                ? "Re-publishing updates the live course."
                : "Publishing creates a live Course + modules + lessons."}
            </p>
          </div>
        </Card>
      </div>

      {/* Publish confirm */}
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish &quot;{title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {status === "published" ? "update the existing" : "create a new"}{" "}
              live Course with{" "}
              <b className="text-foreground">
                {config.modules.length} modules
              </b>{" "}
              and{" "}
              <b className="text-foreground">{totalLessons} lessons</b>.
              Students will be able to enroll immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => publishMutation.mutate()}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Rocket className="h-4 w-4 mr-2" /> Confirm Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Module editor (when a module is selected but no lesson)
// ---------------------------------------------------------------------------
function ModuleEditor({
  module: m,
  onUpdate,
  onAddLesson,
}: {
  module: ModuleCfg
  onUpdate: (patch: Partial<ModuleCfg>) => void
  onAddLesson: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-violet-400" />
        <h3 className="font-semibold text-lg">Module Editor</h3>
      </div>
      <div className="space-y-2">
        <Label>Module title</Label>
        <Input
          value={m.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="e.g. Network Reconnaissance"
        />
      </div>
      <div className="space-y-2">
        <Label>Module description</Label>
        <Textarea
          rows={3}
          value={m.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="What this module covers..."
        />
      </div>
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">
            Lessons ({m.lessons.length})
          </h4>
          <Button
            size="sm"
            variant="outline"
            className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            onClick={onAddLesson}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
          </Button>
        </div>
        {m.lessons.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
            No lessons yet. Add one to start teaching.
          </div>
        ) : (
          <div className="space-y-2">
            {m.lessons.map((l, i) => (
              <div
                key={l.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
              >
                <span className="text-xs font-mono text-muted-foreground">
                  {i + 1}.
                </span>
                <FileText className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-sm flex-1 truncate">{l.title}</span>
                <Badge variant="outline" className="text-[9px]">
                  {LESSON_TYPE_META[l.type].label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lesson editor (when a lesson is selected)
// ---------------------------------------------------------------------------
function LessonEditor({
  module: m,
  lesson,
  onUpdateLesson,
  onBackToModule,
}: {
  module: ModuleCfg
  lesson: LessonCfg
  onUpdateLesson: (patch: Partial<LessonCfg>) => void
  onBackToModule: () => void
}) {
  const meta = LESSON_TYPE_META[lesson.type]
  const Icon = meta.icon
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={onBackToModule}
          className="p-1 rounded hover:bg-accent text-muted-foreground"
          title="Back to module"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Icon className={cn("h-5 w-5", meta.color)} />
        <h3 className="font-semibold text-lg">Lesson Editor</h3>
        <Badge variant="outline" className="text-[10px] ml-auto">
          {m.title}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label>Lesson title</Label>
        <Input
          value={lesson.title}
          onChange={(e) => onUpdateLesson({ title: e.target.value })}
          placeholder="e.g. TCP Handshake & Port Scanning"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Content type</Label>
          <Select
            value={lesson.type}
            onValueChange={(v: LessonType) => onUpdateLesson({ type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LESSON_TYPE_META) as LessonType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {LESSON_TYPE_META[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration (min)</Label>
          <Input
            type="number"
            min={1}
            value={lesson.durationMin}
            onChange={(e) =>
              onUpdateLesson({ durationMin: Number(e.target.value) || 15 })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content (markdown / text)</Label>
        <Textarea
          rows={10}
          value={lesson.content}
          onChange={(e) => onUpdateLesson({ content: e.target.value })}
          placeholder="# Lesson heading

Write your lesson content here. Markdown is supported."
          className="font-mono text-sm"
        />
      </div>

      {lesson.type === "pdf" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 col-span-2">
            <Label>PDF URL</Label>
            <Input
              value={lesson.pdfUrl || ""}
              onChange={(e) =>
                onUpdateLesson({ pdfUrl: e.target.value })
              }
              placeholder="/pdfs/lesson.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label>Pages</Label>
            <Input
              type="number"
              min={0}
              value={lesson.pdfPages || 0}
              onChange={(e) =>
                onUpdateLesson({
                  pdfPages: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60">
        <div>
          <div className="text-sm font-medium">Free preview</div>
          <div className="text-xs text-muted-foreground">
            Allow non-enrolled students to view this lesson
          </div>
        </div>
        <Switch
          checked={lesson.preview}
          onCheckedChange={(v) => onUpdateLesson({ preview: v })}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Right pane - preview / json / settings
// ---------------------------------------------------------------------------
function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: any
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-2 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
        active
          ? "text-violet-400 bg-violet-500/5 border-b-2 border-violet-500"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  )
}

function PreviewPane({
  config,
  selectedModuleId,
  selectedLessonId,
}: {
  config: CourseConfig
  selectedModuleId: string | null
  selectedLessonId: string | null
}) {
  const mod = config.modules.find((m) => m.id === selectedModuleId)
  const lesson = mod?.lessons.find((l) => l.id === selectedLessonId)

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Course preview
        </div>
        <h3 className="font-bold text-lg leading-tight">
          {config.title || "Untitled course"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {config.category} · {config.level} · {config.durationHours}h
        </p>
        {config.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
            {config.description}
          </p>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          {mod ? `Module · ${mod.title}` : "Pick a module"}
        </div>
        {lesson ? (
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              {(() => {
                const Icon = LESSON_TYPE_META[lesson.type].icon
                return (
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      LESSON_TYPE_META[lesson.type].color
                    )}
                  />
                )
              })()}
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {LESSON_TYPE_META[lesson.type].label}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                <Clock className="h-3 w-3" /> {lesson.durationMin}m
              </span>
            </div>
            <h4 className="font-semibold text-sm">{lesson.title}</h4>
            {lesson.content ? (
              <div className="mt-2 text-xs text-muted-foreground line-clamp-6 whitespace-pre-wrap">
                {lesson.content}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground italic">
                No content yet.
              </p>
            )}
            {lesson.preview && (
              <Badge
                variant="outline"
                className="text-[9px] mt-2 text-amber-300"
              >
                Free preview
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a lesson from the outline to preview it here.
          </p>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Curriculum
        </div>
        <div className="space-y-1.5">
          {config.modules.map((m, i) => (
            <div key={m.id} className="text-xs">
              <div className="font-medium">
                <span className="text-muted-foreground font-mono">
                  {i + 1}.
                </span>{" "}
                {m.title}
              </div>
              <div className="pl-4 text-muted-foreground text-[11px]">
                {m.lessons.length} lesson{m.lessons.length !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function JsonPane({
  config,
  onImport,
}: {
  config: CourseConfig
  onImport: (cfg: CourseConfig) => void
}) {
  const [text, setText] = React.useState("")
  const [editing, setEditing] = React.useState(false)

  React.useEffect(() => {
    if (!editing) setText(JSON.stringify(config, null, 2))
  }, [config, editing])

  const copy = () => {
    navigator.clipboard.writeText(text)
    toast.success("JSON copied to clipboard")
  }

  const download = () => {
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${config.title || "course"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = () => {
    try {
      const parsed = JSON.parse(text)
      onImport(parsed)
      setEditing(false)
    } catch (e) {
      toast.error("Invalid JSON: " + (e as Error).message)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[11px]"
          onClick={copy}
        >
          <Copy className="h-3 w-3 mr-1" /> Copy
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[11px]"
          onClick={download}
        >
          <Download className="h-3 w-3 mr-1" /> Download
        </Button>
        <div className="flex-1" />
        {editing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px]"
              onClick={() => {
                setEditing(false)
                setText(JSON.stringify(config, null, 2))
              }}
            >
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-[11px] bg-violet-600 hover:bg-violet-500"
              onClick={importJson}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" /> Apply
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[11px] text-violet-300"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setEditing(true)
        }}
        readOnly={!editing}
        className={cn(
          "flex-1 p-3 bg-transparent font-mono text-[11px] leading-relaxed resize-none outline-none",
          editing ? "bg-muted/30" : ""
        )}
        style={{ minHeight: 300 }}
      />
      <p className="text-[10px] text-muted-foreground p-2 border-t border-border">
        {editing
          ? "Edit JSON and click Apply to import changes into the editor."
          : "Read-only. Click Edit to modify the config directly."}
      </p>
    </div>
  )
}

function SettingsPane({
  config,
  onUpdate,
}: {
  config: CourseConfig
  onUpdate: (patch: Partial<CourseConfig>) => void
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Course settings
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Short name</Label>
        <Input
          value={config.shortName}
          onChange={(e) => onUpdate({ shortName: e.target.value })}
          maxLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Category</Label>
        <Input
          value={config.category}
          onChange={(e) => onUpdate({ category: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Level</Label>
          <Select
            value={config.level}
            onValueChange={(v: any) => onUpdate({ level: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Duration (h)</Label>
          <Input
            type="number"
            min={1}
            value={config.durationHours}
            onChange={(e) =>
              onUpdate({ durationHours: Number(e.target.value) || 40 })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Price</Label>
          <Input
            type="number"
            min={0}
            value={config.price}
            onChange={(e) =>
              onUpdate({ price: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Cert body</Label>
          <Input
            value={config.certBody || ""}
            onChange={(e) => onUpdate({ certBody: e.target.value || null })}
            placeholder="EC-Council"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Accent color</Label>
        <div className="flex flex-wrap gap-2">
          {COURSE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdate({ color: c })}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform",
                `bg-${c}-500`,
                config.color === c
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-105"
              )}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Tags (comma separated)</Label>
        <Input
          value={config.tags.join(", ")}
          onChange={(e) =>
            onUpdate({
              tags: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          placeholder="networking, security, offensive"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Long description</Label>
        <Textarea
          rows={5}
          value={config.longDescription || ""}
          onChange={(e) => onUpdate({ longDescription: e.target.value })}
          placeholder="Full course description shown on the course detail page..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Thumbnail URL (optional)</Label>
        <Input
          value={config.thumbnail || ""}
          onChange={(e) => onUpdate({ thumbnail: e.target.value || null })}
          placeholder="/thumbnails/ceh.png"
        />
      </div>
    </div>
  )
}

function EmptyEditor({
  icon: Icon,
  title,
  sub,
}: {
  icon: any
  title: string
  sub: string
}) {
  return (
    <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="inline-flex p-4 rounded-2xl bg-violet-500/10 mb-4">
        <Icon className="h-8 w-8 text-violet-400" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{sub}</p>
    </div>
  )
}

/* ============================================================
   AI Course Generator — multi-agent LLM-powered course creation
   ============================================================ */
function AICourseGenerator() {
  const qc = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [certSlug, setCertSlug] = React.useState("ceh")
  const [audience, setAudience] = React.useState("Beginner")
  const [level, setLevel] = React.useState<"Beginner" | "Intermediate" | "Advanced">("Beginner")
  const [duration, setDuration] = React.useState(40)
  const [instructorId, setInstructorId] = React.useState("")
  const [result, setResult] = React.useState<any>(null)

  // Fetch instructors for the dropdown
  const { data: instrData } = useQuery<any>({
    queryKey: ["ai-gen-instructors"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/instructors")
        if (!res.ok) return { instructors: [] }
        return res.json()
      } catch { return { instructors: [] } }
    },
  })

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai-course-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificationSlug: certSlug, audience, level, durationHours: duration, instructorId }),
        credentials: "include",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }))
        throw new Error(err.error || "Failed to generate course")
      }
      return res.json()
    },
    onSuccess: (data) => {
      setResult(data)
      toast.success("Course generated successfully!")
      qc.invalidateQueries({ queryKey: ["course-studio-list"] })
    },
    onError: (e: any) => toast.error(e.message || "Failed to generate course"),
  })

  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/30 via-card to-card overflow-hidden">
      <div className="p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-violet-500/10 text-violet-300 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">AI Course Generator</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Generate a complete course from a certification using multi-agent LLM orchestration — curriculum, lessons, quizzes, and assessments.
            </p>
            <Button onClick={() => setOpen(o => !o)} variant="outline" size="sm" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {open ? "Hide" : "Generate with AI"}
            </Button>
          </div>
        </div>

        {open && (
          <div className="mt-4 pt-4 border-t border-violet-500/20 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Certification Slug</label>
                <Input value={certSlug} onChange={(e) => setCertSlug(e.target.value)} placeholder="ceh, security-plus, ccna..." className="font-mono text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Assign Instructor</label>
                <Select value={instructorId} onValueChange={setInstructorId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select instructor" /></SelectTrigger>
                  <SelectContent>
                    {(instrData?.instructors ?? []).map((i: any) => (
                      <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Audience</label>
                <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Beginner, Working Professional..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Level</label>
                <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Duration (hours)</label>
                <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} max={200} />
              </div>
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || !certSlug || !instructorId}
              className="bg-violet-600 hover:bg-violet-500 btn-premium w-full"
            >
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating... (this can take 1-2 minutes)</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate Course</>
              )}
            </Button>

            {result && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="font-semibold text-emerald-300 mb-2">✓ Course Generated</p>
                <pre className="text-xs text-muted-foreground overflow-auto max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
