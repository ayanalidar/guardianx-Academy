"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  ClipboardList,
  Clock,
  FileText,
  Link2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Users,
  Sparkles,
  BookOpen,
  Send,
  Lock,
  Award,
} from "lucide-react"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type SubmissionStatus =
  | "missing"
  | "submitted"
  | "resubmitted"
  | "graded"
  | "returned"

interface CourseRef {
  id: string
  title: string
  shortName: string
  color: string
  thumbnail: string | null
}

interface SubmissionRef {
  id: string
  assignmentId: string
  status: string
  late: boolean
  grade: number | null
  submittedAt: string
  gradedAt: string | null
}

interface AssignmentItem {
  id: string
  title: string
  description: string
  pointsPossible: number
  dueDate: string
  submissionType: string
  allowLate: boolean
  latePenalty: number
  enablePeerReview: boolean
  peerReviewCount: number
  peerReviewDueDate: string | null
  course: CourseRef
  submission: SubmissionRef | null
  status: SubmissionStatus
  dueSoon: boolean
  overdue: boolean
  submissionsCount: number
}

interface AssignmentStats {
  total: number
  dueSoon: number
  overdue: number
  missing: number
  submitted: number
  graded: number
}

interface AssignmentDetail {
  id: string
  title: string
  description: string
  instructions: string | null
  pointsPossible: number
  dueDate: string
  submissionType: string
  allowLate: boolean
  latePenalty: number
  enablePeerReview: boolean
  peerReviewCount: number
  peerReviewDueDate: string | null
}

interface PeerSubmissionToReview {
  id: string
  content: string
  fileUrl: string | null
  submittedAt: string
  late: boolean
  user: { id: string; name: string; avatar: string | null; title: string | null }
}

interface PeerReviewCompleted {
  id: string
  rating: number
  feedback: string
  submittedAt: string
  submission: { id: string; user: { id: string; name: string; avatar: string | null; title: string | null } }
}

interface PeerReviewResponse {
  assignment: {
    id: string
    title: string
    description: string
    instructions: string | null
    pointsPossible: number
    dueDate: string
    peerReviewCount: number
    peerReviewDueDate: string | null
    course: CourseRef
  }
  toReview: PeerSubmissionToReview[]
  completed: PeerReviewCompleted[]
  progress?: { completed: number; target: number; remaining: number }
  needsOwnSubmission?: boolean
  message?: string
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

function dueLabel(iso: string): { text: string; date: Date } {
  const date = new Date(iso)
  return {
    text: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    date,
  }
}

function statusBadge(status: SubmissionStatus, overdue: boolean) {
  if (overdue && status === "missing") {
    return (
      <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
      </Badge>
    )
  }
  switch (status) {
    case "missing":
      return (
        <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      )
    case "submitted":
      return (
        <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Send className="h-3 w-3 mr-1" /> Submitted
        </Badge>
      )
    case "resubmitted":
      return (
        <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Send className="h-3 w-3 mr-1" /> Resubmitted
        </Badge>
      )
    case "returned":
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" /> Returned
        </Badge>
      )
    case "graded":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Graded
        </Badge>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/* Main View                                                          */
/* ------------------------------------------------------------------ */

type FilterTab = "all" | "pending" | "submitted" | "graded" | "overdue"

export function AssignmentsView() {
  const { navigate } = useAppStore()
  const qc = useQueryClient()
  const [tab, setTab] = React.useState<FilterTab>("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [peerReviewOpen, setPeerReviewOpen] = React.useState<string | null>(null)

  const { data, isLoading } = useQuery<{ assignments: AssignmentItem[]; stats: AssignmentStats }>({
    queryKey: ["me", "assignments"],
    queryFn: () => api("/api/me/assignments"),
  })

  const assignments = data?.assignments ?? []

  function bucketFor(a: AssignmentItem): Exclude<FilterTab, "all"> | null {
    if (a.overdue) return "overdue"
    if (a.status === "graded") return "graded"
    if (a.status === "submitted" || a.status === "resubmitted" || a.status === "returned")
      return "submitted"
    if (a.status === "missing") return "pending"
    return null
  }

  const filtered =
    tab === "all" ? assignments : assignments.filter((a) => bucketFor(a) === tab)

  // Compute stat-card counts (Pending = missing && !overdue, Submitted = submitted/resubmitted/returned, Graded, Overdue)
  const pendingCount =
    assignments.filter((a) => a.status === "missing" && !a.overdue).length
  const submittedCount = assignments.filter(
    (a) => a.status === "submitted" || a.status === "resubmitted" || a.status === "returned"
  ).length
  const gradedCount = assignments.filter((a) => a.status === "graded").length
  const overdueCount = assignments.filter((a) => a.overdue).length

  const statCards = [
    {
      key: "pending",
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      key: "submitted",
      label: "Submitted",
      value: submittedCount,
      icon: Send,
      accent: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      key: "graded",
      label: "Graded",
      value: gradedCount,
      icon: CheckCircle2,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: overdueCount,
      icon: AlertTriangle,
      accent: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-emerald-400" /> Assignments
        </h1>
        <p className="text-muted-foreground">
          Your pending and graded work across all enrolled courses.
        </p>
      </header>

      {/* Stats row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          : statCards.map((s) => (
              <Card
                key={s.key}
                className={cn(
                  "p-5 relative overflow-hidden card-hover border",
                  s.border
                )}
              >
                <div className={cn("absolute inset-0 opacity-30 bg-grid", s.bg)} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={cn("h-5 w-5", s.accent)} />
                    <span className="text-3xl font-bold font-mono">{s.value}</span>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              </Card>
            ))}
      </section>

      {/* Filter tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="all" className="py-2">All</TabsTrigger>
          <TabsTrigger value="pending" className="py-2">Pending</TabsTrigger>
          <TabsTrigger value="submitted" className="py-2">Submitted</TabsTrigger>
          <TabsTrigger value="graded" className="py-2">Graded</TabsTrigger>
          <TabsTrigger value="overdue" className="py-2 text-rose-400 data-[state=active]:text-rose-300">
            Overdue
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-1">No assignments here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {tab === "all"
                  ? "You don't have any assignments across enrolled courses yet."
                  : `Nothing in the "${tab}" bucket right now.`}
              </p>
              <Button onClick={() => navigate({ name: "catalog" })}>
                <BookOpen className="h-4 w-4 mr-1.5" /> Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  onOpen={() => setSelectedId(a.id)}
                  onOpenPeerReview={() => setPeerReviewOpen(a.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submission / detail dialog */}
      <AssignmentDialog
        assignmentId={selectedId}
        onClose={() => setSelectedId(null)}
        onSubmitted={() => {
          qc.invalidateQueries({ queryKey: ["me", "assignments"] })
        }}
      />

      {/* Peer review dialog */}
      <PeerReviewDialog
        assignmentId={peerReviewOpen}
        onClose={() => setPeerReviewOpen(null)}
        onReviewed={() => {
          qc.invalidateQueries({ queryKey: ["me", "assignments"] })
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Assignment Card                                                    */
/* ------------------------------------------------------------------ */

function AssignmentCard({
  assignment,
  onOpen,
  onOpenPeerReview,
}: {
  assignment: AssignmentItem
  onOpen: () => void
  onOpenPeerReview: () => void
}) {
  const due = dueLabel(assignment.dueDate)
  return (
    <Card className="p-5 card-hover relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Course badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono font-bold text-sm text-emerald-400">
            {assignment.course.shortName.slice(0, 3)}
          </div>
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold truncate">{assignment.title}</h3>
            {statusBadge(assignment.status, assignment.overdue)}
            {assignment.dueSoon && !assignment.overdue && (
              <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                <Clock className="h-3 w-3 mr-1" /> Due soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {assignment.description || "No description provided."}
          </p>
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono text-[10px]">
              {assignment.course.shortName}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Due {due.text}
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" /> {assignment.pointsPossible} pts
            </span>
            {assignment.submission?.late && (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Late
              </span>
            )}
            {assignment.submission?.grade != null && (
              <span className="text-emerald-400 font-mono font-bold">
                Grade: {assignment.submission.grade}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {assignment.enablePeerReview && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onOpenPeerReview}
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Peer Review</span>
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={onOpen}>
            {assignment.submission ? "View" : "Open"}
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Assignment Detail + Submission Dialog                              */
/* ------------------------------------------------------------------ */

function AssignmentDialog({
  assignmentId,
  onClose,
  onSubmitted,
}: {
  assignmentId: string | null
  onClose: () => void
  onSubmitted: () => void
}) {
  const qc = useQueryClient()
  const [content, setContent] = React.useState("")
  const [fileUrl, setFileUrl] = React.useState("")

  const { data, isLoading } = useQuery<{ assignment: AssignmentDetail }>({
    queryKey: ["assignment", assignmentId],
    queryFn: () => api(`/api/assignments/${assignmentId}`),
    enabled: !!assignmentId,
  })

  // Reset form when assignment changes
  React.useEffect(() => {
    if (assignmentId) {
      setContent("")
      setFileUrl("")
    }
  }, [assignmentId])

  const assignment = data?.assignment

  const submitMutation = useMutation({
    mutationFn: (body: { content?: string; fileUrl?: string }) =>
      api(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success("Submission received!", {
        description: "Your instructor will grade it shortly.",
      })
      qc.invalidateQueries({ queryKey: ["assignment", assignmentId] })
      onSubmitted()
      onClose()
    },
    onError: (e: Error) => toast.error("Submission failed", { description: e.message }),
  })

  const canSubmit =
    content.trim().length > 0 || fileUrl.trim().length > 0

  return (
    <Dialog open={!!assignmentId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            {isLoading ? "Loading…" : assignment?.title}
          </DialogTitle>
          <DialogDescription>
            {assignment
              ? `${assignment.pointsPossible} points · Due ${dueLabel(assignment.dueDate).text}`
              : "Assignment details"}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !assignment ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Description */}
            <section>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {assignment.description || "No description provided."}
              </p>
            </section>

            {/* Instructions */}
            {assignment.instructions && (
              <section>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Instructions
                </Label>
                <div className="text-sm mt-1 whitespace-pre-wrap bg-card/50 border border-border rounded-lg p-3 max-h-64 overflow-y-auto">
                  {assignment.instructions}
                </div>
              </section>
            )}

            {/* Submission type / rules */}
            <section className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <div className="text-muted-foreground">Submission Type</div>
                <div className="font-medium capitalize">{assignment.submissionType}</div>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <div className="text-muted-foreground">Late submissions</div>
                <div className="font-medium">
                  {assignment.allowLate ? `Allowed (-${assignment.latePenalty}%)` : "Not allowed"}
                </div>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-3">
                <div className="text-muted-foreground">Peer review</div>
                <div className="font-medium">
                  {assignment.enablePeerReview
                    ? `${assignment.peerReviewCount} reviews`
                    : "Disabled"}
                </div>
              </div>
            </section>

            {/* Submission form */}
            <section className="space-y-3 border-t border-border pt-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Submit your work
              </Label>
              <div className="space-y-2">
                <Label htmlFor="submit-content">Content / Answer</Label>
                <Textarea
                  id="submit-content"
                  placeholder="Type or paste your submission here…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submit-file">File URL (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="submit-file"
                    placeholder="https://drive.google.com/…"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                  <Link2 className="h-4 w-4 text-muted-foreground self-center" />
                </div>
              </div>
            </section>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!canSubmit || submitMutation.isPending || !assignment}
            onClick={() =>
              submitMutation.mutate({
                content: content.trim() || undefined,
                fileUrl: fileUrl.trim() || undefined,
              })
            }
          >
            {submitMutation.isPending ? "Submitting…" : "Submit"}
            <Send className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Peer Review Dialog                                                 */
/* ------------------------------------------------------------------ */

function PeerReviewDialog({
  assignmentId,
  onClose,
  onReviewed,
}: {
  assignmentId: string | null
  onClose: () => void
  onReviewed: () => void
}) {
  const qc = useQueryClient()
  const [activeSubmissionId, setActiveSubmissionId] = React.useState<string | null>(null)
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [feedback, setFeedback] = React.useState("")

  const { data, isLoading } = useQuery<PeerReviewResponse>({
    queryKey: ["assignment", assignmentId, "peer-reviews"],
    queryFn: () => api(`/api/assignments/${assignmentId}/peer-reviews`),
    enabled: !!assignmentId,
  })

  React.useEffect(() => {
    if (assignmentId) {
      setActiveSubmissionId(null)
      setRating(0)
      setHoverRating(0)
      setFeedback("")
    }
  }, [assignmentId])

  const reviewMutation = useMutation({
    mutationFn: (body: { rating: number; feedback: string }) =>
      api(`/api/submissions/${activeSubmissionId}/peer-review`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success("Peer review submitted!", {
        description: "Thanks for helping a peer improve.",
      })
      qc.invalidateQueries({ queryKey: ["assignment", assignmentId, "peer-reviews"] })
      setActiveSubmissionId(null)
      setRating(0)
      setHoverRating(0)
      setFeedback("")
      onReviewed()
    },
    onError: (e: Error) => toast.error("Review failed", { description: e.message }),
  })

  const toReview = data?.toReview ?? []
  const completed = data?.completed ?? []
  const progress = data?.progress

  return (
    <Dialog open={!!assignmentId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" /> Peer Review
          </DialogTitle>
          <DialogDescription>
            {data?.assignment?.title ?? "Review your peers' submissions"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : data?.needsOwnSubmission ? (
          <div className="py-6 text-center">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">Submit your own work first</p>
            <p className="text-sm text-muted-foreground">{data.message}</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Progress */}
            {progress && (
              <div className="bg-card/50 border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono font-bold text-cyan-400">
                  {progress.completed} / {progress.target}
                </span>
              </div>
            )}

            {/* Submissions to review */}
            {toReview.length === 0 && completed.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No peer submissions are available to review right now.
              </div>
            ) : null}

            {toReview.length > 0 && (
              <section>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  To review ({toReview.length})
                </Label>
                <div className="space-y-2">
                  {toReview.map((s) => {
                    const active = activeSubmissionId === s.id
                    return (
                      <Card
                        key={s.id}
                        className={cn(
                          "p-3 cursor-pointer transition-colors",
                          active
                            ? "border-cyan-500/40 bg-cyan-500/5"
                            : "hover:border-border"
                        )}
                        onClick={() => {
                          setActiveSubmissionId(s.id)
                          setRating(0)
                          setHoverRating(0)
                          setFeedback("")
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            {s.user.avatar ? (
                              <AvatarImage src={s.user.avatar} alt={s.user.name} />
                            ) : null}
                            <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-xs">
                              {s.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{s.user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {timeAgo(s.submittedAt)}
                              {s.late && (
                                <span className="ml-2 text-rose-400">· Late</span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant={active ? "default" : "outline"}>
                            {active ? "Reviewing" : "Review"}
                          </Button>
                        </div>
                        {active && (
                          <div className="mt-3 space-y-3 border-t border-border pt-3">
                            {s.content && (
                              <div className="text-sm whitespace-pre-wrap bg-background/50 rounded p-2 max-h-40 overflow-y-auto">
                                {s.content}
                              </div>
                            )}
                            {s.fileUrl && (
                              <a
                                href={s.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
                              >
                                <Link2 className="h-3 w-3" /> View attached file
                              </a>
                            )}

                            {/* Rating */}
                            <div>
                              <Label className="text-xs text-muted-foreground">Rating</Label>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    aria-label={`${n} stars`}
                                    onMouseEnter={() => setHoverRating(n)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(n)}
                                    className="p-0.5"
                                  >
                                    <Star
                                      className={cn(
                                        "h-6 w-6 transition-colors",
                                        (hoverRating || rating) >= n
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-muted-foreground"
                                      )}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-xs text-muted-foreground font-mono">
                                  {rating > 0 ? `${rating}/5` : "Select"}
                                </span>
                              </div>
                            </div>

                            {/* Feedback */}
                            <div>
                              <Label htmlFor="peer-feedback" className="text-xs text-muted-foreground">
                                Feedback
                              </Label>
                              <Textarea
                                id="peer-feedback"
                                placeholder="Provide constructive feedback…"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="mt-1 min-h-[80px]"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                disabled={
                                  rating < 1 ||
                                  reviewMutation.isPending
                                }
                                onClick={() =>
                                  reviewMutation.mutate({ rating, feedback: feedback.trim() })
                                }
                              >
                                {reviewMutation.isPending ? "Submitting…" : "Submit Review"}
                                <Send className="h-3.5 w-3.5 ml-1.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Completed reviews */}
            {completed.length > 0 && (
              <section>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Completed ({completed.length})
                </Label>
                <div className="space-y-2">
                  {completed.map((r) => (
                    <Card key={r.id} className="p-3 opacity-80">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                            {r.submission.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{r.submission.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          · {timeAgo(r.submittedAt)}
                        </span>
                        <Badge className="ml-auto bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Star className="h-3 w-3 mr-1 fill-amber-400" /> {r.rating}/5
                        </Badge>
                      </div>
                      {r.feedback && (
                        <p className="text-xs text-muted-foreground">{r.feedback}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
