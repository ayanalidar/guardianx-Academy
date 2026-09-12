"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock,
  Users, Video, MapPin, User, Plus, Pencil, Trash2, X, Loader2, AlertTriangle,
  Download, ExternalLink, Search, FileText, Check, Link as LinkIcon,
  Briefcase, Linkedin, Phone, MessageSquare,
} from "lucide-react"
import { toast } from "sonner"

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/* ---------------------------------------------------------------- *
 *  Types                                                            *
 * ---------------------------------------------------------------- */
type TrainingBatch = {
  id: string
  certification: string
  name: string
  schedule: string
  startDate: string
  startIsoDate: string | null
  mode: string
  instructor: string
  instructorId: string | null
  seats: number
  enrolled: number
  level: string
  status: string
  description: string
  featured: boolean
  order: number
  published: boolean
  googleFormUrl: string | null
}

type BatchForm = {
  certification: string
  name: string
  schedule: string
  startDate: string
  startIsoDate: string
  mode: string
  instructor: string
  seats: number
  enrolled: number
  level: string
  status: string
  description: string
  featured: boolean
  order: number
  published: boolean
  googleFormUrl: string
}

/* ---------------------------------------------------------------- *
 *  Helpers                                                         *
 * ---------------------------------------------------------------- */

/** Tailwind bg-* class for the calendar dot / chip for a given cert. */
function certColorClass(cert: string): string {
  const s = cert.toLowerCase()
  if (s.includes("security")) return "bg-emerald-500"
  if (s.includes("ceh") || s.includes("ethical")) return "bg-amber-500"
  if (s.includes("ccna")) return "bg-cyan-500"
  if (s.includes("cissp")) return "bg-rose-500"
  return "bg-violet-500"
}

/** Map a batch's start date (display string + optional ISO) to a YYYY-MM-DD
 *  string for matching against the calendar grid. */
function toIsoDate(b: TrainingBatch): string | null {
  if (b.startIsoDate) return b.startIsoDate.slice(0, 10)
  // Parse "MonthName DD" or "MonthName DD, YYYY"
  const m = b.startDate.match(/^(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/)
  if (!m) return null
  const monthName = m[1]
  const day = parseInt(m[2], 10)
  const year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear()
  const monthIdx = MONTHS.findIndex(x => x === monthName)
  if (monthIdx < 0) return null
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** Derive the day-of-week list (0=Sun,6=Sat) a batch runs on, from its
 *  human-readable schedule string. */
function deriveDays(schedule: string): number[] {
  const s = schedule.toLowerCase()
  const days = new Set<number>()
  // Explicit weekend markers
  if (s.includes("sat")) days.add(6)
  if (s.includes("sun")) days.add(0)
  // Weekdays — match any of Mon/Tue/Wed/Thu/Fri tokens (avoid false-positive
  // from "Saturday/Sunday" by checking weekday tokens specifically)
  if (/\bmon\b|\bmon[-,]/.test(s)) days.add(1)
  if (/\btue\b|\btue[-,]/.test(s)) days.add(2)
  if (/\bwed\b|\bwed[-,]/.test(s)) days.add(3)
  if (/\bthu\b|\bthu[-,]/.test(s)) days.add(4)
  if (/\bfri\b|\bfri[-,]/.test(s)) days.add(5)
  return Array.from(days)
}

function emptyForm(): BatchForm {
  return {
    certification: "",
    name: "",
    schedule: "",
    startDate: "",
    startIsoDate: "",
    mode: "Live Online",
    instructor: "",
    seats: 20,
    enrolled: 0,
    level: "Beginner",
    status: "Open",
    description: "",
    featured: false,
    order: 0,
    published: true,
    googleFormUrl: "",
  }
}

function formFromBatch(b: TrainingBatch): BatchForm {
  return {
    certification: b.certification,
    name: b.name,
    schedule: b.schedule,
    startDate: b.startDate,
    startIsoDate: b.startIsoDate ?? "",
    mode: b.mode,
    instructor: b.instructor,
    seats: b.seats,
    enrolled: b.enrolled,
    level: b.level,
    status: b.status,
    description: b.description,
    featured: b.featured,
    order: b.order,
    published: b.published,
    googleFormUrl: b.googleFormUrl || "",
  }
}

/** Validate the form's required fields. Returns the first error message or null. */
function validateForm(form: BatchForm): string | null {
  if (!form.certification.trim()) return "Certification is required"
  if (!form.name.trim()) return "Batch name is required"
  if (!form.schedule.trim()) return "Schedule is required"
  if (!form.startDate.trim()) return "Start date is required"
  if (!form.instructor.trim()) return "Instructor is required"
  return null
}

/* ---------------------------------------------------------------- *
 *  Component                                                        *
 * ---------------------------------------------------------------- */
export function BatchCalendarView() {
  const { navigate } = useAppStore()
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [view, setView] = React.useState<"month" | "week">("month")
  const [selectedBatch, setSelectedBatch] = React.useState<TrainingBatch | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingBatch, setEditingBatch] = React.useState<TrainingBatch | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deletingBatch, setDeletingBatch] = React.useState<TrainingBatch | null>(null)
  const [form, setForm] = React.useState<BatchForm>(emptyForm())
  const [submitting, setSubmitting] = React.useState(false)

  /* ----------------------------- DB query ----------------------------- */
  // staleTime: 60s — repeat visits are instant (data is cached for 1 minute).
  // The first compile of the API route is unavoidably slow on Turbopack, so the
  // skeleton + spinner below gives the user immediate visual feedback.
  const { data, isLoading, isError, error, isFetching } = useQuery<{ batches: TrainingBatch[]; count: number }>({
    queryKey: ["admin-training-batches"],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await fetch("/api/admin/training-batches")
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized — please sign in as an admin")
        if (res.status === 403) throw new Error("Forbidden — admin role required")
        throw new Error("Failed to load batches")
      }
      return res.json()
    },
  })
  const batches = data?.batches ?? []

  /* ----------------------------- calendar math ----------------------------- */
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }
  function goToday() { setCurrentDate(new Date()) }

  function getBatchesForDay(day: number): TrainingBatch[] {
    const dayOfWeek = new Date(year, month, day).getDay()
    return batches.filter(b => {
      const days = deriveDays(b.schedule)
      if (!days.includes(dayOfWeek)) return false
      return b.status !== "Cancelled" && b.status !== "Completed"
    })
  }

  function getStartingBatches(day: number): TrainingBatch[] {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return batches.filter(b => toIsoDate(b) === iso)
  }

  /* ----------------------------- invalidation helper ----------------------------- */
  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["admin-training-batches"] })
    queryClient.invalidateQueries({ queryKey: ["home-training-batches"] })
    queryClient.invalidateQueries({ queryKey: ["batches-view-training-batches"] })
  }

  /* ----------------------------- create / edit / delete ----------------------------- */
  async function handleCreate() {
    const err = validateForm(form)
    if (err) { toast.error(err); return }
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/training-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || "Failed to create batch")
      }
      toast.success("Batch created successfully")
      invalidateAll()
      setCreateOpen(false)
      setForm(emptyForm())
    } catch (e: any) {
      toast.error(e.message || "Failed to create batch")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate() {
    if (!editingBatch) return
    const err = validateForm(form)
    if (err) { toast.error(err); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/training-batches/${editingBatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || "Failed to update batch")
      }
      toast.success("Batch updated successfully")
      invalidateAll()
      setEditOpen(false)
      setEditingBatch(null)
    } catch (e: any) {
      toast.error(e.message || "Failed to update batch")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deletingBatch) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/training-batches/${deletingBatch.id}`, { method: "DELETE" })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || "Failed to delete batch")
      }
      toast.success("Batch deleted")
      invalidateAll()
      setDeleteOpen(false)
      setDeletingBatch(null)
      // Close the detail modal too if we were viewing this batch
      if (selectedBatch?.id === deletingBatch.id) setSelectedBatch(null)
    } catch (e: any) {
      toast.error(e.message || "Failed to delete batch")
    } finally {
      setSubmitting(false)
    }
  }

  function openCreate() {
    setForm(emptyForm())
    setCreateOpen(true)
  }

  function openEdit(b: TrainingBatch) {
    setEditingBatch(b)
    setForm(formFromBatch(b))
    setEditOpen(true)
  }

  function openDelete(b: TrainingBatch) {
    setDeletingBatch(b)
    setDeleteOpen(true)
  }

  /* ----------------------------- render ----------------------------- */
  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-400" /> Batch Calendar
            </h1>
            {batches.length > 0 && (
              <Badge variant="outline" className="text-[10px] font-mono">
                {batches.length} {batches.length === 1 ? "batch" : "batches"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={openCreate} className="bg-cyan-600 hover:bg-cyan-500 btn-premium">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Batch
            </Button>
            <Button size="sm" variant="outline" onClick={goToday}>Today</Button>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm font-medium min-w-[140px] text-center">{MONTHS[month]} {year}</span>
              <Button size="sm" variant="ghost" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            {/* view toggle (preserved from previous layout) */}
            <div className="hidden sm:flex items-center gap-1 border border-border/40 rounded-md p-0.5">
              {(["month", "week"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors",
                    view === v ? "bg-cyan-500/15 text-cyan-200" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* ----------------------------- loading state ----------------------------- */}
        {/* Immediate, friendly loading state — never a blank page. Shown both on
            the first load (isLoading) and on background re-fetches (isFetching). */}
        {(isLoading || isFetching) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" aria-hidden />
              <span>Loading batches...</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-24" />
              ))}
            </div>
            <Card className="p-4 overflow-hidden">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                  <Skeleton key={d} className="h-6" />
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square sm:aspect-[4/3] rounded-lg" />
                ))}
              </div>
            </Card>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------- error state ----------------------------- */}
        {isError && !isLoading && (
          <Card className="p-8 text-center border-rose-500/30 bg-rose-500/5">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10">
              <AlertTriangle className="size-5 text-rose-300" aria-hidden />
            </div>
            <h3 className="text-base font-semibold mb-2">Couldn&apos;t load batches</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              {(error as Error)?.message || "An error occurred while fetching the batch calendar."}
            </p>
            <Button variant="outline" onClick={() => queryClient.refetchQueries({ queryKey: ["admin-training-batches"] })}>
              Retry
            </Button>
          </Card>
        )}

        {/* ----------------------------- empty state ----------------------------- */}
        {!isLoading && !isError && batches.length === 0 && (
          <Card className="p-10 text-center border-border/60">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/40">
              <Calendar className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <h3 className="text-base font-semibold mb-2">No training batches yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Create your first certification batch to start scheduling live instructor-led training sessions.
            </p>
            <Button onClick={openCreate} className="bg-cyan-600 hover:bg-cyan-500 btn-premium">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create your first batch
            </Button>
          </Card>
        )}

        {/* ----------------------------- main calendar (only when we have batches) ----------------------------- */}
        {!isLoading && !isError && batches.length > 0 && (
          <>
            {/* Batch legend */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {batches.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatch(b)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className={cn("h-2.5 w-2.5 rounded", certColorClass(b.certification))} />
                  {b.certification}
                </button>
              ))}
            </div>

            {/* Calendar grid */}
            <Card className="p-4 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square sm:aspect-[4/3] rounded-lg bg-muted/20" />
                ))}
                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayBatches = getBatchesForDay(day)
                  const starting = getStartingBatches(day)
                  const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
                  return (
                    <div
                      key={day}
                      className={cn(
                        "aspect-square sm:aspect-[4/3] rounded-lg border p-1 sm:p-1.5 relative cursor-pointer hover:border-violet-500/40 transition-colors",
                        isToday ? "border-violet-500 bg-violet-500/5" : "border-border/40 bg-card",
                      )}
                    >
                      <span className={cn("text-[10px] sm:text-xs", isToday ? "text-violet-300 font-bold" : "text-muted-foreground")}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {starting.slice(0, 2).map(b => (
                          <button
                            key={`start-${b.id}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedBatch(b) }}
                            className={cn("block w-full text-left text-[8px] sm:text-[9px] px-1 py-0.5 rounded text-white font-medium truncate hover:opacity-80 transition-opacity", certColorClass(b.certification))}
                            title={`${b.name} - STARTS TODAY`}
                          >
                            ▶ {b.certification.split(" ")[0]}
                          </button>
                        ))}
                        {dayBatches.slice(0, 3 - starting.length).map(b => (
                          <button
                            key={b.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedBatch(b) }}
                            className={cn("block w-full h-1 sm:h-1.5 rounded-full hover:opacity-80 transition-opacity", certColorClass(b.certification))}
                            title={`${b.name} (${b.schedule})`}
                          />
                        ))}
                        {(starting.length + dayBatches.length) > 3 && (
                          <div className="text-[8px] text-muted-foreground">+{(starting.length + dayBatches.length) - 3}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Upcoming batches list */}
            <div className="mt-6 flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold">Upcoming Batches</h2>
              <Button size="sm" variant="outline" onClick={openCreate}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> New Batch
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {batches.map(b => {
                const iso = toIsoDate(b)
                const fmtDate = iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : b.startDate
                return (
                  <Card key={b.id} className="p-4 hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge className={cn("text-[9px] text-white border-0 shrink-0", certColorClass(b.certification))}>
                          {b.certification.split(" ")[0]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] shrink-0",
                            b.status === "Almost Full" && "border-amber-500/40 text-amber-300 bg-amber-500/10",
                            b.status === "Full" && "border-rose-500/40 text-rose-300 bg-rose-500/10",
                            b.status === "Cancelled" && "border-zinc-500/40 text-zinc-300 bg-zinc-500/10",
                            b.status === "Completed" && "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
                            b.status === "Open" && "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
                          )}
                        >
                          {b.status}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">{b.mode}</Badge>
                    </div>
                    <button
                      onClick={() => setSelectedBatch(b)}
                      className="block w-full text-left"
                    >
                      <h3 className="font-semibold text-sm mb-1">{b.name}</h3>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><User className="h-3 w-3 shrink-0" /> {b.instructor}</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" /> {b.schedule}</div>
                        <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 shrink-0" /> Starts {fmtDate}</div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 shrink-0" /> {b.enrolled} / {b.seats} enrolled
                          {!b.published && <span className="text-amber-300"> · Unpublished</span>}
                          {b.featured && <span className="text-violet-300"> · Featured</span>}
                        </div>
                      </div>
                    </button>
                    <div className="mt-3 pt-3 border-t border-border/40 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                        onClick={() => openDelete(b)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ----------------------------- batch detail modal with tabs ----------------------------- */}
      {selectedBatch && (
        <BatchDetailDialog
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onEdit={() => {
            setEditOpen(true)
            setEditingBatch(selectedBatch)
            setForm(formFromBatch(selectedBatch))
            setSelectedBatch(null)
          }}
          onDelete={() => {
            setDeletingBatch(selectedBatch)
            setDeleteOpen(true)
            setSelectedBatch(null)
          }}
        />
      )}

      {/* ----------------------------- Create Batch Dialog ----------------------------- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-400" /> Create New Batch
            </DialogTitle>
            <DialogDescription>
              Add a new live instructor-led certification batch. Color classes are auto-computed from the certification and level.
            </DialogDescription>
          </DialogHeader>
          <BatchFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-cyan-600 hover:bg-cyan-500 btn-premium">
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Create Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------- Edit Batch Dialog ----------------------------- */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingBatch(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-400" /> Edit Batch
            </DialogTitle>
            <DialogDescription>
              {editingBatch ? `${editingBatch.certification} — ${editingBatch.name}` : "Update batch details."}
            </DialogDescription>
          </DialogHeader>
          <BatchFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditingBatch(null) }} disabled={submitting}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={submitting} className="bg-amber-600 hover:bg-amber-500 btn-premium">
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------- Delete confirm Dialog ----------------------------- */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeletingBatch(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" /> Delete Batch
            </DialogTitle>
            <DialogDescription>
              {deletingBatch ? (
                <>Are you sure you want to delete <span className="font-semibold text-foreground">{deletingBatch.name}</span>? This action cannot be undone.</>
              ) : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeletingBatch(null) }} disabled={submitting}>Cancel</Button>
            <Button onClick={handleDelete} disabled={submitting} className="bg-rose-600 hover:bg-rose-500">
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Delete Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------------------------------------------------------------- *
 *  Form fields — shared between Create + Edit dialogs              *
 * ---------------------------------------------------------------- */
function BatchFormFields({
  form,
  setForm,
}: {
  form: BatchForm
  setForm: React.Dispatch<React.SetStateAction<BatchForm>>
}) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <Label className="text-xs">Certification *</Label>
        <Input
          value={form.certification}
          onChange={(e) => setForm({ ...form, certification: e.target.value })}
          placeholder="e.g. CompTIA Security+, CEH, CCNA, CISSP"
        />
      </div>
      <div>
        <Label className="text-xs">Batch Name *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Security+ Weekend Batch"
        />
      </div>
      <div>
        <Label className="text-xs">Schedule *</Label>
        <Input
          value={form.schedule}
          onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          placeholder="e.g. Sat + Sun, 7:00 PM – 9:00 PM IST"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Start Date (display) *</Label>
          <Input
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            placeholder="e.g. October 12"
          />
        </div>
        <div>
          <Label className="text-xs">Start Date (ISO)</Label>
          <Input
            type="date"
            value={form.startIsoDate}
            onChange={(e) => setForm({ ...form, startIsoDate: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Delivery Mode</Label>
          <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Live Online">Live Online</SelectItem>
              <SelectItem value="On-Campus">On-Campus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Level</Label>
          <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Instructor *</Label>
        <Input
          value={form.instructor}
          onChange={(e) => setForm({ ...form, instructor: e.target.value })}
          placeholder="e.g. Dr. Sarah Chen"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Seats</Label>
          <Input
            type="number"
            min={1}
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label className="text-xs">Enrolled</Label>
          <Input
            type="number"
            min={0}
            value={form.enrolled}
            onChange={(e) => setForm({ ...form, enrolled: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label className="text-xs">Order</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Status</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Almost Full">Almost Full</SelectItem>
            <SelectItem value="Full">Full</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional longer description of the batch curriculum."
          rows={3}
        />
      </div>
      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={form.featured}
            onCheckedChange={(v) => setForm({ ...form, featured: v === true })}
          />
          <span className="text-xs">Featured on homepage</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={form.published}
            onCheckedChange={(v) => setForm({ ...form, published: v === true })}
          />
          <span className="text-xs">Published</span>
        </label>
      </div>

      {/* Google Form URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Google Form URL (optional)</label>
        <Input
          value={form.googleFormUrl}
          onChange={(e) => setForm({ ...form, googleFormUrl: e.target.value })}
          placeholder="https://forms.gle/..."
          className="text-sm"
        />
        <p className="text-[10px] text-muted-foreground">
          Paste the Google Form URL for this batch's enrollment. Users will see an "Enroll" button linking to this form.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// BatchDetailDialog — tabbed batch detail with Overview / Leads / Form Setup
// ============================================================
function BatchDetailDialog({
  batch,
  onClose,
  onEdit,
  onDelete,
}: {
  batch: TrainingBatch
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <Badge className={cn("text-xs text-white border-0", certColorClass(batch.certification))}>
              {batch.certification}
            </Badge>
            <span className="truncate">{batch.name}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-3 flex-wrap mt-1">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {batch.schedule}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {batch.startDate}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {batch.enrolled}/{batch.seats}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="form">Google Form</TabsTrigger>
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="overview" className="flex-1 overflow-y-auto pr-1">
            <div className="space-y-2 text-sm py-2">
              <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4 shrink-0" /> {batch.instructor}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 shrink-0" /> {batch.schedule}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 shrink-0" /> Starts {batch.startDate}</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {batch.mode === "Live Online" ? <Video className="h-4 w-4 shrink-0" /> : <MapPin className="h-4 w-4 shrink-0" />} {batch.mode}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4 shrink-0" /> {batch.enrolled} / {batch.seats} enrolled</div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{batch.level}</Badge>
                <Badge variant="outline" className="text-[10px]">{batch.status}</Badge>
                {batch.featured && <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-300">Featured</Badge>}
                {!batch.published && <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300">Unpublished</Badge>}
              </div>
              {batch.description && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">{batch.description}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border/40 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
                <Pencil className="h-3 w-3 mr-1.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200" onClick={onDelete}>
                <Trash2 className="h-3 w-3 mr-1.5" /> Delete
              </Button>
            </div>
          </TabsContent>

          {/* Leads tab */}
          <TabsContent value="leads" className="flex-1 overflow-hidden flex flex-col">
            <BatchLeadsTab batchId={batch.id} />
          </TabsContent>

          {/* Google Form Setup tab */}
          <TabsContent value="form" className="flex-1 overflow-y-auto pr-1">
            <GoogleFormSetupTab batch={batch} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// BatchLeadsTab — shows leads for this batch only
// ============================================================
interface BatchLead {
  id: string
  name: string
  whatsappNumber: string
  linkedinProfile: string | null
  professionalStatus: string | null
  jobRole: string | null
  status: string
  adminNotes: string | null
  source: string
  createdAt: string
}

const LEAD_STATUSES = [
  { value: "New", color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/30", dot: "bg-blue-400" },
  { value: "Contacted", color: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/30", dot: "bg-cyan-400" },
  { value: "Qualified", color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30", dot: "bg-violet-400" },
  { value: "Enrolled", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  { value: "Lost", color: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30", dot: "bg-rose-400" },
]

function BatchLeadsTab({ batchId }: { batchId: string }) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [search, setSearch] = React.useState("")
  const [selectedLead, setSelectedLead] = React.useState<BatchLead | null>(null)

  const queryKey = React.useMemo(() => ["batch-leads", batchId, statusFilter], [batchId, statusFilter])

  const { data, isLoading } = useQuery<{ leads: BatchLead[]; count: number; byStatus: Record<string, number> }>({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      return api(`/api/admin/training-batches/${batchId}/leads?${params.toString()}`)
    },
    refetchInterval: 30000,
  })

  const leads = data?.leads ?? []
  const byStatus = data?.byStatus ?? { New: 0, Contacted: 0, Qualified: 0, Enrolled: 0, Lost: 0 }

  const filteredLeads = search.trim()
    ? leads.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.whatsappNumber.includes(search) ||
        (l.linkedinProfile || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.jobRole || "").toLowerCase().includes(search.toLowerCase())
      )
    : leads

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {LEAD_STATUSES.map((s) => (
          <div key={s.value} className={cn("rounded-lg border p-2 text-center", s.border, s.bg)}>
            <div className="text-lg font-bold tabular-nums">{byStatus[s.value] || 0}</div>
            <div className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search by name, WhatsApp, LinkedIn, role..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            {LEAD_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.value}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Leads list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-lg border border-border/60">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">No leads yet</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">Leads will appear here when someone fills the batch's Google Form</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filteredLeads.map((lead) => {
              const statusMeta = LEAD_STATUSES.find((s) => s.value === lead.status) || LEAD_STATUSES[0]
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="w-full p-3 hover:bg-violet-500/[0.03] transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/10 text-violet-300 font-semibold text-xs shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-medium text-xs truncate">{lead.name}</span>
                          <Badge variant="outline" className={cn("text-[8px] shrink-0", statusMeta.color, statusMeta.border, statusMeta.bg)}>
                            <span className={cn("h-1 w-1 rounded-full mr-1", statusMeta.dot)} />
                            {lead.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" /> {lead.whatsappNumber}</span>
                          {lead.jobRole && <span className="flex items-center gap-0.5"><Briefcase className="h-2.5 w-2.5" /> {lead.jobRole}</span>}
                          {lead.professionalStatus && <span>· {lead.professionalStatus}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lead detail dialog */}
      {selectedLead && (
        <LeadDetailDialog
          lead={selectedLead}
          batchId={batchId}
          onClose={() => setSelectedLead(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["batch-leads", batchId] })
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// LeadDetailDialog — view + edit a single lead
// ============================================================
function LeadDetailDialog({ lead, batchId, onClose, onUpdated }: { lead: BatchLead; batchId: string; onClose: () => void; onUpdated: () => void }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = React.useState(lead.status)
  const [adminNotes, setAdminNotes] = React.useState(lead.adminNotes || "")
  const [saving, setSaving] = React.useState(false)
  const hasChanges = status !== lead.status || adminNotes !== (lead.adminNotes || "")

  const handleSave = async () => {
    setSaving(true)
    try {
      await api(`/api/admin/training-batches/${batchId}/leads/${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes }),
      })
      toast.success("Lead updated")
      onUpdated()
      onClose()
    } catch (e: any) {
      toast.error(e?.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this lead?")) return
    try {
      await api(`/api/admin/training-batches/${batchId}/leads/${lead.id}`, { method: "DELETE" })
      toast.success("Lead deleted")
      onUpdated()
      onClose()
    } catch (e: any) {
      toast.error(e?.message || "Delete failed")
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{lead.name}</DialogTitle>
          <DialogDescription>Lead from {lead.source} · {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Lead fields */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={Phone} label="WhatsApp" value={lead.whatsappNumber} />
            <InfoRow icon={Briefcase} label="Job role" value={lead.jobRole || "—"} />
            <InfoRow icon={User} label="Status" value={lead.professionalStatus || "—"} />
            <InfoRow icon={Linkedin} label="LinkedIn" value={lead.linkedinProfile ? "View profile" : "—"} link={lead.linkedinProfile || undefined} />
          </div>

          {/* Status updater */}
          <div className="border-t border-border/60 pt-3">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Pipeline status</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 text-[9px] font-medium transition-all",
                    status === s.value ? cn(s.bg, s.color, s.border) : "border-border/60 bg-card/40 hover:bg-muted/20 text-muted-foreground"
                  )}
                >
                  {s.value}
                </button>
              ))}
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <Label htmlFor="lead-notes" className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Admin notes</Label>
            <Textarea id="lead-notes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder="Call notes, follow-up reminders..." className="resize-none text-sm" maxLength={5000} />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between flex-row flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />} Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ icon: Icon, label, value, link }: { icon: any; label: string; value: string; link?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/10 p-2.5">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-300 hover:underline flex items-center gap-1">
          {value} <ExternalLink className="h-2.5 w-2.5" />
        </a>
      ) : (
        <div className="text-xs font-medium truncate">{value}</div>
      )}
    </div>
  )
}

// ============================================================
// GoogleFormSetupTab — per-batch Apps Script + form URL
// ============================================================
function GoogleFormSetupTab({ batch }: { batch: TrainingBatch }) {
  const queryClient = useQueryClient()
  const [formUrl, setFormUrl] = React.useState(batch.googleFormUrl || "")
  const [saving, setSaving] = React.useState(false)

  const handleSaveUrl = async () => {
    setSaving(true)
    try {
      await api(`/api/admin/training-batches/${batch.id}`, {
        method: "PATCH",
        body: JSON.stringify({ googleFormUrl: formUrl.trim() || null }),
      })
      toast.success("Google Form URL saved")
      queryClient.invalidateQueries({ queryKey: ["admin-training-batches"] })
    } catch (e: any) {
      toast.error(e?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const scriptUrl = `/api/admin/training-batches/${batch.id}/apps-script`

  return (
    <div className="space-y-5 py-2">
      {/* Download Apps Script */}
      <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
        <div className="flex items-start gap-2.5 mb-3">
          <FileText className="h-5 w-5 text-violet-300 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold">Per-batch Apps Script</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Download a customized Google Apps Script with this batch's ID baked in. No manual editing needed.</p>
          </div>
        </div>
        <a href={scriptUrl} target="_blank" rel="noopener noreferrer">
          <Button className="bg-gradient-to-r from-violet-600 to-violet-500 text-white" size="sm">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download Apps Script (.gs)
          </Button>
        </a>
      </div>

      {/* Setup checklist */}
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Setup checklist</h4>
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li className="flex gap-2"><span className="text-violet-300 font-mono">1.</span> Create a Google Form at <a href="https://forms.new" target="_blank" rel="noreferrer" className="text-violet-300 hover:underline flex items-center gap-0.5">forms.new <ExternalLink className="h-2.5 w-2.5" /></a></li>
          <li className="flex gap-2"><span className="text-violet-300 font-mono">2.</span> Add these 5 questions: Name, WhatsApp number (with country code), LinkedIn profile link, Current professional status, Current job role</li>
          <li className="flex gap-2"><span className="text-violet-300 font-mono">3.</span> Click the 3-dot menu → Script Editor → paste the downloaded script → Save</li>
          <li className="flex gap-2"><span className="text-violet-300 font-mono">4.</span> Run "setupTriggers" and grant permissions</li>
          <li className="flex gap-2"><span className="text-violet-300 font-mono">5.</span> Copy the Google Form URL → paste it below → Save</li>
          <li className="flex gap-2"><span className="text-violet-300 font-mono">6.</span> Leads from this form will now appear in the "Leads" tab above</li>
        </ol>
      </div>

      {/* Google Form URL */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Google Form URL</Label>
        <Input
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://forms.gle/..."
          className="text-sm"
        />
        <p className="text-[10px] text-muted-foreground">Paste the Google Form URL here. An "Enroll" button will appear on the public batches page.</p>
        {formUrl && (
          <a href={formUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-violet-300 hover:underline mt-1">
            <ExternalLink className="h-3 w-3" /> Open form
          </a>
        )}
        <Button onClick={handleSaveUrl} disabled={saving || formUrl === (batch.googleFormUrl || "")} size="sm" className="mt-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />} Save URL
        </Button>
      </div>
    </div>
  )
}
