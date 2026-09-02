"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowRight, ArrowLeft, Brain, Cloud, Shield, Cpu, Database,
  Sparkles, Server, Network, Zap, TrendingUp, Users, Award,
  GraduationCap, Briefcase, Target, Lock, Code2, Layers,
} from "lucide-react"
import { ParticleLogo } from "@/components/platform/particle-logo"

/* ============================================================
   VERTICAL CONFIG — defines the content for each vertical
   ============================================================ */
const VERTICALS = {
  ai: {
    eyebrow: "AI & MACHINE LEARNING",
    title: "Master AI before it masters you.",
    titleAccent: "AI before it masters you.",
    description:
      "From AI fundamentals to LLM security and MLOps — learn how to build, deploy, and secure AI systems. The only platform that teaches AI AND how to attack + defend it.",
    color: "text-violet-300",
    tint: "bg-violet-500/10",
    accent: "from-violet-600 to-fuchsia-600",
    icon: Brain,
    stats: [
      { label: "AI Market by 2027", value: "$17B", icon: TrendingUp, color: "text-violet-300" },
      { label: "Avg Salary", value: "₹14L/yr", icon: Briefcase, color: "text-fuchsia-300" },
      { label: "Job Growth", value: "300%", icon: TrendingUp, color: "text-violet-300" },
      { label: "Courses", value: "12+", icon: GraduationCap, color: "text-fuchsia-300" },
    ],
    domains: [
      { icon: Brain, title: "AI Fundamentals", desc: "Machine learning basics, neural networks, supervised/unsupervised learning.", level: "Beginner" },
      { icon: Sparkles, title: "LLM & GenAI", desc: "Large language models, prompt engineering, RAG, fine-tuning, deployment.", level: "Intermediate" },
      { icon: Lock, title: "AI Security & Red Teaming", desc: "Adversarial attacks, model poisoning, prompt injection, AI red teaming.", level: "Advanced" },
      { icon: Cpu, title: "MLOps for Production", desc: "Model deployment, monitoring, CI/CD for ML, Kubernetes for AI workloads.", level: "Intermediate" },
      { icon: Database, title: "NLP & Computer Vision", desc: "Natural language processing, transformers, CNNs, image recognition.", level: "Intermediate" },
      { icon: Shield, title: "AI Governance & Ethics", desc: "AI policy, compliance, bias detection, responsible AI frameworks.", level: "Beginner" },
    ],
    certifications: [
      { code: "AI-900", name: "Microsoft Azure AI Fundamentals", bg: "bg-violet-500/10", color: "text-violet-300" },
      { code: "ML Engineer", name: "Google ML Engineer Professional", bg: "bg-fuchsia-500/10", color: "text-fuchsia-300" },
      { code: "AWS ML", name: "AWS Certified ML Specialty", bg: "bg-cyan-500/10", color: "text-cyan-300" },
      { code: "AI Red Team", name: "GuardianX AI Red Team Certification", bg: "bg-rose-500/10", color: "text-rose-300" },
    ],
    crossovers: [
      { icon: Shield, title: "AI Security Engineer", desc: "AI + Cybersecurity — secure AI systems against adversarial attacks." },
      { icon: Server, title: "DevSecOps for AI", desc: "AI + DevOps + Security — secure ML pipelines and deployments." },
      { icon: Database, title: "Data Privacy Engineer", desc: "AI + GRC — ensure AI systems comply with data protection laws." },
    ],
    gradient: "from-violet-600/20 via-fuchsia-600/10 to-transparent",
  },
  cloud: {
    eyebrow: "CLOUD COMPUTING",
    title: "The cloud is where the world runs now.",
    titleAccent: "where the world runs now.",
    description:
      "Master AWS, Azure, and GCP — from fundamentals to architecture to security. Build, deploy, and secure cloud infrastructure at scale with hands-on labs.",
    color: "text-cyan-300",
    tint: "bg-cyan-500/10",
    accent: "from-cyan-600 to-blue-600",
    icon: Cloud,
    stats: [
      { label: "Cloud Market", value: "$800B+", icon: TrendingUp, color: "text-cyan-300" },
      { label: "Avg Salary", value: "₹12L/yr", icon: Briefcase, color: "text-blue-300" },
      { label: "Job Growth", value: "25%/yr", icon: TrendingUp, color: "text-cyan-300" },
      { label: "Courses", value: "15+", icon: GraduationCap, color: "text-blue-300" },
    ],
    domains: [
      { icon: Cloud, title: "AWS Architecture", desc: "EC2, S3, RDS, Lambda, VPC, IAM — build scalable AWS infrastructure.", level: "Beginner" },
      { icon: Server, title: "Azure Administration", desc: "Azure AD, VMs, App Services, Azure Storage, networking, security.", level: "Beginner" },
      { icon: Network, title: "GCP Fundamentals", desc: "Compute Engine, Cloud Storage, BigQuery, GKE — Google Cloud basics.", level: "Beginner" },
      { icon: Layers, title: "Kubernetes & Docker", desc: "Container orchestration, pod management, Helm, service mesh.", level: "Intermediate" },
      { icon: Lock, title: "Cloud Security", desc: "Cloud IAM, network security, data encryption, compliance in the cloud.", level: "Advanced" },
      { icon: Code2, title: "Infrastructure as Code", desc: "Terraform, Ansible, CloudFormation — automate everything.", level: "Intermediate" },
    ],
    certifications: [
      { code: "SAA-C03", name: "AWS Solutions Architect Associate", bg: "bg-cyan-500/10", color: "text-cyan-300" },
      { code: "AZ-104", name: "Microsoft Azure Administrator", bg: "bg-blue-500/10", color: "text-blue-300" },
      { code: "CKA", name: "Certified Kubernetes Administrator", bg: "bg-violet-500/10", color: "text-violet-300" },
      { code: "Cloud Sec", name: "GuardianX Cloud Security Certification", bg: "bg-rose-500/10", color: "text-rose-300" },
    ],
    crossovers: [
      { icon: Shield, title: "Cloud Security Engineer", desc: "Cloud + Cybersecurity — secure cloud infrastructure from attacks." },
      { icon: Server, title: "DevSecOps Engineer", desc: "Cloud + DevOps + Security — secure CI/CD pipelines in the cloud." },
      { icon: Network, title: "Cloud Network Architect", desc: "Cloud + Networking — design secure, scalable cloud networks." },
    ],
    gradient: "from-cyan-600/20 via-blue-600/10 to-transparent",
  },
} as const

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  Intermediate: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  Advanced: "text-rose-300 bg-rose-500/10 border-rose-500/30",
}

export function VerticalView({ vertical }: { vertical: "ai" | "cloud" }) {
  const { navigate } = useAppStore()
  const cfg = VERTICALS[vertical]

  // Fetch courses for this vertical (gracefully falls back to static data)
  const { data: coursesData } = useQuery<{ courses: any[]; count: number } | null>({
    queryKey: ["vertical-courses", vertical],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/courses?vertical=${vertical}`)
        if (!res.ok) return null
        return res.json()
      } catch {
        return null
      }
    },
    staleTime: 60_000,
  })
  const courses = coursesData?.courses ?? []

  return (
    <main className="relative">
      {/* =====================================================
          SECTION 1: HERO
          ===================================================== */}
      <section className="relative overflow-hidden" aria-labelledby="vertical-hero-heading">
        {/* Atmospheric background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", cfg.gradient)} aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-10" aria-hidden />
        <div
          className={cn("absolute left-1/3 top-1/4 size-[500px] rounded-full blur-[120px] pointer-events-none", cfg.tint)}
          aria-hidden
        />

        {/* Desktop particle logo on the right */}
        <div className="hidden lg:block absolute right-[6%] top-1/2 -translate-y-1/2 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ParticleLogo size={680} interactive showGlow />
          </motion.div>
        </div>

        {/* Mobile particle logo at top */}
        <div className="lg:hidden absolute inset-x-0 top-0 h-[44vh] flex items-center justify-center pointer-events-none">
          <ParticleLogo size={340} interactive={false} showGlow />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-16 pt-[48vh] lg:pt-16">
          <div className="max-w-3xl">
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

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex items-center gap-2 mb-4"
            >
              <cfg.icon className={cn("h-5 w-5", cfg.color)} aria-hidden />
              <span className={cn("text-[10px] font-mono tracking-[0.25em]", cfg.color)}>
                {cfg.eyebrow}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-4 text-balance"
              id="vertical-hero-heading"
            >
              Master{" "}
              <span className="text-gradient-premium">{cfg.titleAccent}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-base lg:text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed"
            >
              {cfg.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <Button
                size="lg"
                onClick={() => navigate({ name: "catalog" })}
                className={cn("btn-premium px-8 py-6 text-sm bg-gradient-to-r", cfg.accent)}
              >
                EXPLORE COURSES
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ name: "batches" })}
                className="px-6 py-6 text-sm"
              >
                VIEW BATCHES
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2: STATS
          ===================================================== */}
      <section className="py-6 lg:py-8 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cfg.stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="card-premium rounded-xl p-4 lg:p-5"
              >
                <s.icon className={cn("h-5 w-5 mb-2", s.color)} aria-hidden />
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3: DOMAINS / WHAT YOU'LL LEARN
          ===================================================== */}
      <section className="py-8 lg:py-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className={cn("text-[10px] font-mono tracking-[0.25em] mb-2", cfg.color)}>
              WHAT YOU'LL LEARN
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em]">
              {vertical === "ai" ? "AI domains we cover." : "Cloud domains we cover."}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cfg.domains.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="card-premium rounded-xl p-5 lg:p-6 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("inline-flex items-center justify-center h-10 w-10 rounded-lg", cfg.tint, cfg.color)}>
                    <d.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] font-mono", LEVEL_COLORS[d.level])}>
                    {d.level}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg leading-tight mb-1.5">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4: CERTIFICATIONS
          ===================================================== */}
      <section className="py-8 lg:py-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className={cn("text-[10px] font-mono tracking-[0.25em] mb-2", cfg.color)}>
              CERTIFICATION PREP
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em]">
              {vertical === "ai" ? "Certifications we prepare you for." : "Cloud certifications we prepare you for."}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cfg.certifications.map((c, i) => (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="rounded-xl border border-border/60 bg-card p-5 hover:border-violet-500/30 transition-all"
              >
                <div className={cn("inline-flex px-2.5 py-1 rounded-md text-[10px] font-mono font-bold mb-3", c.bg, c.color)}>
                  {c.code}
                </div>
                <h3 className="font-semibold text-sm leading-tight">{c.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 5: CROSSOVER WITH CYBERSECURITY
          ===================================================== */}
      <section className="py-8 lg:py-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className={cn("text-[10px] font-mono tracking-[0.25em] mb-2", cfg.color)}>
              CROSSOVER PATHS
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em]">
              {vertical === "ai"
                ? "Where AI meets cybersecurity."
                : "Where cloud meets cybersecurity."}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              The only platform that teaches both — combine your {vertical === "ai" ? "AI" : "cloud"} skills
              with cybersecurity expertise for high-demand crossover roles.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cfg.crossovers.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="card-premium rounded-xl p-5"
              >
                <div className={cn("inline-flex items-center justify-center h-9 w-9 rounded-lg mb-3", cfg.tint, cfg.color)}>
                  <c.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 6: FEATURED COURSES (if available from DB)
          ===================================================== */}
      {courses.length > 0 && (
        <section className="py-8 lg:py-12 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={cn("text-[10px] font-mono tracking-[0.25em] mb-2", cfg.color)}>
                  FEATURED COURSES
                </p>
                <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em]">
                  {courses.length} courses available
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate({ name: "catalog" })}>
                View All <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((course: any, i: number) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                  className="card-premium rounded-xl p-5 cursor-pointer hover:-translate-y-1 transition-transform"
                  onClick={() => navigate({ name: "course", courseId: course.id })}
                >
                  <Badge variant="outline" className={cn("text-[10px] font-mono mb-2", LEVEL_COLORS[course.level] || "")}>
                    {course.level}
                  </Badge>
                  <h3 className="font-semibold mb-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          SECTION 7: FINAL CTA
          ===================================================== */}
      <section className="py-12 lg:py-16 border-t border-border/40 relative overflow-hidden">
        <div className={cn("absolute inset-0 bg-gradient-to-br", cfg.gradient)} aria-hidden />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <cfg.icon className={cn("h-12 w-12 mx-auto mb-4", cfg.color)} aria-hidden />
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-3">
              Ready to master{" "}
              <span className="text-gradient-premium">
                {vertical === "ai" ? "AI & Machine Learning" : "Cloud Computing"}
              </span>
              ?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of professionals advancing their careers with GuardianX Academy.
              Expert-led training, hands-on labs, and verifiable certifications.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                size="lg"
                onClick={() => navigate({ name: "catalog" })}
                className={cn("btn-premium px-8 py-6 text-sm bg-gradient-to-r", cfg.accent)}
              >
                EXPLORE COURSES <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ name: "contact" })}
                className="px-6 py-6 text-sm"
              >
                TALK TO US
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
