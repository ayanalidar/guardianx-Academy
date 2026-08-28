"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { colorFor, DIFFICULTY_COLORS } from "@/lib/colors"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft, Terminal, Target, Clock, Flag, Lightbulb, CheckCircle2,
  PlayCircle, Lock, ListChecks, BookOpen, Zap, Trophy,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LabData {
  lab: {
    id: string; slug: string; title: string; description: string; longDescription: string
    category: string; difficulty: string; durationMin: number; points: number; tags: string
    scenario: string; objectives: string; hints: string; flag: string; commands: string; color: string
  }
  progress: { status: string; flagFound: boolean; hintsUsed: number } | null
}

export function LabDetailView() {
  const { view, navigate } = useAppStore()
  const slug = view.name === "lab" ? view.labSlug : ""
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<LabData>({
    queryKey: ["lab", slug],
    queryFn: () => api(`/api/labs/${slug}`),
    enabled: !!slug,
  })

  const startMutation = useMutation({
    mutationFn: () => api(`/api/labs/${slug}/submit`, { method: "POST", body: JSON.stringify({ action: "join" }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab", slug] }),
  })

  if (isLoading) return <Skeleton className="h-96" />
  if (!data) return null

  const { lab, progress } = data
  const col = colorFor(lab.color)
  const objectives = lab.objectives.split("|").filter(Boolean)
  const commands = lab.commands.split("|").filter(Boolean)
  const done = progress?.status === "completed"

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ name: "labs" })} className="text-muted-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to labs
      </Button>

      {/* Header */}
      <div className={`relative overflow-hidden rounded-2xl border ${col.border} bg-gradient-to-br ${col.gradient} p-6 lg:p-8`}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[lab.difficulty]}`}>{lab.difficulty}</Badge>
            <Badge variant="outline" className="text-xs">{lab.category}</Badge>
            {done && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Solved</Badge>}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
            <Terminal className="h-7 w-7 text-emerald-400" /> {lab.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl">{lab.longDescription}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{lab.durationMin} min</span>
            <span className="flex items-center gap-1 text-violet-400 font-medium"><Target className="h-4 w-4" />{lab.points} points</span>
            <span className="flex items-center gap-1"><Lightbulb className="h-4 w-4" />{progress?.hintsUsed ?? 0} hints used</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: scenario + objectives + terminal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scenario */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-400" /> Mission Briefing</h3>
            <div className="prose-guardianx max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lab.scenario}</ReactMarkdown>
            </div>
          </Card>

          {/* Objectives */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><ListChecks className="h-4 w-4 text-amber-400" /> Objectives</h3>
            <div className="space-y-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-xs font-mono font-bold">{i + 1}</span>
                  <span className="text-sm">{obj}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Terminal */}
          <LabTerminal
            labSlug={slug}
            commands={commands}
            flag={lab.flag}
            started={!!progress}
            done={done}
            onStart={() => startMutation.mutate()}
          />
        </div>

        {/* Right: hints + flag submission + tools */}
        <div className="space-y-4">
          <HintsPanel slug={slug} hintsString={lab.hints} hintsUsed={progress?.hintsUsed ?? 0} />

          {/* Available commands */}
          <Card className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Terminal className="h-4 w-4 text-cyan-400" /> Available Tools</h3>
            <div className="flex flex-wrap gap-1.5">
              {commands.map((cmd) => (
                <Badge key={cmd} variant="outline" className="text-xs font-mono text-cyan-400 border-cyan-500/20">{cmd}</Badge>
              ))}
            </div>
          </Card>

          {/* Reward */}
          <Card className="p-5 bg-gradient-to-br from-violet-950/30 to-transparent border-violet-500/20">
            <Trophy className="h-8 w-8 text-violet-400 mb-2" />
            <div className="font-semibold text-sm mb-1">Reward</div>
            <div className="text-2xl font-bold text-violet-400">{lab.points} points</div>
            <p className="text-xs text-muted-foreground mt-1">Solve this lab to earn points and unlock achievements.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ---- Hints panel ----
function HintsPanel({ slug, hintsString, hintsUsed }: { slug: string; hintsString: string; hintsUsed: number }) {
  const qc = useQueryClient()
  const hints = hintsString.split("|").filter(Boolean)
  const [revealed, setRevealed] = React.useState(hintsUsed)

  const hintMutation = useMutation({
    mutationFn: () => api(`/api/labs/${slug}/submit`, { method: "POST", body: JSON.stringify({ action: "hint" }) }),
    onSuccess: (data) => {
      setRevealed((r) => r + 1)
      qc.invalidateQueries({ queryKey: ["lab", slug] })
      toast.info(`Hint ${revealed + 1}: ${data.hint}`)
    },
  })

  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Lightbulb className="h-4 w-4 text-amber-400" /> Hints</h3>
      <div className="space-y-2 mb-3">
        {hints.slice(0, revealed).map((h, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{h}</span>
          </div>
        ))}
        {revealed === 0 && <p className="text-xs text-muted-foreground">Stuck? Reveal hints one at a time. Each hint costs nothing but tracks your usage.</p>}
      </div>
      {revealed < hints.length ? (
        <Button variant="outline" size="sm" className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={() => hintMutation.mutate()} disabled={hintMutation.isPending}>
          <Lightbulb className="h-3.5 w-3.5 mr-1.5" /> Reveal Hint ({revealed}/{hints.length})
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground text-center">All hints revealed.</p>
      )}
    </Card>
  )
}

// ---- Interactive terminal ----
function LabTerminal({ labSlug, commands, flag, started, done, onStart }: {
  labSlug: string; commands: string[]; flag: string; started: boolean; done: boolean; onStart: () => void
}) {
  const qc = useQueryClient()
  const [history, setHistory] = React.useState<{ type: "in" | "out" | "err" | "ok"; text: string }[]>([
    { type: "out", text: "GuardianX Lab Terminal v1.0" },
    { type: "out", text: "Type 'help' to see available commands." },
    { type: "out", text: "" },
  ])
  const [input, setInput] = React.useState("")
  const [flagInput, setFlagInput] = React.useState("")
  const [cmdHistory, setCmdHistory] = React.useState<string[]>([])
  const [histIdx, setHistIdx] = React.useState(-1)
  const endRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [history])

  const submitMutation = useMutation({
    mutationFn: (flagValue: string) => api(`/api/labs/${labSlug}/submit`, { method: "POST", body: JSON.stringify({ action: "submit", flag: flagValue }) }),
    onSuccess: (data) => {
      if (data.correct) {
        setHistory((h) => [...h, { type: "ok", text: "✓ FLAG ACCEPTED! Lab solved. Well done, Guardian." }])
        toast.success("🎉 Flag captured! Lab complete!")
        qc.invalidateQueries({ queryKey: ["lab", labSlug] })
        qc.invalidateQueries({ queryKey: ["me"] })
        qc.invalidateQueries({ queryKey: ["achievements"] })
        qc.invalidateQueries({ queryKey: ["lab-stats"] })
        if (data.gamification) {
          import("@/components/providers/gamification-toaster").then((m) => m.showGamification(data.gamification))
        }
      } else {
        setHistory((h) => [...h, { type: "err", text: "✗ Incorrect flag. Try again." }])
        toast.error("Incorrect flag")
      }
    },
  })

  function exec(cmd: string) {
    const parts = cmd.trim().split(/\s+/)
    const c = parts[0]?.toLowerCase()
    const args = parts.slice(1)
    setHistory((h) => [...h, { type: "in", text: cmd }])

    if (!c) return
    const out = (t: string) => setHistory((h) => [...h, { type: "out", text: t }])
    const err = (t: string) => setHistory((h) => [...h, { type: "err", text: t }])

    switch (c) {
      case "help":
        out("Available commands:")
        out("  help              Show this help")
        out("  ls                List available tools")
        out("  whoami            Show current user")
        out("  target            Show target info")
        out("  submit <flag>     Submit a captured flag")
        out("  clear             Clear terminal")
        out("Available tools: " + commands.join(", "))
        break
      case "ls":
        out(commands.join("  "))
        break
      case "whoami":
        out("guardian@guardianx-lab")
        break
      case "target":
        out("Target: vulnlab.local (10.10.10.5)")
        out("Status: " + (done ? "COMPROMISED" : "ACTIVE"))
        out("OS: Linux 5.15.0 (Ubuntu 22.04)")
        break
      case "submit":
        if (!args[0]) { err("Usage: submit <flag>"); break }
        submitMutation.mutate(args.join(" "))
        out("Submitting flag for verification...")
        break
      case "clear":
        setHistory([])
        break
      default:
        if (commands.includes(c)) {
          // simulate tool output based on command
          out(`[${c}] Running...`)
          if (c === "nmap") {
            out("Starting Nmap 7.94 ( https://nmap.org )")
            out("Nmap scan report for 10.10.10.5")
            out("Host is up (0.012s latency).")
            out("PORT     STATE SERVICE")
            out("22/tcp   open  ssh        OpenSSH 8.9p1")
            out("80/tcp   open  http       Apache httpd 2.4.52")
            out("8080/tcp open  http-proxy Jetty 9.4.44")
            out("Service detection performed.")
          } else if (c === "sqlmap") {
            out("[INFO] testing connection to the target URL")
            out("[INFO] testing if the target parameter 'username' is dynamic")
            out("[INFO] heuristic (basic) test shows that GET parameter 'username' might be injectable")
            out("[INFO] GET parameter 'username' appears to be 'AND boolean-based blind'")
            out("[INFO] the back-end DBMS is MySQL")
            out("[INFO] fetching database names")
            out("available databases [2]:")
            out("[*] information_schema")
            out("[*] vulnapp")
            out("[INFO] fetched data logged to text files under '~/.local/share/sqlmap/output'")
          } else if (c === "curl") {
            out("<html><head><title>VulnApp - Login</title></head>")
            out("<body><form action='/login' method='POST'>")
            out("<input name='username'><input name='password' type='password'>")
            out("<button>Login</button></form></body></html>")
          } else if (c === "find") {
            out("/usr/bin/find  (SUID detected - -rwsr-xr-x)")
            out("Hint: 'find . -exec cat /root/flag.txt \\;' reads files as root")
          } else if (c === "cat") {
            if (args[0]?.includes("flag")) {
              out(flag)
            } else {
              out(args[0] ? `[${args[0]}] (file not accessible in sandbox simulation)` : "Usage: cat <file>")
            }
          } else if (c === "hashcat" || c === "john") {
            out("[*] Starting hash cracker...")
            out("[*] Loaded 1 hash")
            out("[*] Algorithm: MD5")
            out("[*] Wordlist: rockyou.txt")
            out("[*] Cracking... [####################] 100%")
            out(`[+] Recovered plaintext: ${flag.replace("FLAG{", "").replace("}", "").replace(/_/g, " ")}`)
          } else if (c === "nc" || c === "tshark" || c === "tcpdump") {
            out("[*] Capturing traffic on interface eth0...")
            out("10.10.10.5.80 > 10.10.10.1.54321: HTTP POST /comment")
            out("Header: X-D: " + Buffer.from(flag).toString("base64").slice(0, 30) + "...")
          } else if (c === "impacket-getuserspns") {
            out("[*] Requesting TGS for service account 'svc_sql'")
            out("[*] Found SPN: HTTP/web-svc.corp.local")
            out("$krb5tgs$23$*svc_sql$CORP.LOCAL$HTTP/web-svc.corp.local*$...")
            out("[+] TGS ticket extracted. Crack with: hashcat -m 13100 ticket.hash")
          } else if (c === "msf-pattern_create") {
            out("Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab")
          } else {
            out(`[${c}] executed. (simulated environment)`)
            out("Try: help, ls, target, or 'submit FLAG{...}' when you find the flag.")
          }
        } else {
          err(`command not found: ${c}. Type 'help' for available commands.`)
        }
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      exec(input)
      if (input.trim()) setCmdHistory((h) => [...h, input])
      setInput("")
      setHistIdx(-1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (cmdHistory.length) {
        const ni = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1)
        setHistIdx(ni)
        setInput(cmdHistory[ni])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (histIdx !== -1) {
        const ni = histIdx + 1
        if (ni >= cmdHistory.length) { setHistIdx(-1); setInput("") }
        else { setHistIdx(ni); setInput(cmdHistory[ni]) }
      }
    }
  }

  if (!started) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Terminal className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Ready to start the lab?</h3>
        <p className="text-sm text-muted-foreground mb-4">Launch the interactive terminal and begin your mission.</p>
        <Button onClick={onStart}><PlayCircle className="h-4 w-4 mr-1.5" /> Start Lab</Button>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-emerald-500/20">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/70" />
          <div className="h-3 w-3 rounded-full bg-amber-500/70" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-2">guardian@guardianx-lab: ~/labs/{labSlug}</span>
        <span className="ml-auto text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" /> CONNECTED
        </span>
      </div>
      <div
        className="p-4 font-mono text-xs h-80 overflow-y-auto bg-[oklch(0.1_0.015_200)] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className={cn(
            "whitespace-pre-wrap break-words",
            line.type === "in" && "text-emerald-300",
            line.type === "out" && "text-muted-foreground",
            line.type === "err" && "text-red-400",
            line.type === "ok" && "text-emerald-400 font-bold",
          )}>
            {line.type === "in" && <span className="text-emerald-500">$ </span>}{line.text}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-emerald-500">$ </span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            className="flex-1 bg-transparent outline-none text-emerald-300 font-mono text-xs ml-1"
            placeholder="type a command..."
          />
        </div>
        <div ref={endRef} />
      </div>
      {/* Flag submission bar */}
      <div className="flex items-center gap-2 p-3 border-t border-border bg-muted/30">
        <Flag className="h-4 w-4 text-amber-400" />
        <input
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && flagInput.trim()) { submitMutation.mutate(flagInput); setFlagInput("") } }}
          placeholder="Paste flag here (FLAG{...}) and press Enter"
          className="flex-1 bg-transparent outline-none text-xs font-mono"
        />
        <Button size="sm" disabled={!flagInput.trim() || submitMutation.isPending} onClick={() => { submitMutation.mutate(flagInput); setFlagInput("") }}>
          <Zap className="h-3.5 w-3.5 mr-1" /> Submit Flag
        </Button>
      </div>
    </Card>
  )
}
