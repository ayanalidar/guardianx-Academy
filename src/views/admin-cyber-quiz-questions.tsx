"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Brain, Loader2, Plus, Pencil, Trash2, Search, ArrowLeft,
  CheckCircle2, AlertCircle, ListChecks,
} from "lucide-react"
import { toast } from "sonner"

const CATEGORIES = ["Phishing", "Passwords", "Social Engineering", "Web Safety", "Mobile Security", "Data Privacy", "Malware", "Wi-Fi Safety"]
const DIFFICULTIES = ["Easy", "Hard", "Advanced"]
const ANSWERS = ["A", "B", "C", "D"]

interface Question {
  id: string
  category: string
  difficulty: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string | null
  active: boolean
}

export function AdminCyberQuizQuestionsView() {
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [difficultyFilter, setDifficultyFilter] = React.useState("ALL")
  const [search, setSearch] = React.useState("")
  const [editing, setEditing] = React.useState<Question | null>(null)
  const [creating, setCreating] = React.useState(false)
  const queryClient = useQueryClient()

  const queryKey = React.useMemo(
    () => ["admin-cyber-quiz-questions", { categoryFilter, difficultyFilter, search }],
    [categoryFilter, difficultyFilter, search]
  )

  const { data, isLoading } = useQuery<{ questions: Question[]; count: number }>({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams()
      if (categoryFilter !== "ALL") params.set("category", categoryFilter)
      if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter)
      if (search.trim()) params.set("q", search.trim())
      return api(`/api/admin/cyber-quiz/questions?${params.toString()}`)
    },
  })

  const questions = data?.questions ?? []

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-violet-400" />
          <h1 className="text-2xl font-bold tracking-tight">Quiz Questions</h1>
        </div>
        <p className="text-sm text-muted-foreground">Manage the 100-question cyber security awareness quiz bank.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={data?.count ?? 0} />
        <StatCard label="Easy" value={questions.filter((q) => q.difficulty === "Easy").length} color="text-emerald-300" />
        <StatCard label="Hard" value={questions.filter((q) => q.difficulty === "Hard").length} color="text-violet-300" />
        <StatCard label="Advanced" value={questions.filter((q) => q.difficulty === "Advanced").length} color="text-amber-300" />
      </div>

      {/* Filters + create */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All levels</SelectItem>
            {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setCreating(true)} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> New
        </Button>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListChecks className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No questions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 max-h-[700px] overflow-y-auto custom-scrollbar">
            {questions.map((q) => (
              <div key={q.id} className="p-4 hover:bg-violet-500/[0.03] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="secondary" className="text-[9px]">{q.category}</Badge>
                      <Badge variant="outline" className="text-[9px]">{q.difficulty}</Badge>
                      <Badge variant="outline" className="text-[9px] font-mono">Ans: {q.correctAnswer}</Badge>
                      {!q.active && <Badge variant="outline" className="text-[9px] text-rose-300 border-rose-500/30">Inactive</Badge>}
                    </div>
                    <div className="text-sm font-medium mb-1 line-clamp-2">{q.question}</div>
                    <div className="text-[10px] text-muted-foreground">
                      A: {q.optionA.slice(0, 50)}{q.optionA.length > 50 ? "…" : ""} · B: {q.optionB.slice(0, 50)}{q.optionB.length > 50 ? "…" : ""} · C: {q.optionC.slice(0, 50)}{q.optionC.length > 50 ? "…" : ""} · D: {q.optionD.slice(0, 50)}{q.optionD.length > 50 ? "…" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(q)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      {(editing || creating) && (
        <QuestionDialog
          question={editing}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-cyber-quiz-questions"] })
            setEditing(null); setCreating(false)
          }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color = "text-foreground" }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
      <div className={cn("text-2xl font-bold tabular-nums", color)}>{value}</div>
    </div>
  )
}

function QuestionDialog({ question, isNew, onClose, onSaved }: { question: Question | null; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    category: question?.category || "Phishing",
    difficulty: question?.difficulty || "Easy",
    question: question?.question || "",
    optionA: question?.optionA || "",
    optionB: question?.optionB || "",
    optionC: question?.optionC || "",
    optionD: question?.optionD || "",
    correctAnswer: question?.correctAnswer || "A",
    explanation: question?.explanation || "",
    active: question?.active ?? true,
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      if (isNew) {
        await api("/api/admin/cyber-quiz/questions", { method: "POST", body: JSON.stringify(form) })
        toast.success("Question created")
      } else {
        await api(`/api/admin/cyber-quiz/questions/${question!.id}`, { method: "PATCH", body: JSON.stringify(form) })
        toast.success("Question updated")
      }
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!question) return
    if (!confirm("Delete this question? This cannot be undone.")) return
    try {
      await api(`/api/admin/cyber-quiz/questions/${question.id}`, { method: "DELETE" })
      toast.success("Question deleted")
      onSaved()
    } catch (e: any) {
      setError(e?.message || "Delete failed")
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Create question" : "Edit question"}</DialogTitle>
          <DialogDescription>{isNew ? "Add a new quiz question to the bank." : "Update the question, options, or correct answer."}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => update("difficulty", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Question</Label>
            <Textarea value={form.question} onChange={(e) => update("question", e.target.value)} rows={2} className="resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["A", "B", "C", "D"] as const).map((opt) => (
              <div key={opt}>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Option {opt}</Label>
                <Input value={(form as any)[`option${opt}`]} onChange={(e) => update(`option${opt}`, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Correct answer</Label>
              <Select value={form.correctAnswer} onValueChange={(v) => update("correctAnswer", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ANSWERS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Active</Label>
              <Select value={form.active ? "true" : "false"} onValueChange={(v) => update("active", v === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Explanation</Label>
            <Textarea value={form.explanation} onChange={(e) => update("explanation", e.target.value)} rows={2} className="resize-none" placeholder="Shown in review mode after submission" />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 p-3 text-sm flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between flex-row flex-wrap gap-2">
          <div>
            {!isNew && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {isNew ? "Create" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
