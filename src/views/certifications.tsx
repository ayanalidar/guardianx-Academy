"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Award, ArrowRight, Shield, BookOpen, ExternalLink, Clock } from "lucide-react"

export function CertificationsView() {
  const { navigate } = useAppStore()
  const { data } = useQuery({
    queryKey: ["certifications"],
    queryFn: async () => { try { const r = await fetch("/api/certifications"); return r.ok ? r.json() : null } catch { return null } },
  })
  const certs = data?.certifications ?? []
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <section className="relative py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-300 bg-violet-500/5"><Award className="h-3 w-3 mr-1.5" /> CERTIFICATION DIRECTORY</Badge>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-3 text-balance">Prepare for industry <span className="text-gradient-premium">certifications.</span></h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">GuardianX provides instructor-led training, hands-on labs, and mock exams to prepare you for official cybersecurity certifications.</p>
        </div>
      </section>
      <section className="py-6 lg:py-8 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {certs.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">Loading certifications...</Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certs.map((c: any, i: number) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                  <Card className="p-5 hover:border-violet-500/30 transition-colors h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="inline-flex p-2.5 rounded-lg bg-violet-500/10"><Award className="h-5 w-5 text-violet-300" /></div>
                      <Badge variant="outline" className={cn("text-[9px]", c.color)}>{c.level}</Badge>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">Issued by {c.issuer}</p>
                    {c.trainingDuration && <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3"><Clock className="h-3 w-3" /> {c.trainingDuration}</div>}
                    {c.domains?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {c.domains.slice(0, 5).map((d: string) => <span key={d} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{d}</span>)}
                        {c.domains.length > 5 && <span className="text-[9px] font-mono px-1.5 py-0.5 text-muted-foreground">+{c.domains.length - 5}</span>}
                      </div>
                    )}
                    {c.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {c.skills.slice(0, 4).map((s: string) => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">{s}</span>)}
                      </div>
                    )}
                    <div className="mt-auto flex gap-2">
                      <Button size="sm" onClick={() => navigate({ name: "catalog" })} className="bg-violet-600 hover:bg-violet-500 btn-premium flex-1">
                        Find Training <ArrowRight className="h-3 w-3 ml-1.5" />
                      </Button>
                      {c.officialUrl && <a href={c.officialUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><ExternalLink className="h-3 w-3" /></Button></a>}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
