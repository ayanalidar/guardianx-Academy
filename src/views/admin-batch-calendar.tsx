"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock,
  Users, Video, MapPin, User,
} from "lucide-react"

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Mock batch schedule data — in production this would come from /api/batches
const BATCHES = [
  { id: 1, title: "CEH Weekend Batch", cert: "CEH", instructor: "Dr. Sarah Chen", days: [6, 0], time: "7:00 PM - 9:00 PM", mode: "Online", students: 12, startDate: "2025-10-12", color: "bg-violet-500" },
  { id: 2, title: "Security+ Weekday", cert: "Security+", instructor: "Raj Patel", days: [1, 3, 5], time: "8:00 PM - 10:00 PM", mode: "Online", students: 8, startDate: "2025-10-20", color: "bg-cyan-500" },
  { id: 3, title: "CCNA Morning", cert: "CCNA", instructor: "Raj Patel", days: [2, 4], time: "7:00 AM - 9:00 AM", mode: "Online", students: 15, startDate: "2025-11-03", color: "bg-amber-500" },
  { id: 4, title: "CISSP Weekend", cert: "CISSP", instructor: "Alex Mercer", days: [6, 0], time: "10:00 AM - 1:00 PM", mode: "Online", students: 5, startDate: "2025-11-09", color: "bg-emerald-500" },
  { id: 5, title: "WAPT Bootcamp", cert: "WAPT", instructor: "Dr. Sarah Chen", days: [1, 2, 3, 4, 5], time: "6:00 PM - 8:00 PM", mode: "On-campus", students: 20, startDate: "2025-10-15", color: "bg-rose-500" },
]

export function BatchCalendarView() {
  const { navigate } = useAppStore()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [view, setView] = React.useState<"month" | "week">("month")
  const [selectedBatch, setSelectedBatch] = React.useState<any>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }
  function goToday() { setCurrentDate(new Date()) }

  // Get batches that occur on a specific day
  function getBatchesForDay(day: number) {
    const dayOfWeek = new Date(year, month, day).getDay()
    return BATCHES.filter(b => b.days.includes(dayOfWeek))
  }

  // Check if a batch starts on this day
  function getStartingBatches(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return BATCHES.filter(b => b.startDate === dateStr)
  }

  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-400" /> Batch Calendar
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={goToday}>Today</Button>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm font-medium min-w-[140px] text-center">{MONTHS[month]} {year}</span>
              <Button size="sm" variant="ghost" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Batch legend */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          {BATCHES.map(b => (
            <button key={b.id} onClick={() => setSelectedBatch(b)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <span className={cn("h-2.5 w-2.5 rounded", b.color)} />
              {b.cert}
            </button>
          ))}
        </div>

        {/* Calendar grid */}
        <Card className="p-4 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square sm:aspect-[4/3] rounded-lg bg-muted/20" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const batches = getBatchesForDay(day)
              const starting = getStartingBatches(day)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square sm:aspect-[4/3] rounded-lg border p-1 sm:p-1.5 relative cursor-pointer hover:border-violet-500/40 transition-colors",
                    isToday ? "border-violet-500 bg-violet-500/5" : "border-border/40 bg-card",
                  )}
                >
                  <span className={cn("text-[10px] sm:text-xs", isToday ? "text-violet-300 font-bold" : "text-muted-foreground")}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {starting.map(b => (
                      <div key={`start-${b.id}`} className={cn("text-[8px] sm:text-[9px] px-1 py-0.5 rounded text-white font-medium truncate", b.color)} title={`${b.title} — STARTS TODAY`}>
                        ▶ {b.cert}
                      </div>
                    ))}
                    {batches.slice(0, 2).map(b => (
                      <div key={b.id} className={cn("h-1 sm:h-1.5 rounded-full", b.color)} title={`${b.title} (${b.time})`} />
                    ))}
                    {batches.length > 2 && <div className="text-[8px] text-muted-foreground">+{batches.length - 2}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Upcoming batches list */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold mb-3">Upcoming Batches</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BATCHES.map(b => (
              <Card key={b.id} className="p-4 hover:border-violet-500/30 transition-colors cursor-pointer" >
                <div onClick={() => setSelectedBatch(b)}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn("text-[9px] text-white border-0", b.color)}>{b.cert}</Badge>
                    <Badge variant="outline" className="text-[9px]">{b.mode}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><User className="h-3 w-3" /> {b.instructor}</div>
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {b.time}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Starts {new Date(b.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {b.students} students</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Batch detail modal */}
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedBatch(null)}>
            <Card className="max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <Badge className={cn("text-xs text-white border-0", selectedBatch.color)}>{selectedBatch.cert}</Badge>
                <Button size="sm" variant="ghost" onClick={() => setSelectedBatch(null)}>✕</Button>
              </div>
              <h2 className="text-lg font-bold mb-3">{selectedBatch.title}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> {selectedBatch.instructor}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {selectedBatch.time}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Starts {new Date(selectedBatch.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                <div className="flex items-center gap-2 text-muted-foreground">{selectedBatch.mode === "Online" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />} {selectedBatch.mode}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> {selectedBatch.students} enrolled</div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40 flex gap-2">
                <Button size="sm" className="flex-1">View Batch</Button>
                <Button size="sm" variant="outline">Edit Schedule</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
