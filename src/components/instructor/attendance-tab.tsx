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
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  Save,
  TrendingUp,
  Users,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================
interface InstructorCourse {
  id: string
  title: string
  shortName: string
}

interface RosterStudent {
  id: string
  name: string
  email: string
  avatar: string | null
  title: string | null
}

interface AttendanceRecord {
  id: string
  userId: string
  courseId: string
  date: string
  sessionType: string
  status: "present" | "absent" | "late" | "excused"
  notes: string
  recordedAt: string
  user: RosterStudent
}

// ============================================================================
// Helpers
// ============================================================================
const STATUSES = [
  { value: "present", label: "Present", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-500" },
  { value: "late", label: "Late", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500" },
  { value: "absent", label: "Absent", icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", dot: "bg-rose-500" },
  { value: "excused", label: "Excused", icon: UserCheck, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", dot: "bg-cyan-500" },
] as const

const SESSION_TYPES = [
  { value: "live", label: "Live Online" },
  { value: "in-person", label: "In Person" },
  { value: "exam", label: "Exam" },
]

function statusMeta(status: string) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0]
}

function todayStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDateShort(date: string): string {
  const d = new Date(date + "T00:00:00")
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ============================================================================
// Main Tab
// ============================================================================
export function InstructorAttendanceTab() {
  const [courseId, setCourseId] = React.useState("")
  const [date, setDate] = React.useState(todayStr())
  const [sessionType, setSessionType] = React.useState("live")

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ courses: InstructorCourse[] }>({
    queryKey: ["instructor", "courses", "list"],
    queryFn: () => api("/api/instructor/courses"),
  })
  const courses = coursesData?.courses ?? []

  React.useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].id)
  }, [courses, courseId])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-emerald-400" />
          Attendance
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track student attendance per session and review historical trends.
        </p>
      </div>

      {/* Controls */}
      <Card className="p-4 holo-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="att-course" className="text-xs uppercase tracking-wider text-muted-foreground">Course</Label>
            {coursesLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger id="att-course">
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="att-date" className="text-xs uppercase tracking-wider text-muted-foreground">Session Date</Label>
            <Input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="att-session" className="text-xs uppercase tracking-wider text-muted-foreground">Session Type</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger id="att-session">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {!courseId ? (
        <EmptyState icon={ClipboardCheck} title="No course selected" description="Choose a course to manage attendance." />
      ) : (
        <>
          <MarkAttendance
            courseId={courseId}
            date={date}
            sessionType={sessionType}
          />
          <AttendanceHistory courseId={courseId} />
        </>
      )}
    </div>
  )
}

// ============================================================================
// Mark Attendance
// ============================================================================
function MarkAttendance({
  courseId,
  date,
  sessionType,
}: {
  courseId: string
  date: string
  sessionType: string
}) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<{
    course: any
    records: AttendanceRecord[]
    byDate: Record<string, AttendanceRecord[]>
    roster: RosterStudent[]
  }>({
    queryKey: ["instructor", "attendance", courseId, date, sessionType],
    queryFn: () =>
      api(`/api/instructor/courses/${courseId}/attendance?date=${encodeURIComponent(date)}&sessionType=${encodeURIComponent(sessionType)}`),
    enabled: !!courseId && !!date,
  })

  const roster = data?.roster ?? []
  const records = data?.records ?? []
  // Build initial status map from records
  const [statuses, setStatuses] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const map: Record<string, string> = {}
    records.forEach((r) => {
      map[r.userId] = r.status
    })
    setStatuses(map)
  }, [records, date, sessionType])

  const bulkMutation = useMutation({
    mutationFn: () => {
      const payload = roster.map((s) => ({
        userId: s.id,
        status: statuses[s.id] ?? "absent",
      }))
      return api(`/api/instructor/courses/${courseId}/attendance/bulk`, {
        method: "POST",
        body: JSON.stringify({ date, sessionType, records: payload }),
      })
    },
    onSuccess: (r: any) => {
      const upserted = r?.upserted ?? 0
      const errors = r?.errors?.length ?? 0
      if (errors > 0) {
        toast.warning(`Saved ${upserted} record(s) — ${errors} error(s)`)
      } else {
        toast.success(`Attendance saved (${upserted} record${upserted !== 1 ? "s" : ""})`)
      }
      qc.invalidateQueries({ queryKey: ["instructor", "attendance", courseId] })
      qc.invalidateQueries({ queryKey: ["instructor", "attendance-history", courseId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function setStatus(userId: string, status: string) {
    setStatuses((prev) => ({ ...prev, [userId]: status }))
  }

  function setAll(status: string) {
    const map: Record<string, string> = {}
    roster.forEach((s) => { map[s.id] = status })
    setStatuses(map)
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      </Card>
    )
  }

  if (roster.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={Users}
          title="No enrolled students"
          description="There are no students enrolled in this course yet."
        />
      </Card>
    )
  }

  const markedCount = Object.keys(statuses).length
  const presentCount = Object.values(statuses).filter((s) => s === "present").length
  const dirty = roster.some((s) => statuses[s.id] && statuses[s.id] !== (records.find((r) => r.userId === s.id)?.status ?? ""))

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-emerald-400" />
            Mark Attendance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDateShort(date)} · {SESSION_TYPES.find((s) => s.value === sessionType)?.label} · {roster.length} student{roster.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Quick set:</span>
          {STATUSES.map((s) => (
            <Button
              key={`set-all-${s.value}`}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setAll(s.value)}
            >
              <s.icon className={cn("h-3 w-3 mr-1", s.color)} />
              All {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Roster */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {roster.map((student) => {
          const currentStatus = statuses[student.id] ?? ""
          return (
            <div
              key={student.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-md bg-muted/20"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                    {initials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate text-sm">{student.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {STATUSES.map((s) => {
                  const isActive = currentStatus === s.value
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(student.id, s.value)}
                      className={cn(
                        "px-2 py-1 rounded-md border text-xs flex items-center gap-1 transition-colors",
                        isActive
                          ? cn(s.bg, s.color, s.border)
                          : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                      )}
                      aria-pressed={isActive}
                      aria-label={`Mark ${student.name} as ${s.label}`}
                    >
                      <s.icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save bar */}
      <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {markedCount}/{roster.length} marked · {presentCount} present
          {dirty && <span className="ml-2 text-amber-400">● unsaved changes</span>}
        </div>
        <Button
          onClick={() => bulkMutation.mutate()}
          disabled={bulkMutation.isPending || markedCount === 0}
        >
          <Save className="h-4 w-4 mr-1.5" />
          Save Attendance
        </Button>
      </div>
    </Card>
  )
}

// ============================================================================
// Attendance History + Stats
// ============================================================================
function AttendanceHistory({ courseId }: { courseId: string }) {
  const { data, isLoading } = useQuery<{
    course: any
    records: AttendanceRecord[]
    byDate: Record<string, AttendanceRecord[]>
    roster: RosterStudent[]
  }>({
    queryKey: ["instructor", "attendance-history", courseId],
    queryFn: () => api(`/api/instructor/courses/${courseId}/attendance`),
    enabled: !!courseId,
  })

  const records = data?.records ?? []
  const byDate = data?.byDate ?? {}
  const roster = data?.roster ?? []

  // Stats
  const stats = React.useMemo(() => {
    if (records.length === 0) {
      return { totalSessions: 0, attendanceRate: 0, mostCommon: "—" }
    }
    const sessionKeys = Object.keys(byDate)
    const totalSessions = sessionKeys.length
    const statusCounts: Record<string, number> = { present: 0, late: 0, absent: 0, excused: 0 }
    records.forEach((r) => {
      if (statusCounts[r.status] !== undefined) statusCounts[r.status]++
    })
    const denom = statusCounts.present + statusCounts.late + statusCounts.absent
    const attendanceRate = denom > 0
      ? Math.round(((statusCounts.present + statusCounts.late) / denom) * 100)
      : 0
    let mostCommon = "present"
    Object.entries(statusCounts).forEach(([k, v]) => {
      if (v > statusCounts[mostCommon]) mostCommon = k
    })
    return { totalSessions, attendanceRate, mostCommon }
  }, [records, byDate])

  // Sessions sorted by date desc
  const sessions = React.useMemo(() => {
    return Object.entries(byDate)
      .map(([key, recs]) => {
        const [date, sessionType] = key.split("|")
        const counts: Record<string, number> = { present: 0, late: 0, absent: 0, excused: 0 }
        recs.forEach((r) => {
          if (counts[r.status] !== undefined) counts[r.status]++
        })
        return { key, date, sessionType, records: recs, counts, total: recs.length }
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [byDate])

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={Calendar}
          title="No attendance history yet"
          description="Once you save a session, you'll see historical summaries here."
        />
      </Card>
    )
  }

  const common = statusMeta(stats.mostCommon)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          icon={Calendar}
          color="text-cyan-400"
          bg="bg-cyan-500/10"
        />
        <StatCard
          label="Most Common"
          value={<span className="capitalize">{stats.mostCommon}</span>}
          icon={common.icon}
          color={common.color}
          bg={common.bg}
        />
      </div>

      {/* Sessions list */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          Recent Sessions
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {sessions.map((s) => (
            <div
              key={s.key}
              className="p-3 rounded-md border border-border bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="font-medium text-sm">
                  {formatDateShort(s.date)}
                  <Badge variant="outline" className="ml-2 text-[10px] bg-muted/30 capitalize">
                    {s.sessionType}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.total} record{s.total !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {STATUSES.map((st) => {
                  const count = s.counts[st.value] ?? 0
                  if (count === 0) return null
                  return (
                    <Badge
                      key={st.value}
                      variant="outline"
                      className={cn("text-[10px]", st.bg, st.color, "border-current/20")}
                    >
                      <st.icon className="h-3 w-3 mr-1" />
                      {count} {st.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Per-student matrix (small table) */}
      {roster.length > 0 && sessions.length > 0 && (
        <Card className="p-4 overflow-hidden">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            Per-Student Breakdown
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card">Student</TableHead>
                  {sessions.slice(0, 8).map((s) => (
                    <TableHead key={s.key} className="text-center min-w-[80px]">
                      <div className="text-[10px]">{formatDateShort(s.date)}</div>
                      <div className="text-[9px] text-muted-foreground capitalize">{s.sessionType}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.slice(0, 20).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="sticky left-0 bg-card font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                            {initials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[140px]">{student.name}</span>
                      </div>
                    </TableCell>
                    {sessions.slice(0, 8).map((s) => {
                      const rec = s.records.find((r) => r.userId === student.id)
                      if (!rec) {
                        return (
                          <TableCell key={s.key} className="text-center text-muted-foreground/40">
                            —
                          </TableCell>
                        )
                      }
                      const meta = statusMeta(rec.status)
                      return (
                        <TableCell key={s.key} className="text-center">
                          <span
                            className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full", meta.bg)}
                            title={`${rec.status} — ${formatDateShort(s.date)}`}
                          >
                            <meta.icon className={cn("h-3 w-3", meta.color)} />
                          </span>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {roster.length > 20 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Showing first 20 students · {roster.length} total
            </p>
          )}
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// Stat Card
// ============================================================================
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}) {
  return (
    <Card className="p-4 relative overflow-hidden card-hover">
      <div className={cn("absolute -right-3 -top-3 h-16 w-16 rounded-full blur-2xl opacity-50", bg)} />
      <div className="relative z-10">
        <div className={cn("inline-flex p-1.5 rounded-md mb-2", bg)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div className="text-2xl font-bold tabular-nums font-mono">{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </Card>
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
