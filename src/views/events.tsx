"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Calendar, ArrowRight, Video, MapPin, Users, Clock, Trophy, Mic, FlaskConical } from "lucide-react"

const TYPE_ICONS: Record<string, any> = { Workshop: FlaskConical, Webinar: Mic, CTF: Trophy, Bootcamp: Calendar, "Campus Event": MapPin, Seminar: Mic }

export function EventsView() {
  const { navigate } = useAppStore()
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => { try { const r = await fetch("/api/events"); return r.ok ? r.json() : null } catch { return null } },
  })
  const events = data?.events ?? []
  const upcoming = events.filter((e: any) => e.status === "Upcoming")
  const past = events.filter((e: any) => e.status === "Completed")

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <section className="relative py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-300 bg-cyan-500/5"><Calendar className="h-3 w-3 mr-1.5" /> EVENTS & EXPERIENCES</Badge>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-3 text-balance">Workshops. Webinars. <span className="text-gradient-cyan">CTFs.</span></h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">Hands-on workshops, live webinars, competitive CTFs, and campus events - in-person and online.</p>
        </div>
      </section>
      <section className="py-6 lg:py-8 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {upcoming.length > 0 && (
            <>
              <h2 className="text-sm font-semibold mb-4 text-violet-300">UPCOMING EVENTS</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {upcoming.map((e: any, i: number) => {
                  const Icon = TYPE_ICONS[e.type] || Calendar
                  return (
                    <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                      <Card className="p-5 hover:border-violet-500/30 transition-colors h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn("inline-flex p-2.5 rounded-lg", e.color?.includes("violet") ? "bg-violet-500/10" : e.color?.includes("cyan") ? "bg-cyan-500/10" : e.color?.includes("amber") ? "bg-amber-500/10" : "bg-emerald-500/10")}><Icon className={cn("h-5 w-5", e.color || "text-violet-300")} /></div>
                          <Badge variant="outline" className="text-[9px]">{e.type}</Badge>
                        </div>
                        <h3 className="font-semibold text-base mb-2">{e.title}</h3>
                        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(e.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          <div className="flex items-center gap-1.5">{e.mode === "Online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />} {e.mode}</div>
                          {e.speaker && <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {e.speaker}</div>}
                          <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {e.registeredCount}/{e.capacity} registered</div>
                        </div>
                        <Button size="sm" onClick={() => navigate({ name: "contact" })} className="mt-auto btn-premium bg-violet-600 hover:bg-violet-500">Register <ArrowRight className="h-3 w-3 ml-1.5" /></Button>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
          {past.length > 0 && (
            <>
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground">PAST EVENTS</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((e: any) => (
                  <Card key={e.id} className="p-4 opacity-60">
                    <div className="flex items-center gap-2 mb-2"><Badge variant="outline" className="text-[9px]">{e.type}</Badge></div>
                    <h3 className="font-semibold text-sm mb-1">{e.title}</h3>
                    <div className="text-xs text-muted-foreground">{new Date(e.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </Card>
                ))}
              </div>
            </>
          )}
          {events.length === 0 && <Card className="p-8 text-center text-muted-foreground text-sm">Loading events...</Card>}
        </div>
      </section>
    </div>
  )
}
