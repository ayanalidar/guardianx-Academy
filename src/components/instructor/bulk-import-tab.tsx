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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  Upload,
  FileSpreadsheet,
  Plus,
  Trash2,
  Eye,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  UserPlus,
  Mail,
  KeyRound,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================
interface InstructorCourse {
  id: string
  title: string
  shortName: string
}

interface PreviewRow {
  name: string
  email: string
  title: string
  valid: boolean
  error?: string
}

interface ImportResult {
  email: string
  status: string
  tempPassword?: string
  error?: string
}

interface ImportSummary {
  created: number
  enrolled: number
  skipped: number
  results: ImportResult[]
}

// ============================================================================
// Helpers
// ============================================================================
const CSV_PLACEHOLDER = `name,email,title
Alice Johnson,alice@example.com,CEH Student
Bob Smith,bob@example.com,Network Analyst
Carol Lee,carol@example.com,Security Intern`

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function downloadTemplateCsv() {
  const blob = new Blob([CSV_PLACEHOLDER], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "guardianx-students-template.csv"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.success("Template downloaded")
}

// ============================================================================
// Main Tab
// ============================================================================
export function InstructorBulkImportTab() {
  const [courseId, setCourseId] = React.useState("")
  const [mode, setMode] = React.useState<"csv" | "manual">("csv")
  const [csvText, setCsvText] = React.useState("")
  const [manualRows, setManualRows] = React.useState<Array<{ name: string; email: string; title: string }>>([
    { name: "", email: "", title: "" },
  ])
  const [preview, setPreview] = React.useState<PreviewRow[] | null>(null)
  const [results, setResults] = React.useState<ImportSummary | null>(null)

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ courses: InstructorCourse[] }>({
    queryKey: ["instructor", "courses", "list"],
    queryFn: () => api("/api/instructor/courses"),
  })
  const courses = coursesData?.courses ?? []

  React.useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].id)
  }, [courses, courseId])

  function reset() {
    setPreview(null)
    setResults(null)
    setCsvText("")
    setManualRows([{ name: "", email: "", title: "" }])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-400" />
            Bulk Student Import
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enroll multiple students into a course at once. New accounts get a temp password emailed.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={downloadTemplateCsv}>
          <Download className="h-4 w-4 mr-1.5" /> Template CSV
        </Button>
      </div>

      {/* Course picker */}
      <Card className="p-4 holo-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="bi-course" className="text-xs uppercase tracking-wider text-muted-foreground">Target Course</Label>
            {coursesLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select value={courseId} onValueChange={(v) => { setCourseId(v); reset() }}>
                <SelectTrigger id="bi-course">
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
          <div className="text-xs text-muted-foreground bg-muted/20 border border-border rounded-md p-2">
            Up to <span className="font-mono text-emerald-400">200</span> students per import.
          </div>
        </div>
      </Card>

      {!courseId ? (
        <EmptyState icon={Upload} title="No course selected" description="Pick a course to import students into." />
      ) : results ? (
        <ImportResults
          summary={results}
          onReset={() => {
            reset()
          }}
        />
      ) : (
        <>
          {/* Mode tabs */}
          <Tabs value={mode} onValueChange={(v) => { setMode(v as "csv" | "manual"); setPreview(null) }}>
            <TabsList className="grid grid-cols-2 w-full max-w-xs">
              <TabsTrigger value="csv">
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Paste CSV
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Manual Entry
              </TabsTrigger>
            </TabsList>
            <TabsContent value="csv" className="mt-3">
              <CsvInput
                csvText={csvText}
                setCsvText={setCsvText}
                courseId={courseId}
                preview={preview}
                setPreview={setPreview}
              />
            </TabsContent>
            <TabsContent value="manual" className="mt-3">
              <ManualInput
                rows={manualRows}
                setRows={setManualRows}
                preview={preview}
                setPreview={setPreview}
              />
            </TabsContent>
          </Tabs>

          {/* Preview */}
          {preview && (
            <PreviewTable rows={preview} />
          )}

          {/* Import action */}
          {preview && preview.some((r) => r.valid) && (
            <ImportAction
              courseId={courseId}
              mode={mode}
              csvText={csvText}
              manualRows={manualRows}
              onImported={(summary) => {
                setResults(summary)
                setPreview(null)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

// ============================================================================
// CSV Input
// ============================================================================
function CsvInput({
  csvText,
  setCsvText,
  courseId,
  preview,
  setPreview,
}: {
  csvText: string
  setCsvText: (v: string) => void
  courseId: string
  preview: PreviewRow[] | null
  setPreview: (v: PreviewRow[] | null) => void
}) {
  const previewMutation = useMutation({
    mutationFn: (csv: string) =>
      api<{ rows: PreviewRow[]; totalRows: number; validRows: number }>(
        "/api/instructor/bulk-import/preview",
        { method: "POST", body: JSON.stringify({ csv }) }
      ),
    onSuccess: (r) => {
      setPreview(r.rows)
      toast.success(`Preview ready - ${r.validRows}/${r.totalRows} valid rows`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function handlePreview() {
    if (!csvText.trim()) {
      toast.error("Paste some CSV first")
      return
    }
    setPreview(null)
    previewMutation.mutate(csvText)
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="bi-csv" className="text-xs uppercase tracking-wider text-muted-foreground">
          CSV Content
        </Label>
        <Button size="sm" variant="ghost" onClick={() => setCsvText(CSV_PLACEHOLDER)}>
          Insert sample
        </Button>
      </div>
      <Textarea
        id="bi-csv"
        value={csvText}
        onChange={(e) => { setCsvText(e.target.value); setPreview(null) }}
        placeholder={CSV_PLACEHOLDER}
        rows={10}
        className="font-mono text-xs"
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Header row required. Accepted columns: <code className="text-emerald-400">name</code>,{" "}
          <code className="text-emerald-400">email</code>, <code className="text-emerald-400">title</code>.
        </p>
        <Button onClick={handlePreview} disabled={previewMutation.isPending || !csvText.trim()}>
          <Eye className="h-4 w-4 mr-1.5" /> Preview
        </Button>
      </div>
    </Card>
  )
}

// ============================================================================
// Manual Entry
// ============================================================================
function ManualInput({
  rows,
  setRows,
  preview,
  setPreview,
}: {
  rows: Array<{ name: string; email: string; title: string }>
  setRows: React.Dispatch<React.SetStateAction<Array<{ name: string; email: string; title: string }>>>
  preview: PreviewRow[] | null
  setPreview: (v: PreviewRow[] | null) => void
}) {
  function addRow() {
    setRows((prev) => [...prev, { name: "", email: "", title: "" }])
    setPreview(null)
  }
  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx))
    setPreview(null)
  }
  function updateRow(idx: number, patch: Partial<{ name: string; email: string; title: string }>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
    setPreview(null)
  }

  function handlePreview() {
    const mapped: PreviewRow[] = rows.map((r) => {
      const name = (r.name || "").trim()
      const email = (r.email || "").trim()
      const title = (r.title || "").trim()
      let error: string | undefined
      if (!name) error = "Missing name"
      else if (name.length < 2) error = "Name too short"
      else if (!isValidEmail(email)) error = "Invalid email"
      return { name, email, title, valid: !error, error }
    })
    setPreview(mapped)
    const valid = mapped.filter((r) => r.valid).length
    toast.success(`Preview ready - ${valid}/${mapped.length} valid rows`)
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Students ({rows.length})
        </Label>
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
        </Button>
      </div>
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-12 sm:col-span-4">
              <Input
                placeholder="Full name"
                value={row.name}
                onChange={(e) => updateRow(idx, { name: e.target.value })}
              />
            </div>
            <div className="col-span-12 sm:col-span-4">
              <Input
                placeholder="email@example.com"
                value={row.email}
                onChange={(e) => updateRow(idx, { email: e.target.value })}
                type="email"
              />
            </div>
            <div className="col-span-9 sm:col-span-3">
              <Input
                placeholder="Title (optional)"
                value={row.title}
                onChange={(e) => updateRow(idx, { title: e.target.value })}
              />
            </div>
            <div className="col-span-3 sm:col-span-1 flex justify-end">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeRow(idx)}
                disabled={rows.length === 1}
                aria-label="Remove row"
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handlePreview} disabled={rows.length === 0}>
          <Eye className="h-4 w-4 mr-1.5" /> Preview
        </Button>
      </div>
    </Card>
  )
}

// ============================================================================
// Preview Table
// ============================================================================
function PreviewTable({ rows }: { rows: PreviewRow[] }) {
  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.length - validCount

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Eye className="h-4 w-4 text-emerald-400" />
          Preview ({rows.length} rows)
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" /> {validCount} valid
          </Badge>
          {invalidCount > 0 && (
            <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">
              <XCircle className="h-3 w-3 mr-1" /> {invalidCount} invalid
            </Badge>
          )}
        </div>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{r.name || <span className="text-muted-foreground/40">-</span>}</TableCell>
                <TableCell className="text-sm">{r.email || <span className="text-muted-foreground/40">-</span>}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.title || "-"}</TableCell>
                <TableCell className="text-right">
                  {r.valid ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Valid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20" title={r.error}>
                      <XCircle className="h-3 w-3 mr-1" /> {r.error}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

// ============================================================================
// Import Action
// ============================================================================
function ImportAction({
  courseId,
  mode,
  csvText,
  manualRows,
  onImported,
}: {
  courseId: string
  mode: "csv" | "manual"
  csvText: string
  manualRows: Array<{ name: string; email: string; title: string }>
  onImported: (s: ImportSummary) => void
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const importMutation = useMutation({
    mutationFn: () => {
      const body =
        mode === "csv"
          ? { courseId, csv: csvText }
          : { courseId, students: manualRows.filter((r) => r.name.trim() && r.email.trim()) }
      return api<ImportSummary>("/api/instructor/bulk-import", {
        method: "POST",
        body: JSON.stringify(body),
      })
    },
    onSuccess: (r) => {
      toast.success(`Import complete - ${r.created} created, ${r.enrolled} enrolled, ${r.skipped} skipped`)
      onImported(r)
      setConfirmOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <>
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/5 border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Ready to import</p>
            <p className="text-xs text-muted-foreground">
              New accounts will receive a temp password via email. Existing users will be enrolled silently.
            </p>
          </div>
        </div>
        <Button onClick={() => setConfirmOpen(true)} disabled={importMutation.isPending}>
          <Upload className="h-4 w-4 mr-1.5" />
          {importMutation.isPending ? "Importing..." : "Import Students"}
        </Button>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm bulk import?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create accounts (with temp passwords) and enroll them in the selected course. Emails will be sent automatically. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => importMutation.mutate()}>
              Confirm Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ============================================================================
// Import Results
// ============================================================================
function ImportResults({
  summary,
  onReset,
}: {
  summary: ImportSummary
  onReset: () => void
}) {
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null)

  function copyPassword(email: string, password: string) {
    navigator.clipboard.writeText(password).then(() => {
      setCopiedEmail(email)
      setTimeout(() => setCopiedEmail(null), 1500)
      toast.success("Temp password copied")
    }).catch(() => toast.error("Copy failed"))
  }

  function copyAllPasswords() {
    const lines = summary.results
      .filter((r) => r.tempPassword)
      .map((r) => `${r.email}\t${r.tempPassword}`)
      .join("\n")
    if (!lines) {
      toast.info("No temp passwords to copy")
      return
    }
    navigator.clipboard.writeText(lines).then(() => {
      toast.success(`Copied ${summary.created} temp password(s)`)
    }).catch(() => toast.error("Copy failed"))
  }

  const createdResults = summary.results.filter((r) => r.status === "created")
  const hasPasswords = createdResults.length > 0

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Created" value={summary.created} icon={UserPlus} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard label="Enrolled" value={summary.enrolled} icon={Users} color="text-cyan-400" bg="bg-cyan-500/10" />
        <StatCard label="Skipped" value={summary.skipped} icon={XCircle} color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      {/* Security warning */}
      {hasPasswords && (
        <Card className="p-3 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-start gap-2">
            <KeyRound className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">Temp passwords generated</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share these credentials with students via a secure channel (not email - they&apos;ve already received their own copy). Treat them as sensitive.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={copyAllPasswords}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
            </Button>
          </div>
        </Card>
      )}

      {/* Results table */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          Import Results
        </h3>
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Temp Password</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {r.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.tempPassword ? (
                      <span className="text-emerald-400">{r.tempPassword}</span>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                    {r.error && (
                      <span className="block text-[10px] text-rose-400">{r.error}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.tempPassword && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={() => copyPassword(r.email, r.tempPassword!)}
                      >
                        {copiedEmail === r.email ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onReset} variant="outline">
          <Plus className="h-4 w-4 mr-1.5" /> New Import
        </Button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    created: { label: "Created", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    exists: { label: "Already exists", cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    skipped: { label: "Skipped", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    error: { label: "Error", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  }
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" }
  return (
    <Badge variant="outline" className={cn("text-[10px] capitalize", m.cls)}>
      {m.label}
    </Badge>
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
  value: number
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
