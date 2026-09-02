"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import {
  ArrowLeft, Users, Search, BookOpen, FlaskConical, Award,
  TrendingUp, Clock, CheckCircle2, Download,
} from "lucide-react"

export function StudentProgressView() {
  const { navigate } = useAppStore()
  const [search, setSearch] = React.useState("")
  const [courseFilter, setCourseFilter] = React.useState("all")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-student-progress", search, courseFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (courseFilter !== "all") params.set("course", courseFilter)
      const res = await fetch(`/api/admin/students?${params}`)
      if (!res.ok) return { students: [], total: 0 }
      return res.json()
    },
    staleTime: 60_000,
  })

  const students = data?.students ?? []
  const totalStudents = (data as any)?.total ?? students.length
  // Derive summary stats from real data instead of hardcoding them.
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum: number, s: any) => sum + (s.progress ?? 0), 0) / students.length)
    : 0
  const totalLabs = students.reduce((sum: number, s: any) => sum + (s.labsCompleted ?? 0), 0)
  const totalCerts = students.reduce((sum: number, s: any) => sum + (s.certCount ?? 0), 0)

  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> Student Progress Overview
            </h1>
          </div>
          <Button size="sm" variant="outline">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: totalStudents, icon: Users, color: "text-violet-300", tint: "bg-violet-500/10" },
            { label: "Avg Course Progress", value: `${avgProgress}%`, icon: BookOpen, color: "text-cyan-300", tint: "bg-cyan-500/10" },
            { label: "Labs Completed", value: totalLabs, icon: FlaskConical, color: "text-amber-300", tint: "bg-amber-500/10" },
            { label: "Certificates Issued", value: totalCerts, icon: Award, color: "text-emerald-300", tint: "bg-emerald-500/10" },
          ].map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("inline-flex p-2 rounded-lg", s.tint)}><s.icon className={cn("h-4 w-4", s.color)} /></div>
                <div><div className="text-2xl font-bold">{s.value}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="ceh">CEH</SelectItem>
              <SelectItem value="ccna">CCNA</SelectItem>
              <SelectItem value="ciSSP">CISSP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Courses</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Labs</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">XP</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Level</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Progress</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No students found.</td></tr>
                ) : (
                  students.map((s: any) => (
                    <tr key={s.id} className="border-t border-border/40 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">{s.enrollments ?? 0}</td>
                      <td className="py-3 px-4 text-sm">{s.labsCompleted ?? 0}</td>
                      <td className="py-3 px-4 text-sm font-mono">{s.xp ?? 0}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className="text-[9px]">Lvl {s.level ?? 1}</Badge></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${s.progress ?? 0}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{s.progress ?? 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
