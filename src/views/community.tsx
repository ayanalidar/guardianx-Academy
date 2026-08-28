"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare, Send, Reply, Pin, Users, Sparkles, ChevronLeft,
} from "lucide-react"
import { toast } from "sonner"
import { useAppStore } from "@/store/app-store"

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discussions", courseId] }); setNewTitle(""); setNewContent(""); toast.success("Discussion posted") },
  })
  const replyMutation = useMutation({
    mutationFn: (body: any) => api("/api/discussions", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discussions", courseId] }); setReplyTo(null); setReplyText(""); toast.success("Reply posted") },
  })

  const discussions = data?.discussions ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-cyan-400" /> Community
        </h1>
        <p className="text-muted-foreground mt-1">Discuss courses, ask questions, and learn together.</p>
      </div>

      {/* Course selector */}
      <div className="flex flex-wrap gap-2">
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => setCourseId(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              courseId === c.id ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.shortName}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Discussions */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
          ) : discussions.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">No discussions yet</p>
              <p className="text-sm text-muted-foreground">Be the first to start a conversation!</p>
            </Card>
          ) : (
            discussions.map((d) => (
              <Card key={d.id} className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-xs">
                      {d.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{d.user.name}</span>
                      {d.pinned && <Pin className="h-3 w-3 text-amber-400" fill="currentColor" />}
                      <span className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{d.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{d.content}</p>

                    {d.replies.length > 0 && (
                      <div className="space-y-2 mb-3 pl-4 border-l-2 border-border">
                        {d.replies.map((r) => (
                          <div key={r.id} className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                                {r.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{r.user.name}</span>
                                <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setReplyTo(replyTo === d.id ? null : d.id)}>
                      <Reply className="h-3 w-3 mr-1" /> Reply {d.replies.length > 0 && `(${d.replies.length})`}
                    </Button>

                    {replyTo === d.id && (
                      <div className="mt-3 flex gap-2">
                        <Input
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && replyText.trim()) replyMutation.mutate({ replyTo: d.id, content: replyText }) }}
                        />
                        <Button size="sm" onClick={() => replyText.trim() && replyMutation.mutate({ replyTo: d.id, content: replyText })}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* New discussion */}
        <div className="space-y-4">
          <Card className="p-5 sticky top-20">
            <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm">
              <Sparkles className="h-4 w-4 text-emerald-400" /> Start a Discussion
            </h3>
            <div className="space-y-3">
              <Input placeholder="Discussion title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Textarea placeholder="Share your question or insight..." value={newContent} onChange={(e) => setNewContent(e.target.value)} className="min-h-[100px]" />
              <Button
                className="w-full"
                disabled={!newTitle.trim() || !newContent.trim() || createMutation.isPending || !courseId}
                onClick={() => createMutation.mutate({ courseId, title: newTitle, content: newContent })}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Post Discussion
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
