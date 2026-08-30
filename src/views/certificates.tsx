"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Award, Shield, Download, Share2, Calendar, CheckCircle2,
  Sparkles, ShieldCheck, ArrowRight, Hash, User, Target,
} from "lucide-react"
import { toast } from "sonner"
import { downloadCertificatePDF } from "@/lib/certificate-pdf"
import { cn } from "@/lib/utils"
import {
  ScrollReveal, TextReveal, Stagger, StaggerItem, CursorGlow,
  MagneticButton, Counter,
} from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"

interface CertItem {
  id: string; certificateId: string; issuedAt: string; score: number
  course: { id: string; title: string; shortName: string; certBody: string; instructor: { name: string } }
}

export function CertificatesView() {
  const { navigate } = useAppStore()
  const { data, isLoading } = useQuery<{ certificates: CertItem[] }>({
    queryKey: ["certificates"],
    queryFn: () => api("/api/certificates"),
  })

  const certs = data?.certificates ?? []

  async function download(cert: CertItem) {
    toast.info("Preparing certificate PDF...")
    await downloadCertificatePDF(cert.id)
  }

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-violet-600/6 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ====================================================
            HEADER — oversized headline
            ==================================================== */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-dot" />
            <span className="text-[10px] font-mono text-amber-300/80 tracking-[0.3em]">
              VERIFIABLE PROOF · BLOCKCHAIN-GRADE INTEGRITY
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.04em] mb-4 text-balance">
            <TextReveal text="Your" />{" "}
            <span className="text-gradient-premium">
              <TextReveal text="certificates." delay={0.2} />
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-muted-foreground max-w-xl mb-12 text-base lg:text-lg leading-relaxed">
            Each certificate is a verifiable artifact. Cryptographically signed, permanently yours.
          </p>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[28rem]" />)}
          </div>
        ) : certs.length === 0 ? (
          /* ====================================================
              EMPTY STATE — premium composition
              ==================================================== */
          <EmptyVaultState />
        ) : (
          <>
            {/* ====================================================
                STATS STRIP — border-left editorial
                ==================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { label: "Certificates held", value: certs.length, accent: "border-amber-500/50", color: "text-amber-300", icon: Award },
                { label: "Avg score", value: Math.round(certs.reduce((a, c) => a + c.score, 0) / certs.length), suffix: "%", accent: "border-emerald-500/50", color: "text-emerald-300", icon: Target },
                { label: "Certifying bodies", value: new Set(certs.map((c) => c.course.certBody)).size, accent: "border-cyan-500/50", color: "text-cyan-300", icon: Shield },
                { label: "Most recent", value: 0, custom: new Date(certs[0].issuedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }), accent: "border-violet-500/50", color: "text-violet-300", icon: Calendar },
              ].map((s, i) => (
                <ScrollReveal key={s.label} delay={0.4 + i * 0.08}>
                  <div className={cn("border-l pl-5", s.accent)}>
                    <s.icon className={cn("h-4 w-4 mb-3", s.color)} />
                    <div className="text-4xl lg:text-5xl font-bold tracking-[-0.03em] mb-1">
                      {s.custom ? s.custom : <Counter value={s.value} suffix={s.suffix ?? ""} />}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* ====================================================
                CERTIFICATE COMPOSITIONS — premium, asymmetric
                ==================================================== */}
            <Stagger className="grid lg:grid-cols-2 gap-8" staggerChildren={0.12}>
              {certs.map((cert) => (
                <StaggerItem key={cert.id} y={40}>
                  <CertificateComposition cert={cert} onDownload={() => download(cert)} />
                </StaggerItem>
              ))}
            </Stagger>

            {/* Footer CTA */}
            <ScrollReveal delay={0.2}>
              <div className="mt-16 flex items-center justify-between p-6 rounded-2xl border border-border/60 bg-card/30">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] mb-1">CONTINUE THE JOURNEY</p>
                  <p className="text-sm">Earn more certificates by completing enrolled courses.</p>
                </div>
                <MagneticButton strength={0.3}>
                  <Button
                    onClick={() => navigate({ name: "learning" })}
                    className="bg-violet-600 hover:bg-violet-500 btn-premium"
                  >
                    Continue Learning <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </MagneticButton>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   EmptyVaultState — premium empty state
   ============================================================ */
function EmptyVaultState() {
  const { navigate } = useAppStore()
  return (
    <ScrollReveal delay={0.4}>
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/30 p-16 lg:p-24 text-center">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-violet-950/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />
        {/* Network viz accent */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <NetworkVisualization variant="section" className="w-full h-full" />
        </div>
        <div className="relative z-10 max-w-md mx-auto">
          <div className="inline-flex p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 mb-6 relative">
            <Award className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
            <div className="absolute inset-0 rounded-2xl animate-glow-pulse" style={{ boxShadow: "0 0 30px -4px oklch(0.7 0.15 85 / 0.4)" }} />
          </div>
          <p className="text-[10px] font-mono text-amber-300/80 tracking-[0.3em] mb-3">VAULT EMPTY</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-3 text-balance">
            No certificates yet.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Complete a course to earn your first verifiable certificate. Each completion is a permanent credential.
          </p>
          <MagneticButton strength={0.3}>
            <Button
              onClick={() => navigate({ name: "learning" })}
              className="bg-violet-600 hover:bg-violet-500 btn-premium px-6 py-5"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Continue Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </MagneticButton>
        </div>
      </div>
    </ScrollReveal>
  )
}

/* ============================================================
   CertificateComposition — premium editorial certificate
   ============================================================ */
function CertificateComposition({ cert, onDownload }: { cert: CertItem; onDownload: () => void }) {
  const initials = cert.course.shortName.slice(0, 4).toUpperCase()
  const instructorInitials = cert.course.instructor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <CursorGlow color="oklch(0.7 0.15 85 / 0.06)" className="group h-full">
      <article className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card/30 transition-all duration-500 group-hover:border-amber-500/30 group-hover:shadow-[0_30px_80px_-30px] group-hover:shadow-amber-500/15 group-hover:-translate-y-1">
        {/* ====================================================
            VISUAL BANNER — oversized course code
            ==================================================== */}
        <div className="relative h-56 lg:h-64 overflow-hidden">
          {/* Layered background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-violet-950/30 to-cyan-950/20" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          {/* Glow orbs */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/15 blur-[60px] rounded-full" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-600/15 blur-[60px] rounded-full" />
          {/* Network viz subtle */}
          <div className="absolute inset-0 opacity-30">
            <NetworkVisualization variant="minimal" className="w-full h-full" />
          </div>

          {/* Top metadata strip */}
          <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[10px] font-mono text-amber-300 tracking-[0.2em]">VERIFIED</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[10px] font-mono text-emerald-300 tracking-[0.2em]">PASSED</span>
            </div>
          </div>

          {/* Oversized course code — center, ghost + filled layer */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative">
              <span className="absolute inset-0 flex items-center justify-center text-[clamp(4rem,12vw,7rem)] font-bold font-mono text-amber-400/15 blur-sm select-none">
                {initials}
              </span>
              <span className="relative text-[clamp(3rem,9vw,5.5rem)] font-bold font-mono text-gradient-premium leading-none">
                {initials}
              </span>
            </div>
          </div>

          {/* Bottom edge accent line */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        </div>

        {/* ====================================================
            CERTIFICATE BODY — editorial, NOT a card grid
            ==================================================== */}
        <div className="p-6 lg:p-7">
          {/* Course title */}
          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] mb-2">
            CERTIFICATE OF COMPLETION
          </p>
          <h3 className="text-xl lg:text-2xl font-bold tracking-[-0.02em] mb-1 leading-tight">
            {cert.course.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Issued by <span className="text-amber-300">{cert.course.certBody || "GuardianX"}</span> · GuardianX Academy
          </p>

          {/* Metadata — editorial rows with border-left */}
          <div className="space-y-3 mb-6">
            <MetaRow icon={Hash} label="Certificate ID" value={
              <span className="font-mono text-[11px] tracking-tight text-foreground/90 break-all">{cert.certificateId}</span>
            } />
            <MetaRow icon={Calendar} label="Issue Date" value={
              <span className="font-mono text-xs">{new Date(cert.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
            } />
            <MetaRow icon={Target} label="Final Score" value={
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-300 tabular-nums">{cert.score}%</span>
                <div className="flex-1 max-w-[100px] h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400" style={{ width: `${cert.score}%` }} />
                </div>
              </div>
            } />
            <MetaRow icon={User} label="Instructor" value={
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-violet-500/10 text-violet-300 text-[10px] font-mono">
                    {instructorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{cert.course.instructor.name}</span>
              </div>
            } />
          </div>

          {/* Footer: actions + verification */}
          <div className="flex items-center justify-between pt-5 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3 text-emerald-300" />
              <span className="font-mono tracking-[0.15em]">BLOCKCHAIN-VERIFIED</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => toast.success("Share link copied!")}
                aria-label="Share certificate"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <MagneticButton strength={0.2}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 btn-premium border-amber-500/30 bg-amber-500/5 text-amber-200 hover:bg-amber-500/15 hover:text-amber-100"
                  onClick={onDownload}
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
              </MagneticButton>
            </div>
          </div>
        </div>
      </article>
    </CursorGlow>
  )
}

function MetaRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-l-2 border-border/60 pl-4 hover:border-amber-500/40 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">{label}</span>
      </div>
      <div className="shrink-0 text-right">{value}</div>
    </div>
  )
}
