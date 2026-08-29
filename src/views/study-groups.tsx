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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Users,
  Plus,
  Lock,
  Search,
  Globe,
  Crown,
  User as UserIcon,
  Link2,
  Tag,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface CourseRef {
  id: string
  title: string
  shortName: string
  color: string
}

interface UserRef {
  id: string
  name: string
  avatar: string | null
  title: string | null
  role: string
}

interface GroupMember {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: UserRef
}

interface StudyGroup {
  id: string
  title: string
  description: string
  courseId: string | null
  course: CourseRef | null
  creator: UserRef
  maxMembers: number
  isPrivate: boolean
  meetingLink: string | null
  tags: string[]
  createdAt: string
  memberCount: number
  isFull: boolean
  isMember: boolean
  isOwner?: boolean
  myRole?: string
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
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

export function StudyGroupsView() {
  const [tab, setTab] = React.useState<"discover" | "mine">("discover")

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-cyan-400" /> Study Groups
        </h1>
        <p className="text-muted-foreground">
          Collaborate with peers. Join or create a group.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "discover" | "mine")}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="discover" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Discover
          </TabsTrigger>
          <TabsTrigger value="mine" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> My Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-4">
          <DiscoverTab />
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <MyGroupsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Discover Tab                                                       */
/* ------------------------------------------------------------------ */

function DiscoverTab() {
  const qc = useQueryClient()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [joinCodeFor, setJoinCodeFor] = React.useState<StudyGroup | null>(null)
  const [openGroupId, setOpenGroupId] = React.useState<string | null>(null)

  const { data, isLoading } = useQuery<{ groups: StudyGroup[] }>({
    queryKey: ["study-groups"],
    queryFn: () => api("/api/study-groups"),
  })

  const groups = data?.groups ?? []
  const filtered = search.trim()
    ? groups.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.description.toLowerCase().includes(search.toLowerCase()) ||
          g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : groups

  const joinMutation = useMutation({
    mutationFn: ({ id, joinCode }: { id: string; joinCode?: string }) =>
      api(`/api/study-groups/${id}/join`, {
        method: "POST",
        body: JSON.stringify(joinCode ? { joinCode } : {}),
      }),
    onSuccess: () => {
      toast.success("Joined study group!")
      qc.invalidateQueries({ queryKey: ["study-groups"] })
      qc.invalidateQueries({ queryKey: ["my-study-groups"] })
      setJoinCodeFor(null)
    },
    onError: (e: Error) => toast.error("Could not join", { description: e.message }),
  })

  return (
    <div className="space-y-4">
      {/* Search + create */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups by title, description or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Group
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">
            {search ? "No matching groups" : "No public groups yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search
              ? "Try a different keyword."
              : "Be the first to create a study group for your peers."}
          </p>
          {!search && (
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Create the First Group
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              onJoin={(grp) => {
                if (grp.isPrivate) {
                  setJoinCodeFor(grp)
                } else {
                  joinMutation.mutate({ id: grp.id })
                }
              }}
              onOpen={(id) => setOpenGroupId(id)}
              joining={joinMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Join-code dialog */}
      <JoinCodeDialog
        group={joinCodeFor}
        onClose={() => setJoinCodeFor(null)}
        onJoin={(code) => {
          if (!joinCodeFor) return
          joinMutation.mutate({ id: joinCodeFor.id, joinCode: code })
        }}
        pending={joinMutation.isPending}
      />

      {/* Open group dialog */}
      <GroupDetailDialog
        groupId={openGroupId}
        onClose={() => setOpenGroupId(null)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Group Card                                                         */
/* ------------------------------------------------------------------ */

function GroupCard({
  group,
  onJoin,
  onOpen,
  joining,
}: {
  group: StudyGroup
  onJoin: (g: StudyGroup) => void
  onOpen: (id: string) => void
  joining: boolean
}) {
  const capacityPct = group.maxMembers
    ? Math.min(100, Math.round((group.memberCount / group.maxMembers) * 100))
    : 0

  return (
    <Card className="p-5 card-hover relative overflow-hidden flex flex-col">
      {/* Course banner */}
      {group.course && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/40 via-emerald-500/30 to-transparent" />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {group.isPrivate ? (
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
          ) : (
            <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <h3 className="font-semibold truncate">{group.title}</h3>
        </div>
        {group.course && (
          <Badge variant="outline" className="font-mono text-[10px] shrink-0">
            {group.course.shortName}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
        {group.description || "No description provided."}
      </p>

      {/* Tags */}
      {group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {group.tags.slice(0, 4).map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="text-[10px] font-normal bg-muted/60"
            >
              <Tag className="h-2.5 w-2.5 mr-1" /> {t}
            </Badge>
          ))}
          {group.tags.length > 4 && (
            <Badge variant="secondary" className="text-[10px] font-normal bg-muted/60">
              +{group.tags.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Capacity */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Members</span>
          <span className="font-mono">
            {group.memberCount}/{group.maxMembers}
          </span>
        </div>
        <Progress value={capacityPct} className="h-1.5" />
      </div>

      {/* Creator */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        <Avatar className="h-6 w-6">
          {group.creator.avatar ? (
            <AvatarImage src={group.creator.avatar} alt={group.creator.name} />
          ) : null}
          <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-[10px]">
            {initialsOf(group.creator.name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-muted-foreground">by {group.creator.name}</span>
        <span className="text-muted-foreground ml-auto">{timeAgo(group.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onOpen(group.id)}
        >
          <Sparkles className="h-3.5 w-3.5" /> Open
        </Button>
        {group.isMember ? (
          <Button size="sm" variant="secondary" disabled className="flex-1 gap-1.5">
            <UserIcon className="h-3.5 w-3.5" /> Joined
          </Button>
        ) : group.isFull ? (
          <Button size="sm" disabled className="flex-1">
            Full
          </Button>
        ) : (
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            disabled={joining}
            onClick={() => onJoin(group)}
          >
            {group.isPrivate ? (
              <>
                <Lock className="h-3.5 w-3.5" /> Join with Code
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Join
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Create Group Dialog                                                */
/* ------------------------------------------------------------------ */

interface CreateForm {
  title: string
  description: string
  courseId: string
  maxMembers: string
  isPrivate: boolean
  joinCode: string
  meetingLink: string
  tags: string
}

function CreateGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = React.useState<CreateForm>({
    title: "",
    description: "",
    courseId: "",
    maxMembers: "10",
    isPrivate: false,
    joinCode: "",
    meetingLink: "",
    tags: "",
  })

  const { data: coursesData } = useQuery<{ courses: { id: string; title: string; shortName: string }[] }>({
    queryKey: ["courses", "enrolled-for-groups"],
    queryFn: () => api("/api/courses?enrolled=true"),
    enabled: open,
  })
  const courses = coursesData?.courses ?? []

  React.useEffect(() => {
    if (open) {
      setForm({
        title: "",
        description: "",
        courseId: "",
        maxMembers: "10",
        isPrivate: false,
        joinCode: "",
        meetingLink: "",
        tags: "",
      })
    }
  }, [open])

  const createMutation = useMutation({
    mutationFn: (body: any) =>
      api("/api/study-groups", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success("Study group created!")
      qc.invalidateQueries({ queryKey: ["study-groups"] })
      qc.invalidateQueries({ queryKey: ["my-study-groups"] })
      onOpenChange(false)
    },
    onError: (e: Error) => toast.error("Could not create group", { description: e.message }),
  })

  function submit() {
    const body: any = {
      title: form.title.trim(),
      description: form.description.trim(),
      maxMembers: Number(form.maxMembers) || 10,
      isPrivate: form.isPrivate,
      meetingLink: form.meetingLink.trim() || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }
    if (form.courseId) body.courseId = form.courseId
    if (form.isPrivate && form.joinCode.trim()) body.joinCode = form.joinCode.trim()
    createMutation.mutate(body)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-400" /> Create Study Group
          </DialogTitle>
          <DialogDescription>
            Spin up a collaborative space for your peers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="g-title">Title</Label>
            <Input
              id="g-title"
              placeholder="e.g. CEH Final Exam Prep"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-desc">Description</Label>
            <Textarea
              id="g-desc"
              placeholder="What is this group for? What will you study?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="g-course">Linked course (optional)</Label>
              <select
                id="g-course"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              >
                <option value="">— None —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-max">Max members</Label>
              <Input
                id="g-max"
                type="number"
                min={2}
                max={500}
                value={form.maxMembers}
                onChange={(e) => setForm({ ...form, maxMembers: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-meeting">Meeting link (optional)</Label>
            <Input
              id="g-meeting"
              placeholder="https://meet.google.com/…"
              value={form.meetingLink}
              onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-tags">Tags (comma-separated)</Label>
            <Input
              id="g-tags"
              placeholder="exam-prep, networking, hands-on"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="g-private" className="cursor-pointer">
                Private group
              </Label>
              <p className="text-xs text-muted-foreground">
                Require a join code for members to enter.
              </p>
            </div>
            <Switch
              id="g-private"
              checked={form.isPrivate}
              onCheckedChange={(c) => setForm({ ...form, isPrivate: c })}
            />
          </div>

          {form.isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="g-code">Join code (leave blank to auto-generate)</Label>
              <Input
                id="g-code"
                placeholder="e.g. CYBER42"
                value={form.joinCode}
                onChange={(e) => setForm({ ...form, joinCode: e.target.value })}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!form.title.trim() || createMutation.isPending}
            onClick={submit}
          >
            {createMutation.isPending ? "Creating…" : "Create Group"}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Join Code Dialog                                                   */
/* ------------------------------------------------------------------ */

function JoinCodeDialog({
  group,
  onClose,
  onJoin,
  pending,
}: {
  group: StudyGroup | null
  onClose: () => void
  onJoin: (code: string) => void
  pending: boolean
}) {
  const [code, setCode] = React.useState("")

  React.useEffect(() => {
    if (group) setCode("")
  }, [group])

  return (
    <Dialog open={!!group} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-400" /> Join Private Group
          </DialogTitle>
          <DialogDescription>
            Enter the join code provided by the group owner to join{" "}
            <span className="font-medium text-foreground">
              {group?.title ?? ""}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="join-code">Join code</Label>
          <Input
            id="join-code"
            placeholder="e.g. CYBER42"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono tracking-widest text-center text-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.trim()) onJoin(code.trim())
            }}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!code.trim() || pending}
            onClick={() => onJoin(code.trim())}
          >
            {pending ? "Joining…" : "Join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Group Detail Dialog (Open button)                                  */
/* ------------------------------------------------------------------ */

function GroupDetailDialog({
  groupId,
  onClose,
}: {
  groupId: string | null
  onClose: () => void
}) {
  const { data, isLoading } = useQuery<{ group: StudyGroup & { members?: GroupMember[] } }>({
    queryKey: ["study-group", groupId],
    queryFn: () => api(`/api/study-groups/${groupId}`),
    enabled: !!groupId,
  })

  const group = data?.group
  const members = group?.members ?? []

  return (
    <Dialog open={!!groupId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            {group?.title ?? "Loading…"}
          </DialogTitle>
          <DialogDescription>
            {group?.course
              ? `Linked to ${group.course.shortName} — ${group.course.title}`
              : "Standalone study group"}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !group ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {group.description && (
              <p className="text-sm whitespace-pre-wrap">{group.description}</p>
            )}

            {group.meetingLink && (
              <a
                href={group.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:underline"
              >
                <Link2 className="h-4 w-4" /> Open meeting link
              </a>
            )}

            {group.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {group.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] bg-muted/60">
                    <Tag className="h-2.5 w-2.5 mr-1" /> {t}
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Members ({group.memberCount}/{group.maxMembers})
              </Label>
              <div className="mt-2 max-h-64 overflow-y-auto space-y-2 pr-1">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border"
                  >
                    <Avatar className="h-7 w-7">
                      {m.user.avatar ? (
                        <AvatarImage src={m.user.avatar} alt={m.user.name} />
                      ) : null}
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {initialsOf(m.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {timeAgo(m.joinedAt)}
                      </div>
                    </div>
                    {m.role === "owner" && (
                      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Crown className="h-3 w-3 mr-1" /> Owner
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* My Groups Tab                                                      */
/* ------------------------------------------------------------------ */

function MyGroupsTab() {
  const [openGroupId, setOpenGroupId] = React.useState<string | null>(null)

  const { data, isLoading } = useQuery<{ groups: StudyGroup[] }>({
    queryKey: ["my-study-groups"],
    queryFn: () => api("/api/study-groups/my"),
  })

  const groups = data?.groups ?? []

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">You haven't joined any groups</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse the Discover tab to find a group, or create your own.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Card key={g.id} className="p-5 card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  {g.isPrivate ? (
                    <Lock className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Users className="h-5 w-5 text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold truncate">{g.title}</h3>
                    {g.course && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {g.course.shortName}
                      </Badge>
                    )}
                    {g.myRole === "owner" ? (
                      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Crown className="h-3 w-3 mr-1" /> Owner
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                        <UserIcon className="h-3 w-3 mr-1" /> Member
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {g.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {g.memberCount}/{g.maxMembers} members
                    </span>
                    {g.meetingLink && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Link2 className="h-3 w-3" /> Meeting link
                      </span>
                    )}
                    <span>Created {timeAgo(g.createdAt)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => setOpenGroupId(g.id)}
                >
                  <Sparkles className="h-3.5 w-3.5" /> Open
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <GroupDetailDialog groupId={openGroupId} onClose={() => setOpenGroupId(null)} />
    </div>
  )
}
