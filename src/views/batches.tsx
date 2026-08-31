"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Video,
  Users,
  Target,
  Building2,
  Sparkles,
  Filter,
  X,
  CalendarDays,
  CalendarCheck,
  Sun,
  Sunset,
  Moon,
  MapPin,
  Signal,
} from "lucide-react"

/* ============================================================
   BatchesView — dedicated batches discovery page.

   Structure:
   1. Hero — "Upcoming Certification Batches"
   2. Filters — Certification, Schedule, Mode, Level
   3. Batch Grid — detailed batch cards
   4. CTA — "Don't see your batch?" request flow

   Data is hardcoded for now — will be DB-driven in a later task.
   ============================================================ */

interface Batch {
  id: string
  certification: string
  certGroup: "Security+" | "CEH" | "CCNA" | "CISSP"
  name: string
  schedule: string
  startDate: string
  mode: "Live Online" | "On-Campus"
  instructor: string
  seats: number
  almostFull: boolean
  level: "Beginner" | "Intermediate" | "Advanced"
  // visual styling per batch (driven by level)
  certColor: string
  certTint: string
  certBorder: string
  levelColor: string
  levelTint: string
  levelBorder: string
  borderColor: string
  btnClass: string
  // for the schedule filter
  scheduleType: "weekday" | "weekend" | "morning" | "evening" | "late-night"
}

const BATCHES: Batch[] = [
  {
    id: "batch-sec-plus-weekend",
    certification: "CompTIA Security+",
    certGroup: "Security+",
    name: "Security+ Weekend Batch",
    schedule: "Sat + Sun, 7:00 PM – 9:00 PM IST",
    startDate: "October 12",
    mode: "Live Online",
    instructor: "Senior Cybersecurity Instructor",
    seats: 12,
    almostFull: false,
    level: "Beginner",
    certColor: "text-emerald-300",
    certTint: "bg-emerald-500/15",
    certBorder: "border-emerald-500/30",
    levelColor: "text-emerald-300",
    levelTint: "bg-emerald-500/10",
    levelBorder: "border-emerald-500/30",
    borderColor: "border-border/60 hover:border-emerald-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.65_0.15_155_/_0.25)]",
    btnClass: "bg-emerald-600 hover:bg-emerald-500",
    scheduleType: "weekend",
  },
  {
    id: "batch-ceh-weekday-evening",
    certification: "CEH (Certified Ethical Hacker)",
    certGroup: "CEH",
    name: "CEH Weekday Evening",
    schedule: "Mon-Wed-Fri, 8:00 PM – 10:00 PM IST",
    startDate: "October 20",
    mode: "Live Online",
    instructor: "Dr. Sarah Chen",
    seats: 8,
    almostFull: false,
    level: "Intermediate",
    certColor: "text-amber-300",
    certTint: "bg-amber-500/15",
    certBorder: "border-amber-500/30",
    levelColor: "text-amber-300",
    levelTint: "bg-amber-500/10",
    levelBorder: "border-amber-500/30",
    borderColor: "border-border/60 hover:border-amber-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.7_0.15_70_/_0.25)]",
    btnClass: "bg-amber-600 hover:bg-amber-500",
    scheduleType: "weekday",
  },
  {
    id: "batch-ccna-morning",
    certification: "CCNA",
    certGroup: "CCNA",
    name: "CCNA Morning Batch",
    schedule: "Tue-Thu, 7:00 AM – 9:00 AM IST",
    startDate: "November 03",
    mode: "Live Online",
    instructor: "Raj Patel",
    seats: 15,
    almostFull: false,
    level: "Beginner",
    certColor: "text-cyan-300",
    certTint: "bg-cyan-500/15",
    certBorder: "border-cyan-500/30",
    levelColor: "text-emerald-300",
    levelTint: "bg-emerald-500/10",
    levelBorder: "border-emerald-500/30",
    borderColor: "border-border/60 hover:border-cyan-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.7_0.15_220_/_0.25)]",
    btnClass: "bg-cyan-600 hover:bg-cyan-500",
    scheduleType: "morning",
  },
  {
    id: "batch-cissp-weekend-intensive",
    certification: "CISSP",
    certGroup: "CISSP",
    name: "CISSP Weekend Intensive",
    schedule: "Sat-Sun, 10:00 AM – 1:00 PM IST",
    startDate: "November 09",
    mode: "Live Online",
    instructor: "Alex Mercer",
    seats: 5,
    almostFull: true,
    level: "Advanced",
    certColor: "text-rose-300",
    certTint: "bg-rose-500/15",
    certBorder: "border-rose-500/30",
    levelColor: "text-rose-300",
    levelTint: "bg-rose-500/10",
    levelBorder: "border-rose-500/30",
    borderColor: "border-border/60 hover:border-rose-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.65_0.2_15_/_0.25)]",
    btnClass: "bg-rose-600 hover:bg-rose-500",
    scheduleType: "weekend",
  },
]

/* Filter options ------------------------------------------------ */

const CERT_FILTERS = [
  { value: "all", label: "All Certifications" },
  { value: "Security+", label: "CompTIA Security+" },
  { value: "CEH", label: "CEH" },
  { value: "CCNA", label: "CCNA" },
  { value: "CISSP", label: "CISSP" },
] as const

const SCHEDULE_FILTERS = [
  { value: "all", label: "All Schedules", icon: Calendar },
  { value: "weekday", label: "Weekday", icon: CalendarDays },
  { value: "weekend", label: "Weekend", icon: CalendarCheck },
  { value: "morning", label: "Morning", icon: Sun },
  { value: "evening", label: "Evening", icon: Sunset },
  { value: "late-night", label: "Late Night", icon: Moon },
] as const

const MODE_FILTERS = [
  { value: "all", label: "All Modes", icon: Signal },
  { value: "Live Online", label: "Live Online", icon: Video },
  { value: "On-Campus", label: "On-Campus", icon: Building2 },
] as const

const LEVEL_FILTERS = [
  { value: "all", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
] as const

const FADE_UP = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
}

export function BatchesView() {
  const { navigate } = useAppStore()

  /* ----------------------------- filters state ----------------------------- */
  const [certFilter, setCertFilter] = React.useState<string>("all")
  const [scheduleFilter, setScheduleFilter] = React.useState<string>("all")
  const [modeFilter, setModeFilter] = React.useState<string>("all")
  const [levelFilter, setLevelFilter] = React.useState<string>("all")

  /* --------------------------- filtered batches ---------------------------- */
  const filteredBatches = React.useMemo(() => {
    return BATCHES.filter((b) => {
      if (certFilter !== "all" && b.certGroup !== certFilter) return false
      if (scheduleFilter !== "all" && b.scheduleType !== scheduleFilter) return false
      if (modeFilter !== "all" && b.mode !== modeFilter) return false
      if (levelFilter !== "all" && b.level !== levelFilter) return false
      return true
    })
  }, [certFilter, scheduleFilter, modeFilter, levelFilter])

  const activeFilterCount =
    (certFilter !== "all" ? 1 : 0) +
    (scheduleFilter !== "all" ? 1 : 0) +
    (modeFilter !== "all" ? 1 : 0) +
    (levelFilter !== "all" ? 1 : 0)

  const clearFilters = () => {
    setCertFilter("all")
    setScheduleFilter("all")
    setModeFilter("all")
    setLevelFilter("all")
  }

  return (
    <div className="relative min-h-screen pt-2 lg:pt-4">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" aria-hidden />
      <div
        className="absolute top-0 right-0 w-[600px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10">
        {/* ====================================================
            SECTION 1: HERO
            ==================================================== */}
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <button
                onClick={() => navigate({ name: "home" })}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-violet-300 transition-colors tracking-[0.2em]"
              >
                <ArrowLeft className="h-3 w-3" />
                BACK TO HOME
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex items-center gap-2 mb-4"
            >
              <Calendar className="h-5 w-5 text-violet-300" aria-hidden />
              <span className="text-[10px] font-mono text-violet-300/80 tracking-[0.25em]">
                LIVE INSTRUCTOR-LED BATCHES
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-4 text-balance"
            >
              Upcoming{" "}
              <span className="text-gradient-premium">Certification Batches</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-base lg:text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed"
            >
              Live instructor-led training with flexible schedules. Choose a batch
              that fits your certification goal, time zone, and skill level — then
              enroll before seats fill up.
            </motion.p>

            {/* Quick stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-border/40 max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
                BATCHES OPEN
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-300">
                <span className="size-2 rounded-full bg-cyan-400" aria-hidden />
                LIVE SESSIONS
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-violet-300">
                <span className="size-2 rounded-full bg-violet-400" aria-hidden />
                12 EXPERT INSTRUCTORS
              </span>
            </motion.div>
          </div>
        </section>

        {/* ====================================================
            SECTION 2: FILTERS
            ==================================================== */}
        <section className="py-6 lg:py-8 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between gap-4 mb-4"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span className="text-sm font-semibold">Filter Batches</span>
                {activeFilterCount > 0 && (
                  <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/30 font-mono text-[10px]">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Clear filters
                </button>
              )}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Certification filter */}
              <FilterGroup label="Certification">
                <FilterSelect
                  value={certFilter}
                  onChange={setCertFilter}
                  options={CERT_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
                />
              </FilterGroup>

              {/* Schedule filter */}
              <FilterGroup label="Schedule">
                <div className="flex flex-wrap gap-1.5">
                  {SCHEDULE_FILTERS.map((f) => {
                    const active = scheduleFilter === f.value
                    return (
                      <button
                        key={f.value}
                        onClick={() => setScheduleFilter(f.value)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                          active
                            ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                            : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        <f.icon className="size-3" aria-hidden />
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </FilterGroup>

              {/* Mode filter */}
              <FilterGroup label="Mode">
                <div className="flex flex-wrap gap-1.5">
                  {MODE_FILTERS.map((f) => {
                    const active = modeFilter === f.value
                    return (
                      <button
                        key={f.value}
                        onClick={() => setModeFilter(f.value)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                          active
                            ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-200"
                            : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        <f.icon className="size-3" aria-hidden />
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </FilterGroup>

              {/* Level filter */}
              <FilterGroup label="Level">
                <div className="flex flex-wrap gap-1.5">
                  {LEVEL_FILTERS.map((f) => {
                    const active = levelFilter === f.value
                    return (
                      <button
                        key={f.value}
                        onClick={() => setLevelFilter(f.value)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                          active
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                            : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </FilterGroup>
            </div>
          </div>
        </section>

        {/* ====================================================
            SECTION 3: BATCH GRID
            ==================================================== */}
        <section className="py-8 lg:py-12 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em]">
                  Available Batches
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Showing{" "}
                  <span className="text-foreground font-medium">{filteredBatches.length}</span>{" "}
                  of {BATCHES.length} upcoming batches
                </p>
              </div>
            </motion.div>

            {filteredBatches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-border/60 bg-card p-10 text-center"
              >
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/40">
                  <Filter className="size-5 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="text-base font-semibold mb-2">No batches match your filters</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                  Try adjusting or clearing your filters to see all upcoming batches —
                  or request a custom batch below.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                {filteredBatches.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * i, ease: "easeOut" }}
                    className={cn(
                      "group relative rounded-2xl border bg-card p-5 lg:p-6 transition-all duration-300 hover:-translate-y-1",
                      b.borderColor
                    )}
                  >
                    {/* Header row: certification badge + level pill */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <Badge
                          className={cn(
                            "mb-2 font-mono text-[10px] uppercase tracking-wider",
                            b.certTint,
                            b.certColor,
                            b.certBorder
                          )}
                        >
                          {b.certification}
                        </Badge>
                        <h3 className="text-lg font-semibold leading-tight">
                          {b.name}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-wider shrink-0",
                          b.levelTint,
                          b.levelColor,
                          b.levelBorder
                        )}
                      >
                        {b.level}
                      </Badge>
                    </div>

                    {/* Meta rows */}
                    <dl className="space-y-2 text-sm mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                        <span className="text-muted-foreground">{b.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                        <span className="text-muted-foreground">Starts {b.startDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                        <span className="text-muted-foreground">{b.mode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                        <span className="text-muted-foreground">{b.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                        <span
                          className={cn(
                            b.almostFull
                              ? "text-amber-300 font-medium"
                              : "text-emerald-300 font-medium"
                          )}
                        >
                          {b.seats} seats available{b.almostFull ? " · Almost Full" : ""}
                        </span>
                      </div>
                    </dl>

                    <Button
                      onClick={() => navigate({ name: "contact" })}
                      className={cn("w-full btn-premium", b.btnClass)}
                      size="sm"
                      aria-label={`Enroll in ${b.name}`}
                    >
                      ENROLL NOW
                      <ArrowRight className="size-4 ml-2" aria-hidden />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            SECTION 4: CTA — Don't see your batch?
            ==================================================== */}
        <section className="py-12 lg:py-16 border-t border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" aria-hidden />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-violet-600/8 blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...FADE_UP}>
              <div className="inline-flex items-center gap-2 mb-5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5">
                <Sparkles className="size-3.5 text-violet-300" aria-hidden />
                <span className="font-mono text-[10px] text-violet-300/90 tracking-[0.25em]">
                  CUSTOM BATCHES
                </span>
              </div>

              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
                Don&apos;t see your <span className="text-gradient-premium">batch?</span>
              </h2>

              <p className="text-base text-muted-foreground max-w-xl mx-auto mb-7 leading-relaxed">
                Tell us the certification you want, your preferred schedule, and your
                time zone. We&apos;ll open a batch when we have enough learners — or
                arrange a 1-on-1 cohort for your team.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate({ name: "contact" })}
                  className="bg-violet-600 hover:bg-violet-500 btn-premium px-8 py-6 text-sm w-full sm:w-auto"
                  aria-label="Request a batch"
                >
                  <Sparkles className="size-4 mr-2" aria-hidden />
                  REQUEST A BATCH
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ name: "catalog" })}
                  className="px-7 py-6 text-sm w-full sm:w-auto"
                  aria-label="Browse all courses"
                >
                  BROWSE ALL COURSES
                  <ArrowRight className="size-4 ml-2" aria-hidden />
                </Button>
              </div>

              <p className="mt-5 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider inline-flex items-center gap-1.5">
                <MapPin className="size-3" aria-hidden />
                Custom batches available worldwide · Online &amp; on-campus
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- *
 *  FilterGroup + FilterSelect — small presentational helpers        *
 * ---------------------------------------------------------------- */

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-3">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  // Native select — accessible, fast, no extra dep.
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm text-foreground focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
      aria-label="Filter by certification"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
