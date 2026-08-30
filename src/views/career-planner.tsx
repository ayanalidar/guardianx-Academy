"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "@/components/platform/motion-system"
import {
  Briefcase,
  Target,
  TrendingUp,
  GraduationCap,
  Award,
  FlaskConical,
  Map,
  CheckCircle2,
  Circle,
  DollarSign,
  Rocket,
  Clock,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

/* ============================================================
   CareerPlannerView — visual roadmap with role selector
   ============================================================ */

interface CareerRole {
  id: string
  title: string
  description: string
  avgSalary: string
  requiredSkills: string[]
  recommendedCourses: string[]
  growthRate: string
  category: string
}

interface CareerPath {
  id: string
  targetRole: string
  currentRole: string
  targetSalary: string
  recommendedCourses: string[]
  recommendedCerts: string[]
  recommendedLabs: string[]
  estimatedWeeks: number
  progress: number
}

interface CourseItem {
  id: string
  shortName: string
  title: string
}
interface LabItem {
  id: string
  title: string
  category: string
  difficulty: string
}

const DEFAULT_CERTS: Record<string, string[]> = {
  security: ["CompTIA Security+", "CEH", "CySA+", "OSCP"],
  cloud: ["CCSP", "AWS Security Specialty", "Azure SC-100"],
  governance: ["CISSP", "CISM", "ISO 27001 Lead Auditor"],
  network: ["CCNA", "CCNP Security", "Palo Alto PCNSE"],
}

const CATEGORY_LABEL: Record<string, string> = {
  security: "Security",
  cloud: "Cloud",
  governance: "Governance",
  network: "Network",
}

const CATEGORY_COLOR: Record<string, string> = {
  security: "text-violet-300 border-violet-500/30 bg-violet-500/10",
  cloud: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
  governance: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  network: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
}

export function CareerPlannerView() {
  const qc = useQueryClient()

  const { data: rolesData, isLoading: rolesLoading } = useQuery<{ roles: CareerRole[] }>({
    queryKey: ["career-roles"],
    queryFn: () => api("/api/career/roles"),
  })

  const { data: coursesData } = useQuery<{ courses: CourseItem[] }>({
    queryKey: ["career-courses"],
    queryFn: () => api("/api/courses"),
  })
  const { data: labsData } = useQuery<{ labs: LabItem[] }>({
    queryKey: ["career-labs"],
    queryFn: () => api("/api/labs"),
  })

  const { data: pathData } = useQuery<{ path: CareerPath | null }>({
    queryKey: ["career-path"],
    queryFn: () => api("/api/career/path"),
  })

  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [currentRole, setCurrentRole] = React.useState("")
  const [targetSalary, setTargetSalary] = React.useState("")
  const [estimatedWeeks, setEstimatedWeeks] = React.useState(12)

  // Pre-fill when path loads
  React.useEffect(() => {
    if (pathData?.path) {
      const role = (rolesData?.roles ?? []).find((r) => r.title === pathData.path!.targetRole)
      if (role) setSelectedRoleId(role.id)
      setCurrentRole(pathData.path.currentRole)
      setTargetSalary(pathData.path.targetSalary)
      setEstimatedWeeks(pathData.path.estimatedWeeks)
    }
  }, [pathData, rolesData])

  const selectedRole = (rolesData?.roles ?? []).find((r) => r.id === selectedRoleId)

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) throw new Error("Select a target role first")
      const courseIds = (coursesData?.courses ?? [])
        .slice(0, 4)
        .map((c) => c.id)
      const labIds = (labsData?.labs ?? []).slice(0, 3).map((l) => l.id)
      const certs = DEFAULT_CERTS[selectedRole.category] || DEFAULT_CERTS.security
      return api<{ path: CareerPath }>("/api/career/path", {
        method: "POST",
        body: JSON.stringify({
          targetRole: selectedRole.title,
          currentRole,
          targetSalary,
          recommendedCourses: courseIds,
          recommendedCerts: certs,
          recommendedLabs: labIds,
          estimatedWeeks,
        }),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["career-path"] })
      toast.success("Career path saved")
    },
    onError: (err: any) => toast.error(err?.message || "Failed to save career path"),
  })

  const path = pathData?.path ?? null
  const roles = rolesData?.roles ?? []

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.25em]">
              CAREER PATH PLANNER
            </span>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.03em] mb-3 text-balance">
            Plan your <span className="text-gradient-premium">cybersecurity career</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-muted-foreground max-w-xl mb-10">
            Choose your target role and we&apos;ll generate a personalized roadmap with recommended
            courses, certifications, and hands-on labs.
          </p>
        </ScrollReveal>

        {/* Progress dashboard if a path exists */}
        {path && (
          <ScrollReveal delay={0.25}>
            <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm p-6 mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-1">
                    Your Career Path
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">{path.targetRole}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {path.currentRole ? `From: ${path.currentRole}` : "Set your current role"}{" "}
                    {path.targetSalary ? `→ Target: ${path.targetSalary}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
                      Estimated
                    </p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-violet-300" />
                      <span className="text-lg font-semibold">{path.estimatedWeeks}w</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="text-violet-300 font-mono">{path.progress}%</span>
              </div>
              <Progress value={path.progress} className="h-2" />
            </div>
          </ScrollReveal>
        )}

        {/* Role picker */}
        <ScrollReveal delay={0.3}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-violet-300" />
            <h2 className="text-lg font-semibold">Choose your target role</h2>
          </div>
        </ScrollReveal>

        {rolesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {roles.map((r, i) => {
              const isSel = selectedRoleId === r.id
              return (
                <ScrollReveal key={r.id} delay={0.3 + i * 0.04}>
                  <button
                    onClick={() => setSelectedRoleId(r.id)}
                    className={cn(
                      "w-full text-left rounded-xl border bg-card/30 backdrop-blur-sm p-5 transition-all hover:bg-card/50",
                      isSel
                        ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                        : "border-border/60 hover:border-violet-500/30"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("inline-flex p-2 rounded-lg border", CATEGORY_COLOR[r.category] || CATEGORY_COLOR.security)}>
                        <Briefcase className="h-4 w-4" />
                      </div>
                      {isSel && (
                        <CheckCircle2 className="h-5 w-5 text-violet-300" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-1.5 text-sm">{r.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-violet-300/80">{r.avgSalary}</span>
                      <span className="text-emerald-300 flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" />
                        {r.growthRate}
                      </span>
                    </div>
                  </button>
                </ScrollReveal>
              )
            })}
          </div>
        )}

        {/* Selected role detail + roadmap form */}
        {selectedRole && (
          <ScrollReveal>
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Role details + form */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-violet-300" />
                    <h3 className="font-semibold">{selectedRole.title}</h3>
                    <Badge variant="outline" className={cn("ml-auto text-[10px]", CATEGORY_COLOR[selectedRole.category] || CATEGORY_COLOR.security)}>
                      {CATEGORY_LABEL[selectedRole.category] || selectedRole.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {selectedRole.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-2">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole.requiredSkills.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Avg Salary</p>
                      <p className="text-sm font-semibold text-violet-300">{selectedRole.avgSalary}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Growth</p>
                      <p className="text-sm font-semibold text-emerald-300">{selectedRole.growthRate}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Category</p>
                      <p className="text-sm font-semibold">{CATEGORY_LABEL[selectedRole.category]}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border/60 pt-4">
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5 block">
                        Current role
                      </label>
                      <Input
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="e.g. Junior Developer"
                        className="bg-card border-border/60 text-sm h-9"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5 block">
                          Target salary
                        </label>
                        <Input
                          value={targetSalary}
                          onChange={(e) => setTargetSalary(e.target.value)}
                          placeholder="$120,000"
                          className="bg-card border-border/60 text-sm h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5 block">
                          Estimated weeks
                        </label>
                        <Input
                          type="number"
                          value={estimatedWeeks}
                          onChange={(e) => setEstimatedWeeks(Number(e.target.value) || 12)}
                          className="bg-card border-border/60 text-sm h-9"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      className="w-full bg-violet-600 hover:bg-violet-500 btn-premium"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save Career Path"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recommended roadmap */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm p-6 sticky top-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Map className="h-4 w-4 text-violet-300" />
                    <h3 className="font-semibold">Recommended Roadmap</h3>
                  </div>
                  <ScrollArea className="max-h-[520px]">
                    <div className="space-y-4 pr-2">
                      {/* Courses */}
                      <RoadmapSection
                        icon={GraduationCap}
                        title="Recommended Courses"
                        items={(coursesData?.courses ?? []).slice(0, 4).map((c) => ({
                          id: c.id,
                          label: c.shortName,
                          sub: c.title,
                        }))}
                      />
                      {/* Certifications */}
                      <RoadmapSection
                        icon={Award}
                        title="Certifications to Pursue"
                        items={(DEFAULT_CERTS[selectedRole.category] || DEFAULT_CERTS.security).map((c, i) => ({
                          id: String(i),
                          label: c,
                          sub: "",
                        }))}
                      />
                      {/* Labs */}
                      <RoadmapSection
                        icon={FlaskConical}
                        title="Hands-on Labs"
                        items={(labsData?.labs ?? []).slice(0, 3).map((l) => ({
                          id: l.id,
                          label: l.title,
                          sub: `${l.category} · ${l.difficulty}`,
                        }))}
                      />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}

function RoadmapSection({
  icon: Icon,
  title,
  items,
}: {
  icon: any
  title: string
  items: { id: string; label: string; sub: string }[]
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-violet-300" />
        <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
          {title}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground/70">No items yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <div
              key={it.id}
              className="flex items-start gap-2 rounded-lg border border-border/40 bg-background/30 p-2.5"
            >
              <Circle className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{it.label}</p>
                {it.sub && <p className="text-[10px] text-muted-foreground truncate">{it.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
