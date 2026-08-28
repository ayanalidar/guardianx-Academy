"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  StickyNote, Plus, Search, Trash2, Pin, PenLine, Save, X,
  BookOpen, Clock, Hash,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { NOTE_COLORS } from "@/lib/colors"

interface NoteItem {
  id: string; title: string; content: string; color: string; pinned: boolean
  lessonId: string | null; courseId: string | null; createdAt: string; updatedAt: string
  lesson?: { id: string; title: string; module: { course: { id: string; title: string; shortName: string } } } | null
}

export function MyNotesView() {
  const { navigate } = useAppStore()
  const qc = useQueryClient()
  const [q, setQ] = React.useState("")
  const [showEditor, setShowEditor] = React.useState(false)
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftContent, setDraftContent] = React.useState("")
  const [draftColor, setDraftColor] = React.useState("emerald")
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const { data, isLoading } = useQuery<{ notes: NoteItem[] }>({
    queryKey: ["notes", "all"],
    queryFn: () => api("/api/notes"),
  })

  const notes = (data?.notes ?? []).filter(
    (n) => !q || n.title.toLowerCase().includes(q.toLowerCase()) || n.content.toLowerCase().includes(q.toLowerCase())
  )

  const createMutation = useMutation({
    mutationFn: (body: any) => api("/api/notes", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] })
      qc.invalidateQueries({ queryKey: ["me"] })
      setShowEditor(false); setDraftTitle(""); setDraftContent("")
      toast.success("Note created")
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => api(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); setEditingId(null); toast.success("Note updated") },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/notes/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); qc.invalidateQueries({ queryKey: ["me"] }); toast.success("Note deleted") },
  })

  function startEdit(n: NoteItem) {
    setEditingId(n.id); setDraftTitle(n.title); setDraftContent(n.content); setDraftColor(n.color); setShowEditor(true)
  }
  function save() {
    if (!draftTitle.trim() && !draftContent.trim()) return
    if (editingId) updateMutation.mutate({ id: editingId, title: draftTitle || "Untitled", content: draftContent, color: draftColor })
    else createMutation.mutate({ title: draftTitle || "Untitled note", content: draftContent, color: draftColor })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <StickyNote className="h-7 w-7 text-amber-400" /> My Notes
          </h1>
          <p className="text-muted-foreground mt-1">All your study notes in one place — searchable & organized.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setDraftTitle(""); setDraftContent(""); setDraftColor("emerald"); setShowEditor(true) }}>
          <Plus className="h-4 w-4 mr-1.5" /> New Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search notes..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {/* Editor */}
      {showEditor && (
        <Card className="p-5 border-emerald-500/30 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <PenLine className="h-4 w-4 text-emerald-400" /> {editingId ? "Edit Note" : "New Note"}
            </h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowEditor(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <Input placeholder="Note title..." value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
            <Textarea placeholder="Write your note here. Markdown is supported in lessons..." value={draftContent} onChange={(e) => setDraftContent(e.target.value)} className="min-h-[120px]" />
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Color:</span>
                {NOTE_COLORS.slice(1).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDraftColor(c.id)}
                    className={cn("h-6 w-6 rounded-full border-2 transition-all", c.bg, c.border, draftColor === c.id ? "scale-125 ring-2 ring-offset-2 ring-offset-background ring-emerald-500/40" : "")}
                  />
                ))}
              </div>
              <Button size="sm" onClick={save} disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="h-3.5 w-3.5 mr-1" /> {editingId ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notes grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <StickyNote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No notes yet</p>
          <p className="text-sm text-muted-foreground">Create your first note or jot down insights while studying.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => {
            const col = NOTE_COLORS.find((c) => c.id === n.color) ?? NOTE_COLORS[0]
            return (
              <Card key={n.id} className={cn("p-4 flex flex-col group relative", col.bg, col.border, "border")}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm line-clamp-1 flex-1">{n.title}</h3>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => updateMutation.mutate({ id: n.id, pinned: !n.pinned })} className={cn("p-1 rounded hover:bg-background/50", n.pinned ? "text-amber-400" : "text-muted-foreground")}>
                      <Pin className="h-3 w-3" fill={n.pinned ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => startEdit(n)} className="p-1 rounded hover:bg-background/50 text-muted-foreground hover:text-emerald-400">
                      <PenLine className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(n.id)} className="p-1 rounded hover:bg-background/50 text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-5 flex-1">{n.content}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                  {n.lesson ? (
                    <button onClick={() => navigate({ name: "lesson", lessonId: n.lesson!.id, courseId: n.lesson!.module.course.id })} className="text-[10px] text-muted-foreground hover:text-emerald-400 flex items-center gap-1 min-w-0">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate">{n.lesson.module.course.shortName}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> General</span>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />{new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {n.pinned && <Pin className="absolute top-2 right-2 h-3 w-3 text-amber-400" fill="currentColor" />}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
