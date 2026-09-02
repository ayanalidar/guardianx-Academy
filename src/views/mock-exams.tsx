"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FileQuestion, ArrowRight, Clock, Target, CheckCircle2, AlertCircle } from "lucide-react"

export function MockExamsView() {
  const { navigate } = useAppStore()
  const { data } = useQuery({
    queryKey: ["mock-exams"],
    queryFn: async () => { try { const r = await fetch("/api/mock-exams"); return r.ok ? r.json() : null } catch { return null } },
  })
  const exams = data?.exams ?? []

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <section className="relative py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-300 bg-amber-500/5"><FileQuestion className="h-3 w-3 mr-1.5" /> MOCK EXAMS</Badge>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-3 text-balance">Practice. Assess. <span className="text-gradient-premium">Improve.</span></h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">Timed practice exams with real question banks. Track your readiness and identify weak areas before the real thing.</p>
        </div>
      </section>
      <section className="py-6 lg:py-8 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {exams.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">Loading mock exams...</Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((e: any, i: number) => {
                const attempts = e.userAttempts || []
                const hasPassed = attempts.some((a: any) => a.score >= e.passingScore)
                const hasAttempted = attempts.length > 0
                return (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                    <Card className="p-5 hover:border-amber-500/30 transition-colors h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="inline-flex p-2.5 rounded-lg bg-amber-500/10"><FileQuestion className="h-5 w-5 text-amber-300" /></div>
                        {hasPassed ? <Badge className="bg-emerald-500/10 text-emerald-300 border-0 text-[9px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Passed</Badge> : hasAttempted ? <Badge className="bg-amber-500/10 text-amber-300 border-0 text-[9px]"><AlertCircle className="h-3 w-3 mr-1" /> Attempted</Badge> : <Badge variant="outline" className="text-[9px]">Available</Badge>}
                      </div>
                      <h3 className="font-semibold text-sm mb-2">{e.title}</h3>
                      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {e.duration} minutes</div>
                        <div className="flex items-center gap-1.5"><Target className="h-3 w-3" /> {e.questionCount} questions</div>
                        <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Pass: {e.passingScore}%</div>
                      </div>
                      <Button size="sm" onClick={() => navigate({ name: "login" })} className="mt-auto btn-premium bg-amber-600 hover:bg-amber-500">
                        {hasAttempted ? "Retake Exam" : "Start Exam"} <ArrowRight className="h-3 w-3 ml-1.5" />
                      </Button>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
