"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Users,
  Award,
  Calendar,
  FileText,
  Star,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  Link2,
  Type,
  Save,
  ListChecks,
  ScrollText,
  Eye,
  X,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================
interface InstructorCourse {
  id: string
  title: string
  shortName: string
}

interface RubricCriterion {
  id: string
  label: string
  description: string
  points: number
  order: number
}

interface Rubric {
  id: string
  title: string
  description: string
  courseId: string | null
  course: { id: string; title: string; shortName: string } | null
  criteria: RubricCriterion[]
  _count?: { assignments: number }
  updatedAt: string
}

interface Assignment {
  id: string
  courseId: string
  moduleId: string | null
  title: string
  description: string
  instructions: string
  pointsPossible: number
  dueDate: string
  allowLate: boolean
  latePenalty: number
  submissionType: string
  enablePeerReview: boolean
  peerReviewCount: number
  peerReviewDueDate: string | null
  rubricId: string | null
  rubric: { id: string; title: string } | null
  published: boolean
  createdAt: string
  _count: { submissions: number }
}

interface SubmissionUser {
  id: string
  name: string
  email: string
  avatar: string | null
  title: string | null
}

interface Submission {
  id: string
  userId: string
  assignmentId: string
  content: string
  fileUrl: string | null
  submittedAt: string
  status: string
  grade: number | null
  feedback: string | null
  late: boolean
  gradedAt: string | null
  rubricScores: string | null
  user: SubmissionUser
  _count: { peerReviews: number }
}

interface CourseModule {
  id: string
  title: string
  order: number
}

// ============================================================================
// Helpers
// ============================================================================
const SUBMISSION_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "file", label: "File Upload", icon: FileCheck2 },
  { value: "url", label: "URL", icon: Link2 },
]

function toLocalDateTimeInputValue(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function submissionTypeIcon(type: string) {
  return SUBMISSION_TYPES.find((t) => t.value === type)?.icon ?? Type
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted: { label: "Submitted", cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    resubmitted: { label: "Resubmitted", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    graded: { label: "Graded", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    returned: { label: "Returned", cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  }
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" }
  return <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wide", m.cls)}>{m.label}</Badge>
}

// ============================================================================
// Main Tab
// ============================================================================
export function InstructorAssignmentsTab() {
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [rubricsOpen, setRubricsOpen] = React.useState(false)
  const [detailAssignment, setDetailAssignment] = React.useState<Assignment | null>(null)

  const qc = useQueryClient()
  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ courses: InstructorCourse[] }>({
    queryKey: ["instructor", "courses", "list"],
    queryFn: () => api("/api/instructor/courses"),
  })
  const courses = coursesData?.courses ?? []

  React.useEffect(() => {
    if (!selectedCourseId && courses.length > 0) setSelectedCourseId(courses[0].id)
  }, [courses, selectedCourseId])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-400" />
            Assignments & Rubrics
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, grade, and manage assignments across your courses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRubricsOpen(true)}>
            <ScrollText className="h-4 w-4 mr-1.5" /> Rubrics
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!selectedCourseId}>
            <Plus className="h-4 w-4 mr-1.5" /> Create Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Course picker */}
        <Card className="lg:col-span-1 p-4 holo-border">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Select Course
          </Label>
          {coursesLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.shortName || c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {courses.length === 0 && !coursesLoading && (
            <p className="text-xs text-muted-foreground mt-2">No courses available.</p>
          )}
        </Card>

        {/* Assignments list */}
        <div className="lg:col-span-3">
          {!selectedCourseId ? (
            <EmptyState
              icon={ClipboardList}
              title="No course selected"
              description="Choose a course to view its assignments."
            />
          ) : (
            <AssignmentsList
              courseId={selectedCourseId}
              onOpenDetail={(a) => setDetailAssignment(a)}
            />
          )}
        </div>
      </div>

      {/* Create dialog */}
      {createOpen && (
        <AssignmentFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          courseId={selectedCourseId}
          rubrics={[]}
          onCreated={() => {
            qc.invalidateQueries({ queryKey: ["instructor", "assignments", selectedCourseId] })
            setCreateOpen(false)
            toast.success("Assignment created")
          }}
        />
      )}

      {/* Detail dialog */}
      {detailAssignment && (
        <AssignmentDetailDialog
          assignment={detailAssignment}
          open={!!detailAssignment}
          onOpenChange={(o) => !o && setDetailAssignment(null)}
          courseId={selectedCourseId}
        />
      )}

      {/* Rubrics manager */}
      <RubricsManagerDialog open={rubricsOpen} onOpenChange={setRubricsOpen} />
    </div>
  )
}

// ============================================================================
// Assignments List
// ============================================================================
function AssignmentsList({
  courseId,
  onOpenDetail,
}: {
  courseId: string
  onOpenDetail: (a: Assignment) => void
}) {
  const { data, isLoading } = useQuery<{ assignments: Assignment[] }>({
    queryKey: ["instructor", "assignments", courseId],
    queryFn: () => api(`/api/instructor/courses/${courseId}/assignments`),
    enabled: !!courseId,
  })
  const qc = useQueryClient()
  const assignments = data?.assignments ?? []
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/instructor/assignments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Assignment deleted")
      qc.invalidateQueries({ queryKey: ["instructor", "assignments", courseId] })
      setDeleteId(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No assignments yet"
        description="Create your first assignment to start collecting submissions."
      />
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const SubIcon = submissionTypeIcon(a.submissionType)
        const overdue = new Date(a.dueDate).getTime() < Date.now()
        return (
          <Card key={a.id} className="p-4 card-hover group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{a.title}</h3>
                  {a.enablePeerReview && (
                    <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                      <Star className="h-3 w-3 mr-1" /> Peer Review ×{a.peerReviewCount}
                    </Badge>
                  )}
                  {a.rubric && (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                      <ListChecks className="h-3 w-3 mr-1" /> Rubric
                    </Badge>
                  )}
                </div>
                {a.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <SubIcon className="h-3.5 w-3.5" /> {a.submissionType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" /> {a.pointsPossible} pts
                  </span>
                  <span className={cn("flex items-center gap-1", overdue && "text-rose-400")}>
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(a.dueDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {a._count.submissions} submissions
                    </Badge>
                  </span>
                  {a.allowLate && (
                    <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                      Late OK (−{a.latePenalty}%/hr)
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" variant="default" onClick={() => onOpenDetail(a)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> Open
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-rose-400" />
                </Button>
              </div>
            </div>

            <AlertDialog open={deleteId === a.id} onOpenChange={(o) => !o && setDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{a.title}&rdquo; and all of its submissions. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(a.id)}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        )
      })}
    </div>
  )
}

// ============================================================================
// Assignment Form Dialog (Create / Edit)
// ============================================================================
interface AssignmentFormValues {
  title: string
  description: string
  instructions: string
  pointsPossible: number
  dueDate: string
  submissionType: string
  allowLate: boolean
  latePenalty: number
  enablePeerReview: boolean
  peerReviewCount: number
  peerReviewDueDate: string
  rubricId: string
  moduleId: string
}

const EMPTY_FORM: AssignmentFormValues = {
  title: "",
  description: "",
  instructions: "",
  pointsPossible: 100,
  dueDate: "",
  submissionType: "text",
  allowLate: true,
  latePenalty: 5,
  enablePeerReview: false,
  peerReviewCount: 2,
  peerReviewDueDate: "",
  rubricId: "",
  moduleId: "",
}

function AssignmentFormDialog({
  open,
  onOpenChange,
  courseId,
  assignment,
  rubrics: _rubrics,
  onCreated,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  courseId: string
  assignment?: Assignment | null
  rubrics: Rubric[]
  onCreated?: () => void
  onUpdated?: () => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = React.useState<AssignmentFormValues>(EMPTY_FORM)
  const [rubrics, setRubrics] = React.useState<Rubric[]>([])
  const [modules, setModules] = React.useState<CourseModule[]>([])

  // Load rubrics + modules
  React.useEffect(() => {
    let cancelled = false
    if (open) {
      api("/api/instructor/rubrics").then((r: any) => {
        if (!cancelled) setRubrics(r.rubrics ?? [])
      }).catch(() => {})
      if (courseId) {
        // Public course endpoint includes modules with lessons
        api(`/api/courses/${courseId}`).then((r: any) => {
          if (!cancelled) setModules(r.course?.modules ?? [])
        }).catch(() => setModules([]))
      }
    }
    return () => { cancelled = true }
  }, [open, courseId])

  // Prefill when editing
  React.useEffect(() => {
    if (assignment) {
      setForm({
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        pointsPossible: assignment.pointsPossible,
        dueDate: toLocalDateTimeInputValue(assignment.dueDate),
        submissionType: assignment.submissionType,
        allowLate: assignment.allowLate,
        latePenalty: assignment.latePenalty,
        enablePeerReview: assignment.enablePeerReview,
        peerReviewCount: assignment.peerReviewCount,
        peerReviewDueDate: toLocalDateTimeInputValue(assignment.peerReviewDueDate),
        rubricId: assignment.rubricId ?? "",
        moduleId: assignment.moduleId ?? "",
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [assignment, open])

  const createMutation = useMutation({
    mutationFn: (payload: any) =>
      api(`/api/instructor/courses/${courseId}/assignments`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      onCreated?.()
      qc.invalidateQueries({ queryKey: ["instructor", "rubrics"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      api(`/api/instructor/assignments/${assignment?.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Assignment updated")
      onUpdated?.()
      qc.invalidateQueries({ queryKey: ["instructor", "assignments", courseId] })
      onOpenChange(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.dueDate) {
      toast.error("Title and due date are required")
      return
    }
    const payload = {
      title: form.title.trim(),
      description: form.description,
      instructions: form.instructions,
      pointsPossible: Number(form.pointsPossible),
      dueDate: new Date(form.dueDate).toISOString(),
      submissionType: form.submissionType,
      allowLate: form.allowLate,
      latePenalty: Number(form.latePenalty),
      enablePeerReview: form.enablePeerReview,
      peerReviewCount: Number(form.peerReviewCount),
      peerReviewDueDate: form.peerReviewDueDate
        ? new Date(form.peerReviewDueDate).toISOString()
        : null,
      rubricId: form.rubricId || null,
      moduleId: form.moduleId || null,
    }
    if (assignment) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const isEdit = !!assignment
  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-400" />
            {isEdit ? "Edit Assignment" : "Create Assignment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="a-title">Title *</Label>
            <Input
              id="a-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. CEH Module 3 Lab Report"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="a-desc">Description</Label>
            <Input
              id="a-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short summary shown in lists"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="a-instructions">Instructions</Label>
            <Textarea
              id="a-instructions"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="Detailed instructions for students..."
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-points">Points Possible</Label>
              <Input
                id="a-points"
                type="number"
                min={0}
                value={form.pointsPossible}
                onChange={(e) => setForm({ ...form, pointsPossible: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="a-due">Due Date *</Label>
              <Input
                id="a-due"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-type">Submission Type</Label>
              <Select value={form.submissionType} onValueChange={(v) => setForm({ ...form, submissionType: v })}>
                <SelectTrigger id="a-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBMISSION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-module">Module (optional)</Label>
              <Select value={form.moduleId} onValueChange={(v) => setForm({ ...form, moduleId: v })}>
                <SelectTrigger id="a-module">
                  <SelectValue placeholder="No module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— None —</SelectItem>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="a-rubric">Rubric (optional)</Label>
            <Select value={form.rubricId} onValueChange={(v) => setForm({ ...form, rubricId: v })}>
              <SelectTrigger id="a-rubric">
                <SelectValue placeholder="No rubric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— None —</SelectItem>
                {rubrics.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Late policy */}
          <Card className="p-3 bg-card/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="a-late" className="cursor-pointer">Allow late submissions</Label>
                <p className="text-xs text-muted-foreground">Let students submit after the deadline with a penalty.</p>
              </div>
              <Switch
                id="a-late"
                checked={form.allowLate}
                onCheckedChange={(v) => setForm({ ...form, allowLate: v })}
              />
            </div>
            {form.allowLate && (
              <div className="mt-3">
                <Label htmlFor="a-penalty" className="text-xs">Late penalty (% per hour)</Label>
                <Input
                  id="a-penalty"
                  type="number"
                  min={0}
                  max={100}
                  value={form.latePenalty}
                  onChange={(e) => setForm({ ...form, latePenalty: Number(e.target.value) })}
                  className="mt-1 max-w-[160px]"
                />
              </div>
            )}
          </Card>

          {/* Peer review */}
          <Card className="p-3 bg-card/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="a-peer" className="cursor-pointer flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-violet-400" /> Enable peer review
                </Label>
                <p className="text-xs text-muted-foreground">Students review each other&apos;s submissions.</p>
              </div>
              <Switch
                id="a-peer"
                checked={form.enablePeerReview}
                onCheckedChange={(v) => setForm({ ...form, enablePeerReview: v })}
              />
            </div>
            {form.enablePeerReview && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <Label htmlFor="a-peer-count" className="text-xs">Reviews per student</Label>
                  <Input
                    id="a-peer-count"
                    type="number"
                    min={1}
                    max={10}
                    value={form.peerReviewCount}
                    onChange={(e) => setForm({ ...form, peerReviewCount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="a-peer-due" className="text-xs">Peer review due</Label>
                  <Input
                    id="a-peer-due"
                    type="datetime-local"
                    value={form.peerReviewDueDate}
                    onChange={(e) => setForm({ ...form, peerReviewDueDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </Card>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              <Save className="h-4 w-4 mr-1.5" />
              {isEdit ? "Save Changes" : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Assignment Detail Dialog (with Submissions + Edit sub-tabs)
// ============================================================================
function AssignmentDetailDialog({
  assignment,
  open,
  onOpenChange,
  courseId,
}: {
  assignment: Assignment
  open: boolean
  onOpenChange: (o: boolean) => void
  courseId: string
}) {
  const [tab, setTab] = React.useState<"submissions" | "edit">("submissions")
  React.useEffect(() => { setTab("submissions") }, [assignment.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <ClipboardList className="h-5 w-5 text-emerald-400" />
            <span className="truncate">{assignment.title}</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "submissions" | "edit")} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          <TabsContent value="submissions" className="flex-1 overflow-hidden mt-3">
            <SubmissionsTab assignment={assignment} />
          </TabsContent>
          <TabsContent value="edit" className="flex-1 overflow-y-auto mt-3">
            <AssignmentFormDialog
              open={true}
              onOpenChange={(o) => !o && onOpenChange(false)}
              courseId={courseId}
              assignment={assignment}
              rubrics={[]}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Submissions tab (inside detail)
// ============================================================================
function SubmissionsTab({ assignment }: { assignment: Assignment }) {
  const [filter, setFilter] = React.useState<string>("all")
  const { data, isLoading } = useQuery<{ submissions: Submission[]; stats: any; assignment: any }>({
    queryKey: ["instructor", "submissions", assignment.id],
    queryFn: () => api(`/api/instructor/assignments/${assignment.id}/submissions`),
  })
  const submissions = data?.submissions ?? []
  const stats = data?.stats
  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Pending", value: stats.pending, color: "text-amber-400" },
            { label: "Graded", value: stats.graded, color: "text-emerald-400" },
            { label: "Avg Grade", value: `${stats.avgGrade}%`, color: "text-cyan-400" },
          ].map((s) => (
            <Card key={s.label} className="p-2.5 text-center">
              <div className={cn("text-xl font-bold tabular-nums font-mono", s.color)}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", "submitted", "resubmitted", "graded", "returned"].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="h-7 text-xs capitalize"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Submissions */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No submissions" description="No submissions match this filter yet." />
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <SubmissionRow key={s.id} submission={s} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubmissionRow({ submission, assignment }: { submission: Submission; assignment: Assignment }) {
  const [expanded, setExpanded] = React.useState(false)
  const [grading, setGrading] = React.useState(false)
  const initials = submission.user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="p-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate flex items-center gap-2">
              {submission.user.name}
              {submission.late && (
                <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                  LATE
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(submission.submittedAt)} · {submission.user.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusBadge(submission.status)}
          {submission.grade !== null && (
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              {submission.grade}/{assignment.pointsPossible}
            </Badge>
          )}
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {submission.content && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Content</div>
                <div className="text-sm bg-muted/30 rounded p-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {submission.content}
                </div>
              </div>
            )}
            {submission.fileUrl && (
              <div className="flex items-center gap-2 text-sm">
                <FileCheck2 className="h-4 w-4 text-cyan-400" />
                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate">
                  {submission.fileUrl}
                </a>
              </div>
            )}
          </div>

          {submission.feedback && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Feedback</div>
              <div className="text-sm bg-muted/30 rounded p-2 whitespace-pre-wrap">{submission.feedback}</div>
            </div>
          )}

          <Button size="sm" variant="default" onClick={() => setGrading(true)}>
            <Award className="h-3.5 w-3.5 mr-1.5" />
            {submission.status === "graded" ? "Update Grade" : "Grade Submission"}
          </Button>
        </div>
      )}

      {grading && (
        <GradingDialog
          submission={submission}
          assignment={assignment}
          open={grading}
          onOpenChange={setGrading}
        />
      )}
    </Card>
  )
}

// ============================================================================
// Grading Dialog
// ============================================================================
function GradingDialog({
  submission,
  assignment,
  open,
  onOpenChange,
}: {
  submission: Submission
  assignment: Assignment
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const qc = useQueryClient()
  const [grade, setGrade] = React.useState<number>(submission.grade ?? 0)
  const [feedback, setFeedback] = React.useState<string>(submission.feedback ?? "")
  const [rubricScores, setRubricScores] = React.useState<Record<string, number>>({})

  // Load rubric if assignment has one
  const { data: rubricData } = useQuery<{ rubric: Rubric }>({
    queryKey: ["instructor", "rubric", assignment.rubricId],
    queryFn: () => api(`/api/instructor/rubrics/${assignment.rubricId}`),
    enabled: !!assignment.rubricId,
  })

  React.useEffect(() => {
    if (rubricData?.rubric) {
      const init: Record<string, number> = {}
      rubricData.rubric.criteria.forEach((c) => { init[c.id] = 0 })
      // Parse existing scores
      if (submission.rubricScores) {
        try {
          const parsed = JSON.parse(submission.rubricScores)
          if (Array.isArray(parsed)) {
            parsed.forEach((row: any) => {
              if (row?.criterionId) init[row.criterionId] = Number(row.score) || 0
            })
          }
        } catch {}
      }
      setRubricScores(init)
    }
  }, [rubricData, submission.rubricScores])

  const gradeMutation = useMutation({
    mutationFn: () => {
      const scoresArr = rubricData?.rubric
        ? rubricData.rubric.criteria.map((c) => ({ criterionId: c.id, label: c.label, score: rubricScores[c.id] ?? 0, points: c.points }))
        : []
      const computedGrade = rubricData?.rubric
        ? Math.round(
            (Object.values(rubricScores).reduce((a, b) => a + b, 0) /
              Math.max(1, rubricData.rubric.criteria.reduce((a, c) => a + c.points, 0))) *
              100
          )
        : grade
      return api(`/api/instructor/submissions/${submission.id}/grade`, {
        method: "POST",
        body: JSON.stringify({ grade: computedGrade, feedback, rubricScores: scoresArr }),
      })
    },
    onSuccess: () => {
      toast.success("Submission graded")
      qc.invalidateQueries({ queryKey: ["instructor", "submissions", assignment.id] })
      onOpenChange(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const totalPossible = rubricData?.rubric?.criteria.reduce((a, c) => a + c.points, 0) ?? 0
  const totalAwarded = rubricData?.rubric?.criteria.reduce((a, c) => a + (rubricScores[c.id] ?? 0), 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-400" /> Grade Submission
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Student: </span>
            <span className="font-medium">{submission.user.name}</span>
          </div>

          {/* Rubric scores */}
          {rubricData?.rubric && (
            <Card className="p-3 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider">Rubric: {rubricData.rubric.title}</Label>
                <Badge variant="outline" className="text-[10px]">
                  {totalAwarded} / {totalPossible} pts
                </Badge>
              </div>
              <div className="space-y-2">
                {rubricData.rubric.criteria.map((c) => (
                  <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="range"
                        min={0}
                        max={c.points}
                        value={rubricScores[c.id] ?? 0}
                        onChange={(e) => setRubricScores({ ...rubricScores, [c.id]: Number(e.target.value) })}
                        className="w-full cursor-pointer accent-emerald-500"
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-mono">
                      {rubricScores[c.id] ?? 0} / {c.points}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Manual grade override (only when no rubric) */}
          {!rubricData?.rubric && (
            <div className="space-y-1.5">
              <Label htmlFor="g-grade">Grade (0-100)</Label>
              <Input
                id="g-grade"
                type="number"
                min={0}
                max={100}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Out of {assignment.pointsPossible} points possible.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="g-feedback">Feedback</Label>
            <Textarea
              id="g-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the student..."
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={() => gradeMutation.mutate()} disabled={gradeMutation.isPending}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Save Grade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Rubrics Manager Dialog
// ============================================================================
function RubricsManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<{ rubrics: Rubric[] }>({
    queryKey: ["instructor", "rubrics"],
    queryFn: () => api("/api/instructor/rubrics"),
    enabled: open,
  })
  const rubrics = data?.rubrics ?? []
  const [editing, setEditing] = React.useState<Rubric | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/instructor/rubrics/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Rubric deleted")
      qc.invalidateQueries({ queryKey: ["instructor", "rubrics"] })
      setDeleteId(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-emerald-400" /> Grading Rubrics
            </span>
            <Button size="sm" onClick={() => { setEditing(null); setCreating(true) }}>
              <Plus className="h-4 w-4 mr-1" /> New Rubric
            </Button>
          </DialogTitle>
        </DialogHeader>

        {(creating || editing) ? (
          <RubricForm
            rubric={editing}
            onCancel={() => { setCreating(false); setEditing(null) }}
            onSaved={() => {
              setCreating(false)
              setEditing(null)
              qc.invalidateQueries({ queryKey: ["instructor", "rubrics"] })
            }}
          />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : rubrics.length === 0 ? (
          <EmptyState icon={ScrollText} title="No rubrics yet" description="Create a rubric to standardize grading across assignments." />
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 pr-2">
              {rubrics.map((r) => (
                <Card key={r.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate flex items-center gap-2">
                        {r.title}
                        {r._count && r._count.assignments > 0 && (
                          <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                            {r._count.assignments} assignment{r._count.assignments !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.criteria.slice(0, 4).map((c) => (
                          <Badge key={c.id} variant="secondary" className="text-[10px]">
                            {c.label} · {c.points}pt
                          </Badge>
                        ))}
                        {r.criteria.length > 4 && (
                          <Badge variant="secondary" className="text-[10px]">+{r.criteria.length - 4} more</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(r)} aria-label="Edit rubric">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)} aria-label="Delete rubric">
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  <AlertDialog open={deleteId === r.id} onOpenChange={(o) => !o && setDeleteId(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete rubric?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Deleting &ldquo;{r.title}&rdquo; will detach it from any assignments using it (they will have no rubric).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(r.id)}
                          className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

function RubricForm({
  rubric,
  onCancel,
  onSaved,
}: {
  rubric: Rubric | null
  onCancel: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [criteria, setCriteria] = React.useState<Array<{ id?: string; label: string; description: string; points: number; order: number }>>([])

  React.useEffect(() => {
    if (rubric) {
      setTitle(rubric.title)
      setDescription(rubric.description)
      setCriteria(rubric.criteria.map((c, i) => ({
        id: c.id, label: c.label, description: c.description, points: c.points, order: i,
      })))
    } else {
      setTitle("")
      setDescription("")
      setCriteria([{ label: "", description: "", points: 10, order: 0 }])
    }
  }, [rubric])

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: title.trim(),
        description,
        criteria: criteria.map((c, i) => ({
          label: c.label.trim(),
          description: c.description,
          points: Number(c.points),
          order: i,
        })),
      }
      if (rubric) {
        return api(`/api/instructor/rubrics/${rubric.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      }
      return api("/api/instructor/rubrics", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    },
    onSuccess: () => {
      toast.success(rubric ? "Rubric updated" : "Rubric created")
      onSaved()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function addCriterion() {
    setCriteria([...criteria, { label: "", description: "", points: 10, order: criteria.length }])
  }
  function removeCriterion(idx: number) {
    setCriteria(criteria.filter((_, i) => i !== idx))
  }
  function updateCriterion(idx: number, patch: Partial<{ label: string; description: string; points: number }>) {
    setCriteria(criteria.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }

  const totalPoints = criteria.reduce((a, c) => a + Number(c.points || 0), 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="r-title">Title *</Label>
          <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lab Report Rubric" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Total Points</Label>
          <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/30 font-mono text-emerald-400">
            {totalPoints} pts
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="r-desc">Description</Label>
        <Textarea
          id="r-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this rubric for?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Criteria</Label>
          <Button size="sm" variant="outline" type="button" onClick={addCriterion}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Criterion
          </Button>
        </div>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {criteria.map((c, idx) => (
            <Card key={idx} className="p-2.5 bg-card/40">
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 sm:col-span-5">
                  <Input
                    placeholder="Criterion label *"
                    value={c.label}
                    onChange={(e) => updateCriterion(idx, { label: e.target.value })}
                  />
                </div>
                <div className="col-span-8 sm:col-span-5">
                  <Input
                    placeholder="Description"
                    value={c.description}
                    onChange={(e) => updateCriterion(idx, { description: e.target.value })}
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <Input
                    type="number"
                    min={0}
                    value={c.points}
                    onChange={(e) => updateCriterion(idx, { points: Number(e.target.value) })}
                    aria-label="Points"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button size="icon" variant="ghost" type="button" onClick={() => removeCriterion(idx)} aria-label="Remove criterion">
                    <X className="h-4 w-4 text-rose-400" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {criteria.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No criteria yet. Add at least one.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !title.trim() || criteria.length === 0 || criteria.some((c) => !c.label.trim())}
        >
          <Save className="h-4 w-4 mr-1.5" />
          {rubric ? "Save Changes" : "Create Rubric"}
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Empty State
// ============================================================================
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <Card className="p-8 text-center border-dashed">
      <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-emerald-400" />
      </div>
      <p className="font-medium mb-1">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
    </Card>
  )
}
