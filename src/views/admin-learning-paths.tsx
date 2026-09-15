"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Route, Plus, Pencil, Trash2, Loader2,
  Star, EyeOff, Zap, FlaskConical, Trophy, Clock,
} from "lucide-react"
import { toast } from "sonner"

interface LearningPathItem {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  vertical: string
  icon: string
  color: string
  tint: string
  difficulty: string
  duration: string
  skillsCount: number
  labsCount: number
  xpReward: number
  careerOutcome: string | null
  skills: string // JSON array string
  courses: string // JSON array string
  order: number
  published: boolean
  featured: boolean
}

/** Form-facing shape: skills + courses are editable as comma-separated strings. */
interface LearningPathForm {
  id?: string
  slug: string
  title: string
  subtitle: string
  description: string
  vertical: string
  icon: string
  color: string
  tint: string
  difficulty: string
  duration: string
  skillsCount: number
  labsCount: number
  xpReward: number
  careerOutcome: string
  skills: string // comma-separated
  courses: string // comma-separated
  order: number
  published: boolean
  featured: boolean
}

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]
const VERTICALS = ["cyber", "ai", "cloud"]

function emptyForm(): LearningPathForm {
  return {
    slug: "", title: "", subtitle: "", description: "",
    vertical: "cyber", icon: "Route", color: "text-violet-300", tint: "bg-violet-500/10",
    difficulty: "Beginner", duration: "12 weeks",
    skillsCount: 0, labsCount: 0, xpReward: 5000,
    careerOutcome: "", skills: "", courses: "",
    order: 0, published: true, featured: false,
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

/** Convert a stored LearningPathItem (JSON-array string fields) into the form shape. */
function itemToForm(p: LearningPathItem): LearningPathForm {
  let skillsArr: string[] = []
  let coursesArr: string[] = []
  try { skillsArr = JSON.parse(p.skills || "[]") } catch { skillsArr = [] }
  try { coursesArr = JSON.parse(p.courses || "[]") } catch { coursesArr = [] }
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle || "",
    description: p.description || "",
    vertical: p.vertical,
    icon: p.icon,
    color: p.color,
    tint: p.tint,
    difficulty: p.difficulty,
    duration: p.duration,
    skillsCount: p.skillsCount,
    labsCount: p.labsCount,
    xpReward: p.xpReward,
    careerOutcome: p.careerOutcome || "",
    skills: skillsArr.join(", "),
    courses: coursesArr.join(", "),
    order: p.order,
    published: p.published,
    featured: p.featured,
  }
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "text-emerald-300 border-emerald-500/30",
  Intermediate: "text-amber-300 border-amber-500/30",
  Advanced: "text-rose-300 border-rose-500/30",
}

export function AdminLearningPathsView() {
  const qc = useQueryClient()
  const [editing, setEditing] = React.useState<LearningPathItem | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleting, setDeleting] = React.useState<LearningPathItem | null>(null)
  const [form, setForm] = React.useState<LearningPathForm>(emptyForm())

  const { data, isLoading } = useQuery<{ learningPaths: LearningPathItem[] }>({
    queryKey: ["admin-learning-paths"],
    queryFn: () => api("/api/admin/learning-paths"),
  })

  const paths = data?.learningPaths ?? []

  const saveMutation = useMutation({
    mutationFn: async (f: LearningPathForm) => {
      // Convert comma-separated skills/courses into JSON array strings
      const payload = {
        title: f.title,
        slug: f.slug,
        subtitle: f.subtitle,
        description: f.description,
        vertical: f.vertical,
        icon: f.icon,
        color: f.color,
        tint: f.tint,
        difficulty: f.difficulty,
        duration: f.duration,
        skillsCount: f.skillsCount,
        labsCount: f.labsCount,
        xpReward: f.xpReward,
        careerOutcome: f.careerOutcome,
        skills: JSON.stringify(f.skills.split(",").map((s) => s.trim()).filter(Boolean)),
        courses: JSON.stringify(f.courses.split(",").map((s) => s.trim()).filter(Boolean)),
        order: f.order,
        published: f.published,
        featured: f.featured,
      }
      if (editing) {
        return api(`/api/admin/learning-paths/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) })
      } else {
        return api("/api/admin/learning-paths", { method: "POST", body: JSON.stringify(payload) })
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Learning path updated" : "Learning path created")
      qc.invalidateQueries({ queryKey: ["admin-learning-paths"] })
      qc.invalidateQueries({ queryKey: ["learning-paths"] })
      setEditing(null); setCreating(false); setForm(emptyForm())
    },
    onError: (e: any) => toast.error(e?.message || "Save failed"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/learning-paths/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Learning path deleted")
      qc.invalidateQueries({ queryKey: ["admin-learning-paths"] })
      qc.invalidateQueries({ queryKey: ["learning-paths"] })
      setDeleting(null)
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  })

  const startEdit = (p: LearningPathItem) => { setEditing(p); setForm(itemToForm(p)); setCreating(false) }
  const startCreate = () => { setCreating(true); setEditing(null); setForm(emptyForm()) }
  const closeDialog = () => { setEditing(null); setCreating(false); setForm(emptyForm()) }

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return }
    const finalForm = { ...form, slug: form.slug.trim() || slugify(form.title) }
    saveMutation.mutate(finalForm)
  }

  const isOpen = editing || creating

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Route className="h-6 w-6 text-violet-400" /> Learning Paths Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and publish curated learning paths across cyber, AI, and cloud.</p>
        </div>
        <Button onClick={startCreate} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> New Learning Path
        </Button>
      </div>

      {/* Learning paths list */}
      <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Route className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No learning paths yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Click “New Learning Path” to create your first one.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {paths.map((p) => (
              <div key={p.id} className="p-4 hover:bg-violet-500/[0.03] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", p.tint || "bg-violet-500/10")}>
                      <Route className={cn("h-5 w-5", p.color || "text-violet-300")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-medium text-sm truncate">{p.title}</span>
                        <Badge variant="outline" className="text-[9px]">{p.vertical}</Badge>
                        <Badge variant="outline" className={cn("text-[9px]", DIFFICULTY_STYLES[p.difficulty] || "text-muted-foreground")}>{p.difficulty}</Badge>
                        {p.featured && <Badge variant="outline" className="text-[9px] text-violet-300 border-violet-500/30"><Star className="h-2.5 w-2.5 mr-0.5" /> Featured</Badge>}
                        {!p.published && <Badge variant="outline" className="text-[9px] text-amber-300 border-amber-500/30"><EyeOff className="h-2.5 w-2.5 mr-0.5" /> Unpublished</Badge>}
                      </div>
                      {p.subtitle && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{p.subtitle}</p>}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.duration}</span>
                        <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3" />{p.skillsCount} skills</span>
                        <span className="inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" />{p.labsCount} labs</span>
                        <span className="inline-flex items-center gap-1"><Trophy className="h-3 w-3" />{p.xpReward.toLocaleString()} XP</span>
                        <span className="font-mono">/{p.slug}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => setDeleting(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
              <DialogTitle>{editing ? "Edit Learning Path" : "Create New Learning Path"}</DialogTitle>
              <DialogDescription>{editing ? `Editing: ${editing.title}` : "Create a curated learning path with skills, labs, and XP rewards."}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Title + slug */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="e.g. SOC Analyst Bootcamp" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Slug *</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="soc-analyst-bootcamp" className="font-mono text-sm" />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <Label className="text-xs font-medium">Subtitle</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="One-line tagline shown on the path card" />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-medium">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Full description of the learning path" className="resize-none" />
              </div>

              {/* Difficulty + vertical */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Vertical</Label>
                  <Select value={form.vertical} onValueChange={(v) => setForm({ ...form, vertical: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VERTICALS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Icon + color + tint */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Icon (Lucide name)</Label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Route" className="font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Color class</Label>
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="text-violet-300" className="font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Tint class</Label>
                  <Input value={form.tint} onChange={(e) => setForm({ ...form, tint: e.target.value })} placeholder="bg-violet-500/10" className="font-mono text-xs" />
                </div>
              </div>

              {/* Duration + skillsCount + labsCount */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="12 weeks" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Skills count</Label>
                  <Input type="number" value={form.skillsCount} onChange={(e) => setForm({ ...form, skillsCount: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Labs count</Label>
                  <Input type="number" value={form.labsCount} onChange={(e) => setForm({ ...form, labsCount: Number(e.target.value) })} />
                </div>
              </div>

              {/* xpReward + careerOutcome */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">XP Reward</Label>
                  <Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Career Outcome</Label>
                  <Input value={form.careerOutcome} onChange={(e) => setForm({ ...form, careerOutcome: e.target.value })} placeholder="e.g. Junior SOC Analyst" />
                </div>
              </div>

              {/* Skills (comma-separated) */}
              <div>
                <Label className="text-xs font-medium">Skills (comma-separated)</Label>
                <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="SIEM, Threat Hunting, Incident Response" />
                <p className="text-[10px] text-muted-foreground mt-1">Stored as a JSON array. e.g. <code className="font-mono">["SIEM","Threat Hunting"]</code></p>
              </div>

              {/* Courses (comma-separated) */}
              <div>
                <Label className="text-xs font-medium">Courses (comma-separated IDs)</Label>
                <Input value={form.courses} onChange={(e) => setForm({ ...form, courses: e.target.value })} placeholder="course-uid-1, course-uid-2" />
                <p className="text-[10px] text-muted-foreground mt-1">Stored as a JSON array of course IDs.</p>
              </div>

              {/* Checkboxes + order */}
              <div className="flex items-center gap-6 pt-2 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v === true })} />
                  <span className="text-xs">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v === true })} />
                  <span className="text-xs">Published</span>
                </label>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Order</Label>
                  <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-20" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Save Changes" : "Create Path"}
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
              <AlertDialogTitle>Delete learning path?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete “{deleting.title}”. This cannot be undone.</AlertDialogDescription>
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
