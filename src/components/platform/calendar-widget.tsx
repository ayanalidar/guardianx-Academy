"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Radio, Clock, BookOpen, Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalendarEvent {
  date: string // YYYY-MM-DD
  title: string
  type: "live" | "deadline" | "lesson" | "exam" | "streak"
  time?: string
  meta?: string
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const EVENT_COLORS: Record<CalendarEvent["type"], { dot: string; bg: string; text: string; border: string }> = {
  live: { dot: "bg-red-500", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  deadline: { dot: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  lesson: { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  exam: { dot: "bg-violet-500", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30" },
  streak: { dot: "bg-orange-500", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
}

interface CalendarWidgetProps {
  /** Override the events source — if provided, the widget uses these events instead of fetching. */
  events?: CalendarEvent[]
  /** Role context for fetching events (defaults to fetching live sessions + me/courses) */
  fetchLive?: boolean
  className?: string
  /** Compact mode for sidebar usage */
  compact?: boolean
}

export function CalendarWidget({ events: providedEvents, fetchLive = true, className, compact }: CalendarWidgetProps) {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = React.useState<string | null>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })

  // Fetch live sessions + enrolled courses for events (only if no events provided)
  const { data: liveData, isLoading } = useQuery<{ sessions: any[] }>({
    queryKey: ["calendar", "live-sessions", "all"],
    queryFn: () => api("/api/live-sessions?status=all"),
    enabled: fetchLive && !providedEvents,
    refetchInterval: 60000,
  })

  const fetchedEvents: CalendarEvent[] = React.useMemo(() => {
    if (providedEvents) return providedEvents
    const evts: CalendarEvent[] = []
    for (const s of liveData?.sessions ?? []) {
      const d = new Date(s.scheduledAt)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      evts.push({
        date: dateStr,
        title: s.title,
        type: s.status === "live" ? "live" : "lesson",
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        meta: s.course?.shortName || "Session",
      })
    }
    return evts
  }, [liveData, providedEvents])

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of fetchedEvents) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return map
  }, [fetchedEvents])

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Build a 6-week grid (42 cells)
  const cells: { day: number; month: "prev" | "current" | "next"; dateStr: string }[] = []
  for (let i = 0; i < 42; i++) {
    if (i < firstDay) {
      const day = daysInPrevMonth - firstDay + 1 + i
      const d = new Date(year, month - 1, day)
      cells.push({ day, month: "prev", dateStr: fmt(d) })
    } else if (i < firstDay + daysInMonth) {
      const day = i - firstDay + 1
      const d = new Date(year, month, day)
      cells.push({ day, month: "current", dateStr: fmt(d) })
    } else {
      const day = i - firstDay - daysInMonth + 1
      const d = new Date(year, month + 1, day)
      cells.push({ day, month: "next", dateStr: fmt(d) })
    }
  }

  const selectedEvents = selectedDay ? eventsByDate.get(selectedDay) ?? [] : []

  function fmt(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-emerald-400" /> {MONTHS[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            title="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              const d = new Date()
              setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
              setSelectedDay(todayStr)
            }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            title="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1">
            {w.slice(0, compact ? 1 : 3)}
          </div>
        ))}
      </div>

      {/* Day grid */}
      {isLoading && !providedEvents ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-md" />)}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            const evts = eventsByDate.get(cell.dateStr) ?? []
            const isToday = cell.dateStr === todayStr
            const isSelected = cell.dateStr === selectedDay
            const isOtherMonth = cell.month !== "current"
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(cell.dateStr)}
                className={cn(
                  "relative aspect-square sm:aspect-auto sm:h-10 rounded-md flex flex-col items-center justify-center text-xs transition-all border",
                  isOtherMonth && "text-muted-foreground/40",
                  !isOtherMonth && "hover:bg-accent/40 hover:border-border",
                  isSelected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "border-transparent",
                  isToday && !isSelected && "bg-emerald-500/5 border-emerald-500/20"
                )}
              >
                <span className={cn("font-mono", isToday && "font-bold")}>
                  {cell.day}
                </span>
                {evts.length > 0 && (
                  <div className="absolute bottom-1 flex items-center gap-0.5">
                    {evts.slice(0, compact ? 2 : 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={cn("h-1 w-1 rounded-full", EVENT_COLORS[e.type].dot)}
                      />
                    ))}
                    {evts.length > (compact ? 2 : 3) && (
                      <span className="text-[7px] text-muted-foreground">+{evts.length - (compact ? 2 : 3)}</span>
                    )}
                  </div>
                )}
                {isToday && !isSelected && (
                  <span className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-emerald-400" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Selected day events */}
      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              {new Date(selectedDay + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </h4>
            <Badge variant="outline" className="text-[10px]">{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}</Badge>
          </div>
          <ScrollArea className={compact ? "h-32" : "h-40"}>
            {selectedEvents.length === 0 ? (
              <div className="text-center py-4">
                <CalendarIcon className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-[11px] text-muted-foreground">No events scheduled</p>
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                {selectedEvents.map((e, idx) => {
                  const c = EVENT_COLORS[e.type]
                  const Icon = e.type === "live" ? Radio : e.type === "lesson" ? BookOpen : e.type === "streak" ? Flame : Clock
                  return (
                    <div key={idx} className={cn("flex items-center gap-2 p-2 rounded-lg border", c.bg, c.border)}>
                      <div className={cn("p-1.5 rounded-md", c.bg)}>
                        <Icon className={cn("h-3 w-3", c.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{e.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {e.time && <span className="font-mono">{e.time}</span>}
                          {e.meta && <span> · {e.meta}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </Card>
  )
}
