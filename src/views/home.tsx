"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield, Terminal, Lock, ArrowRight, Users, BookOpen, Award,
  FlaskConical, Radio, Star, Cpu, Network, Code2, Eye, PlayCircle,
  ShieldCheck, Server, Wifi, Database, Activity, Zap, Target,
  CheckCircle2, Fingerprint, Globe, Building2, ChevronRight,
  Loader2, BadgeCheck, AlertTriangle, Clock, Cloud,
  GraduationCap, Briefcase, Crown, Layers, Tv, Mic,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getCourseImage } from "@/lib/course-images"
import { CertificateVerifyCard } from "@/components/platform/certificate-verify-card"
import {
  ScrollReveal, TextReveal, Stagger, StaggerItem,
  MagneticButton, Counter, CursorGlow,
} from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"
import { AnimatedLogo } from "@/components/platform/animated-logo"
import { usePageContent, getContent, getContentArray } from "@/lib/use-content"
import { getCmsIcon } from "@/lib/cms-icons"

interface Course {
  id: string; title: string; shortName: string; description: string
  level: string; durationHours: number; rating: number; studentsCount: number
  thumbnail: string | null; color: string; category: string; certBody: string | null
  instructor: { id: string; name: string; title: string | null }
  lessonCount: number; moduleCount: number
}

export function HomeView() {
  const { navigate } = useAppStore()

  // CMS-driven content — falls back to hardcoded defaults when CMS
  // data isn't loaded yet (or the admin hasn't edited a key).
  const cms = usePageContent("home")
  const cmsData = cms.data

  const heroTitle = getContent(cmsData, "hero", "title", "Master the art of")
  const heroTitleAccent = getContent(cmsData, "hero", "titleAccent", "cyber defense.")
  const heroBadge = getContent(cmsData, "hero", "badge", "WORLD-CLASS CYBER SECURITY EDUCATION")
  const heroDescription = getContent(cmsData, "hero", "description", "A world-class platform for aspirants, freshers, and working professionals. Certification prep, live workshops, hands-on labs, and corporate training — all in one place.")
  const heroCtaPrimary = getContent(cmsData, "hero", "ctaPrimary", "Explore Courses")
  const heroCtaSecondary = getContent(cmsData, "hero", "ctaSecondary", "Start Learning")
  const heroStats = getContentArray<{ value: number; suffix?: string; label: string; color: string }>(
    cmsData, "stats", "items",
    [
      { value: 12000, suffix: "+", label: "Learners", color: "text-violet-300" },
      { value: 28, suffix: "+", label: "Courses", color: "text-cyan-300" },
      { value: 31, suffix: "", label: "Labs", color: "text-amber-300" },
      { value: 150, suffix: "+", label: "Partners", color: "text-emerald-300" },
    ]
  )
  const trustLabel = getContent(cmsData, "trust", "label", "Trusted by defenders at")
  const trustCompanies = getContentArray<string>(cmsData, "trust", "companies", ["Google", "Microsoft", "Amazon", "IBM", "Cisco", "Palantir", "CrowdStrike"])
  const audiencesEyebrow = getContent(cmsData, "audiences", "eyebrow", "WHO WE SERVE")
  const audiencesTitle = getContent(cmsData, "audiences", "title", "Built for every stage of your")
  const audiencesTitleAccent = getContent(cmsData, "audiences", "titleAccent", "cyber security journey.")
  const audiences = getContentArray<{ icon: string; title: string; desc: string; color: string; bg: string; stat: string }>(
    cmsData, "audiences", "items",
    [
      { icon: "GraduationCap", title: "Aspirants", desc: "Starting from zero? Build foundations in networking, Linux, and security basics. Beginner-friendly courses with guided paths.", color: "text-violet-400", bg: "bg-violet-500/10", stat: "Start from scratch" },
      { icon: "Briefcase", title: "Freshers", desc: "Land your first security role. Master in-demand certifications like CEH, CCNA, and RHCSA with hands-on lab practice.", color: "text-cyan-400", bg: "bg-cyan-500/10", stat: "Get job-ready" },
      { icon: "ShieldCheck", title: "Working Professionals", desc: "Level up with advanced certs (OSCP, CISSP, CISM). Stay current with threat intelligence and cutting-edge labs.", color: "text-amber-400", bg: "bg-amber-500/10", stat: "Advance your career" },
    ]
  )
  const coursesEyebrow = getContent(cmsData, "courses", "eyebrow", "CERTIFICATION COURSES")
  const coursesTitle = getContent(cmsData, "courses", "title", "Build skills that survive")
  const coursesTitleAccent = getContent(cmsData, "courses", "titleAccent", "the real world.")
  const coursesViewAllCta = getContent(cmsData, "courses", "viewAllCta", "View All Courses")
  const corporateEyebrow = getContent(cmsData, "corporate", "eyebrow", "BEYOND COURSES")
  const corporateTitle = getContent(cmsData, "corporate", "title", "Training that goes beyond")
  const corporateTitleAccent = getContent(cmsData, "corporate", "titleAccent", "the classroom.")
  const corporateDesc = getContent(cmsData, "corporate", "description", "We offer corporate trainings, on-demand workshops, and live webinars for teams and individuals.")
  const corporate = getContentArray<{ icon: string; title: string; desc: string; color: string; bg: string; features: string[] }>(
    cmsData, "corporate", "items",
    [
      { icon: "Briefcase", title: "Corporate Training", desc: "Customized cyber security training programs for organizations. Upskill your workforce with enterprise-grade curriculum.", color: "text-violet-400", bg: "bg-violet-500/10", features: ["Custom curriculum", "On-site or remote", "Team analytics", "Dedicated instructor"] },
      { icon: "Tv", title: "On-Demand Workshops", desc: "Intensive hands-on workshops covering specific topics: pentesting, forensics, cloud security, and more.", color: "text-cyan-400", bg: "bg-cyan-500/10", features: ["1-3 day intensives", "Hands-on labs", "Expert instructors", "Certificate of completion"] },
      { icon: "Mic", title: "Live Webinars", desc: "Free and paid webinars on the latest cyber security trends, threat intelligence, and career guidance.", color: "text-amber-400", bg: "bg-amber-500/10", features: ["Weekly sessions", "Industry experts", "Q&A included", "Recorded for replay"] },
    ]
  )
  const partnersEyebrow = getContent(cmsData, "partners", "eyebrow", "PARTNER INSTITUTIONS")
  const partnersTitle = getContent(cmsData, "partners", "title", "On-premises training for")
  const partnersTitleAccent = getContent(cmsData, "partners", "titleAccent", "schools, colleges & universities.")
  const partnersDesc = getContent(cmsData, "partners", "description", "We partner with educational institutions to deliver world-class cyber security training on their premises.")
  const partners = getContentArray<{ type: string; icon: string; desc: string; color: string; bg: string; cta: string }>(
    cmsData, "partners", "items",
    [
      { type: "Schools", icon: "Building2", desc: "Comprehensive cyber security programs for school students. Includes a complimentary School Management System for MoU partners.", color: "text-emerald-400", bg: "bg-emerald-500/10", cta: "School Portal Login" },
      { type: "Colleges", icon: "BookOpen", desc: "Industry-aligned certification courses integrated into college curriculum. Hands-on labs and instructor-led training.", color: "text-cyan-400", bg: "bg-cyan-500/10", cta: "College Portal Login" },
      { type: "Universities", icon: "Award", desc: "Advanced research-grade cyber security labs, degree integration, and PhD-level coursework for universities.", color: "text-violet-400", bg: "bg-violet-500/10", cta: "University Portal Login" },
    ]
  )
  const benefitsEyebrow = getContent(cmsData, "partners", "benefitsEyebrow", "PARTNER BENEFITS")
  const benefitsTitle = getContent(cmsData, "partners", "benefitsTitle", "Why institutions choose GuardianX.")
  const benefits = getContentArray<{ icon: string; title: string; desc: string; color: string; bg: string }>(
    cmsData, "benefits", "items",
    [
      { icon: "Building2", title: "School Management System", desc: "Complimentary full-featured school management software for MoU partners. Manage students, attendance, grades, and more — separate from our training platform.", color: "text-violet-400", bg: "bg-violet-500/10" },
      { icon: "FlaskConical", title: "31 Docker-Powered Labs", desc: "Production-grade cyber range with live targets. Students practice on real vulnerabilities, not simulations.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { icon: "Award", title: "Verifiable Certificates", desc: "Tamper-evident, publicly verifiable credentials. Employers can validate any certificate by ID.", color: "text-amber-400", bg: "bg-amber-500/10" },
      { icon: "Users", title: "On-Premises Training", desc: "We deliver training at your institution. Instructors, labs, and materials brought to your campus.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
      { icon: "Target", title: "Real-Time Analytics", desc: "Track student progress, attendance, engagement, and career outcomes in real-time.", color: "text-rose-400", bg: "bg-rose-500/10" },
      { icon: "Globe", title: "Bulk Student Import", desc: "Onboard entire batches via CSV. Auto-generate accounts, enroll in courses, assign instructors.", color: "text-teal-400", bg: "bg-teal-500/10" },
    ]
  )
  const partnersExploreCta = getContent(cmsData, "partners", "exploreCta", "Explore Partners")
  const partnersMouCta = getContent(cmsData, "partners", "mouCta", "Sign an MoU")
  const finalCtaTitle = getContent(cmsData, "finalCta", "title", "Become unstoppable.")
  const finalCtaSubtitle = getContent(cmsData, "finalCta", "subtitle", "Join 12,000+ defenders advancing their careers. Free to start. No credit card.")
  const finalCtaPrimary = getContent(cmsData, "finalCta", "ctaPrimary", "Start Free Today")
  const finalCtaSecondary = getContent(cmsData, "finalCta", "ctaSecondary", "Talk to Us")

  const { data: coursesData } = useQuery<{ courses: Course[] }>({
    queryKey: ["public-courses"],
    queryFn: () => api("/api/courses"),
  })
  const courses = coursesData?.courses ?? []

  return (
    <div className="relative">
      {/* ====================================================
          SECTION 1: HERO — with animated 3D logo centerpiece
          ==================================================== */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500/6 blur-[100px] rounded-full pointer-events-none" />

        {/* Floating animated logo centerpiece — visible on large screens, behind text */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatedLogo size={520} showShards showParticles={false} showScanArc parallax />
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
              <span className="text-[10px] font-mono text-violet-300/80 tracking-[0.25em]">
                {heroBadge}
              </span>
            </motion.div>

            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1] tracking-[-0.03em] mb-6 text-balance">
              <TextReveal text={heroTitle} />
              <br />
              <span className="text-gradient-premium">
                <TextReveal text={heroTitleAccent} delay={0.3} />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-base lg:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed"
            >
              {heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center gap-4 mb-12"
            >
              <MagneticButton strength={0.3}>
                <Button size="lg" onClick={() => navigate({ name: "catalog" })} className="bg-violet-600 hover:bg-violet-500 btn-premium px-8 py-6 text-sm">
                  {heroCtaPrimary}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Button size="lg" variant="ghost" onClick={() => navigate({ name: "login" })} className="px-6 py-6 text-sm text-muted-foreground hover:text-foreground">
                  <PlayCircle className="h-4 w-4 mr-2" /> {heroCtaSecondary}
                </Button>
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex items-center gap-8 pt-8 border-t border-border/40"
            >
              {heroStats.map((s, i) => (
                <div key={s.label}>
                  <div className={cn("text-2xl font-bold tabular-nums", s.color)}>
                    <Counter value={s.value} suffix={s.suffix ?? ""} />
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Mobile / tablet — show animated logo inline above text */}
        <div className="lg:hidden absolute inset-x-0 top-0 h-[50vh] flex items-center justify-center pointer-events-none opacity-50">
          <AnimatedLogo size={260} showShards showParticles={false} showScanArc parallax={false} />
        </div>
        <div className="lg:hidden relative z-10 pt-[45vh]" />
      </section>

      {/* ====================================================
          SECTION 2: TRUST BAR
          ==================================================== */}
      <section className="py-8 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[9px] text-muted-foreground/60 uppercase tracking-[0.3em] mb-5">
            {trustLabel}
          </p>
          <div className="flex items-center justify-center gap-x-8 gap-y-3 flex-wrap opacity-25">
            {trustCompanies.map((name) => (
              <span key={name} className="text-sm font-semibold tracking-wide">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 3: WHO WE SERVE — three audiences
          ==================================================== */}
      <section className="py-20 lg:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">{audiencesEyebrow}</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
              {audiencesTitle}
              <br />
              <span className="text-muted-foreground/60">{audiencesTitleAccent}</span>
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-6">
            {audiences.map((aud, i) => {
              const Icon = getCmsIcon(aud.icon)
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="h-full rounded-xl border border-border/60 bg-card p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className={cn("inline-flex p-3 rounded-xl mb-4", aud.bg)}>
                      <Icon className={cn("h-6 w-6", aud.color)} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{aud.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{aud.desc}</p>
                    <div className={cn("text-xs font-mono", aud.color)}>{aud.stat}</div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 4: COURSES
          ==================================================== */}
      <section className="py-20 lg:py-28 border-t border-border/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-12">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">{coursesEyebrow}</p>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance">
                  {coursesTitle}
                  <br />
                  <span className="text-muted-foreground/60">{coursesTitleAccent}</span>
                </h2>
              </div>
              <Button variant="outline" onClick={() => navigate({ name: "catalog" })} className="glass">
                {coursesViewAllCta} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </ScrollReveal>

          {courses.length > 0 ? (
            <>
              <ScrollReveal delay={0.1}>
                <FeaturedCourse course={courses[0]} />
              </ScrollReveal>
              <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" staggerChildren={0.08}>
                {courses.slice(1, 7).map((course, i) => (
                  <StaggerItem key={course.id}>
                    <CourseCard course={course} index={i} />
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">Loading courses...</div>
          )}
        </div>
      </section>

      {/* ====================================================
          SECTION 5: CINEMATIC LABS — holographic scope
          ==================================================== */}
      <CinematicLabsSection />

      {/* ====================================================
          SECTION 6: CORPORATE TRAINING + WORKSHOPS + WEBINARS
          ==================================================== */}
      <section className="py-20 lg:py-28 border-t border-border/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <p className="text-[10px] font-mono text-cyan-400 tracking-[0.25em] mb-4">{corporateEyebrow}</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
              {corporateTitle}
              <br />
              <span className="text-gradient-cyan">{corporateTitleAccent}</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              {corporateDesc}
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-6">
            {corporate.map((item, i) => {
              const Icon = getCmsIcon(item.icon)
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="h-full rounded-xl border border-border/60 bg-card p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className={cn("inline-flex p-3 rounded-xl mb-4", item.bg)}>
                      <Icon className={cn("h-6 w-6", item.color)} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {item.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="w-full glass" onClick={() => navigate({ name: "contact" })}>
                      Learn More <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 7: CERTIFICATE VERIFICATION
          ==================================================== */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <CertificateVerifyCard />
          </ScrollReveal>
        </div>
      </section>

      {/* ====================================================
          SECTION 8: PARTNER INSTITUTIONS + BENEFITS
          ==================================================== */}
      <section className="py-20 lg:py-28 border-t border-border/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <p className="text-[10px] font-mono text-violet-400 tracking-[0.25em] mb-4">{partnersEyebrow}</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
              {partnersTitle}
              <br />
              <span className="text-gradient-premium">{partnersTitleAccent}</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              {partnersDesc}
            </p>
          </ScrollReveal>

          {/* Three partner types — each with own CTA */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {partners.map((p, i) => {
              const Icon = getCmsIcon(p.icon)
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="h-full rounded-xl border border-border/60 bg-card p-6 shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                    <div className={cn("inline-flex p-3 rounded-xl mb-4", p.bg)}>
                      <Icon className={cn("h-6 w-6", p.color)} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{p.type}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{p.desc}</p>
                    <div className="space-y-2">
                      <Button size="sm" className={cn("w-full", p.type === "Schools" ? "bg-emerald-600 hover:bg-emerald-500" : p.type === "Colleges" ? "bg-cyan-600 hover:bg-cyan-500" : "bg-violet-600 hover:bg-violet-500")} onClick={() => navigate({ name: "login" })}>
                        {p.cta} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                      <Button variant="outline" size="sm" className="w-full glass" onClick={() => navigate({ name: "institutions" })}>
                        Learn More
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>

          {/* Partner benefits */}
          <ScrollReveal delay={0.2}>
            <div className="text-center mb-8">
              <p className="text-[10px] font-mono text-cyan-400 tracking-[0.25em] mb-3">{benefitsEyebrow}</p>
              <h3 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-balance">
                {benefitsTitle}
              </h3>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {benefits.map((b, i) => {
              const Icon = getCmsIcon(b.icon)
              return (
                <ScrollReveal key={i} delay={0.1 + i * 0.05}>
                  <div className="h-full rounded-xl border border-border/60 bg-card p-5 shadow-md hover:shadow-lg transition-shadow">
                    <div className={cn("inline-flex p-2.5 rounded-lg mb-3", b.bg)}>
                      <Icon className={cn("h-5 w-5", b.color)} />
                    </div>
                    <h4 className="font-semibold text-sm mb-2">{b.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center">
              <Button onClick={() => navigate({ name: "institutions" })} className="bg-violet-600 hover:bg-violet-500 btn-premium mr-3">
                <Building2 className="h-4 w-4 mr-2" /> {partnersExploreCta} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="outline" onClick={() => navigate({ name: "contact" })} className="glass">
                {partnersMouCta} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====================================================
          SECTION 9: FINAL CTA
          ==================================================== */}
      <section className="py-20 lg:py-28 border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-6 text-balance">
              {finalCtaTitle}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              {finalCtaSubtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton strength={0.3}>
                <Button size="lg" onClick={() => navigate({ name: "login" })} className="bg-violet-600 hover:bg-violet-500 btn-premium px-8 py-6">
                  {finalCtaPrimary} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Button size="lg" variant="ghost" onClick={() => navigate({ name: "contact" })} className="px-8 py-6 text-muted-foreground hover:text-foreground">
                  {finalCtaSecondary}
                </Button>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   CinematicLabsSection — holographic scope with animated labs
   ============================================================ */
function CinematicLabsSection() {
  const [activeLab, setActiveLab] = React.useState(0)
  const cms = usePageContent("home")
  const cmsData = cms.data
  const labsEyebrow = getContent(cmsData, "labs", "eyebrow", "HANDS-ON LABS")
  const labsTitle = getContent(cmsData, "labs", "title", "Train against")
  const labsTitleAccent = getContent(cmsData, "labs", "titleAccent", "real targets.")
  const labsDesc = getContent(cmsData, "labs", "description", "31 Docker-powered labs with live target environments. Each lab spins up a real vulnerable system for you to attack, exploit, and defend.")
  const labsFeatures = getContentArray<{ icon: string; title: string; desc: string }>(
    cmsData, "labs", "features",
    [
      { icon: "Server", title: "Live Target Environments", desc: "Each lab spins up a Docker container with a real vulnerable system. Not a simulation — a real attack surface." },
      { icon: "Terminal", title: "In-Browser Terminal", desc: "Full Kali Linux terminal in your browser. Run nmap, sqlmap, burp, metasploit — no setup required." },
      { icon: "Target", title: "Dynamic Flags & Auto-Grading", desc: "Each lab generates a unique flag. Submit it for instant grading and XP. No two attempts are the same." },
      { icon: "Activity", title: "Real-Time Progress Tracking", desc: "Track time spent, hints used, attempts made. Build a portfolio of practical skills." },
    ]
  )
  const labsPoweredBy = getContentArray<string>(cmsData, "labs", "poweredBy", ["Docker", "Kali Linux", "Burp Suite", "Nmap", "Wireshark", "Metasploit", "SIEM"])
  const labsCta = getContent(cmsData, "labs", "cta", "Enter the Cyber Range")
  const labs = [
    { name: "SQL Injection — Login Bypass", category: "Web Security", difficulty: "Easy", icon: Code2, color: "text-violet-400", bg: "bg-violet-500/10" },
    { name: "Linux Privilege Escalation", category: "Privilege Escalation", difficulty: "Medium", icon: Terminal, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { name: "Active Directory Kerberoasting", category: "Active Directory", difficulty: "Hard", icon: Network, color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "Buffer Overflow — Control EIP", category: "Reverse Engineering", difficulty: "Insane", icon: Cpu, color: "text-rose-400", bg: "bg-rose-500/10" },
  ]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveLab((prev) => (prev + 1) % labs.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [labs.length])

  return (
    <section className="py-20 lg:py-28 border-t border-border/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-8" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal className="mb-12">
          <p className="text-[10px] font-mono text-cyan-400 tracking-[0.25em] mb-4">{labsEyebrow}</p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
            {labsTitle}
            <span className="text-gradient-cyan"> {labsTitleAccent}</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-lg">
            {labsDesc}
          </p>
        </ScrollReveal>

        {/* Holographic lab scope — animated */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left — animated scope visualization */}
          <ScrollReveal>
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-violet-500/20"
              >
                {labs.map((lab, i) => {
                  const angle = (i / labs.length) * 360
                  const x = Math.cos((angle * Math.PI) / 180) * 45
                  const y = Math.sin((angle * Math.PI) / 180) * 45
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      style={{ transform: `translate(${x}%, ${y}%)` }}
                    >
                      <motion.div
                        animate={activeLab === i ? { scale: 1.3 } : { scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className={cn("p-2.5 rounded-lg border", activeLab === i ? lab.bg + " border-" + lab.color.replace("text-", "") : "border-border/40 bg-card")}
                      >
                        <lab.icon className={cn("h-4 w-4", activeLab === i ? lab.color : "text-muted-foreground")} />
                      </motion.div>
                    </div>
                  )
                })}
              </motion.div>

              {/* Inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-8 rounded-full border border-cyan-500/20"
              >
                {[0, 60, 120, 180, 240, 300].map((angle) => {
                  const x = Math.cos((angle * Math.PI) / 180) * 45
                  const y = Math.sin((angle * Math.PI) / 180) * 45
                  return (
                    <div key={angle} className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/40" style={{ transform: `translate(${x}%, ${y}%)` }} />
                  )
                })}
              </motion.div>

              {/* Center — active lab */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={activeLab}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className={cn("inline-flex p-4 rounded-2xl border mb-3", labs[activeLab].bg, "border-" + labs[activeLab].color.replace("text-", "") + "/30")}>
                    {React.createElement(labs[activeLab].icon, { className: cn("h-8 w-8", labs[activeLab].color) })}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground tracking-wider mb-1">{labs[activeLab].category.toUpperCase()}</div>
                  <div className="text-sm font-semibold max-w-[160px]">{labs[activeLab].name}</div>
                  <Badge variant="outline" className={cn("text-[9px] mt-2", labs[activeLab].difficulty === "Easy" ? "border-emerald-500/30 text-emerald-400" : labs[activeLab].difficulty === "Medium" ? "border-amber-500/30 text-amber-400" : labs[activeLab].difficulty === "Hard" ? "border-rose-500/30 text-rose-400" : "border-violet-500/30 text-violet-400")}>
                    {labs[activeLab].difficulty.toUpperCase()}
                  </Badge>
                </motion.div>
              </div>

              {/* Pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-1/4 rounded-full border border-violet-500/20"
              />
            </div>
          </ScrollReveal>

          {/* Right — lab features + tech stack */}
          <div>
            <ScrollReveal delay={0.1}>
              <div className="space-y-4 mb-8">
                {labsFeatures.map((f, i) => {
                  const Icon = getCmsIcon(f.icon)
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card shadow-md">
                      <div className="inline-flex p-2 rounded-lg bg-violet-500/10 shrink-0">
                        <Icon className="h-5 w-5 text-violet-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">{f.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-[0.25em] mb-3">POWERED BY</p>
                <div className="flex items-center flex-wrap gap-2">
                  {labsPoweredBy.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs font-mono text-muted-foreground hover:text-violet-300 hover:border-violet-500/30 transition-colors shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <Button className="mt-6 bg-violet-600 hover:bg-violet-500 btn-premium" onClick={() => useAppStore.getState().navigate({ name: "login" })}>
                <FlaskConical className="h-4 w-4 mr-2" /> {labsCta} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FeaturedCourse — with real image
   ============================================================ */
function FeaturedCourse({ course }: { course: Course }) {
  const { navigate } = useAppStore()
  const image = getCourseImage(course)

  return (
    <CursorGlow className="group" color="oklch(0.6 0.2 295 / 0.04)">
      <div
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card cursor-pointer shadow-lg"
        onClick={() => navigate({ name: "course", courseId: course.id })}
      >
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
            <img src={image} alt={course.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="text-[9px] font-mono text-muted-foreground/80 tracking-[0.2em] px-2 py-1 rounded bg-background/60 backdrop-blur">
                FEATURED COURSE
              </span>
            </div>
          </div>

          <div className="p-8 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-violet-500/30 text-violet-300 bg-violet-500/5">
                {course.level.toUpperCase()}
              </span>
              {course.certBody && <span className="text-[10px] text-muted-foreground font-mono">{course.certBody}</span>}
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em] mb-3 text-balance">{course.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2">{course.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Duration", value: `${course.durationHours}h`, icon: Clock },
                { label: "Rating", value: course.rating.toFixed(1), icon: Star },
                { label: "Students", value: course.studentsCount, icon: Users },
                { label: "Modules", value: course.moduleCount, icon: BookOpen },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <m.icon className="h-3 w-3" /> {m.label}
                  </div>
                  <div className="text-sm font-medium">{m.value}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-violet-600 hover:bg-violet-500 btn-premium" onClick={(e) => { e.stopPropagation(); navigate({ name: "course", courseId: course.id }); }}>
                Enroll Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <span className="text-[10px] text-muted-foreground font-mono">{course.instructor.name}</span>
            </div>
          </div>
        </div>
      </div>
    </CursorGlow>
  )
}

/* ============================================================
   CourseCard — with real image + Enroll Now CTA
   ============================================================ */
function CourseCard({ course, index }: { course: Course; index: number }) {
  const { navigate } = useAppStore()
  const image = getCourseImage(course)

  const levelColors: Record<string, string> = {
    Beginner: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    Intermediate: "border-cyan-500/30 text-cyan-400 bg-cyan-500/5",
    Advanced: "border-violet-500/30 text-violet-400 bg-violet-500/5",
  }

  return (
    <CursorGlow className="group h-full" color="oklch(0.6 0.2 295 / 0.04)">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.05 }}
        className="relative overflow-hidden rounded-xl border border-border/60 bg-card cursor-pointer h-full flex flex-col shadow-lg"
        onClick={() => navigate({ name: "course", courseId: course.id })}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={image} alt={course.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="text-[9px] font-mono text-muted-foreground/60 tracking-[0.2em]">{String(index + 2).padStart(2, "0")}</span>
            <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded border", levelColors[course.level])}>{course.level.toUpperCase()}</span>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {course.certBody && <span className="text-[9px] text-muted-foreground font-mono">{course.certBody}</span>}
          <h3 className="font-semibold text-base mb-1 group-hover:text-violet-300 transition-colors line-clamp-1">{course.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed flex-1">{course.description}</p>
          <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-mono mb-3">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{course.rating}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.studentsCount}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.durationHours}h</span>
          </div>
          <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-500 text-xs" onClick={(e) => { e.stopPropagation(); navigate({ name: "course", courseId: course.id }); }}>
            Enroll Now <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </motion.div>
    </CursorGlow>
  )
}
