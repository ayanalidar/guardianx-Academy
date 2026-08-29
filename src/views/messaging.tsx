"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  ChevronLeft,
  Mail,
  Users,
} from "lucide-react"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface UserRef {
  id: string
  name: string
  avatar: string | null
  title: string | null
  role: string
}

interface MessageItem {
  id: string
  content: string
  senderId: string
  createdAt: string
  read: boolean
  isMine: boolean
}

interface ThreadListItem {
  id: string
  other: UserRef
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

interface ThreadDetail {
  thread: { id: string; other: UserRef }
  messages: MessageItem[]
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return "now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function timeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/* ------------------------------------------------------------------ */
/* Main View                                                          */
/* ------------------------------------------------------------------ */

export function MessagingView() {
  const qc = useQueryClient()
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [newMessageOpen, setNewMessageOpen] = React.useState(false)
  const [mobileShowConversation, setMobileShowConversation] = React.useState(false)

  const { data: threadsData, isLoading: threadsLoading } = useQuery<{ threads: ThreadListItem[] }>({
    queryKey: ["message-threads"],
    queryFn: () => api("/api/messages/threads"),
    refetchInterval: 10000,
  })

  const threads = threadsData?.threads ?? []
  const filtered = search.trim()
    ? threads.filter((t) =>
        t.other.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.lastMessage?.content ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : threads

  function openThread(id: string) {
    setActiveThreadId(id)
    setMobileShowConversation(true)
    // Mark as read on server
    api(`/api/messages/threads/${id}/read`, { method: "POST" })
      .then(() => qc.invalidateQueries({ queryKey: ["message-threads"] }))
      .catch(() => {})
  }

  function handleNewThreadCreated(threadId: string) {
    qc.invalidateQueries({ queryKey: ["message-threads"] })
    setNewMessageOpen(false)
    openThread(threadId)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-emerald-400" /> Messages
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Direct messages with your instructors and peers.
          </p>
        </div>
        <Button onClick={() => setNewMessageOpen(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> New Message
        </Button>
      </header>

      {/* Two-pane layout */}
      <Card className="overflow-hidden grid md:grid-cols-[320px_1fr] h-[70vh] min-h-[480px] p-0">
        {/* Left pane — thread list */}
        <section
          className={cn(
            "border-r border-border flex flex-col",
            mobileShowConversation && activeThreadId ? "hidden md:flex" : "flex"
          )}
        >
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threads…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Thread list */}
          <ScrollArea className="flex-1">
            {threadsLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {search ? "No matching threads." : "No conversations yet."}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => openThread(t.id)}
                      className={cn(
                        "w-full text-left p-3 flex items-start gap-3 transition-colors hover:bg-card/50",
                        activeThreadId === t.id && "bg-card/70"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 border border-border">
                          {t.other.avatar ? (
                            <AvatarImage src={t.other.avatar} alt={t.other.name} />
                          ) : null}
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs">
                            {initialsOf(t.other.name)}
                          </AvatarFallback>
                        </Avatar>
                        {t.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {t.unreadCount > 9 ? "9+" : t.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "text-sm truncate",
                              t.unreadCount > 0 ? "font-semibold" : "font-medium"
                            )}
                          >
                            {t.other.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {t.lastMessage ? timeAgo(t.lastMessage.createdAt) : ""}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-xs text-muted-foreground truncate mt-0.5",
                            t.unreadCount > 0 && "text-foreground/80 font-medium"
                          )}
                        >
                          {t.lastMessage
                            ? (t.lastMessage.isMine ? "You: " : "") + t.lastMessage.content
                            : "No messages yet"}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </section>

        {/* Right pane — active conversation */}
        <section
          className={cn(
            "flex flex-col",
            mobileShowConversation && activeThreadId ? "flex" : "hidden md:flex"
          )}
        >
          {activeThreadId ? (
            <ConversationPane
              threadId={activeThreadId}
              onBack={() => {
                setMobileShowConversation(false)
                setActiveThreadId(null)
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a thread from the left, or start a new message.
              </p>
            </div>
          )}
        </section>
      </Card>

      {/* New message dialog */}
      <NewMessageDialog
        open={newMessageOpen}
        onOpenChange={setNewMessageOpen}
        onCreated={handleNewThreadCreated}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Conversation Pane                                                  */
/* ------------------------------------------------------------------ */

function ConversationPane({
  threadId,
  onBack,
}: {
  threadId: string
  onBack: () => void
}) {
  const qc = useQueryClient()
  const [draft, setDraft] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery<ThreadDetail>({
    queryKey: ["thread", threadId],
    queryFn: () => api(`/api/messages/threads/${threadId}`),
    refetchInterval: 10000,
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api(`/api/messages/threads/${threadId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setDraft("")
      qc.invalidateQueries({ queryKey: ["thread", threadId] })
      qc.invalidateQueries({ queryKey: ["message-threads"] })
    },
    onError: (e: Error) => toast.error("Failed to send", { description: e.message }),
  })

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [data?.messages, isLoading])

  const other = data?.thread.other
  const messages = data?.messages ?? []

  function handleSend() {
    const trimmed = draft.trim()
    if (!trimmed || sendMutation.isPending) return
    sendMutation.mutate(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by day
  const grouped: { label: string; items: MessageItem[] }[] = []
  let currentLabel = ""
  for (const m of messages) {
    const label = dayLabel(m.createdAt)
    if (label !== currentLabel) {
      currentLabel = label
      grouped.push({ label, items: [m] })
    } else {
      grouped[grouped.length - 1].items.push(m)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="flex items-center gap-3 p-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={onBack}
          aria-label="Back to threads"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-9 w-9 border border-border">
          {other?.avatar ? <AvatarImage src={other.avatar} alt={other.name} /> : null}
          <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs">
            {other ? initialsOf(other.name) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {other?.name ?? "Loading…"}
          </div>
          {other?.title && (
            <div className="text-xs text-muted-foreground truncate">{other.title}</div>
          )}
        </div>
        <Badge variant="outline" className="capitalize text-[10px] hidden sm:inline-flex">
          {other?.role ?? ""}
        </Badge>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={cn("h-12", i % 2 === 0 ? "w-2/3" : "w-1/2 ml-auto")} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <Mail className="h-10 w-10 mb-2" />
            No messages yet — say hello!
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="text-center text-[10px] uppercase tracking-wider text-muted-foreground py-1">
                {group.label}
              </div>
              {group.items.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.isMine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] px-3 py-2 rounded-xl text-sm break-words",
                      m.isMine
                        ? "bg-emerald-500/15 text-emerald-50 border border-emerald-500/30 rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <div
                      className={cn(
                        "text-[10px] mt-1",
                        m.isMine ? "text-emerald-200/60" : "text-muted-foreground"
                      )}
                    >
                      {timeShort(m.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <footer className="p-3 border-t border-border">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!draft.trim() || sendMutation.isPending}
            className="gap-1.5"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </footer>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* New Message Dialog                                                 */
/* ------------------------------------------------------------------ */

function NewMessageDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (threadId: string) => void
}) {
  const [recipientId, setRecipientId] = React.useState("")
  const [content, setContent] = React.useState("")

  const { data: contactsData, isLoading } = useQuery<{ contacts: UserRef[] }>({
    queryKey: ["message-contacts"],
    queryFn: () => api("/api/messages/contacts"),
    enabled: open,
  })

  const contacts = contactsData?.contacts ?? []

  React.useEffect(() => {
    if (open) {
      setRecipientId("")
      setContent("")
    }
  }, [open])

  const createMutation = useMutation({
    mutationFn: (body: { recipientId: string; content: string }) =>
      api<{ thread: { id: string } }>("/api/messages/threads", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      toast.success("Conversation started")
      onCreated(data.thread.id)
    },
    onError: (e: Error) => toast.error("Could not send", { description: e.message }),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" /> New Message
          </DialogTitle>
          <DialogDescription>
            Choose a recipient from your network and write the first message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Recipient picker */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Recipient
            </label>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border border-dashed border-border rounded-lg text-center">
                <Users className="h-5 w-5 mx-auto mb-1" />
                No contacts available. Enroll in a course to message instructors.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setRecipientId(c.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg border transition-colors text-left",
                      recipientId === c.id
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-border hover:bg-card/50"
                    )}
                  >
                    <Avatar className="h-8 w-8 border border-border">
                      {c.avatar ? <AvatarImage src={c.avatar} alt={c.name} /> : null}
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs">
                        {initialsOf(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      {c.title && (
                        <div className="text-xs text-muted-foreground truncate">{c.title}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {c.role}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Message
            </label>
            <Textarea
              placeholder="Write your message…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={
              !recipientId ||
              !content.trim() ||
              createMutation.isPending ||
              contacts.length === 0
            }
            onClick={() =>
              createMutation.mutate({ recipientId, content: content.trim() })
            }
          >
            {createMutation.isPending ? "Sending…" : "Send"}
            <Send className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
