"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2, BookOpen, Award, Users, FlaskConical,
  ArrowRight, ChevronRight, Target,
  CheckCircle2, Activity, Server, Database,
  GraduationCap, Briefcase, Globe, Trophy, MapPin, Calendar,
  LogIn, School, Building, Landmark,
  FileCheck, Send, ClipboardCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ScrollReveal, TextReveal, Stagger, StaggerItem,
  MagneticButton, Counter, CursorGlow,
} from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"
import { ParticleLogo } from "@/components/platform/particle-logo"
import { usePageContent, getContent } from "@/lib/use-content"

// ============================================================
// Partner types — three institutional segments GuardianX serves
// with on-premises training. Each has its own login portal.
// ============================================================
type PartnerType = "School" | "College" | "University"

interface PartnerTypeConfig {
  type: PartnerType
  title: string
  description: string
  icon: typeof Building2
  accent: string // text color
  bg: string // icon background tint
  border: string // hover border color
  ctaLabel: string // portal login label
  highlight?: string // optional callout
  highlightIcon?: typeof Building2
}

const PARTNER_TYPES: PartnerTypeConfig[] = [
  {
    type: "School",
    title: "Schools",
    description:
      "On-premises cyber security training for secondary schools (grades 9-12). Build early foundations in safe hacking, digital citizenship, and STEM-aligned security electives with year-round GuardianX cohorts.",
    icon: School,
    accent: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "hover:border-emerald-500/40",
    ctaLabel: "School Portal Login",
    highlight: "Complimentary School Management System for MoU partners",
    highlightIcon: Database,
  },
  {
    type: "College",
    title: "Colleges",
    description:
      "On-premises training for engineering, technical, and degree colleges. Run dedicated cyber security electives, weekend bootcamps, and an on-campus cyber range powered by GuardianX labs.",
    icon: Building,
    accent: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "hover:border-cyan-500/40",
    ctaLabel: "College Portal Login",
  },
  {
    type: "University",
    title: "Universities",
    description:
      "On-premises training for research-focused universities. Full B.Tech / M.Tech track integration, PhD-grade lab access, and GuardianX as the official practice platform for your department.",
    icon: Landmark,
    accent: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "hover:border-violet-500/40",
    ctaLabel: "University Portal Login",
  },
]

// ============================================================
// Featured partner profiles — example placeholders only.
// Not real institutions. Designed to demonstrate the partner
// profile card pattern.
// ============================================================
interface FeaturedPartner {
  name: string
  type: PartnerType
  location: string
  established: number
  website: string
  studentsTrained: number
  certsEarned: number
  partnerSince: number
  description: string
  logoIcon: typeof Building2
}

const TYPE_STYLES: Record<PartnerType, { logoBg: string; logoColor: string; typeBadgeClass: string }> = {
  School: {
    logoBg: "bg-emerald-500/10",
    logoColor: "text-emerald-400",
    typeBadgeClass: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  },
  College: {
    logoBg: "bg-cyan-500/10",
    logoColor: "text-cyan-400",
    typeBadgeClass: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",
  },
  University: {
    logoBg: "bg-violet-500/10",
    logoColor: "text-violet-400",
    typeBadgeClass: "border-violet-500/40 text-violet-300 bg-violet-500/10",
  },
}

const FEATURED_PARTNERS: FeaturedPartner[] = [
  {
    name: "Delhi Cyber Sciences Academy",
    type: "School",
    location: "New Delhi, India",
    established: 2015,
    website: "https://example.edu/delhi-cyber",
    studentsTrained: 450,
    certsEarned: 320,
    partnerSince: 2022,
    description:
      "A secondary school integrating cybersecurity fundamentals into STEM curriculum for grades 9-12 with year-round GuardianX cohorts.",
    logoIcon: School,
  },
  {
    name: "Mumbai Institute of Technology",
    type: "College",
    location: "Mumbai, India",
    established: 1998,
    website: "https://example.edu/mumbai-it",
    studentsTrained: 2100,
    certsEarned: 1450,
    partnerSince: 2021,
    description:
      "Premier engineering college running dedicated cyber security electives and a campus cyber range powered by GuardianX labs.",
    logoIcon: Building,
  },
  {
    name: "Bangalore Cyber Security University",
    type: "University",
    location: "Bengaluru, India",
    established: 2005,
    website: "https://example.edu/blr-cyber-univ",
    studentsTrained: 3800,
    certsEarned: 2900,
    partnerSince: 2020,
    description:
      "A research-focused university offering full B.Tech and M.Tech tracks in cyber security with GuardianX as the official practice platform.",
    logoIcon: Landmark,
  },
  {
    name: "Chennai Tech College",
    type: "College",
    location: "Chennai, India",
    established: 2010,
    website: "https://example.edu/chennai-tech",
    studentsTrained: 1200,
    certsEarned: 890,
    partnerSince: 2023,
    description:
      "A modern technical college running weekend GuardianX bootcamps and industry-aligned certification tracks for working professionals.",
    logoIcon: Building,
  },
  {
    name: "Pune Defense Academy",
    type: "School",
    location: "Pune, India",
    established: 2018,
    website: "https://example.edu/pune-defense",
    studentsTrained: 680,
    certsEarned: 510,
    partnerSince: 2022,
    description:
      "A defense-focused academy preparing cadets for cyber operations roles with hands-on offensive and defensive security training.",
    logoIcon: Trophy,
  },
  {
    name: "Hyderabad Cyber Institute",
    type: "College",
    location: "Hyderabad, India",
    established: 2012,
    website: "https://example.edu/hyderabad-cyber",
    studentsTrained: 1550,
    certsEarned: 1100,
    partnerSince: 2021,
    description:
      "An industry-facing institute training IT professionals in advanced specializations including IAM, PAM, and cloud security.",
    logoIcon: Building,
  },
]

// ============================================================
// Benefits — what every institutional partner unlocks
// ============================================================
const BENEFITS = [
  {
    icon: Database,
    title: "School Management System",
    desc: "A SEPARATE product for MoU partners (not our training platform). Manage students, attendance, batches, fees, and grades from one dashboard.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    tag: "MoU partners only",
  },
  {
    icon: FlaskConical,
    title: "31 Docker Labs",
    desc: "Docker-powered hands-on labs with live targets. No setup required — students start practicing on day one, on-premises.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    tag: "Cyber range",
  },
  {
    icon: Award,
    title: "Verifiable Certificates",
    desc: "Tamper-evident certificates with public verification. Employers and academic institutions can verify any credential by ID.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    tag: "Industry recognized",
  },
  {
    icon: Server,
    title: "On-Premises Training",
    desc: "We deliver training at your campus — your classrooms, your labs, your schedule. Our instructors travel to your institution.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    tag: "In-person",
  },
  {
    icon: Activity,
    title: "Real-Time Analytics",
    desc: "Track student progress, attendance, engagement, and certification outcomes. Data-driven decisions for program directors.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    tag: "Live insights",
  },
  {
    icon: Users,
    title: "Bulk Student Import",
    desc: "CSV upload, batch management, unique school codes, and attendance tracking. Onboard 1,000 students in under an hour.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    tag: "At scale",
  },
]

// ============================================================
// Cyber range flow — Students → Courses → Labs → Assessments → Certificates → Career Ready
// ============================================================
const CYBER_RANGE_FLOW = [
  { step: "Students", icon: Users, color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  { step: "Courses", icon: BookOpen, color: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { step: "Labs", icon: FlaskConical, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { step: "Assessments", icon: Target, color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { step: "Certificates", icon: Award, color: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  { step: "Career Ready", icon: Briefcase, color: "text-teal-300", bg: "bg-teal-500/10", border: "border-teal-500/30" },
]

// ============================================================
// Partnership models
// ============================================================
const PARTNERSHIP_MODELS = [
  {
    title: "Academic",
    icon: GraduationCap,
    desc: "For schools, colleges, and universities. Full curriculum integration with on-premises training delivery and academic-grade reporting.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    features: ["Curriculum mapping", "On-premises delivery", "Academic reporting", "Faculty training"],
  },
  {
    title: "Enterprise",
    icon: Building2,
    desc: "For corporations. Upskill your workforce with enterprise-grade security training and custom-tailored threat scenarios.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    features: ["Custom curriculum", "On-site or remote", "Team analytics", "Dedicated instructor"],
  },
  {
    title: "Training Partner",
    icon: Briefcase,
    desc: "For training institutes. Offer GuardianX courses under your brand with revenue share and white-label portal access.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    features: ["White-label portal", "Revenue sharing", "Co-branded certs", "Partner support"],
  },
  {
    title: "Campus Program",
    icon: Users,
    desc: "For student communities and cyber clubs. Affordable cohort access with mentorship and competition-ready practice labs.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    features: ["Cohort pricing", "Mentor support", "CTF practice", "Career guidance"],
  },
]

export function PartnerInstitutionsView() {
  const { navigate } = useAppStore()

  // CMS-driven hero copy — falls back to defaults if CMS data missing.
  const cms = usePageContent("institutions")
  const cmsData = cms.data
  const heroEyebrow = getContent(cmsData, "hero", "eyebrow", "INSTITUTIONAL PARTNERSHIPS")
  const heroTitle = getContent(cmsData, "hero", "title", "On-premises training for")
  const heroTitleAccent = getContent(cmsData, "hero", "titleAccent", "schools, colleges & universities.")
  const heroDesc = getContent(cmsData, "hero", "description", "GuardianX delivers cybersecurity training directly at your campus — your classrooms, your labs, your schedule. From secondary schools to research universities, we build job-ready defenders through a single, integrated platform.")
  const heroCtaPrimary = getContent(cmsData, "hero", "ctaPrimary", "Sign an MoU")
  const heroCtaSecondary = getContent(cmsData, "hero", "ctaSecondary", "Build Your Cybersecurity Program")

  return (
    <div className="relative min-h-screen pt-2 lg:pt-4">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* ====================================================
            SECTION 1: HERO
            ==================================================== */}
        <section className="py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left — text */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <Building2 className="h-5 w-5 text-violet-300" />
                  <span className="text-[10px] font-mono text-violet-300/80 tracking-[0.25em]">{heroEyebrow}</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-4 text-balance"
                >
                  {heroTitle}
                  <br />
                  <span className="text-gradient-premium">{heroTitleAccent}</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-base lg:text-lg text-muted-foreground max-w-xl mb-5 leading-relaxed"
                >
                  {heroDesc}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center gap-3 flex-wrap mb-5"
                >
                  <MagneticButton strength={0.3}>
                    <Button
                      size="lg"
                      onClick={() => navigate({ name: "contact" })}
                      className="bg-violet-600 hover:bg-violet-500 btn-premium px-8 py-6 text-sm"
                    >
                      {heroCtaPrimary} <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </MagneticButton>
                  <MagneticButton strength={0.2}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate({ name: "contact" })}
                      className="px-6 py-6 text-sm"
                    >
                      {heroCtaSecondary}
                    </Button>
                  </MagneticButton>
                </motion.div>

                {/* Hero stats */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="grid grid-cols-3 gap-4 pt-5 border-t border-border/40"
                >
                  {[
                    { value: 150, suffix: "+", label: "Institutions", color: "text-violet-300" },
                    { value: 12000, suffix: "+", label: "Students", color: "text-cyan-300" },
                    { value: 8500, suffix: "+", label: "Certs Issued", color: "text-amber-300" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className={cn("text-2xl lg:text-3xl font-bold tabular-nums", s.color)}>
                        <Counter value={s.value} suffix={s.suffix} />
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right — particle logo centerpiece (same size as home page) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative flex items-center justify-center"
              >
                <ParticleLogo size={680} interactive showGlow />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SECTION 2: THREE PARTNER TYPES
            ==================================================== */}
        <section className="py-6 lg:py-10 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-6 text-center">
              <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">WHO WE PARTNER WITH</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance">
                Three institution types.
                <br />
                <span className="text-muted-foreground/60">One training platform.</span>
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-4">
                Each partner type gets its own dedicated login portal, training schedule, and curriculum alignment.
                Choose your institution to learn more.
              </p>
            </ScrollReveal>

            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerChildren={0.1}>
              {PARTNER_TYPES.map((pt) => (
                <StaggerItem key={pt.type}>
                  <CursorGlow className="group h-full" color="oklch(0.6 0.2 295 / 0.04)">
                    <div className={cn(
                      "relative h-full flex flex-col rounded-2xl border border-border/60 bg-card shadow-lg p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_oklch(0.6_0.2_295_/_0.25)]",
                      pt.border
                    )}>
                      {/* Header — icon + type badge */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={cn("inline-flex items-center justify-center h-12 w-12 rounded-xl transition-transform duration-500 group-hover:scale-110", pt.bg)}>
                          <pt.icon className={cn("h-6 w-6", pt.accent)} />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono tracking-wider border-border/60 text-muted-foreground">
                          {pt.type.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Title + description */}
                      <h3 className="text-xl font-semibold mb-2">{pt.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        {pt.description}
                      </p>

                      {/* Highlight callout (Schools: School Management System) */}
                      {pt.highlight && pt.highlightIcon && (
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 mb-5">
                          <div className="flex items-start gap-2">
                            <pt.highlightIcon className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-[10px] font-mono text-emerald-300/80 tracking-wider mb-1">SEPARATE PRODUCT</div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{pt.highlight}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CTA buttons */}
                      <div className="mt-auto space-y-2.5">
                        <Button
                          className={cn(
                            "w-full btn-premium",
                            pt.type === "School" && "bg-emerald-600 hover:bg-emerald-500",
                            pt.type === "College" && "bg-cyan-600 hover:bg-cyan-500",
                            pt.type === "University" && "bg-violet-600 hover:bg-violet-500",
                          )}
                          onClick={() => navigate({ name: "login" })}
                        >
                          <LogIn className="h-4 w-4 mr-1.5" />
                          {pt.ctaLabel}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate({ name: "contact" })}
                        >
                          Learn More <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </CursorGlow>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ====================================================
            SECTION 3: PARTNER BENEFITS
            ==================================================== */}
        <section className="py-6 lg:py-10 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-6">
              <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">PARTNER BENEFITS</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance">
                Everything your institution unlocks.
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mt-4">
                On-premises training delivery, a dedicated cyber range, a separate School Management System
                for MoU partners, and full program analytics — all in one partnership.
              </p>
            </ScrollReveal>

            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerChildren={0.08}>
              {BENEFITS.map((b) => (
                <StaggerItem key={b.title}>
                  <CursorGlow className="group h-full" color="oklch(0.6 0.2 295 / 0.04)">
                    <div className="h-full rounded-xl border border-border/60 bg-card shadow-lg p-6 transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.6_0.2_295_/_0.25)]">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("inline-flex p-3 rounded-lg transition-transform group-hover:scale-110", b.bg)}>
                          <b.icon className={cn("h-5 w-5", b.color)} />
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase px-2 py-1 rounded border border-border/60 bg-background/40">
                          {b.tag}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{b.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </CursorGlow>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ====================================================
            SECTION 4: FEATURED PARTNERS
            ==================================================== */}
        <section className="py-6 lg:py-10 border-t border-border/40 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <ScrollReveal className="mb-6">
              <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">FEATURED PARTNERS</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance mb-4">
                Institutions growing with GuardianX.
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl">
                A glimpse of the schools, colleges, and universities building tomorrow&apos;s defenders on
                our platform. Example profiles shown for illustration.
              </p>
            </ScrollReveal>

            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerChildren={0.08}>
              {FEATURED_PARTNERS.map((p) => {
                const ts = TYPE_STYLES[p.type]
                return (
                  <StaggerItem key={p.name}>
                    <CursorGlow className="group h-full" color="oklch(0.6 0.2 295 / 0.04)">
                      <div className="relative h-full flex flex-col rounded-xl border border-border/60 bg-card shadow-lg p-6 transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.6_0.2_295_/_0.25)]">
                        {/* Header — logo + type badge */}
                        <div className="flex items-start justify-between mb-5">
                          <div className={cn(
                            "inline-flex items-center justify-center h-12 w-12 rounded-full transition-transform duration-500 group-hover:scale-110",
                            ts.logoBg
                          )}>
                            <p.logoIcon className={cn("h-6 w-6", ts.logoColor)} />
                          </div>
                          <Badge variant="outline" className={cn("text-[10px] font-mono tracking-wider", ts.typeBadgeClass)}>
                            {p.type.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Name + description */}
                        <h3 className="font-semibold text-base mb-2 group-hover:text-violet-200 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                          {p.description}
                        </p>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-2.5 mb-5 mt-auto">
                          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">LOCATION</span>
                            </div>
                            <div className="text-xs font-medium leading-snug">{p.location}</div>
                          </div>
                          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">ESTABLISHED</span>
                            </div>
                            <div className="text-xs font-medium tabular-nums">{p.established}</div>
                          </div>
                          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">STUDENTS</span>
                            </div>
                            <div className="text-xs font-medium tabular-nums">
                              {p.studentsTrained.toLocaleString()} trained
                            </div>
                          </div>
                          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Award className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">CERTS</span>
                            </div>
                            <div className="text-xs font-medium tabular-nums">
                              {p.certsEarned.toLocaleString()} earned
                            </div>
                          </div>
                        </div>

                        {/* Partner since footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/40 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Trophy className="h-3.5 w-3.5 text-amber-300" />
                            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">
                              PARTNER SINCE
                            </span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-amber-200">
                            {p.partnerSince}
                          </span>
                        </div>

                        {/* Website link button */}
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/40 hover:bg-violet-600/10 hover:border-violet-500/40 px-4 py-2.5 text-xs font-medium transition-all duration-300 group/btn"
                        >
                          <Globe className="h-3.5 w-3.5 text-violet-300" />
                          Visit Website
                          <ArrowRight className="h-3 w-3 ml-0.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </a>
                      </div>
                    </CursorGlow>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        {/* ====================================================
            SECTION 5: YOUR INSTITUTION. OUR CYBER RANGE.
            ==================================================== */}
        <section className="py-6 lg:py-10 border-t border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <ScrollReveal className="text-center mb-6">
              <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">THE PATH</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
                Your institution.
                <br />
                <span className="text-gradient-premium">Our cyber range.</span>
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                From onboarding students to issuing industry-recognized certificates — every step runs
                inside the GuardianX platform, on your premises.
              </p>
            </ScrollReveal>

            {/* Flow diagram */}
            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl border border-border/60 bg-card shadow-lg p-6 lg:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {CYBER_RANGE_FLOW.map((s, i) => (
                    <React.Fragment key={s.step}>
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className={cn(
                          "relative inline-flex items-center justify-center h-16 w-16 rounded-2xl border mb-3 transition-transform hover:scale-110",
                          s.bg, s.border
                        )}>
                          <s.icon className={cn("h-6 w-6", s.color)} />
                          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-card border border-border/60 text-[9px] font-mono text-muted-foreground flex items-center justify-center tabular-nums">
                            {i + 1}
                          </span>
                        </div>
                        <span className="text-xs font-medium">{s.step}</span>
                      </motion.div>
                      {i < CYBER_RANGE_FLOW.length - 1 && (
                        <div className="hidden lg:flex items-center justify-center">
                          <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ====================================================
            SECTION 6: PARTNERSHIP MODELS
            ==================================================== */}
        <section className="py-6 lg:py-10 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-6">
              <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">PARTNERSHIP MODELS</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance">
                Choose your partnership.
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mt-4">
                Four engagement models. Pick the one that matches your institution&apos;s stage and scale.
              </p>
            </ScrollReveal>

            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerChildren={0.1}>
              {PARTNERSHIP_MODELS.map((m) => (
                <StaggerItem key={m.title}>
                  <CursorGlow className="group h-full" color="oklch(0.6 0.2 295 / 0.04)">
                    <div className="h-full flex flex-col rounded-xl border border-border/60 bg-card shadow-lg p-6 transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.6_0.2_295_/_0.25)]">
                      <div className={cn("inline-flex p-3 rounded-xl mb-4 self-start transition-transform group-hover:scale-110", m.bg)}>
                        <m.icon className={cn("h-6 w-6", m.color)} />
                      </div>
                      <h3 className="font-semibold mb-2">{m.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{m.desc}</p>
                      <ul className="space-y-1.5 mb-5 mt-auto">
                        {m.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate({ name: "contact" })}
                      >
                        Enquire <ArrowRight className="h-3 w-3 ml-1.5" />
                      </Button>
                    </div>
                  </CursorGlow>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ====================================================
            SECTION 7: FINAL CTA — Sign an MoU + Build Your Program
            ==================================================== */}
        <section className="py-6 lg:py-10 border-t border-border/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/8 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/5">
                <FileCheck className="h-3.5 w-3.5 text-violet-300" />
                <span className="text-[10px] font-mono text-violet-300 tracking-[0.25em]">MEMORANDUM OF UNDERSTANDING</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-6 text-balance">
                Sign an MoU.
                <br />
                <span className="text-gradient-premium">Build your cybersecurity program.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
                Let&apos;s transform your institution&apos;s cyber education together — on your premises,
                with our cyber range, instructors, and a dedicated School Management System for MoU partners.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <MagneticButton strength={0.3}>
                  <Button
                    size="lg"
                    onClick={() => navigate({ name: "contact" })}
                    className="bg-violet-600 hover:bg-violet-500 btn-premium px-8 py-6"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Sign an MoU
                  </Button>
                </MagneticButton>
                <MagneticButton strength={0.2}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate({ name: "contact" })}
                    className="px-6 py-6"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Build Your Cybersecurity Program
                  </Button>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Trust footer */}
            <ScrollReveal delay={0.4}>
              <div className="mt-8 pt-5 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: "MoU Setup", value: "2-4 weeks", icon: FileCheck, color: "text-violet-300" },
                  { label: "On-Prem Visit", value: "Scheduled", icon: Server, color: "text-cyan-300" },
                  { label: "Instructor-led", value: "Year-round", icon: GraduationCap, color: "text-amber-300" },
                  { label: "Renewal", value: "Annual", icon: Calendar, color: "text-emerald-300" },
                ].map((t) => (
                  <div key={t.label} className="text-center">
                    <t.icon className={cn("h-5 w-5 mx-auto mb-2", t.color)} />
                    <div className="text-sm font-semibold">{t.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </div>
  )
}
