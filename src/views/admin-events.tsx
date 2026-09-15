"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import {
  Calendar, Plus, Pencil, Trash2, Loader2, ArrowLeft,
  Users, Clock, Video, MapPin, Star, Eye, EyeOff,
} from "lucide-react"
import { toast } from "sonner"

interface EventItem {
  id: string
  slug: string
  title: string
  type: string
  category: string
  description: string
  longDescription: string
  startDate: string
  startIsoDate: string | null
  endDate: string
  time: string
  venue: string
  mode: string
  organizer: string
  instructor: string | null
  capacity: number
  registered: number
  fee: string
  status: string
  imageUrl: string | null
  tags: string
  featured: boolean
  order: number
  published: boolean
}

const EVENT_TYPES = ["workshop", "webinar", "ctf", "campus", "awareness", "corporate", "bootcamp"]
const EVENT_STATUSES = ["Open", "Full", "Completed", "Cancelled"]

function emptyForm(): Partial<EventItem> {
  return {
    title: "", slug: "", type: "workshop", category: "General", description: "",
    longDescription: "", startDate: "", startIsoDate: "", endDate: "", time: "",
    venue: "Online", mode: "Live Online", organizer: "GuardianX", instructor: "",
    capacity: 100, registered: 0, fee: "Free", status: "Open", imageUrl: "",
    tags: "", featured: false, order: 0, published: true,
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function AdminEventsView() {
  const { navigate } = useAppStore()
  const qc = useQueryClient()
  const [editing, setEditing] = React.useState<EventItem | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleting, setDeleting] = React.useState<EventItem | null>(null)
  const [form, setForm] = React.useState<Partial<EventItem>>(emptyForm())

  const { data, isLoading } = useQuery<{ events: EventItem[] }>({
    queryKey: ["admin-events"],
    queryFn: () => api("/api/admin/events"),
  })

  const events = data?.events ?? []

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<EventItem>) => {
      if (editing) {
        return api(`/api/admin/events/${editing.id}`, { method: "PATCH", body: JSON.stringify(data) })
      } else {
        return api("/api/admin/events", { method: "POST", body: JSON.stringify(data) })
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Event updated" : "Event created")
      qc.invalidateQueries({ queryKey: ["admin-events"] })
      qc.invalidateQueries({ queryKey: ["events"] })
      setEditing(null); setCreating(false); setForm(emptyForm())
    },
    onError: (e: any) => toast.error(e?.message || "Save failed"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Event deleted")
      qc.invalidateQueries({ queryKey: ["admin-events"] })
      qc.invalidateQueries({ queryKey: ["events"] })
      setDeleting(null)
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  })

  const startEdit = (e: EventItem) => { setEditing(e); setForm(e); setCreating(false) }
  const startCreate = () => { setCreating(true); setEditing(null); setForm(emptyForm()) }
  const closeDialog = () => { setEditing(null); setCreating(false); setForm(emptyForm()) }

  const handleSave = () => {
    if (!form.title?.trim()) { toast.error("Title is required"); return }
    const finalForm = { ...form, slug: form.slug?.trim() || slugify(form.title || "") }
    saveMutation.mutate(finalForm)
  }

  const isOpen = editing || creating

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-violet-400" /> Events Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and publish events — workshops, webinars, CTFs, bootcamps.</p>
        </div>
        <Button onClick={startCreate} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> New Event
        </Button>
      </div>

      {/* Events list */}
      <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No events yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {events.map((e) => (
              <div key={e.id} className="p-4 hover:bg-violet-500/[0.03] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-500/10 text-violet-300 shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-medium text-sm truncate">{e.title}</span>
                        <Badge variant="outline" className="text-[9px]">{e.type}</Badge>
                        <Badge variant="outline" className="text-[9px]">{e.category}</Badge>
                        <Badge variant="outline" className={cn("text-[9px]", e.status === "Open" ? "text-emerald-300 border-emerald-500/30" : "text-muted-foreground")}>{e.status}</Badge>
                        {e.featured && <Badge variant="outline" className="text-[9px] text-violet-300 border-violet-500/30"><Star className="h-2.5 w-2.5 mr-0.5" /> Featured</Badge>}
                        {!e.published && <Badge variant="outline" className="text-[9px] text-amber-300 border-amber-500/30"><EyeOff className="h-2.5 w-2.5 mr-0.5" /> Unpublished</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span>{e.startDate || "No date"}</span>
                        <span>· {e.fee}</span>
                        <span>· {e.registered}/{e.capacity} registered</span>
                        <span className="font-mono">/{e.slug}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => setDeleting(e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      {isOpen && (
        <Dialog open onOpenChange={(o) => !o && closeDialog()}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>{editing ? `Editing: ${editing.title}` : "Create a new workshop, webinar, CTF, bootcamp, or campus event."}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Title + slug */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Title *</Label>
                  <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="e.g. CEH Weekend Workshop" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Slug *</Label>
                  <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ceh-weekend-workshop" className="font-mono text-sm" />
                </div>
              </div>

              {/* Type + category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Category</Label>
                  <Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Offensive Security" />
                </div>
              </div>

              {/* Description + longDescription */}
              <div>
                <Label className="text-xs font-medium">Short Description</Label>
                <Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One-line summary shown on event cards" />
              </div>
              <div>
                <Label className="text-xs font-medium">Long Description</Label>
                <Textarea value={form.longDescription || ""} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} rows={3} placeholder="Full description shown on the event detail page" className="resize-none" />
              </div>

              {/* Dates + time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Start Date (display)</Label>
                  <Input value={form.startDate || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="e.g. October 15, 2026" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Start ISO Date (for sorting)</Label>
                  <Input type="date" value={form.startIsoDate || ""} onChange={(e) => setForm({ ...form, startIsoDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">End Date</Label>
                  <Input value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} placeholder="e.g. October 16, 2026" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Time</Label>
                  <Input value={form.time || ""} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 7:00 PM - 9:00 PM IST" />
                </div>
              </div>

              {/* Venue + mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Venue</Label>
                  <Input value={form.venue || ""} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Online or address" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Mode</Label>
                  <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Live Online">Live Online</SelectItem>
                      <SelectItem value="On-Campus">On-Campus</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Organizer + instructor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Organizer</Label>
                  <Input value={form.organizer || ""} onChange={(e) => setForm({ ...form, organizer: e.target.value })} placeholder="GuardianX" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Instructor (optional)</Label>
                  <Input value={form.instructor || ""} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="e.g. Dr. Sarah Chen" />
                </div>
              </div>

              {/* Capacity + fee + status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Capacity</Label>
                  <Input type="number" value={form.capacity || 0} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Fee</Label>
                  <Input value={form.fee || ""} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="Free or ₹500" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EVENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image URL + tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Image URL (optional)</Label>
                  <Input value={form.imageUrl || ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label className="text-xs font-medium">Tags (pipe-separated)</Label>
                  <Input value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="OWASP|Burp Suite|Web Pentest" />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v === true })} />
                  <span className="text-xs">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v === true })} />
                  <span className="text-xs">Published</span>
                </label>
                <div>
                  <Label className="text-xs font-medium">Order</Label>
                  <Input type="number" value={form.order || 0} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-20 inline ml-2" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Save Changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      {deleting && (
        <AlertDialog open onOpenChange={(o) => !o && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete event?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete "{deleting.title}". This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(deleting.id)} className="bg-rose-600 hover:bg-rose-500">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
