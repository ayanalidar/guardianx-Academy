"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Network,
  Users,
  Plus,
  ArrowLeft,
  Clock,
  Server,
  Shield,
  Swords,
  Eye,
  Crown,
  Cpu,
  Activity,
  Radio,
} from "lucide-react"
import { toast } from "sonner"
import { ScrollReveal } from "@/components/platform/motion-system"

/* ============================================================
   CyberRangeView
   ============================================================ */

interface RangeMachine {
  hostname: string
  os: string
  role: string
  ip: string
}

interface RangeTopology {
  nodes: { id: string; label: string; type: string }[]
  links: [string, string][]
}

interface RangeItem {
  id: string
  name: string
  description: string
  topology: RangeTopology
  machines: RangeMachine[]
  maxUsers: number
  difficulty: string
  duration: number
  status: string
  activeSessions: { id: string; status: string; memberCount: number; isMember: boolean }[]
}

interface RangeSession {
  id: string
  status: string
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  range: RangeItem
  members: { userId: string; name: string; avatar: string | null; title: string | null; role: string; isMe: boolean }[]
  isMember: boolean
  isLeader: boolean
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-300",
  intermediate: "text-amber-300",
  advanced: "text-rose-300",
}

const NODE_TYPE_ICON: Record<string, typeof Server> = {
  server: Server,
  firewall: Shield,
  directory: Crown,
  client: Cpu,
  plc: Cpu,
  api: Activity,
  ingress: Network,
  pod: Server,
}

const ROLES = [
  { id: "attacker", label: "Attacker", icon: Swords, color: "text-rose-300", desc: "Offensive — breach & pivot" },
  { id: "defender", label: "Defender", icon: Shield, color: "text-cyan-300", desc: "Defensive — detect & contain" },
  { id: "observer", label: "Observer", icon: Eye, color: "text-amber-300", desc: "Spectate and learn" },
] as const

const ROLE_LABEL: Record<string, { label: string; icon: typeof Swords; color: string }> = {
  leader: { label: "Leader", icon: Crown, color: "text-violet-300" },
  attacker: { label: "Attacker", icon: Swords, color: "text-rose-300" },
  defender: { label: "Defender", icon: Shield, color: "text-cyan-300" },
  observer: { label: "Observer", icon: Eye, color: "text-amber-300" },
}

export function CyberRangeView() {
  const qc = useQueryClient()
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null)
  const [joinRole, setJoinRole] = React.useState<string>("attacker")

  const { data: listData, isLoading: listLoading } = useQuery<{ ranges: RangeItem[] }>({
    queryKey: ["cyber-ranges"],
    queryFn: () => api("/api/cyber-range"),
  })

  const { data: detail, isLoading: detailLoading } = useQuery<{ session: RangeSession }>({
    queryKey: ["cyber-range", activeSessionId],
    queryFn: () => api(`/api/cyber-range/${activeSessionId}`),
    enabled: !!activeSessionId,
    refetchInterval: 10000,
  })

  const createSession = useMutation({
    mutationFn: (rangeId: string) =>
      api("/api/cyber-range", { method: "POST", body: JSON.stringify({ rangeId }) }),
    onSuccess: (data: { session: RangeSession }) => {
      toast.success("Range session created!")
      setActiveSessionId(data.session.id)
      qc.invalidateQueries({ queryKey: ["cyber-ranges"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const joinSession = useMutation({
    mutationFn: () =>
      api(`/api/cyber-range/${activeSessionId}`, { method: "POST", body: JSON.stringify({ role: joinRole }) }),
    onSuccess: () => {
      toast.success("Joined the range!")
      qc.invalidateQueries({ queryKey: ["cyber-range", activeSessionId] })
      qc.invalidateQueries({ queryKey: ["cyber-ranges"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const ranges = listData?.ranges ?? []

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.25em]">
              COLLABORATIVE CYBER RANGE · ATTACK vs DEFENSE
            </span>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] mb-3 text-balance">
            Cyber <span className="text-gradient-premium">Range</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-muted-foreground max-w-xl mb-12">
            Spin up shared network environments. Assign attackers, defenders, and observers — then run live red-vs-blue engagements.
          </p>
        </ScrollReveal>

        {!activeSessionId ? (
          listLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ranges.map((r, i) => (
                <ScrollReveal key={r.id} delay={0.05 + i * 0.08}>
                  <div className="card-premium rounded-2xl p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className={cn("capitalize", DIFFICULTY_COLORS[r.difficulty])}>
                        {r.difficulty}
                      </Badge>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.maxUsers}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.duration}m</span>
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{r.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{r.description}</p>

                    {/* Topology preview */}
                    <TopologyMini topology={r.topology} />

                    {/* Machine list */}
                    <div className="mb-4">
                      <div className="text-[10px] font-mono text-violet-300 tracking-[0.2em] mb-2">
                        {r.machines.length} MACHINES
                      </div>
                      <div className="space-y-1">
                        {r.machines.slice(0, 3).map((m) => (
                          <div key={m.hostname} className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-muted-foreground truncate">{m.hostname}</span>
                            <span className="text-violet-300">{m.ip}</span>
                          </div>
                        ))}
                        {r.machines.length > 3 && (
                          <div className="text-[10px] font-mono text-muted-foreground">
                            +{r.machines.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
                      {r.activeSessions.length > 0 ? (
                        <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                          <Radio className="h-3 w-3 pulse-dot" /> {r.activeSessions.length} live
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">No active sessions</span>
                      )}
                      <Button
                        size="sm"
                        onClick={() => createSession.mutate(r.id)}
                        disabled={createSession.isPending}
                        className="bg-violet-600 hover:bg-violet-500 btn-premium"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Session
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )
        ) : (
          detailLoading || !detail ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setActiveSessionId(null)} className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" /> All ranges
              </Button>

              {/* Range Header */}
              <ScrollReveal>
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 lg:p-8 shadow-lg">
                  <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="outline" className={cn("capitalize", DIFFICULTY_COLORS[detail.session.range.difficulty])}>
                        {detail.session.range.difficulty}
                      </Badge>
                      <Badge variant="outline" className="capitalize">{detail.session.status}</Badge>
                      <Badge variant="outline" className="text-cyan-300 border-cyan-500/30">
                        <Clock className="h-3 w-3 mr-1" /> {detail.session.range.duration} min
                      </Badge>
                      <Badge variant="outline" className="text-violet-300 border-violet-500/30">
                        <Users className="h-3 w-3 mr-1" /> {detail.session.members.length} / {detail.session.range.maxUsers}
                      </Badge>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">{detail.session.range.name}</h2>
                    <p className="text-sm text-muted-foreground mb-6">{detail.session.range.description}</p>

                    {/* Topology preview */}
                    <TopologyFull topology={detail.session.range.topology} machines={detail.session.range.machines} />
                  </div>
                </div>
              </ScrollReveal>

              {/* Team Lobby + Role pick */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-4">
                    <p className="text-[10px] font-mono text-violet-400 tracking-[0.3em] mb-2">SESSION LOBBY</p>
                    <h3 className="text-xl font-bold tracking-tight">Team Roster</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {detail.session.members.map((m) => {
                      const role = ROLE_LABEL[m.role] ?? ROLE_LABEL.attacker
                      return (
                        <div
                          key={m.userId}
                          className={cn(
                            "rounded-xl border p-4",
                            m.isMe ? "border-violet-500/40 bg-violet-500/10" : "border-border/60 bg-card"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-mono font-semibold text-violet-200">
                              {m.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{m.name}{m.isMe && " (You)"}</div>
                              {m.title && <div className="text-[10px] text-muted-foreground">{m.title}</div>}
                            </div>
                          </div>
                          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono", "bg-muted/50", role.color)}>
                            <role.icon className="h-3 w-3" /> {role.label}
                          </div>
                        </div>
                      )
                    })}
                    {Array.from({ length: Math.max(0, detail.session.range.maxUsers - detail.session.members.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="rounded-xl border border-dashed border-border/60 p-4 flex items-center justify-center text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 mr-1.5" /> Open slot
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role select */}
                <div>
                  <div className="mb-4">
                    <p className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] mb-2">PICK A SIDE</p>
                    <h3 className="text-xl font-bold tracking-tight">Your Role</h3>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card shadow-lg p-4 space-y-3">
                    {detail.session.isMember ? (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> You&apos;re on the team.
                      </div>
                    ) : (
                      <>
                        {ROLES.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setJoinRole(r.id)}
                            className={cn(
                              "w-full text-left rounded-lg border p-3 transition-all",
                              joinRole === r.id
                                ? "border-violet-500/50 bg-violet-500/10"
                                : "border-border/60 bg-muted/30 hover:border-violet-500/30"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <r.icon className={cn("h-4 w-4", r.color)} />
                              <span className="text-sm font-medium">{r.label}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                          </button>
                        ))}
                        <Button
                          onClick={() => joinSession.mutate()}
                          disabled={joinSession.isPending}
                          className="w-full bg-violet-600 hover:bg-violet-500 btn-premium"
                        >
                          {joinSession.isPending ? "Joining..." : "Join Range"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

/* ---- Mini topology preview (used on range cards) ---- */
function TopologyMini({ topology }: { topology: RangeTopology }) {
  const nodes = topology?.nodes ?? []
  const links = topology?.links ?? []
  if (nodes.length === 0) return null
  const w = 240
  const h = 90
  // Spread nodes in a row
  const pos = new Map<string, { x: number; y: number }>()
  nodes.forEach((n, i) => {
    const x = 24 + (i * (w - 48)) / Math.max(1, nodes.length - 1)
    pos.set(n.id, { x, y: h / 2 })
  })
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-2 mb-4">
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {links.map(([from, to], i) => {
          const a = pos.get(from)
          const b = pos.get(to)
          if (!a || !b) return null
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="oklch(0.5 0.1 270 / 0.5)" strokeWidth={1} />
          )
        })}
        {nodes.map((n) => {
          const p = pos.get(n.id)
          if (!p) return null
          const Icon = NODE_TYPE_ICON[n.type] ?? Server
          return (
            <g key={n.id} transform={`translate(${p.x - 12}, ${p.y - 12})`}>
              <circle cx={12} cy={12} r={11} fill="oklch(0.2 0.015 270)" stroke="oklch(0.6 0.2 295 / 0.4)" strokeWidth={1} />
              <foreignObject x={4} y={4} width={16} height={16}>
                <div className="flex items-center justify-center w-full h-full">
                  <Icon className="h-3 w-3 text-violet-300" />
                </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ---- Full topology (used in detail) ---- */
function TopologyFull({ topology, machines }: { topology: RangeTopology; machines: RangeMachine[] }) {
  const nodes = topology?.nodes ?? []
  const links = topology?.links ?? []
  if (nodes.length === 0) return null
  const w = 640
  const h = 200
  const pos = new Map<string, { x: number; y: number }>()
  nodes.forEach((n, i) => {
    const x = 60 + (i * (w - 120)) / Math.max(1, nodes.length - 1)
    pos.set(n.id, { x, y: h / 2 })
  })
  const machineIpMap = new Map(machines.map((m) => [m.hostname, m.ip]))

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="text-[10px] font-mono text-violet-300 tracking-[0.2em] mb-3">NETWORK TOPOLOGY</div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <defs>
          <marker id="cr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(0.5 0.1 270 / 0.6)" />
          </marker>
        </defs>
        {links.map(([from, to], i) => {
          const a = pos.get(from)
          const b = pos.get(to)
          if (!a || !b) return null
          return (
            <line
              key={i}
              x1={a.x + 20}
              y1={a.y}
              x2={b.x - 20}
              y2={b.y}
              stroke="oklch(0.5 0.1 270 / 0.5)"
              strokeWidth={1.5}
              markerEnd="url(#cr-arrow)"
            />
          )
        })}
        {nodes.map((n) => {
          const p = pos.get(n.id)
          if (!p) return null
          const Icon = NODE_TYPE_ICON[n.type] ?? Server
          return (
            <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
              <circle cx={0} cy={0} r={20} fill="oklch(0.2 0.015 270)" stroke="oklch(0.6 0.2 295 / 0.5)" strokeWidth={1.5} />
              <foreignObject x={-10} y={-10} width={20} height={20}>
                <div className="flex items-center justify-center w-full h-full">
                  <Icon className="h-4 w-4 text-violet-300" />
                </div>
              </foreignObject>
              <text
                x={0}
                y={36}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {n.label}
              </text>
              {machineIpMap.has(n.id) && (
                <text
                  x={0}
                  y={48}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
                >
                  {machineIpMap.get(n.id)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
