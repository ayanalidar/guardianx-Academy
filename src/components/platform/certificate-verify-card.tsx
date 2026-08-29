"use client"

import * as React from "react"
import { Shield, Search, Award, CheckCircle2, XCircle, Loader2, BadgeCheck, Calendar, User, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface VerifyResult {
  valid: boolean
  hashValid?: boolean
  error?: string
  certificate?: {
    certificateId: string
    issuedAt: string
    score: number
    studentName: string
    studentTitle: string | null
    courseTitle: string
    courseShortName: string
    certBody: string | null
    instructorName: string
    instructorTitle: string | null
    template: { name: string; borderStyle: string; sealStyle: string; primaryColor: string } | null
  }
}

/**
 * "Verify Your Certificate" card — shown on the public homepage (auth screen).
 * Anyone (employer, recruiter, learner) can enter a certificate ID to confirm
 * it was genuinely issued by GuardianX Academy.
 */
export function CertificateVerifyCard() {
  const [open, setOpen] = React.useState(false)
  const [certId, setCertId] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<VerifyResult | null>(null)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!certId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await api<VerifyResult>(`/api/certificates/verify?certificateId=${encodeURIComponent(certId.trim())}`)
      setResult(data)
    } catch (err: any) {
      setResult({ valid: false, error: err.message ?? "Verification failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true) } }}
        className="group relative overflow-hidden p-5 cursor-pointer transition-all hover:border-amber-500/40 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] border-border bg-card/60 backdrop-blur"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-500/30 flex items-center justify-center">
              <BadgeCheck className="h-6 w-6 text-amber-400" strokeWidth={1.8} />
            </div>
            <div className="absolute -inset-1 bg-amber-500/20 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">Verify Your Certificate</h3>
              <Badge variant="outline" className="text-[10px] py-0 h-4 border-amber-500/40 text-amber-400">
                PUBLIC
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Employers & recruiters can confirm the authenticity of any GuardianX certificate by its ID.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-amber-400/80">
              <Search className="h-3 w-3" />
              <span>Enter certificate ID to verify →</span>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              Certificate Verification
            </DialogTitle>
            <DialogDescription>
              Enter the certificate ID (e.g. <span className="font-mono text-amber-400">GX-ABCD1234</span>) to verify its authenticity.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerify} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cert-id">Certificate ID</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cert-id"
                  className="pl-9 font-mono uppercase"
                  placeholder="GX-XXXXXXXX"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !certId.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" /> Verify Certificate
                </>
              )}
            </Button>
          </form>

          {/* Try demo button */}
          {!result && !loading && (
            <div className="text-center">
              <button
                onClick={() => setCertId("GX-")}
                className="text-[11px] text-muted-foreground hover:text-amber-400 font-mono underline-offset-2 hover:underline"
              >
                Don&apos;t have one? Try a demo cert after completing a course.
              </button>
            </div>
          )}

          {result && (
            <div className="mt-2">
              {result.valid && result.certificate ? (
                <Card className={cn(
                  "p-4 border-2",
                  result.hashValid ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/5"
                )}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      result.hashValid ? "bg-emerald-500/20" : "bg-amber-500/20"
                    )}>
                      <CheckCircle2 className={cn("h-6 w-6", result.hashValid ? "text-emerald-400" : "text-amber-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        Authentic Certificate
                        <Badge className={cn("text-[10px] h-4", result.hashValid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                          {result.hashValid ? "VERIFIED" : "VALID"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Issued by GuardianX Academy
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-0.5">
                        <User className="h-3 w-3" /> Recipient
                      </div>
                      <div className="font-medium">{result.certificate.studentName}</div>
                      {result.certificate.studentTitle && (
                        <div className="text-[10px] text-muted-foreground">{result.certificate.studentTitle}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-0.5">
                        <BookOpen className="h-3 w-3" /> Course
                      </div>
                      <div className="font-medium">{result.certificate.courseTitle}</div>
                      <div className="text-[10px] text-muted-foreground">{result.certificate.courseShortName}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-0.5">
                        <Calendar className="h-3 w-3" /> Issued
                      </div>
                      <div className="font-medium">{new Date(result.certificate.issuedAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-0.5">
                        <Award className="h-3 w-3" /> Score
                      </div>
                      <div className="font-medium">{result.certificate.score}%</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="text-[10px] font-mono text-muted-foreground">
                      ID: {result.certificate.certificateId}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      Instructor: {result.certificate.instructorName}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 border-2 border-red-500/40 bg-red-500/5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <XCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-red-400">Not Found</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {result.error ?? "No certificate matches this ID."}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2 font-mono">
                        Check the ID and try again. Certificate IDs start with &quot;GX-&quot;.
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
