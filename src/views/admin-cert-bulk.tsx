"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import {
  ArrowLeft, Award, Users, CheckCircle2, Loader2, Download,
  ShieldCheck, Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export function CertBulkIssuanceView() {
  const { navigate } = useAppStore()
  const [selectedBatch, setSelectedBatch] = React.useState("")
  const [issuing, setIssuing] = React.useState(false)
  const [issued, setIssued] = React.useState<any[]>([])

  // Mock batch data with enrolled students
  const batches = [
    { id: "batch-1", name: "CEH Weekend Batch — Oct 2025", cert: "CEH", students: 12, completed: 10 },
    { id: "batch-2", name: "Security+ Weekday — Oct 2025", cert: "Security+", students: 8, completed: 6 },
    { id: "batch-3", name: "CCNA Morning — Nov 2025", cert: "CCNA", students: 15, completed: 0 },
    { id: "batch-4", name: "CISSP Weekend — Nov 2025", cert: "CISSP", students: 5, completed: 3 },
  ]

  const selectedBatchData = batches.find(b => b.id === selectedBatch)

  async function handleBulkIssue() {
    if (!selectedBatch) return
    setIssuing(true)
    setIssued([])
    try {
      // In production, this would call /api/admin/certificates/bulk-issue
      await new Promise(r => setTimeout(r, 1500)) // simulate API call
      const mockIssued = Array.from({ length: selectedBatchData?.completed ?? 0 }).map((_, i) => ({
        id: `GX-CERT-2025-${String(1000 + i).padStart(4, "0")}`,
        student: `Student ${i + 1}`,
        cert: selectedBatchData?.cert,
        status: "issued",
      }))
      setIssued(mockIssued)
      toast.success(`${mockIssued.length} certificates issued successfully!`)
    } catch {
      toast.error("Bulk issuance failed")
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-400" /> Certificate Bulk Issuance
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Select batch */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-4">Select a Batch</h2>
          <div className="space-y-2">
            {batches.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBatch(b.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  selectedBatch === b.id ? "border-violet-500 bg-violet-500/5" : "border-border/60 hover:border-violet-500/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[9px]">{b.cert}</Badge>
                      <span className="font-medium text-sm">{b.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span><Users className="h-3 w-3 inline mr-1" />{b.students} enrolled</span>
                      <span><CheckCircle2 className="h-3 w-3 inline mr-1" />{b.completed} completed</span>
                    </div>
                  </div>
                  {selectedBatch === b.id && <CheckCircle2 className="h-5 w-5 text-violet-400" />}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Issue button */}
        {selectedBatchData && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">{selectedBatchData.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedBatchData.completed} students eligible for {selectedBatchData.cert} certification
                </p>
              </div>
              <Button onClick={handleBulkIssue} disabled={issuing || selectedBatchData.completed === 0} className="bg-violet-600 hover:bg-violet-500 btn-premium">
                {issuing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Issuing...</> : <><Award className="h-4 w-4 mr-2" /> Issue {selectedBatchData.completed} Certificates</>}
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {issued.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-semibold">Issued Certificates</h2>
              <Badge className="bg-emerald-500/10 text-emerald-300 border-0">{issued.length} issued</Badge>
            </div>
            <div className="space-y-2">
              {issued.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-sm font-medium">{c.student}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.id}</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-300 border-0">VERIFIED</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1.5" /> Download All</Button>
              <Button size="sm" variant="outline"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Notify Students</Button>
            </div>
          </Card>
        )}

        {/* Info */}
        <Card className="p-4 border-violet-500/20 bg-violet-500/5">
          <p className="text-xs text-muted-foreground">
            <span className="text-violet-300 font-semibold">HOW IT WORKS:</span> Select a batch with completed students, click "Issue Certificates", and GuardianX will generate verifiable credentials for each eligible student. Students are notified automatically via email with their credential ID and verification URL.
          </p>
        </Card>
      </div>
    </div>
  )
}
