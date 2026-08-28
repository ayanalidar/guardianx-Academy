"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Award, Shield, Download, Share2, Calendar, CheckCircle2, Lock, Sparkles, Printer } from "lucide-react"
import { toast } from "sonner"
import { downloadCertificatePDF } from "@/lib/certificate-pdf"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-7 w-7 text-amber-400" /> Certificates
        </h1>
        <p className="text-muted-foreground mt-1">Your verifiable proof of completion. Share with employers.</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : certs.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No certificates yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Complete a course to earn your first certificate.</p>
          <Button onClick={() => navigate({ name: "learning" })}>
            <Sparkles className="h-4 w-4 mr-1.5" /> Continue Learning
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {certs.map((cert) => {
            const initials = cert.course.shortName.slice(0, 3)
            return (
              <Card key={cert.id} className="overflow-hidden relative group card-hover">
                {/* Certificate banner */}
                <div className="relative h-32 bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-cyan-500/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 text-amber-400 text-xs font-mono">
                    <Shield className="h-3.5 w-3.5" /> VERIFIED
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> PASSED
                    </Badge>
                  </div>
                  <div className="relative z-10 text-center">
                    <Award className="h-10 w-10 text-amber-400 mx-auto mb-1" strokeWidth={1.5} />
                    <div className="font-mono font-bold text-2xl text-gradient-emerald">{initials}</div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-1">CERTIFICATE OF COMPLETION</div>
                    <h3 className="font-semibold">{cert.course.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1">Issued by {cert.course.certBody} · GuardianX</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Score</div>
                      <div className="font-bold text-emerald-400">{cert.score}%</div>
                    </div>
                    <div>
                      <div className="text-muted-flex text-muted-foreground">Issued</div>
                      <div className="font-mono">{new Date(cert.issuedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-muted-foreground">Certificate ID</div>
                      <div className="font-mono text-[11px] truncate">{cert.certificateId}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                          {cert.course.instructor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{cert.course.instructor.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => download(cert)}>
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success("Share link copied!")}>
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
