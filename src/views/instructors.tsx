"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Users, GraduationCap, Award, Linkedin, ArrowRight, Briefcase,
  Sparkles, BookOpen, Calendar, ExternalLink, ShieldCheck,
} from "lucide-react"

/* ============================================================
   /instructors — public listing of all INSTRUCTOR users with
   their InstructorProfile data. (master-prompt §25)
   ============================================================ */

interface InstructorRow {
  id: string
  name: string
  avatar: string | null
  title: string | null
  bio: string | null
  expertise: string[]
  yearsExperience: number
  certifications: string[]
  linkedinUrl: string | null
  maxBatches: number
  coursesCount: number
  batchesCount: number
  learnersCount: number
  createdAt: string
}

const ACCENTS = [
  { tint: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-500/30", ring: "ring-violet-500/20" },
  { tint: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/30", ring: "ring-cyan-500/20" },
  { tint: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30", ring: "ring-amber-500/20" },
  { tint: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30", ring: "ring-emerald-500/20" },
  { tint: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/30", ring: "ring-rose-500/20" },
]

function initials(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function InstructorsView() {
  const { navigate } = useAppStore()
  const { data, isLoading, isError } = useQuery<{ instructors: InstructorRow[]; count: number }>({
    queryKey: ["public-instructors"],
    queryFn: async () => {
      const res = await fetch("/api/instructors")
      if (!res.ok) return { instructors: [], count: 0 }
      return res.json()
    },
    staleTime: 60_000,
  })

  const instructors = data?.instructors ?? []

  return (
    <div className="relative min-h-screen pt-2 lg:pt-4">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      {/* subtle violet glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />

      {/* HERO */}
      <section className="relative py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="outline" className="mb-5 border-violet-500/30 text-violet-300 bg-violet-500/5">
              <Users className="h-3 w-3 mr-1.5" /> GUARDIANX INSTRUCTORS
            </Badge>
            <h1 className="text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em] mb-4 text-balance">
              Learn from people who have{" "}
              <span className="text-gradient-premium">done the work.</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every GuardianX instructor has shipped production security work — pentests, SOC operations,
              GRC programs, cloud hardening. No career academics. Just operators teaching what they actually do.
            </p>
          </motion.div>

          {/* Mini stats row */}
          {instructors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5"
            >
              <StatChip icon={Users} value={instructors.length} label="Instructors" tint="text-violet-300" />
              <StatChip
                icon={BookOpen}
                value={instructors.reduce((a, i) => a + i.coursesCount, 0)}
                label="Courses taught"
                tint="text-cyan-300"
              />
              <StatChip
                icon={Calendar}
                value={instructors.reduce((a, i) => a + i.batchesCount, 0)}
                label="Active batches"
                tint="text-amber-300"
              />
              <StatChip
                icon={GraduationCap}
                value={instructors.reduce((a, i) => a + i.learnersCount, 0)}
                label="Learners reached"
                tint="text-emerald-300"
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* GRID */}
      <section className="relative py-8 lg:py-10 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl border border-border/60 bg-card animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-8 text-center">
              <p className="text-sm text-rose-300">Failed to load instructors. Please try again later.</p>
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-border/60 bg-card">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-base font-semibold mb-2">No instructors published yet.</p>
              <p className="text-sm text-muted-foreground mb-5">
                Our team is being assembled. Check back soon, or reach out to ask about a specific course.
              </p>
              <Button size="sm" onClick={() => navigate({ name: "contact" })} className="bg-violet-600 hover:bg-violet-500">
                Contact us <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {instructors.map((instr, i) => {
                const accent = ACCENTS[i % ACCENTS.length]!
                return (
                  <motion.div
                    key={instr.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="card-premium rounded-2xl p-6 flex flex-col"
                  >
                    {/* Avatar + name */}
                    <div className="flex items-start gap-4 mb-4">
                      {instr.avatar ? (
                        <img
                          src={instr.avatar}
                          alt={instr.name}
                          className={cn("h-14 w-14 rounded-xl object-cover ring-2", accent.border)}
                          draggable={false}
                        />
                      ) : (
                        <div
                          className={cn(
                            "h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold ring-2",
                            accent.tint, accent.text, accent.border,
                          )}
                        >
                          {initials(instr.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base leading-tight mb-1 truncate">{instr.name}</h3>
                        {instr.title && (
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{instr.title}</p>
                        )}
                      </div>
                      {instr.linkedinUrl && (
                        <a
                          href={instr.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                            "bg-muted/40 hover:bg-[#0a66c2]/20 text-muted-foreground hover:text-[#0a66c2]",
                          )}
                          aria-label={`${instr.name} on LinkedIn`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {/* Expertise tags */}
                    {instr.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {instr.expertise.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 rounded-md border",
                              accent.tint, accent.text, accent.border,
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bio (truncated) */}
                    {instr.bio && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                        {instr.bio}
                      </p>
                    )}

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 mb-5 mt-auto">
                      <MiniStat
                        icon={Briefcase}
                        value={`${instr.yearsExperience}+`}
                        label="Years"
                        tint={accent.text}
                      />
                      <MiniStat icon={BookOpen} value={`${instr.coursesCount}`} label="Courses" tint={accent.text} />
                      <MiniStat icon={GraduationCap} value={`${instr.learnersCount}`} label="Learners" tint={accent.text} />
                    </div>

                    {/* Certifications */}
                    {instr.certifications.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1 mb-4 pt-3 border-t border-border/40">
                        <Award className={cn("h-3 w-3 mr-1", accent.text)} />
                        {instr.certifications.slice(0, 4).map((c) => (
                          <span key={c} className="text-[10px] font-mono text-muted-foreground">
                            {c}
                          </span>
                        ))}
                        {instr.certifications.length > 4 && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            +{instr.certifications.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate({ name: "instructor-detail", instructorId: instr.id })}
                      className="w-full group"
                    >
                      View Profile
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* CTA at bottom */}
          {!isLoading && instructors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mt-14 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 text-center"
            >
              <Sparkles className="h-7 w-7 text-violet-300 mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">Want to teach with us?</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
                We&apos;re always looking for working security professionals who want to mentor the next generation.
              </p>
              <Button onClick={() => navigate({ name: "contact" })} className="bg-violet-600 hover:bg-violet-500 btn-premium">
                Apply to instruct <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

function StatChip({ icon: Icon, value, label, tint }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string; tint: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border/60 bg-card/60 backdrop-blur">
      <Icon className={cn("h-4 w-4", tint)} />
      <span className="font-mono text-sm font-bold tabular-nums">{value.toLocaleString()}</span>
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  )
}

function MiniStat({ icon: Icon, value, label, tint }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string; tint: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/40 px-2 py-2.5 text-center">
      <Icon className={cn("h-3.5 w-3.5 mx-auto mb-1", tint)} />
      <div className="font-mono text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  )
}
