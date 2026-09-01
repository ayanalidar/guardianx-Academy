"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Sparkles, Loader2, CheckCircle2, AlertCircle,
  BookOpen, FileText, Award, Zap, RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

export function AiCourseGeneratorView() {
  const { navigate } = useAppStore()
  const qc = useQueryClient()

  // Fetch certifications
  const { data: certsData } = useQuery({
    queryKey: ["certifications-for-ai"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/certifications")
        if (!res.ok) return null
        return res.json()
      } catch { return null }
    },
  })
  const certifications = certsData?.certifications ?? []

  // Fetch instructors
  const { data: instructorsData } = useQuery({
    queryKey: ["instructors-for-ai"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/instructors")
        if (!res.ok) return null
        return res.json()
      } catch { return null }
    },
  })
  const instructors = instructorsData?.instructors ?? []

  // Form state
  const [certSlug, setCertSlug] = React.useState("")
  const [audience, setAudience] = React.useState("Beginner")
  const [level, setLevel] = React.useState("Beginner")
  const [durationHours, setDurationHours] = React.useState(40)
  const [instructorId, setInstructorId] = React.useState("")

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/ai-course-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Generation failed")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(`Course generated: ${data.courseTitle} (${data.moduleCount} modules, ${data.lessonCount} lessons)`)
      qc.invalidateQueries({ queryKey: ["courses"] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleGenerate = () => {
    if (!certSlug) { toast.error("Select a certification"); return }
    if (!instructorId) { toast.error("Select an instructor"); return }
    generateMutation.mutate({
      certificationSlug: certSlug,
      audience,
      level,
      durationHours: Number(durationHours),
      instructorId,
    })
  }

  const result = generateMutation.data

  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" /> AI Course Generator
            </h1>
          </div>
          {result && (
            <Badge className="bg-emerald-500/10 text-emerald-300 border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Last: {result.courseTitle}
            </Badge>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* How it works */}
        <Card className="p-5 border-violet-500/20 bg-violet-500/5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-300" /> How AI Course Generator Works
          </h2>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { step: "01", icon: BookOpen, title: "Curriculum Designer", desc: "AI designs modules & lessons from certification domains", color: "text-violet-300", bg: "bg-violet-500/10" },
              { step: "02", icon: FileText, title: "Content Writer", desc: "AI writes lesson content for each module", color: "text-cyan-300", bg: "bg-cyan-500/10" },
              { step: "03", icon: Award, title: "Assessment Builder", desc: "AI creates quiz questions per module", color: "text-amber-300", bg: "bg-amber-500/10" },
              { step: "04", icon: CheckCircle2, title: "Quality Reviewer", desc: "AI validates domain coverage", color: "text-emerald-300", bg: "bg-emerald-500/10" },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className={cn("inline-flex p-2.5 rounded-lg mb-2", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">{s.step}</div>
                <div className="text-xs font-semibold">{s.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Generator form */}
        <Card className="p-6 space-y-5">
          <h2 className="text-sm font-semibold">Generate New Course</h2>

          {/* Certification */}
          <div>
            <Label className="text-xs mb-1.5 block">Certification *</Label>
            <Select value={certSlug} onValueChange={setCertSlug}>
              <SelectTrigger><SelectValue placeholder="Select certification..." /></SelectTrigger>
              <SelectContent>
                {certifications.map((c: any) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name} ({c.issuer})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected cert details */}
          {certSlug && (() => {
            const cert = certifications.find((c: any) => c.slug === certSlug)
            if (!cert) return null
            return (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn("text-[9px]", cert.color)}>{cert.level}</Badge>
                  <span className="text-xs text-muted-foreground">{cert.issuer}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(cert.domains || []).slice(0, 5).map((d: string) => (
                    <span key={d} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{d}</span>
                  ))}
                  {(cert.domains || []).length > 5 && <span className="text-[9px] text-muted-foreground">+{cert.domains.length - 5} more</span>}
                </div>
              </div>
            )
          })()}

          {/* Grid: audience, level, duration, instructor */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5 block">Target Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aspirants">Aspirants (new to cybersecurity)</SelectItem>
                  <SelectItem value="Freshers">Freshers (starting career)</SelectItem>
                  <SelectItem value="Working Professional">Working Professional</SelectItem>
                  <SelectItem value="Students">Students (school/college)</SelectItem>
                  <SelectItem value="Institution">Institution (batch training)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Course Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Duration (hours)</Label>
              <Input type="number" value={durationHours} onChange={e => setDurationHours(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Assign Instructor *</Label>
              <Select value={instructorId} onValueChange={setInstructorId}>
                <SelectTrigger><SelectValue placeholder="Select instructor..." /></SelectTrigger>
                <SelectContent>
                  {instructors.map((inst: any) => (
                    <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {generateMutation.isPending ? (
                <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> AI agents working...</span>
              ) : (
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-violet-400" /> Ready to generate</span>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !certSlug || !instructorId}
              className="bg-violet-600 hover:bg-violet-500 btn-premium"
            >
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate Course</>
              )}
            </Button>
          </div>
        </Card>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold text-emerald-300">Course Generated Successfully!</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-card/50">
                  <BookOpen className="h-5 w-5 text-violet-300 mx-auto mb-1" />
                  <div className="text-xl font-bold">{result.moduleCount}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Modules</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50">
                  <FileText className="h-5 w-5 text-cyan-300 mx-auto mb-1" />
                  <div className="text-xl font-bold">{result.lessonCount}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Lessons</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50">
                  <Award className="h-5 w-5 text-amber-300 mx-auto mb-1" />
                  <div className="text-xl font-bold">{result.quizCount}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Quizzes</div>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Course Title</span><span className="font-medium">{result.courseTitle}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Course ID</span><span className="font-mono text-xs">{result.courseId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="text-amber-300 border-amber-500/30">Draft</Badge></div>
              </div>
              {result.review && (
                <div className="p-3 rounded-lg bg-card/50 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    {result.review.covers_all ? (
                      <><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-300">All certification domains covered</span></>
                    ) : (
                      <><AlertCircle className="h-4 w-4 text-amber-400" /><span className="text-xs font-semibold text-amber-300">Some domains may be missing</span></>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{result.review.assessment}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => navigate({ name: "course", courseId: result.courseId })} className="bg-violet-600 hover:bg-violet-500 btn-premium flex-1">
                  Review Course <ArrowLeft className="h-3.5 w-3.5 ml-1.5 rotate-180" />
                </Button>
                <Button variant="outline" onClick={() => { generateMutation.reset(); setCertSlug(""); setInstructorId("") }}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Generate Another
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                Course is saved as DRAFT. Review in Course Studio before publishing.
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
