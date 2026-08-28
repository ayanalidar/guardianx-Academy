"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { colorFor, DIFFICULTY_COLORS } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search, FlaskConical, Clock, Target, ChevronRight, Terminal, Shield,
  CheckCircle2, Circle, PlayCircle, Flame, Zap, Lock, TrendingUp,
} from "lucide-react"

interface LabItem {
  id: string; slug: string; title: string; description: string; longDescription: string
  category: string; difficulty: string; durationMin: number; points: number; tags: string
  color: string; progress?: { status: string; flagFound: boolean } | null
}

const CATEGORIES = ["All", "Web Security", "Network", "Privilege Escalation", "Cryptography", "Forensics", "Reverse Engineering", "Active Directory"]
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard", "Insane"]

const CATEGORY_ICONS: Record<string, any> = {
  "Web Security": Shield,
  "Network": Terminal,
  "Privilege Escalation": Lock,
  "Cryptography": Zap,
  "Forensics": Target,
  "Reverse Engineering": FlaskConical,
  "Active Directory": Shield,
}

export function LabsView() {
  const { navigate } = useAppStore()
  const [q, setQ] = React.useState("")
  const [category, setCategory] = React.useState("All")
  const [difficulty, setDifficulty] = React.useState("All")

  const { data, isLoading } = useQuery<{ labs: LabItem[] }>({
    queryKey: ["labs", q, category, difficulty],
    queryFn: () => {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (category !== "All") params.set("category", category)
      if (difficulty !== "All") params.set("difficulty", difficulty)
      return api(`/api/labs?${params.toString()}`)
    },
  })

  const labs = data?.labs ?? []
  const completed = labs.filter((l) => l.progress?.status === "completed").length
  const inProgress = labs.filter((l) => l.progress?.status === "in_progress").length
  const totalPoints = labs.filter((l) => l.progress?.status === "completed").reduce((a, l) => a + l.points, 0)

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-background to-background p-6 lg:p-8 scanlines">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-mono mb-3">
              <Terminal className="h-3 w-3" /> HANDS-ON LABS
            </div>
            <h1 className="text-3xl font-bold mb-2">Cyber Security Labs</h1>
            <p className="text-muted-foreground max-w-xl">
              Practice real-world offensive security challenges. From SQLi to Active Directory Kerberoasting — solve CTF-style labs and capture the flag.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center px-4 py-3 rounded-xl border border-border bg-card/40 backdrop-blur">
              <div className="text-2xl font-bold text-emerald-400">{completed}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Solved</div>
            </div>
            <div className="text-center px-4 py-3 rounded-xl border border-border bg-card/40 backdrop-blur">
              <div className="text-2xl font-bold text-amber-400">{inProgress}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Active</div>
            </div>
            <div className="text-center px-4 py-3 rounded-xl border border-border bg-card/40 backdrop-blur">
              <div className="text-2xl font-bold text-violet-400">{totalPoints}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search labs by name, technique, or tag..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `${labs.length} labs available`}</div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : labs.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No labs match your filters</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {labs.map((lab) => {
            const col = colorFor(lab.color)
            const CatIcon = CATEGORY_ICONS[lab.category] ?? FlaskConical
            const done = lab.progress?.status === "completed"
            const started = lab.progress?.status === "in_progress"
            return (
              <button key={lab.id} onClick={() => navigate({ name: "lab", labSlug: lab.slug })} className="text-left group">
                <Card className="overflow-hidden card-hover h-full flex flex-col relative">
                  {done && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" /> SOLVED
                    </div>
                  )}
                  {started && !done && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-mono border border-amber-500/30">
                      <Circle className="h-3 w-3 fill-current" /> IN PROGRESS
                    </div>
                  )}
                  <div className={`relative h-24 bg-gradient-to-br ${col.gradient} flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <CatIcon className={`relative h-10 w-10 ${col.text}`} strokeWidth={1.5} />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] ${DIFFICULTY_COLORS[lab.difficulty]}`}>{lab.difficulty}</Badge>
                      <Badge variant="outline" className="text-[10px]">{lab.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-violet-400 transition-colors line-clamp-1">{lab.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{lab.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lab.durationMin}m</span>
                      <span className="flex items-center gap-1 text-violet-400 font-medium"><Target className="h-3 w-3" />{lab.points} pts</span>
                    </div>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
