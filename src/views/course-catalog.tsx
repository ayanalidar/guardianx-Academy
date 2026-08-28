"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { colorFor, LEVEL_COLORS } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Clock, BookOpen, Users, Shield, SlidersHorizontal } from "lucide-react"

interface CourseItem {
  id: string; slug: string; title: string; shortName: string; description: string
  category: string; level: string; durationHours: number; rating: number
  studentsCount: number; color: string; tags: string; certBody: string
  instructor: { id: string; name: string; title: string | null }
  lessonCount: number; moduleCount: number
}

const CATEGORIES = ["All", "Ethical Hacking", "Networking", "Web Security", "System Administration", "Security Management", "Identity & Access"]
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"]

export function CourseCatalogView() {
  const { navigate } = useAppStore()
  const [q, setQ] = React.useState("")
  const [category, setCategory] = React.useState("All")
  const [level, setLevel] = React.useState("All")

  const { data, isLoading } = useQuery<{ courses: CourseItem[] }>({
    queryKey: ["courses", q, category, level],
    queryFn: () => {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (category !== "All") params.set("category", category)
      if (level !== "All") params.set("level", level)
      return api(`/api/courses?${params.toString()}`)
    },
  })

  const courses = data?.courses ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-950/30 to-background p-6 lg:p-8">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-3">
            <Shield className="h-3 w-3" /> CERTIFICATION TRACKS
          </div>
          <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
          <p className="text-muted-foreground max-w-2xl">
            Industry-recognized cyber security certification prep. From beginner networking to advanced exploitation and privileged access management.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, topic, or tag (e.g. SQLi, BGP, SELinux)..."
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {isLoading ? "Loading..." : `${courses.length} course${courses.length !== 1 ? "s" : ""} found`}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-28" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /></div>
              </div>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No courses found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => {
            const col = colorFor(c.color)
            return (
              <button key={c.id} onClick={() => navigate({ name: "course", courseId: c.id })} className="text-left group">
                <Card className="overflow-hidden card-hover h-full flex flex-col">
                  <div className={`relative h-28 bg-gradient-to-br ${col.gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <div className="absolute top-0 right-0 px-2 py-1 bg-background/60 backdrop-blur text-[10px] font-mono text-muted-foreground rounded-bl-lg">
                      {c.certBody}
                    </div>
                    <span className={`relative font-mono font-bold text-3xl ${col.text} group-hover:scale-110 transition-transform`}>
                      {c.shortName}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[c.level]}`}>{c.level}</Badge>
                      <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">{c.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{c.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{c.rating}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.studentsCount.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.durationHours}h</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.lessonCount}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">by {c.instructor.name}</span>
                      <span className={`text-sm font-bold ${col.text}`}>${c.price}</span>
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
