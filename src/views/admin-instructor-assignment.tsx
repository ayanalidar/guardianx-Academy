"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Users, Calendar, AlertTriangle, CheckCircle2,
  UserCog, Clock,
} from "lucide-react"
import { toast } from "sonner"

const INSTRUCTORS = [
  { id: "1", name: "Dr. Sarah Chen", expertise: "Pentesting, Web Security", batches: 2, maxBatches: 3 },
  { id: "2", name: "Raj Patel", expertise: "Network Security, SOC", batches: 2, maxBatches: 3 },
  { id: "3", name: "Alex Mercer", expertise: "Cloud Security, GRC", batches: 1, maxBatches: 2 },
]

const BATCHES = [
  { id: "b1", name: "CEH Weekend Batch", cert: "CEH", schedule: "Sat-Sun 7PM", instructor: "Dr. Sarah Chen", status: "assigned" },
  { id: "b2", name: "Security+ Weekday", cert: "Security+", schedule: "MWF 8PM", instructor: "Raj Patel", status: "assigned" },
  { id: "b3", name: "CCNA Morning", cert: "CCNA", schedule: "Tue-Thu 7AM", instructor: "Raj Patel", status: "assigned" },
  { id: "b4", name: "CISSP Weekend", cert: "CISSP", schedule: "Sat-Sun 10AM", instructor: "Alex Mercer", status: "assigned" },
  { id: "b5", name: "WAPT Bootcamp", cert: "WAPT", schedule: "Mon-Fri 6PM", instructor: null, status: "unassigned" },
]

export function InstructorAssignmentView() {
  const { navigate } = useAppStore()
  const [batches, setBatches] = React.useState(BATCHES)

  function assignInstructor(batchId: string, instructorName: string) {
    setBatches(batches.map(b => b.id === batchId ? { ...b, instructor: instructorName, status: "assigned" } : b))
    toast.success(`Assigned ${instructorName} to batch`)
  }

  // Conflict detection: same instructor on overlapping schedule
  function hasConflict(batch: typeof BATCHES[0]): boolean {
    return batches.some(b => b.id !== batch.id && b.instructor === batch.instructor && b.schedule === batch.schedule)
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
              <UserCog className="h-5 w-5 text-amber-400" /> Instructor Assignment Manager
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Instructor workload */}
        <div className="grid sm:grid-cols-3 gap-4">
          {INSTRUCTORS.map(inst => (
            <Card key={inst.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex p-2 rounded-lg bg-violet-500/10"><Users className="h-4 w-4 text-violet-300" /></div>
                <div>
                  <div className="font-semibold text-sm">{inst.name}</div>
                  <div className="text-[10px] text-muted-foreground">{inst.expertise}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Workload</span>
                <Badge variant="outline" className={cn("text-[9px]", inst.batches >= inst.maxBatches ? "text-rose-300 border-rose-500/30" : "text-emerald-300 border-emerald-500/30")}>
                  {inst.batches}/{inst.maxBatches} batches
                </Badge>
              </div>
              <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", inst.batches >= inst.maxBatches ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${(inst.batches / inst.maxBatches) * 100}%` }} />
              </div>
            </Card>
          ))}
        </div>

        {/* Batch assignments */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Batch</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Schedule</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Instructor</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => {
                  const conflict = b.instructor && hasConflict(b)
                  return (
                    <tr key={b.id} className="border-t border-border/40 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="font-medium text-sm">{b.name}</div>
                        <Badge variant="outline" className="text-[9px] mt-0.5">{b.cert}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{b.schedule}</td>
                      <td className="py-3 px-4">
                        <Select value={b.instructor ?? ""} onValueChange={v => assignInstructor(b.id, v)}>
                          <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                          <SelectContent>
                            {INSTRUCTORS.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        {conflict ? (
                          <Badge className="text-[9px] bg-rose-500/10 text-rose-300 border border-rose-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Conflict</Badge>
                        ) : b.instructor ? (
                          <Badge className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Assigned</Badge>
                        ) : (
                          <Badge className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30">Unassigned</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Conflict info */}
        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-300 font-semibold">CONFLICT DETECTION:</span> The system automatically detects when an instructor is assigned to two batches with the same schedule. Conflicts are highlighted in red.
          </p>
        </Card>
      </div>
    </div>
  )
}
