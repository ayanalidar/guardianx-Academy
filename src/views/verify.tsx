"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ShieldCheck, ShieldAlert, ShieldX, ArrowLeft, ArrowRight,
  Check, X, Calendar, Hash, Award, TrendingUp, Lock,
  User, BookOpen, Sparkles, Fingerprint, AlertTriangle,
  Search, Copy,
} from "lucide-react"
import { toast } from "sonner"

/** Public-facing credential shape returned by /api/credentials/verify. */
type VerifiedCredential = {
  credentialId: string
  candidateName: string
  certificationName: string
  certificationSlug?: string
  certificationLevel?: string
  score: number
  issueDate: string
  expiryDate?: string | null
  status: string
  skillsAssessed?: string[]
  examType?: string
  verificationHash?: string
}

type VerifyResponse = {
  valid: boolean
  credential: VerifiedCredential | null
  error?: string
}

/**
 * VerifyView — public certificate verification page (master-prompt §44).
 *
 * Reachable at `/#/verify/<credentialId>` or `/#/verify?credentialId=<id>`.
 * Also reachable with no id (`/#/verify`) — in that case the user is
 * prompted to paste a credential ID into a search box.
 *
 * Fetches from `/api/credentials/verify/[credentialId]` (public, no auth)
 * and renders one of three terminal states:
 *   1. VERIFIED ✓       — green card with full certificate details
 *   2. NOT FOUND / REVOKED — red/amber card with explanation
 *   3. EMPTY             — prompt to enter a credential ID
 *
 * Styled with the premium dark-tech aesthetic (card-premium, glow,
 * mono-caps micro-labels, text-gradient-premium accents).
 */
export function VerifyView() {
  const { view, navigate } = useAppStore()
  const initialId = view.name === "verify" ? view.credentialId ?? "" : ""
  const [manualId, setManualId] = React.useState(initialId)
  const [submittedId, setSubmittedId] = React.useState(initialId)

  // If the user navigated here via footer/credentials link with an id in
  // the URL hash, kick off verification immediately. Otherwise stay empty.
  const activeId = submittedId || initialId

  const { data, isLoading, isError } = useQuery<VerifyResponse>({
    queryKey: ["verify-credential", activeId],
    queryFn: async () => {
      if (!activeId) return null
      const res = await fetch(`/api/credentials/verify/${encodeURIComponent(activeId)}`)
      // Always 200 (even on not-found / revoked) — the API never 4xx's
      // for non-existent ids; it returns { valid: false, credential: null }
      if (!res.ok) {
        throw new Error("Verification service unavailable")
      }
      return res.json() as Promise<VerifyResponse>
    },
    enabled: !!activeId,
    retry: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = manualId.trim()
    if (!trimmed) return
    setSubmittedId(trimmed)
    // Update the URL hash so the verification result is shareable.
    navigate({ name: "verify", credentialId: trimmed })
  }

  function copyShareUrl() {
    if (!activeId) return
    const url = `${window.location.origin}/#/verify/${encodeURIComponent(activeId)}`
    navigator.clipboard?.writeText(url)
    toast.success("Verification URL copied")
  }

  return (
    <div className="relative min-h-screen pt-2 lg:pt-4">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      {/* Atmospheric glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      {/* HERO */}
      <section className="relative py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-300 bg-emerald-500/5">
              <Fingerprint className="h-3 w-3 mr-1.5" /> GUARDIANX CREDENTIAL VERIFIER
            </Badge>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-4 text-balance">
              Verify a{" "}
              <span className="text-gradient-premium">credential.</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              GuardianX credentials are publicly verifiable. Enter a credential ID below to
              confirm its authenticity, candidate, and current status.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="relative pb-2">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter credential ID — e.g. GX-CERT-2025-XXXX"
                className="pl-9 font-mono"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !manualId.trim()}
              className="bg-violet-600 hover:bg-violet-500 btn-premium"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>
          <p className="mt-2 text-[10px] font-mono text-muted-foreground/70 tracking-wider text-center">
            PUBLIC · NO LOGIN REQUIRED · CRYPTOGRAPHICALLY SIGNED
          </p>
        </div>
      </section>

      {/* RESULT */}
      <section className="relative py-6 lg:py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {!activeId && <EmptyState />}
          {activeId && isLoading && <LoadingState id={activeId} />}
          {activeId && !isLoading && !isError && data && data.valid && data.credential && (
            <VerifiedCard cred={data.credential} onShare={copyShareUrl} />
          )}
          {activeId && !isLoading && !isError && data && !data.valid && data.credential && (
            <RevokedCard cred={data.credential} />
          )}
          {activeId && !isLoading && !isError && data && !data.valid && !data.credential && (
            <NotFoundCard id={activeId} />
          )}
          {activeId && !isLoading && isError && <ErrorCard />}
        </div>
      </section>

      {/* BACK NAV */}
      <section className="relative py-6 lg:py-8 border-t border-border/40 mt-4">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ name: "credentials" })}
            className="text-muted-foreground hover:text-violet-300"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Credentials
          </Button>
        </div>
      </section>
    </div>
  )
}

/* ----------------------------- empty state ------------------------------- */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-premium rounded-xl p-8 text-center"
    >
      <div className="inline-flex p-3 rounded-full bg-violet-500/10 text-violet-300 mb-4">
        <Fingerprint className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Awaiting credential ID</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Paste a GuardianX credential ID above and hit Verify. The credential holder
        can find their ID on their certificate or in the Credentials dashboard.
      </p>
    </motion.div>
  )
}

/* ----------------------------- loading state ----------------------------- */

function LoadingState({ id }: { id: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="card-premium rounded-xl p-8 text-center"
    >
      <div className="inline-flex items-center justify-center mb-4">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
      </div>
      <p className="text-sm font-mono text-muted-foreground tracking-wider">
        VERIFYING <span className="text-foreground">{id}</span>...
      </p>
    </motion.div>
  )
}

/* ----------------------------- verified card ----------------------------- */

function VerifiedCard({
  cred,
  onShare,
}: {
  cred: VerifiedCredential
  onShare: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-premium rounded-xl overflow-hidden"
    >
      {/* Header bar */}
      <div className="relative px-6 py-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent">
        <div className="absolute inset-0 bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="inline-flex p-2.5 rounded-lg bg-emerald-500/15 text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-emerald-400 tracking-[0.3em] mb-1">
              VERIFICATION RESULT
            </p>
            <h2 className="text-2xl font-bold text-emerald-300 tracking-tight flex items-center gap-2">
              Verified <Check className="h-5 w-5" />
            </h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          This GuardianX credential is <span className="text-emerald-300 font-semibold">active and authentic</span>.
          The details below match the official record.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Field icon={<User className="h-3.5 w-3.5" />} label="Candidate" value={cred.candidateName} />
          <Field icon={<BookOpen className="h-3.5 w-3.5" />} label="Certification" value={cred.certificationName} />
          {cred.certificationLevel && (
            <Field icon={<Sparkles className="h-3.5 w-3.5" />} label="Level" value={cred.certificationLevel} />
          )}
          <Field icon={<TrendingUp className="h-3.5 w-3.5" />} label="Score" value={`${cred.score}%`} />
          <Field
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Issue Date"
            value={new Date(cred.issueDate).toLocaleDateString()}
          />
          {cred.expiryDate && (
            <Field
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Expires"
              value={new Date(cred.expiryDate).toLocaleDateString()}
            />
          )}
          <Field
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Credential ID"
            value={cred.credentialId}
            mono
          />
          <Field
            icon={<Lock className="h-3.5 w-3.5" />}
            label="Status"
            value={<span className="text-emerald-300 font-semibold capitalize">{cred.status}</span>}
          />
        </div>

        {cred.skillsAssessed && cred.skillsAssessed.length > 0 && (
          <div className="pt-4 border-t border-border/40">
            <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mb-2">
              SKILLS ASSESSED
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cred.skillsAssessed.map((s: string) => (
                <span
                  key={s}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {cred.verificationHash && (
          <div className="pt-4 border-t border-border/40">
            <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] mb-1.5">
              VERIFICATION HASH
            </p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {cred.verificationHash}
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
          <Button size="sm" variant="outline" onClick={onShare} className="flex-1">
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy share URL
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = `${window.location.origin}/#/credentials`)}
            className="flex-1"
          >
            <Award className="h-3.5 w-3.5 mr-1.5" /> Browse Credentials
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

/* ----------------------------- revoked / suspended / expired card ------- */

function RevokedCard({ cred }: { cred: VerifiedCredential }) {
  const isRevoked = cred.status === "revoked"
  const isSuspended = cred.status === "suspended"

  const palette = isRevoked
    ? { ring: "border-rose-500/30 bg-rose-500/5", tint: "bg-rose-500/15 text-rose-300", text: "text-rose-300", Icon: ShieldX, label: "REVOKED" }
    : isSuspended
    ? { ring: "border-amber-500/30 bg-amber-500/5", tint: "bg-amber-500/15 text-amber-300", text: "text-amber-300", Icon: ShieldAlert, label: "SUSPENDED" }
    : { ring: "border-amber-500/30 bg-amber-500/5", tint: "bg-amber-500/15 text-amber-300", text: "text-amber-300", Icon: AlertTriangle, label: "EXPIRED" }

  const Icon = palette.Icon
  const explanation = isRevoked
    ? "This credential has been revoked by GuardianX. It is no longer valid and should not be accepted as proof of the listed skills."
    : isSuspended
    ? "This credential is currently suspended pending review. Please contact the credential holder or GuardianX support for clarification."
    : "This credential has passed its expiry date. The candidate may need to re-certify to maintain an active status."

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("card-premium rounded-xl overflow-hidden", palette.ring)}
    >
      {/* Header bar */}
      <div className={cn("relative px-6 py-5 border-b border-border/40", palette.ring)}>
        <div className="relative flex items-center gap-3">
          <div className={cn("inline-flex p-2.5 rounded-lg", palette.tint)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className={cn("text-[10px] font-mono tracking-[0.3em] mb-1", palette.text)}>
              VERIFICATION RESULT
            </p>
            <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", palette.text)}>
              {palette.label} <X className="h-5 w-5" />
            </h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <p className="text-sm text-muted-foreground">{explanation}</p>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Field icon={<User className="h-3.5 w-3.5" />} label="Candidate" value={cred.candidateName} />
          <Field icon={<BookOpen className="h-3.5 w-3.5" />} label="Certification" value={cred.certificationName} />
          <Field icon={<TrendingUp className="h-3.5 w-3.5" />} label="Score" value={`${cred.score}%`} />
          <Field
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Issue Date"
            value={new Date(cred.issueDate).toLocaleDateString()}
          />
          {cred.expiryDate && (
            <Field
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Expires"
              value={new Date(cred.expiryDate).toLocaleDateString()}
            />
          )}
          <Field icon={<Hash className="h-3.5 w-3.5" />} label="Credential ID" value={cred.credentialId} mono />
          <Field
            icon={<Lock className="h-3.5 w-3.5" />}
            label="Status"
            value={<span className={cn("font-semibold capitalize", palette.text)}>{cred.status}</span>}
          />
        </div>

        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground">
          <p>
            If you believe this result is in error, please contact{" "}
            <a
              href="mailto:academy@guardianx.in"
              className="text-violet-300 hover:underline"
            >
              academy@guardianx.in
            </a>
            .
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ----------------------------- not found card --------------------------- */

function NotFoundCard({ id }: { id: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-premium rounded-xl overflow-hidden border-rose-500/30 bg-rose-500/5"
    >
      <div className="relative px-6 py-5 border-b border-rose-500/20 bg-gradient-to-r from-rose-500/8 via-rose-500/4 to-transparent">
        <div className="relative flex items-center gap-3">
          <div className="inline-flex p-2.5 rounded-lg bg-rose-500/15 text-rose-300">
            <ShieldX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-rose-400 tracking-[0.3em] mb-1">
              VERIFICATION RESULT
            </p>
            <h2 className="text-2xl font-bold text-rose-300 tracking-tight flex items-center gap-2">
              Not Found <X className="h-5 w-5" />
            </h2>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          No GuardianX credential matches this ID. The credential may have been
          mistyped, fabricated, or never issued.
        </p>
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3">
          <p className="text-[10px] font-mono text-rose-400 tracking-[0.2em] mb-1">
            LOOKED UP
          </p>
          <p className="text-sm font-mono text-foreground break-all">{id}</p>
        </div>
        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground">
          <p>
            GuardianX credential IDs follow the format{" "}
            <span className="font-mono text-foreground">GX-CERT-YYYY-XXXX</span>. Double-check
            the ID with the credential holder, or contact{" "}
            <a
              href="mailto:academy@guardianx.in"
              className="text-violet-300 hover:underline"
            >
              academy@guardianx.in
            </a>{" "}
            for assistance.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ----------------------------- error card ------------------------------- */

function ErrorCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-premium rounded-xl p-6 text-center border-amber-500/30 bg-amber-500/5"
    >
      <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-300 mb-3">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-amber-300 mb-2">Verification unavailable</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        The verification service is temporarily unavailable. Please try again in a moment.
      </p>
    </motion.div>
  )
}

/* ----------------------------- field primitive -------------------------- */

function Field({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5">
      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] flex items-center gap-1.5">
        {icon} {label.toUpperCase()}
      </span>
      <span className={cn("text-foreground font-medium", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  )
}
