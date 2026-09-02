"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  ArrowRight, ArrowLeft, Brain, Cloud, Shield, Cpu, Database,
  Sparkles, Server, Network, Zap, TrendingUp, Users, Award,
  GraduationCap, Briefcase, Target, Lock, Code2, Layers,
  Search, BookOpen, Star, FlaskConical, Clock,
} from "lucide-react"
import { getCourseImage } from "@/lib/course-images"

/* ============================================================
   VERTICAL CONFIG
   ============================================================ */
const VERTICALS = {
  ai: {
    eyebrow: "AI & MACHINE LEARNING",
    title: "Master AI",
    titleAccent: "before it masters you.",
    description:
      "From AI fundamentals to LLM security and MLOps — learn how to build, deploy, and secure AI systems. The only platform that teaches AI AND how to attack + defend it.",
    color: "text-violet-300",
    tint: "bg-violet-500/10",
    barColor: "bg-violet-500",
    glow: "shadow-[0_0_30px_-8px] shadow-violet-500/30",
    icon: Brain,
    bgGradient: "bg-violet-600/8",
    bgGradient2: "bg-fuchsia-500/6",
    domains: [
      { icon: Brain, title: "AI Fundamentals", desc: "Machine learning basics, neural networks, supervised/unsupervised learning.", level: "Beginner", color: "text-violet-300", tint: "bg-violet-500/10", barColor: "bg-violet-500", glow: "shadow-[0_0_30px_-8px] shadow-violet-500/30" },
      { icon: Sparkles, title: "LLM & GenAI", desc: "Large language models, prompt engineering, RAG, fine-tuning, deployment.", level: "Intermediate", color: "text-fuchsia-300", tint: "bg-fuchsia-500/10", barColor: "bg-fuchsia-500", glow: "shadow-[0_0_30px_-8px] shadow-fuchsia-500/30" },
      { icon: Lock, title: "AI Security & Red Teaming", desc: "Adversarial attacks, model poisoning, prompt injection, AI red teaming.", level: "Advanced", color: "text-rose-300", tint: "bg-rose-500/10", barColor: "bg-rose-500", glow: "shadow-[0_0_30px_-8px] shadow-rose-500/30" },
      { icon: Cpu, title: "MLOps for Production", desc: "Model deployment, monitoring, CI/CD for ML, Kubernetes for AI workloads.", level: "Intermediate", color: "text-cyan-300", tint: "bg-cyan-500/10", barColor: "bg-cyan-500", glow: "shadow-[0_0_30px_-8px] shadow-cyan-500/30" },
      { icon: Database, title: "NLP & Computer Vision", desc: "Natural language processing, transformers, CNNs, image recognition.", level: "Intermediate", color: "text-amber-300", tint: "bg-amber-500/10", barColor: "bg-amber-500", glow: "shadow-[0_0_30px_-8px] shadow-amber-500/30" },
      { icon: Shield, title: "AI Governance & Ethics", desc: "AI policy, compliance, bias detection, responsible AI frameworks.", level: "Beginner", color: "text-emerald-300", tint: "bg-emerald-500/10", barColor: "bg-emerald-500", glow: "shadow-[0_0_30px_-8px] shadow-emerald-500/30" },
    ],
    certs: ["AI-900", "ML Engineer", "AWS ML", "AI Red Team", "TensorFlow Dev", "Azure AI"],
    stats: [
      { icon: BookOpen, label: "Courses", value: "12+", color: "text-violet-300", tint: "bg-violet-500/10" },
      { icon: Briefcase, label: "Avg Salary", value: "₹14L/yr", color: "text-fuchsia-300", tint: "bg-fuchsia-500/10" },
      { icon: TrendingUp, label: "Job Growth", value: "300%", color: "text-violet-300", tint: "bg-violet-500/10" },
      { icon: Star, label: "Market by 2027", value: "$17B", color: "text-fuchsia-300", tint: "bg-fuchsia-500/10" },
    ],
    crossovers: [
      { icon: Shield, title: "AI Security Engineer", desc: "AI + Cybersecurity — secure AI systems against adversarial attacks.", color: "text-rose-300", tint: "bg-rose-500/10" },
      { icon: Server, title: "DevSecOps for AI", desc: "AI + DevOps + Security — secure ML pipelines and deployments.", color: "text-cyan-300", tint: "bg-cyan-500/10" },
      { icon: Database, title: "Data Privacy Engineer", desc: "AI + GRC — ensure AI systems comply with data protection laws.", color: "text-emerald-300", tint: "bg-emerald-500/10" },
    ],
  },
  cloud: {
    eyebrow: "CLOUD COMPUTING",
    title: "The cloud is",
    titleAccent: "where the world runs now.",
    description:
      "Master AWS, Azure, and GCP — from fundamentals to architecture to security. Build, deploy, and secure cloud infrastructure at scale with hands-on labs.",
    color: "text-cyan-300",
    tint: "bg-cyan-500/10",
    barColor: "bg-cyan-500",
    glow: "shadow-[0_0_30px_-8px] shadow-cyan-500/30",
    icon: Cloud,
    bgGradient: "bg-cyan-600/8",
    bgGradient2: "bg-blue-500/6",
    domains: [
      { icon: Cloud, title: "AWS Architecture", desc: "EC2, S3, RDS, Lambda, VPC, IAM — build scalable AWS infrastructure.", level: "Beginner", color: "text-cyan-300", tint: "bg-cyan-500/10", barColor: "bg-cyan-500", glow: "shadow-[0_0_30px_-8px] shadow-cyan-500/30" },
      { icon: Server, title: "Azure Administration", desc: "Azure AD, VMs, App Services, Azure Storage, networking, security.", level: "Beginner", color: "text-blue-300", tint: "bg-blue-500/10", barColor: "bg-blue-500", glow: "shadow-[0_0_30px_-8px] shadow-blue-500/30" },
      { icon: Network, title: "GCP Fundamentals", desc: "Compute Engine, Cloud Storage, BigQuery, GKE — Google Cloud basics.", level: "Beginner", color: "text-emerald-300", tint: "bg-emerald-500/10", barColor: "bg-emerald-500", glow: "shadow-[0_0_30px_-8px] shadow-emerald-500/30" },
      { icon: Layers, title: "Kubernetes & Docker", desc: "Container orchestration, pod management, Helm, service mesh.", level: "Intermediate", color: "text-violet-300", tint: "bg-violet-500/10", barColor: "bg-violet-500", glow: "shadow-[0_0_30px_-8px] shadow-violet-500/30" },
      { icon: Lock, title: "Cloud Security", desc: "Cloud IAM, network security, data encryption, compliance in the cloud.", level: "Advanced", color: "text-rose-300", tint: "bg-rose-500/10", barColor: "bg-rose-500", glow: "shadow-[0_0_30px_-8px] shadow-rose-500/30" },
      { icon: Code2, title: "Infrastructure as Code", desc: "Terraform, Ansible, CloudFormation — automate everything.", level: "Intermediate", color: "text-amber-300", tint: "bg-amber-500/10", barColor: "bg-amber-500", glow: "shadow-[0_0_30px_-8px] shadow-amber-500/30" },
    ],
    certs: ["AWS SAA", "AZ-104", "CKA", "Cloud Sec", "Terraform", "GCP ACE"],
    stats: [
      { icon: BookOpen, label: "Courses", value: "15+", color: "text-cyan-300", tint: "bg-cyan-500/10" },
      { icon: Briefcase, label: "Avg Salary", value: "₹12L/yr", color: "text-blue-300", tint: "bg-blue-500/10" },
      { icon: TrendingUp, label: "Job Growth", value: "25%/yr", color: "text-cyan-300", tint: "bg-cyan-500/10" },
      { icon: Star, label: "Market Size", value: "$800B+", color: "text-blue-300", tint: "bg-blue-500/10" },
    ],
    crossovers: [
      { icon: Shield, title: "Cloud Security Engineer", desc: "Cloud + Cybersecurity — secure cloud infrastructure from attacks.", color: "text-rose-300", tint: "bg-rose-500/10" },
      { icon: Server, title: "DevSecOps Engineer", desc: "Cloud + DevOps + Security — secure CI/CD pipelines in the cloud.", color: "text-cyan-300", tint: "bg-cyan-500/10" },
      { icon: Network, title: "Cloud Network Architect", desc: "Cloud + Networking — design secure, scalable cloud networks.", color: "text-emerald-300", tint: "bg-emerald-500/10" },
    ],
  },
} as const

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  Intermediate: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  Advanced: "text-rose-300 bg-rose-500/10 border-rose-500/30",
}

interface CourseItem {
  id: string; slug: string; title: string; shortName: string; description: string
  category: string; level: string; durationHours: number; rating: number
  studentsCount: number; color: string; thumbnail: string | null; instructor: { name: string; title: string; avatar: string | null } | null
}

export function VerticalView({ vertical }: { vertical: "ai" | "cloud" }) {
  const { navigate } = useAppStore()
  const cfg = VERTICALS[vertical]
  const [q, setQ] = React.useState("")
  const [level, setLevel] = React.useState("All")
  const [selectedDomain, setSelectedDomain] = React.useState<string | null>(null)

  const { data, isLoading } = useQuery<{ courses: CourseItem[]; count: number } | null>({
    queryKey: ["vertical-courses", vertical, q, level],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ vertical })
        if (q) params.set("q", q)
        if (level && level !== "All") params.set("level", level)
        const res = await fetch(`/api/courses?${params}`)
        if (!res.ok) return null
        return res.json()
      } catch {
        return null
      }
    },
    staleTime: 60_000,
  })
  const courses = data?.courses ?? []

  const filtered = selectedDomain
    ? courses.filter(c => c.category?.toLowerCase().includes(selectedDomain.split(" ")[0].toLowerCase()))
    : courses

  return (
    <div className="relative min-h-screen pt-2 lg:pt-4">
      {/* Atmospheric background — matching the catalog style */}
      <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
      <div className={cn("absolute top-0 right-0 w-[600px] h-[400px] blur-[120px] rounded-full pointer-events-none", cfg.bgGradient)} />
      <div className={cn("absolute top-20 left-1/4 w-[400px] h-[300px] blur-[100px] rounded-full pointer-events-none", cfg.bgGradient2)} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* ====================================================
            HERO — matching the catalog style (single-column text, no particle logo)
            ==================================================== */}
        <section className="relative mb-6 lg:mb-12">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate({ name: "home" })}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-violet-300 transition-colors tracking-[0.2em] mb-4"
          >
            <ArrowLeft className="h-3 w-3" />
            BACK TO HOME
          </motion.button>

          {/* Eyebrow + headline — matching catalog exactly */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("h-1.5 w-1.5 rounded-full pulse-dot", cfg.barColor)} />
              <span className={cn("text-[10px] font-mono tracking-[0.3em]", cfg.color)}>{cfg.eyebrow}</span>
            </div>
            <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.9] tracking-[-0.04em] mb-4 text-balance">
              {cfg.title}{" "}
              <span className="text-gradient-premium">{cfg.titleAccent}</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {cfg.description}
            </p>
          </motion.div>

          {/* Domain Selector — matching the catalog's Career Path Selector style */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <p className={cn("text-[10px] font-mono tracking-[0.25em] mb-3", cfg.color)}>CHOOSE YOUR DOMAIN</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cfg.domains.map((d, i) => {
                const isActive = selectedDomain === d.title
                const Icon = d.icon
                return (
                  <button
                    key={d.title}
                    onClick={() => setSelectedDomain(isActive ? null : d.title)}
                    className={cn(
                      "group relative text-left rounded-xl border p-4 transition-all duration-300 overflow-hidden",
                      isActive
                        ? cn("border-transparent bg-card shadow-lg", d.glow)
                        : "border-border/60 bg-card/60 hover:bg-card hover:border-violet-500/30"
                    )}
                  >
                    {isActive && <div className={cn("absolute top-0 left-0 right-0 h-0.5", d.barColor)} />}
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("inline-flex p-2.5 rounded-lg transition-transform group-hover:scale-110", d.tint)}>
                        <Icon className={cn("h-5 w-5", d.color)} />
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-mono", LEVEL_COLORS[d.level])}>
                        {d.level}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{d.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{d.desc}</p>
                    <div className="flex items-center gap-1 mt-3">
                      <span className={cn("text-[10px] font-mono tracking-wider", isActive ? d.color : "text-muted-foreground")}>
                        {isActive ? "ACTIVE" : "EXPLORE"}
                      </span>
                      <ArrowRight className={cn("h-3 w-3 transition-transform", isActive ? d.color : "text-muted-foreground", "group-hover:translate-x-0.5")} />
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Stats strip — matching catalog's StatCard style */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
          >
            {cfg.stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 p-4 flex items-center gap-3">
                  <div className={cn("inline-flex p-2.5 rounded-lg", s.tint)}>
                    <Icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <div>
                    <div className="text-lg font-bold tabular-nums">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* Certification ticker — matching catalog's scrolling marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative overflow-hidden py-3 border-y border-border/40"
          >
            <div className="flex items-center gap-6 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
              {[...cfg.certs, ...cfg.certs].map((cert, i) => (
                <span key={i} className="text-xs font-mono text-muted-foreground/60 tracking-wider flex items-center gap-2">
                  <span className={cn("h-1 w-1 rounded-full", cfg.barColor, "opacity-40")} />
                  {cert}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ====================================================
            FILTER BAR — matching catalog's filter bar
            ==================================================== */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-lg p-4 sm:p-5 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${vertical === "ai" ? "AI" : "cloud"} courses...`}
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {selectedDomain && (
              <Button variant="outline" size="sm" onClick={() => setSelectedDomain(null)} className="text-xs">
                Clear domain filter
              </Button>
            )}
          </div>
        </div>

        {/* ====================================================
            COURSE GRID — matching catalog's course cards
            ==================================================== */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                onClick={() => navigate({ name: "course", courseId: course.id })}
                className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden cursor-pointer transition-all hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Thumbnail */}
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-violet-950/40 to-card">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Brain className={cn("h-10 w-10 opacity-20", cfg.color)} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className={cn("text-[10px] font-mono", LEVEL_COLORS[course.level])}>
                      {course.level}
                    </Badge>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.durationHours}h</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3" />{course.rating || 4.5}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.studentsCount || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No courses yet in this domain</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're building {vertical === "ai" ? "AI & Machine Learning" : "Cloud Computing"} courses right now. Check back soon or contact us for early access.
            </p>
            <Button onClick={() => navigate({ name: "contact" })} variant="outline">
              Get Early Access <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        )}

        {/* ====================================================
            CROSSOVER WITH CYBERSECURITY
            ==================================================== */}
        <section className="mt-12 py-8 lg:py-12 border-t border-border/40">
          <div className="mb-6">
            <p className={cn("text-[10px] font-mono tracking-[0.25em] mb-2", cfg.color)}>CROSSOVER PATHS</p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em]">
              {vertical === "ai" ? "Where AI meets cybersecurity." : "Where cloud meets cybersecurity."}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              The only platform that teaches both — combine your {vertical === "ai" ? "AI" : "cloud"} skills with cybersecurity expertise for high-demand crossover roles.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cfg.crossovers.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                  className="rounded-xl border border-border/60 bg-card p-5 hover:border-violet-500/30 transition-all"
                >
                  <div className={cn("inline-flex items-center justify-center h-9 w-9 rounded-lg mb-3", c.tint)}>
                    <Icon className={cn("h-4 w-4", c.color)} />
                  </div>
                  <h3 className="font-semibold mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ====================================================
            FINAL CTA
            ==================================================== */}
        <section className="py-12 lg:py-16 border-t border-border/40 text-center">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-3">
            Ready to master{" "}
            <span className="text-gradient-premium">
              {vertical === "ai" ? "AI & Machine Learning" : "Cloud Computing"}
            </span>?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of professionals advancing their careers with GuardianX Academy.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" onClick={() => navigate({ name: "catalog" })} className={cn("btn-premium px-8", cfg.barColor)}>
              EXPLORE ALL COURSES <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ name: "contact" })} className="px-6">
              TALK TO US
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
