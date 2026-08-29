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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Send,
  Plus,
  ArrowLeft,
  Search,
  Mail,
  Users,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================
interface Contact {
  id: string
  name: string
  avatar: string | null
  title: string | null
  role: string
}

interface MessageThread {
  id: string
  other: Contact
  lastMessage: {
    id: string
    content: string
    senderId: string
    createdAt: string
    isMine: boolean
  } | null
  lastMessageAt: string
  unreadCount: number
}

interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  createdAt: string
  read: boolean
  isMine: boolean
}

// ============================================================================
// Helpers
// ============================================================================
function timeAgo(iso: string): string {
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return ""
  const diff = Date.now() - d
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d`
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatDay(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
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
export function InstructorMessagingTab() {
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null)
  const [newMessageOpen, setNewMessageOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [mobilePane, setMobilePane] = React.useState<"list" | "conversation">("list")

  const qc = useQueryClient()
  const { data: threadsData, isLoading } = useQuery<{ threads: MessageThread[] }>({
    queryKey: ["instructor", "message-threads"],
    queryFn: () => api("/api/messages/threads"),
    refetchInterval: 10_000,
  })
  const threads = threadsData?.threads ?? []
  const filtered = threads.filter((t) =>
    !search ||
    t.other.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.lastMessage?.content ?? "").toLowerCase().includes(search.toLowerCase())
  )
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null
  const totalUnread = threads.reduce((a, t) => a + t.unreadCount, 0)

  function openThread(id: string) {
    setActiveThreadId(id)
    setMobilePane("conversation")
    // Mark as read
    api(`/api/messages/threads/${id}/read`, { method: "POST" }).then(() => {
      qc.invalidateQueries({ queryKey: ["instructor", "message-threads"] })
    }).catch(() => {})
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            Messages
            {totalUnread > 0 && (
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                {totalUnread} unread
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Direct messages with students enrolled in your courses.
          </p>
        </div>
        <Button size="sm" onClick={() => setNewMessageOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Message
        </Button>
      </div>

      {/* Two-pane layout */}
      <Card className="overflow-hidden holo-border">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[600px]">
          {/* Thread list */}
          <div
            className={cn(
              "border-r border-border flex flex-col bg-card/30",
              mobilePane === "conversation" && "hidden md:flex"
            )}
          >
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-2 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {search ? "No matching conversations." : "No messages yet."}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((t) => (
                    <ThreadListItem
                      key={t.id}
                      thread={t}
                      active={t.id === activeThreadId}
                      onClick={() => openThread(t.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Conversation */}
          <div className={cn("flex flex-col", mobilePane === "list" && "hidden md:flex")}>
            {activeThread ? (
              <ConversationPane
                thread={activeThread}
                onBack={() => {
                  setMobilePane("list")
                  setActiveThreadId(null)
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Mail className="h-7 w-7 text-emerald-400" />
                  </div>
                  <p className="font-medium mb-1">Select a conversation</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Choose a student from the list to view or start a conversation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {newMessageOpen && (
        <NewMessageDialog
          open={newMessageOpen}
          onOpenChange={setNewMessageOpen}
          onSent={(threadId) => {
            setNewMessageOpen(false)
            qc.invalidateQueries({ queryKey: ["instructor", "message-threads"] })
            openThread(threadId)
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// Thread list item
// ============================================================================
function ThreadListItem({
  thread,
  active,
  onClick,
}: {
  thread: MessageThread
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-3 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors",
        active && "bg-emerald-500/10"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono">
          {initials(thread.other.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-sm truncate", thread.unreadCount > 0 ? "font-semibold" : "font-medium")}>
            {thread.other.name}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {thread.lastMessage ? timeAgo(thread.lastMessage.createdAt) : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {thread.lastMessage
              ? `${thread.lastMessage.isMine ? "You: " : ""}${thread.lastMessage.content}`
              : "No messages yet"}
          </span>
          {thread.unreadCount > 0 && (
            <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-rose-500 hover:bg-rose-500">
              {thread.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Conversation pane
// ============================================================================
function ConversationPane({
  thread,
  onBack,
}: {
  thread: MessageThread
  onBack: () => void
}) {
  const qc = useQueryClient()
  const [draft, setDraft] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery<{ thread: { other: Contact }; messages: Message[] }>({
    queryKey: ["instructor", "message-thread", thread.id],
    queryFn: () => api(`/api/messages/threads/${thread.id}`),
    enabled: !!thread.id,
    refetchInterval: 10_000,
  })
  const messages = data?.messages ?? []
  const other = data?.thread?.other ?? thread.other

  // Group by day
  const grouped = React.useMemo(() => {
    const groups: Array<{ day: string; messages: Message[] }> = []
    for (const m of messages) {
      const day = formatDay(m.createdAt)
      const last = groups[groups.length - 1]
      if (last && last.day === day) last.messages.push(m)
      else groups.push({ day, messages: [m] })
    }
    return groups
  }, [messages])

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api(`/api/messages/threads/${thread.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setDraft("")
      qc.invalidateQueries({ queryKey: ["instructor", "message-thread", thread.id] })
      qc.invalidateQueries({ queryKey: ["instructor", "message-threads"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function handleSend() {
    const content = draft.trim()
    if (!content) return
    sendMutation.mutate(content)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/30">
        <Button size="icon" variant="ghost" className="md:hidden" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono">
            {initials(other.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate flex items-center gap-2">
            {other.name}
            {other.role && (
              <Badge variant="outline" className="text-[10px] bg-muted/30 capitalize">
                {other.role.toLowerCase()}
              </Badge>
            )}
          </div>
          {other.title && (
            <div className="text-xs text-muted-foreground truncate">{other.title}</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4 bg-grid-light">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className="h-12 w-2/3 rounded-xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground">
            <div>
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No messages yet. Say hello!
            </div>
          </div>
        ) : (
          grouped.map((g) => (
            <div key={g.day} className="space-y-2">
              <div className="text-center">
                <Badge variant="outline" className="text-[10px] bg-card/50 text-muted-foreground">
                  {g.day}
                </Badge>
              </div>
              {g.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.isMine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                      m.isMine
                        ? "bg-emerald-500 text-emerald-950 rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div
                      className={cn(
                        "text-[10px] mt-1",
                        m.isMine ? "text-emerald-950/60" : "text-muted-foreground"
                      )}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-border bg-card/30">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="resize-none min-h-[40px] max-h-32"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!draft.trim() || sendMutation.isPending}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// New Message Dialog
// ============================================================================
function NewMessageDialog({
  open,
  onOpenChange,
  onSent,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSent: (threadId: string) => void
}) {
  const [recipientId, setRecipientId] = React.useState("")
  const [content, setContent] = React.useState("")
  const [search, setSearch] = React.useState("")

  const { data: contactsData, isLoading } = useQuery<{ contacts: Contact[] }>({
    queryKey: ["instructor", "message-contacts"],
    queryFn: () => api("/api/messages/contacts"),
    enabled: open,
  })
  const contacts = contactsData?.contacts ?? []
  const filteredContacts = contacts.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  const createMutation = useMutation({
    mutationFn: () =>
      api("/api/messages/threads", {
        method: "POST",
        body: JSON.stringify({ recipientId, content: content.trim() }),
      }),
    onSuccess: (r: any) => {
      toast.success("Message sent")
      onSent(r.thread.id)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recipientId) {
      toast.error("Select a recipient")
      return
    }
    if (!content.trim()) {
      toast.error("Message cannot be empty")
      return
    }
    createMutation.mutate()
  }

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setRecipientId("")
      setContent("")
      setSearch("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-400" /> New Message
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-recipient">Recipient</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-8"
                disabled={!recipientId ? false : false}
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-border rounded-md mt-1.5 divide-y divide-border">
              {isLoading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Users className="h-5 w-5 mx-auto mb-1 opacity-50" />
                  No contacts available.
                </div>
              ) : (
                filteredContacts.slice(0, 30).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setRecipientId(c.id); setSearch("") }}
                    className={cn(
                      "w-full p-2.5 flex items-center gap-2.5 text-left hover:bg-muted/30 transition-colors",
                      recipientId === c.id && "bg-emerald-500/10"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                        {initials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.title || c.role.toLowerCase()}
                      </div>
                    </div>
                    {recipientId === c.id && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Selected
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-content">Message</Label>
            <Textarea
              id="m-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              <Send className="h-4 w-4 mr-1.5" /> Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
