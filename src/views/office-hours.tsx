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
  CalendarClock,
  Video,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Sparkles,
  AlertCircle,
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
  bio?: string | null
}

interface CourseRef {
  id: string
  title: string
  shortName: string
  color: string
}

type SlotMode = "video" | "in-person" | "chat"

interface OfficeHourSlot {
  id: string
  startAt: string
  endAt: string
  mode: SlotMode
  location: string
  maxBookings: number
  courseId: string | null
  course: CourseRef | null
  instructor: UserRef
  bookedCount: number
  isFull: boolean
  myBooking: { id: string } | null
}

interface OfficeHourBooking {
  id: string
  topic: string
  notes: string
  status: string
  createdAt: string
  slot: {
    id: string
    startAt: string
    endAt: string
    mode: SlotMode
    location: string
    maxBookings: number
    course: CourseRef | null
    instructor: UserRef
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function ModeIcon({
  mode,
  className,
}: {
  mode: SlotMode
  className?: string
}) {
  if (mode === "video") return <Video className={className} />
  if (mode === "in-person") return <MapPin className={className} />
  return <MessageCircle className={className} />
}

function modeLabel(mode: SlotMode) {
  if (mode === "video") return "Video"
  if (mode === "in-person") return "In-Person"
  return "Chat"
}

function modeColor(mode: SlotMode) {
  if (mode === "video") return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" }
  if (mode === "in-person") return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" }
  return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function formatDuration(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
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

export function OfficeHoursView() {
  const [tab, setTab] = React.useState<"available" | "mine">("available")

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarClock className="h-7 w-7 text-emerald-400" /> Office Hours
        </h1>
        <p className="text-muted-foreground">
          Book 1:1 time with your instructors.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "available" | "mine")}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="available" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Available Slots
          </TabsTrigger>
          <TabsTrigger value="mine" className="gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" /> My Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          <AvailableSlotsTab />
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <MyBookingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Available Slots Tab                                                */
/* ------------------------------------------------------------------ */

function AvailableSlotsTab() {
  const [bookSlot, setBookSlot] = React.useState<OfficeHourSlot | null>(null)

  const { data, isLoading } = useQuery<{ slots: OfficeHourSlot[] }>({
    queryKey: ["office-hours-available"],
    queryFn: () => api("/api/office-hours/available"),
    refetchInterval: 30000,
  })

  const slots = data?.slots ?? []

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No upcoming office hours</h3>
          <p className="text-sm text-muted-foreground">
            Your instructors haven't opened any slots yet. Check back soon.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((s) => (
            <SlotCard key={s.id} slot={s} onBook={() => setBookSlot(s)} />
          ))}
        </div>
      )}

      <BookSlotDialog
        slot={bookSlot}
        onClose={() => setBookSlot(null)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Slot Card                                                          */
/* ------------------------------------------------------------------ */

function SlotCard({
  slot,
  onBook,
}: {
  slot: OfficeHourSlot
  onBook: () => void
}) {
  const color = modeColor(slot.mode)
  const start = formatDateTime(slot.startAt)
  const end = formatDateTime(slot.endAt)
  const capacityPct = slot.maxBookings
    ? Math.min(100, Math.round((slot.bookedCount / slot.maxBookings) * 100))
    : 0
  const isBookedByMe = !!slot.myBooking
  const isPast = new Date(slot.endAt).getTime() <= Date.now()

  return (
    <Card className="p-5 card-hover relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 via-cyan-500/30 to-transparent" />

      {/* Instructor */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10 border border-border">
          {slot.instructor.avatar ? (
            <AvatarImage src={slot.instructor.avatar} alt={slot.instructor.name} />
          ) : null}
          <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs">
            {initialsOf(slot.instructor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{slot.instructor.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {slot.instructor.title || "Instructor"}
          </div>
        </div>
        {slot.course && (
          <Badge variant="outline" className="font-mono text-[10px] shrink-0">
            {slot.course.shortName}
          </Badge>
        )}
      </div>

      {/* Date / time */}
      <div className="space-y-1 mb-3 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium">{start.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>
            {start.time} – {end.time}
            <span className="text-muted-foreground ml-1">
              ({formatDuration(slot.startAt, slot.endAt)})
            </span>
          </span>
        </div>
      </div>

      {/* Mode + location */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge
          variant="outline"
          className={cn("gap-1", color.text, color.bg, color.border, "border")}
        >
          <ModeIcon mode={slot.mode} className="h-3 w-3" /> {modeLabel(slot.mode)}
        </Badge>
        {slot.location && (
          <Badge variant="secondary" className="text-[10px] gap-1 bg-muted/60">
            <MapPin className="h-2.5 w-2.5" />
            <span className="max-w-[120px] truncate">{slot.location}</span>
          </Badge>
        )}
      </div>

      {/* Capacity */}
      <div className="space-y-1.5 mb-4 mt-auto">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-mono">
            {slot.bookedCount}/{slot.maxBookings}
          </span>
        </div>
        <Progress value={capacityPct} className="h-1.5" />
      </div>

      {/* Action */}
      {isBookedByMe ? (
        <Button variant="secondary" disabled className="w-full gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Booked
        </Button>
      ) : isPast ? (
        <Button variant="ghost" disabled className="w-full">
          Session ended
        </Button>
      ) : slot.isFull ? (
        <Button variant="ghost" disabled className="w-full">
          Fully booked
        </Button>
      ) : (
        <Button onClick={onBook} className="w-full gap-1.5">
          <Sparkles className="h-4 w-4" /> Book Slot
        </Button>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Book Slot Dialog                                                   */
/* ------------------------------------------------------------------ */

function BookSlotDialog({
  slot,
  onClose,
}: {
  slot: OfficeHourSlot | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [topic, setTopic] = React.useState("")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (slot) {
      setTopic("")
      setNotes("")
    }
  }, [slot])

  const bookMutation = useMutation({
    mutationFn: (body: { topic: string; notes: string }) =>
      api(`/api/office-hours/${slot?.id}/book`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success("Slot booked!", {
        description: "Check your email for the meeting details.",
      })
      qc.invalidateQueries({ queryKey: ["office-hours-available"] })
      qc.invalidateQueries({ queryKey: ["my-office-hour-bookings"] })
      onClose()
    },
    onError: (e: Error) => toast.error("Could not book slot", { description: e.message }),
  })

  const start = slot ? formatDateTime(slot.startAt) : null
  const end = slot ? formatDateTime(slot.endAt) : null
  const color = slot ? modeColor(slot.mode) : null

  return (
    <Dialog open={!!slot} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-emerald-400" /> Book Office Hours
          </DialogTitle>
          <DialogDescription>
            Confirm your booking with{" "}
            <span className="font-medium text-foreground">
              {slot?.instructor.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {!slot || !start || !end || !color ? null : (
          <div className="space-y-4 py-2">
            {/* Summary */}
            <div className={cn("rounded-lg border p-3 space-y-2", color.border, color.bg)}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <ModeIcon mode={slot.mode} className={cn("h-4 w-4", color.text)} />
                {modeLabel(slot.mode)} session
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {start.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {start.time} – {end.time}
                </div>
                {slot.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{slot.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="book-topic">Topic</Label>
              <Input
                id="book-topic"
                placeholder="e.g. Need help with subnetting"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={200}
              />
              <p className="text-[10px] text-muted-foreground">
                Optional — gives your instructor a heads-up.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="book-notes">Notes</Label>
              <Textarea
                id="book-notes"
                placeholder="Anything specific you want to cover?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
                maxLength={2000}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={bookMutation.isPending || !slot}
            onClick={() =>
              bookMutation.mutate({ topic: topic.trim(), notes: notes.trim() })
            }
          >
            {bookMutation.isPending ? "Booking…" : "Confirm Booking"}
            <Sparkles className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* My Bookings Tab                                                    */
/* ------------------------------------------------------------------ */

function MyBookingsTab() {
  const { data, isLoading } = useQuery<{ bookings: OfficeHourBooking[] }>({
    queryKey: ["my-office-hour-bookings"],
    queryFn: () => api("/api/office-hours/my-bookings"),
    refetchInterval: 30000,
  })

  const bookings = data?.bookings ?? []

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No upcoming bookings</h3>
          <p className="text-sm text-muted-foreground">
            Browse the Available Slots tab to book office hours with your instructors.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Booking Card                                                       */
/* ------------------------------------------------------------------ */

function BookingCard({ booking }: { booking: OfficeHourBooking }) {
  const slot = booking.slot
  const color = modeColor(slot.mode)
  const start = formatDateTime(slot.startAt)
  const end = formatDateTime(slot.endAt)

  const statusBadge = (() => {
    switch (booking.status) {
      case "booked":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{booking.status}</Badge>
    }
  })()

  return (
    <Card className="p-5 card-hover">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Instructor avatar */}
        <div className="flex items-center gap-3 shrink-0 sm:w-56">
          <Avatar className="h-10 w-10 border border-border">
            {slot.instructor.avatar ? (
              <AvatarImage src={slot.instructor.avatar} alt={slot.instructor.name} />
            ) : null}
            <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs">
              {initialsOf(slot.instructor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{slot.instructor.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {slot.instructor.title || "Instructor"}
            </div>
          </div>
        </div>

        {/* Time + mode */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm">{start.date}</span>
            <span className="text-sm text-muted-foreground">
              {start.time} – {end.time}
            </span>
            <Badge
              variant="outline"
              className={cn("gap-1 text-[10px]", color.text, color.bg, color.border, "border")}
            >
              <ModeIcon mode={slot.mode} className="h-2.5 w-2.5" /> {modeLabel(slot.mode)}
            </Badge>
            {slot.course && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {slot.course.shortName}
              </Badge>
            )}
            {statusBadge}
          </div>
          {booking.topic && (
            <div className="text-sm text-muted-foreground mb-1">
              <span className="text-muted-foreground/80">Topic:</span>{" "}
              <span className="text-foreground">{booking.topic}</span>
            </div>
          )}
          {booking.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">{booking.notes}</p>
          )}
          {slot.location && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{slot.location}</span>
            </div>
          )}
        </div>

        {/* Cancel */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs shrink-0"
          onClick={() =>
            toast.info("Contact instructor to cancel", {
              description: "Reply to your booking confirmation email or message the instructor directly.",
            })
          }
        >
          <User className="h-3 w-3 mr-1" /> Cancel
        </Button>
      </div>
    </Card>
  )
}
