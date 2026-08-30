"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare, Send, Reply, Pin, Sparkles, ArrowRight, Plus,
  Users, Activity, Hash,
} from "lucide-react"
import { toast } from "sonner"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"
import {
  ScrollReveal, TextReveal, Stagger, StaggerItem, CursorGlow,
  MagneticButton, Counter,
} from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"

interface Discussion {
  id: string; title: string; content: string; pinned: boolean; createdAt: string
  user: { id: string; name: string; avatar: string | null }
  replies: { id: string; content: string; createdAt: string; user: { id: string; name: string; avatar: string | null } }[]
}

export function CommunityView() {
  const { navigate } = useAppStore()
  const qc = useQueryClient()
  const [courseId, setCourseId] = React.useState("")
  const [newTitle, setNewTitle] = React.useState("")
  const [newContent, setNewContent] = React.useState("")
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  const [replyText, setReplyText] = React.useState("")
  const [showComposer, setShowComposer] = React.useState(false)

  const { data: coursesData } = useQuery<{ courses: any[] }>({
    queryKey: ["courses", "all"],
    queryFn: () => api("/api/courses"),
  })
  const courses = coursesData?.courses ?? []
  React.useEffect(() => { if (!courseId && courses[0]) setCourseId(courses[0].id) }, [courses, courseId])

  const { data, isLoading } = useQuery<{ discussions: Discussion[] }>({
    queryKey: ["discussions", courseId],
    queryFn: () => api(`/api/discussions?courseId=${courseId}`),
    enabled: !!courseId,
  })

  const createMutation = useMutation({
    mutationFn: (body: any) => api("/api/discussions", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discussions", courseId] })
      setNewTitle(""); setNewContent(""); setShowComposer(false)
      toast.success("Discussion posted")
    },
  })
  const replyMutation = useMutation({
    mutationFn: (body: any) => api("/api/discussions", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discussions", courseId] })
      setReplyTo(null); setReplyText("")
      toast.success("Reply posted")
    },
  })

  const discussions = data?.discussions ?? []
  const activeCourse = courses.find((c) => c.id === courseId)

  // Sort: pinned first, then by createdAt desc
  const sortedDiscussions = [...discussions].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Aggregate stats
  const totalReplies = discussions.reduce((sum, d) => sum + d.replies.length, 0)
  const uniqueAuthors = new Set(discussions.map((d) => d.user.id)).size
  const lastActivity = discussions.length > 0
    ? discussions.reduce((latest, d) => {
        const times = [new Date(d.createdAt), ...d.replies.map((r) => new Date(r.createdAt))]
        const max = new Date(Math.max(...times.map((t) => t.getTime())))
        return max > latest ? max : latest
      }, new Date(0))
    : null

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-violet-600/6 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ====================================================
            HEADER — oversized headline
            ==================================================== */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-dot" />
            <span className="text-[10px] font-mono text-cyan-300/80 tracking-[0.3em]">
              DISCUSSIONS · {activeCourse?.shortName?.toUpperCase() ?? "—"}
            </span>
          </div>
        </ScrollReveal>

        <div className="flex items-end justify-between gap-6 flex-wrap mb-12">
          <div className="flex-1 min-w-0">
            <ScrollReveal delay={0.1}>
              <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.04em] mb-4 text-balance">
                <TextReveal text="Community." />
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-muted-foreground max-w-xl text-base lg:text-lg leading-relaxed">
                Ask questions. Share insights. Learn together with defenders worldwide.
              </p>
            </ScrollReveal>
          </div>

          {/* Create discussion CTA — premium */}
          <ScrollReveal delay={0.4}>
            <MagneticButton strength={0.3}>
              <Button
                onClick={() => setShowComposer((v) => !v)}
                className="bg-violet-600 hover:bg-violet-500 btn-premium px-6 py-5 shadow-[0_8px_30px_-8px] shadow-violet-500/30"
              >
                <Plus className="h-4 w-4 mr-2" /> New Discussion
              </Button>
            </MagneticButton>
          </ScrollReveal>
        </div>

        {/* ====================================================
            STATS STRIP — border-left editorial
            ==================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            { label: "Discussions", value: discussions.length, accent: "border-violet-500/50", color: "text-violet-300", icon: MessageSquare },
            { label: "Replies", value: totalReplies, accent: "border-cyan-500/50", color: "text-cyan-300", icon: Reply },
            { label: "Contributors", value: uniqueAuthors, accent: "border-emerald-500/50", color: "text-emerald-300", icon: Users },
            { label: "Last activity", value: 0, custom: lastActivity ? timeAgo(lastActivity) : "—", accent: "border-amber-500/50", color: "text-amber-300", icon: Activity },
          ].map((s, i) => (
            <ScrollReveal key={s.label} delay={0.4 + i * 0.08}>
              <div className={cn("border-l pl-5", s.accent)}>
                <s.icon className={cn("h-4 w-4 mb-3", s.color)} />
                <div className="text-4xl lg:text-5xl font-bold tracking-[-0.03em] mb-1">
                  {s.custom ? s.custom : <Counter value={s.value} />}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Course selector — premium pill row */}
        <ScrollReveal>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em]">FILTER BY COURSE</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCourseId(c.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300",
                    courseId === c.id
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-200 shadow-[0_0_20px_-4px] shadow-violet-500/30"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border",
                  )}
                >
                  {c.shortName}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ====================================================
            COMPOSER — collapsible premium panel
            ==================================================== */}
        {showComposer && (
          <ScrollReveal>
            <div className="relative mb-10 overflow-hidden rounded-2xl border border-violet-500/30 bg-card/40 backdrop-blur-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                  <h3 className="text-sm font-semibold tracking-tight">Start a discussion</h3>
                  <span className="text-[10px] text-muted-foreground font-mono ml-auto">in {activeCourse?.shortName}</span>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Discussion title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-background/40"
                  />
                  <Textarea
                    placeholder="Share your question or insight..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="min-h-[120px] bg-background/40 resize-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {newTitle.length}/120 · {newContent.length}/2000
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>Cancel</Button>
                      <Button
                        size="sm"
                        disabled={!newTitle.trim() || !newContent.trim() || createMutation.isPending || !courseId}
                        onClick={() => createMutation.mutate({ courseId, title: newTitle, content: newContent })}
                        className="bg-violet-600 hover:bg-violet-500 btn-premium"
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" /> Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ====================================================
            DISCUSSIONS — editorial list (NOT cards)
            ==================================================== */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : sortedDiscussions.length === 0 ? (
          <EmptyCommunityState onCompose={() => setShowComposer(true)} />
        ) : (
          <div className="space-y-3">
            <Stagger staggerChildren={0.08}>
              {sortedDiscussions.map((d) => (
                <StaggerItem key={d.id}>
                  <DiscussionRow
                    discussion={d}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onReply={() => replyText.trim() && replyMutation.mutate({ replyTo: d.id, content: replyText })}
                    isPending={replyMutation.isPending}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   DiscussionRow — editorial composition
   ============================================================ */
function DiscussionRow({
  discussion: d, replyTo, setReplyTo, replyText, setReplyText, onReply, isPending,
}: {
  discussion: Discussion
  replyTo: string | null
  setReplyTo: (v: string | null) => void
  replyText: string
  setReplyText: (v: string) => void
  onReply: () => void
  isPending: boolean
}) {
  const authorInitials = d.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const lastReplyAt = d.replies.length > 0
    ? new Date(d.replies[d.replies.length - 1].createdAt)
    : new Date(d.createdAt)

  return (
    <CursorGlow color="oklch(0.6 0.2 295 / 0.05)" className="group">
      <article className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/20 transition-all duration-300",
        d.pinned
          ? "border-amber-500/30 bg-amber-500/[0.03]"
          : "border-border/60 hover:border-violet-500/30 hover:bg-card/30",
      )}>
        {d.pinned && (
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500/60 to-amber-500/20" />
        )}

        <div className="p-5 lg:p-6">
          {/* Top meta row */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className={cn(
                  "text-[11px] font-mono font-bold",
                  d.pinned ? "bg-amber-500/10 text-amber-300" : "bg-cyan-500/10 text-cyan-300",
                )}>
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{d.user.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {new Date(d.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {d.pinned && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-mono text-amber-300 tracking-[0.15em]">
                  <Pin className="h-2.5 w-2.5" fill="currentColor" /> PINNED
                </span>
              )}
              <span className="text-[10px] text-muted-foreground font-mono tracking-[0.15em]">
                {d.replies.length} {d.replies.length === 1 ? "REPLY" : "REPLIES"}
              </span>
            </div>
          </div>

          {/* Title + content */}
          <h3 className="text-lg lg:text-xl font-bold tracking-tight mb-2 group-hover:text-violet-200 transition-colors">
            {d.title}
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 leading-relaxed mb-4">
            {d.content}
          </p>

          {/* Replies inline */}
          {d.replies.length > 0 && (
            <div className="ml-4 pl-4 border-l-2 border-border/60 space-y-3 mb-4">
              {d.replies.slice(-2).map((r) => (
                <div key={r.id} className="flex items-start gap-2.5">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-mono">
                      {r.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium">{r.user.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {timeAgo(new Date(r.createdAt))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.content}</p>
                  </div>
                </div>
              ))}
              {d.replies.length > 2 && (
                <button
                  onClick={() => setReplyTo(replyTo === d.id ? null : d.id)}
                  className="text-[10px] text-violet-300 hover:text-violet-200 font-mono tracking-[0.15em] ml-9"
                >
                  + {d.replies.length - 2} MORE REPLIES
                </button>
              )}
            </div>
          )}

          {/* Bottom action row */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                LAST ACTIVITY {timeAgo(lastReplyAt).toUpperCase()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-violet-200"
              onClick={() => setReplyTo(replyTo === d.id ? null : d.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              {replyTo === d.id ? "Cancel" : "Reply"}
              {d.replies.length > 0 && ` (${d.replies.length})`}
            </Button>
          </div>

          {/* Reply composer */}
          {replyTo === d.id && (
            <div className="mt-4 pt-4 border-t border-border/40 flex gap-2">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && replyText.trim() && !isPending) {
                    e.preventDefault()
                    onReply()
                  }
                }}
                className="bg-background/40"
                autoFocus
              />
              <Button
                size="sm"
                onClick={onReply}
                disabled={!replyText.trim() || isPending}
                className="bg-violet-600 hover:bg-violet-500 btn-premium"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </article>
    </CursorGlow>
  )
}

/* ============================================================
   Empty state — premium
   ============================================================ */
function EmptyCommunityState({ onCompose }: { onCompose: () => void }) {
  return (
    <ScrollReveal>
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-card/20 p-16 lg:p-24 text-center">
        <div className="absolute inset-0 bg-grid opacity-8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/6 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <NetworkVisualization variant="section" className="w-full h-full" />
        </div>
        <div className="relative z-10 max-w-md mx-auto">
          <div className="inline-flex p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 mb-6">
            <MessageSquare className="h-10 w-10 text-cyan-300" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-mono text-cyan-300/80 tracking-[0.3em] mb-3">SILENCE HERE</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-3 text-balance">
            No discussions yet.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Be the first to spark a conversation. Ask a question, share an insight, or start a debate.
          </p>
          <MagneticButton strength={0.3}>
            <Button
              onClick={onCompose}
              className="bg-violet-600 hover:bg-violet-500 btn-premium px-6 py-5"
            >
              <Plus className="h-4 w-4 mr-2" /> Start the conversation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </MagneticButton>
        </div>
      </div>
    </ScrollReveal>
  )
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (day > 0) return `${day}d ago`
  if (hr > 0) return `${hr}h ago`
  if (min > 0) return `${min}m ago`
  return "just now"
}
