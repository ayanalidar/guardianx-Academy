"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
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
  Briefcase, Plus, Pencil, Trash2, Loader2,
  Building2, MapPin, Users, Globe,
} from "lucide-react"
import { toast } from "sonner"

interface PostedBy {
  id: string
  name: string | null
  email: string | null
}

interface JobItem {
  id: string
  title: string
  company: string
  companyLogo: string | null
  location: string
  remote: boolean
  type: string
  salary: string
  description: string
  requirements: string
  requiredCerts: string   // JSON array string
  requiredSkills: string  // JSON array string
  postedById: string
  postedBy: PostedBy | null
  status: string          // active | closed | draft
  applicationCount: number
  createdAt: string
}

const JOB_TYPES = ["full-time", "part-time", "contract", "internship"]
const JOB_STATUSES = ["active", "closed", "draft"]

/** Parse a stored JSON-array string back to a JS array (defensive). */
function parseJsonArray<T = string>(raw: string | undefined | null): T[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

/** Render a JSON-array string as a comma-separated text for editing. */
function jsonArrayToText(raw: string | undefined | null): string {
  const arr = parseJsonArray(raw)
  return arr.join(", ")
}

function emptyForm(): Partial<JobItem> {
  return {
    title: "",
    company: "",
    companyLogo: "",
    location: "",
    remote: false,
    type: "full-time",
    salary: "",
    description: "",
    requirements: "",
    requiredCerts: "",
    requiredSkills: "",
    status: "active",
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "text-emerald-300 border-emerald-500/30"
    case "closed":
      return "text-muted-foreground"
    case "draft":
      return "text-amber-300 border-amber-500/30"
    default:
      return "text-muted-foreground"
  }
}

function typeLabel(t: string): string {
  return t
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("-")
}

export function AdminJobsView() {
  const qc = useQueryClient()
  const [editing, setEditing] = React.useState<JobItem | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleting, setDeleting] = React.useState<JobItem | null>(null)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [form, setForm] = React.useState<Partial<JobItem>>(emptyForm())

  const { data, isLoading } = useQuery<{ jobs: JobItem[] }>({
    queryKey: ["admin-jobs"],
    queryFn: () => api("/api/admin/jobs"),
  })

  const jobs = data?.jobs ?? []

  // Search + status filter (client-side, list is small)
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.type.toLowerCase().includes(q)
      )
    })
  }, [jobs, search, statusFilter])

  // Counts for the stats strip
  const stats = React.useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter((j) => j.status === "active").length,
      closed: jobs.filter((j) => j.status === "closed").length,
      draft: jobs.filter((j) => j.status === "draft").length,
      applications: jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0),
    }
  }, [jobs])

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<JobItem>) => {
      if (editing) {
        return api(`/api/admin/jobs/${editing.id}`, { method: "PATCH", body: JSON.stringify(data) })
      } else {
        return api("/api/admin/jobs", { method: "POST", body: JSON.stringify(data) })
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Job updated" : "Job created")
      qc.invalidateQueries({ queryKey: ["admin-jobs"] })
      qc.invalidateQueries({ queryKey: ["jobs"] })
      setEditing(null); setCreating(false); setForm(emptyForm())
    },
    onError: (e: any) => toast.error(e?.message || "Save failed"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/jobs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Job deleted")
      qc.invalidateQueries({ queryKey: ["admin-jobs"] })
      qc.invalidateQueries({ queryKey: ["jobs"] })
      setDeleting(null)
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  })

  const startEdit = (j: JobItem) => {
    setEditing(j)
    // Translate the JSON-array fields back to comma-separated text for the editor
    setForm({
      ...j,
      requiredCerts: jsonArrayToText(j.requiredCerts),
      requiredSkills: jsonArrayToText(j.requiredSkills),
    })
    setCreating(false)
  }
  const startCreate = () => { setCreating(true); setEditing(null); setForm(emptyForm()) }
  const closeDialog = () => { setEditing(null); setCreating(false); setForm(emptyForm()) }

  const handleSave = () => {
    if (!form.title?.trim()) { toast.error("Title is required"); return }
    if (!form.company?.trim()) { toast.error("Company is required"); return }
    if (!form.location?.trim()) { toast.error("Location is required"); return }
    saveMutation.mutate(form)
  }

  const isOpen = editing || creating

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-violet-400" /> Jobs Board Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Post cyber security roles, manage applications, and curate the public job board.
          </p>
        </div>
        <Button onClick={startCreate} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> New Job
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card className="p-4 bg-card/40 border-border/60">
          <div className="text-xs text-muted-foreground">Total Jobs</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-card/40 border-border/60">
          <div className="text-xs text-muted-foreground">Active</div>
          <div className="text-2xl font-bold mt-1 text-emerald-300">{stats.active}</div>
        </Card>
        <Card className="p-4 bg-card/40 border-border/60">
          <div className="text-xs text-muted-foreground">Drafts</div>
          <div className="text-2xl font-bold mt-1 text-amber-300">{stats.draft}</div>
        </Card>
        <Card className="p-4 bg-card/40 border-border/60">
          <div className="text-xs text-muted-foreground">Closed</div>
          <div className="text-2xl font-bold mt-1 text-muted-foreground">{stats.closed}</div>
        </Card>
        <Card className="p-4 bg-card/40 border-border/60 col-span-2 sm:col-span-1">
          <div className="text-xs text-muted-foreground">Applications</div>
          <div className="text-2xl font-bold mt-1 text-violet-300 flex items-center gap-1.5">
            <Users className="h-5 w-5" /> {stats.applications}
          </div>
        </Card>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, company, location, type..."
          className="sm:max-w-sm bg-card/40 border-border/60"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-card/40 border-border/60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{typeLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs list */}
      <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {jobs.length === 0 ? "No jobs yet" : "No jobs match your filters"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {jobs.length === 0 ? "Click \"New Job\" to post the first role." : "Try clearing the search or status filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 max-h-[70vh] overflow-y-auto custom-scroll">
            {filteredJobs.map((j) => (
              <div key={j.id} className="p-4 hover:bg-violet-500/[0.03] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Company logo or fallback icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-500/10 text-violet-300 shrink-0 overflow-hidden">
                      {j.companyLogo ? (
                        <img src={j.companyLogo} alt={j.company} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-medium text-sm truncate">{j.title}</span>
                        <Badge variant="outline" className="text-[9px]">{typeLabel(j.type)}</Badge>
                        <Badge variant="outline" className={cn("text-[9px]", statusBadgeClass(j.status))}>
                          {j.status}
                        </Badge>
                        {j.remote && (
                          <Badge variant="outline" className="text-[9px] text-cyan-300 border-cyan-500/30">
                            <Globe className="h-2.5 w-2.5 mr-0.5" /> Remote
                          </Badge>
                        )}
                        {j.applicationCount > 0 && (
                          <Badge variant="outline" className="text-[9px] text-violet-300 border-violet-500/30">
                            <Users className="h-2.5 w-2.5 mr-0.5" /> {j.applicationCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {j.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {j.location}
                        </span>
                        {j.salary && <span>· {j.salary}</span>}
                        {j.postedBy?.name && <span>· Posted by {j.postedBy.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(j)} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      onClick={() => setDeleting(j)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
              <DialogTitle>{editing ? "Edit Job" : "Create New Job"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? `Editing: ${editing.title} at ${editing.company}`
                  : "Post a new cyber security role to the public jobs board."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Title */}
              <div>
                <Label className="text-xs font-medium">Job Title *</Label>
                <Input
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior SOC Analyst"
                />
              </div>

              {/* Company + logo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Company *</Label>
                  <Input
                    value={form.company || ""}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="e.g. GuardianX Defense"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Company Logo URL (optional)</Label>
                  <Input
                    value={form.companyLogo || ""}
                    onChange={(e) => setForm({ ...form, companyLogo: e.target.value })}
                    placeholder="https://logo.url/company.png"
                  />
                </div>
              </div>

              {/* Location + remote */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Location *</Label>
                  <Input
                    value={form.location || ""}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Remote?</Label>
                  <label className="flex items-center gap-2 cursor-pointer h-9 mt-1">
                    <Checkbox
                      checked={form.remote}
                      onCheckedChange={(v) => setForm({ ...form, remote: v === true })}
                    />
                    <span className="text-xs">This is a fully remote role</span>
                  </label>
                </div>
              </div>

              {/* Type + status + salary */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {JOB_STATUSES.map((s) => <SelectItem key={s} value={s}>{typeLabel(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Salary</Label>
                  <Input
                    value={form.salary || ""}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="₹8-15 LPA"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Full job description — responsibilities, what the day-to-day looks like, team context..."
                  className="resize-none"
                />
              </div>

              {/* Requirements */}
              <div>
                <Label className="text-xs font-medium">Requirements</Label>
                <Textarea
                  value={form.requirements || ""}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  rows={3}
                  placeholder="Years of experience, education, certifications, soft skills..."
                  className="resize-none"
                />
              </div>

              {/* Required Skills (comma-separated) */}
              <div>
                <Label className="text-xs font-medium">Required Skills (comma-separated)</Label>
                <Input
                  value={form.requiredSkills || ""}
                  onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                  placeholder="SIEM, Splunk, Incident Response, Python"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Stored as a JSON array. Separate multiple skills with commas.
                </p>
              </div>

              {/* Required Certifications (comma-separated) */}
              <div>
                <Label className="text-xs font-medium">Required Certifications (comma-separated)</Label>
                <Input
                  value={form.requiredCerts || ""}
                  onChange={(e) => setForm({ ...form, requiredCerts: e.target.value })}
                  placeholder="CEH, OSCP, Security+, CISSP"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Stored as a JSON array. Separate multiple certs with commas.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-gradient-to-r from-violet-600 to-violet-500 text-white"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Save Changes" : "Create Job"}
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
              <AlertDialogTitle>Delete job?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{deleting.title}" at {deleting.company}.
                {deleting.applicationCount > 0 && (
                  <> This job has {deleting.applicationCount} application(s) which will also be deleted.</>
                )}
                {" "}This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleting.id)}
                className="bg-rose-600 hover:bg-rose-500"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
