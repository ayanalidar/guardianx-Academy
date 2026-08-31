"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ThreatMap - canvas-based animated network visualization representing
 * live lab infrastructure, students connecting to targets, and packet
 * flow between nodes.
 *
 *  - Nodes pulse softly
 *  - Packets travel as small dots along connection edges
 *  - Occasional status events appear as transient text overlays
 *    ("LAB ONLINE", "MISSION COMPLETE", "INTRUSION DETECTED", ...)
 *  - Respects prefers-reduced-motion: shows a single static frame
 *  - Cleans up its rAF + observers on unmount
 *
 * Variants:
 *  - hero    : large, dense, slow - for landing hero
 *  - section : medium - for marketing section panels
 *  - compact : small - for dashboard side widgets
 */

export interface ThreatMapProps {
  variant?: "hero" | "section" | "compact"
  showLabels?: boolean
  className?: string
}

interface TMNode {
  id: number
  x: number // normalized 0..1
  y: number // normalized 0..1
  radius: number
  type: "core" | "lab" | "student" | "target"
  label: string
  pulsePhase: number
}

interface TMEdge {
  from: number
  to: number
}

interface TMPacket {
  edge: number
  progress: number // 0..1
  speed: number
  color: string
}

interface TMEvent {
  id: number
  text: string
  x: number // normalized
  y: number // normalized
  ttl: number // frames remaining
  maxTtl: number
  color: string
}

const NODE_LABELS_CORE = ["GUARDIAN-CORE"]
const NODE_LABELS_LAB = [
  "LAB-01", "LAB-02", "LAB-03", "LAB-04", "LAB-05", "LAB-06",
  "LAB-07", "LAB-08", "LAB-09", "LAB-10",
]
const NODE_LABELS_TARGET = [
  "10.10.24.14", "10.10.45.7", "10.10.99.2", "10.10.13.21",
  "10.10.55.18", "10.10.71.4", "10.10.32.9", "10.10.88.1",
]
const NODE_LABELS_STUDENT = [
  "STU-7C3A", "STU-9F12", "STU-2B8D", "STU-4E5K",
  "STU-1A2B", "STU-6D4F", "STU-8C9E",
]

const EVENT_MESSAGES: { text: string; color: string }[] = [
  { text: "LAB ONLINE", color: "rgba(110, 231, 183, 0.95)" },
  { text: "MISSION COMPLETE", color: "rgba(167, 139, 250, 0.95)" },
  { text: "FLAG CAPTURED", color: "rgba(110, 231, 183, 0.95)" },
  { text: "INTRUSION DETECTED", color: "rgba(251, 113, 133, 0.95)" },
  { text: "SCANNING...", color: "rgba(103, 232, 249, 0.95)" },
  { text: "SSH BRUTEFORCE", color: "rgba(251, 191, 36, 0.95)" },
  { text: "ENCRYPTED LINK", color: "rgba(103, 232, 249, 0.95)" },
  { text: "TARGET ACQUIRED", color: "rgba(251, 113, 133, 0.95)" },
  { text: "XP +250", color: "rgba(251, 191, 36, 0.95)" },
  { text: "LEVEL UP", color: "rgba(167, 139, 250, 0.95)" },
]

const VARIANT_CONFIG = {
  hero: { nodes: 22, edges: 14, packets: 14, eventInterval: 90, labelEvery: 1 },
  section: { nodes: 14, edges: 9, packets: 8, eventInterval: 130, labelEvery: 2 },
  compact: { nodes: 8, edges: 5, packets: 4, eventInterval: 180, labelEvery: 3 },
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ThreatMap({
  variant = "section",
  showLabels = true,
  className,
}: ThreatMapProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const rafRef = React.useRef<number>(0)
  const eventsRef = React.useRef<TMEvent[]>([])
  const eventIdRef = React.useRef<number>(0)

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // Build static node + edge + packet graph
  const graph = React.useMemo(() => {
    const cfg = VARIANT_CONFIG[variant]

    const nodes: TMNode[] = []
    let labelIdx = 0

    // Core in center
    nodes.push({
      id: 0,
      x: 0.5,
      y: 0.5,
      radius: variant === "hero" ? 7 : variant === "section" ? 6 : 5,
      type: "core",
      label: NODE_LABELS_CORE[0],
      pulsePhase: 0,
    })

    // Labs - inner ring
    const labCount = Math.max(3, Math.floor(cfg.nodes * 0.32))
    for (let i = 0; i < labCount; i++) {
      const angle = (i / labCount) * Math.PI * 2 + Math.random() * 0.2
      const r = 0.18 + Math.random() * 0.05
      nodes.push({
        id: nodes.length,
        x: 0.5 + Math.cos(angle) * r,
        y: 0.5 + Math.sin(angle) * r * 0.7,
        radius: 4 + Math.random() * 1,
        type: "lab",
        label: NODE_LABELS_LAB[labelIdx++ % NODE_LABELS_LAB.length],
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Targets - outer ring
    const targetCount = Math.max(3, Math.floor(cfg.nodes * 0.34))
    for (let i = 0; i < targetCount; i++) {
      const angle = (i / targetCount) * Math.PI * 2 + Math.random() * 0.3
      const r = 0.32 + Math.random() * 0.08
      nodes.push({
        id: nodes.length,
        x: 0.5 + Math.cos(angle) * r,
        y: 0.5 + Math.sin(angle) * r * 0.7,
        radius: 3.5 + Math.random() * 1.5,
        type: "target",
        label: NODE_LABELS_TARGET[i % NODE_LABELS_TARGET.length],
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Students - scattered periphery
    const studentCount = Math.max(2, cfg.nodes - labCount - targetCount - 1)
    for (let i = 0; i < studentCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 0.42 + Math.random() * 0.06
      nodes.push({
        id: nodes.length,
        x: 0.5 + Math.cos(angle) * r,
        y: 0.5 + Math.sin(angle) * r * 0.75,
        radius: 2.5 + Math.random() * 1,
        type: "student",
        label: NODE_LABELS_STUDENT[i % NODE_LABELS_STUDENT.length],
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Edges - connect everything sensibly
    const edges: TMEdge[] = []
    // core -> each lab
    for (let i = 1; i <= labCount; i++) {
      edges.push({ from: 0, to: i })
    }
    // labs -> targets (random pairing)
    for (let i = 0; i < targetCount; i++) {
      const fromLab = 1 + Math.floor(Math.random() * labCount)
      edges.push({ from: fromLab, to: labCount + 1 + i })
    }
    // students -> labs or core
    for (let i = 0; i < studentCount; i++) {
      const studentId = labCount + targetCount + 1 + i
      const target = Math.random() < 0.5 ? 0 : 1 + Math.floor(Math.random() * labCount)
      edges.push({ from: studentId, to: target })
    }
    // Trim if too many
    const trimmedEdges = edges.slice(0, cfg.edges + labCount)

    // Packets
    const packets: TMPacket[] = []
    for (let i = 0; i < cfg.packets; i++) {
      packets.push({
        edge: Math.floor(Math.random() * trimmedEdges.length),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        color: Math.random() < 0.5
          ? "rgba(167, 139, 250, 0.95)"
          : "rgba(103, 232, 249, 0.95)",
      })
    }

    return { nodes, edges: trimmedEdges, packets, cfg }
  }, [variant])

  // Draw a single static frame (used both for reduced-motion and as a base)
  const drawFrame = React.useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
      ctx.clearRect(0, 0, w, h)

      const { nodes, edges, packets } = graph

      // --- Edges ---
      ctx.lineWidth = 0.6
      for (const edge of edges) {
        const a = nodes[edge.from]
        const b = nodes[edge.to]
        if (!a || !b) continue
        const ax = a.x * w
        const ay = a.y * h
        const bx = b.x * w
        const by = b.y * h

        // Edge color: core-link = violet, others = slate/cyan
        const isCoreLink = a.type === "core" || b.type === "core"
        const grad = ctx.createLinearGradient(ax, ay, bx, by)
        if (isCoreLink) {
          grad.addColorStop(0, "rgba(124, 58, 237, 0.35)")
          grad.addColorStop(1, "rgba(103, 232, 249, 0.15)")
        } else {
          grad.addColorStop(0, "rgba(148, 163, 184, 0.22)")
          grad.addColorStop(1, "rgba(103, 232, 249, 0.10)")
        }
        ctx.strokeStyle = grad
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }

      // --- Packets ---
      for (const pkt of packets) {
        const edge = edges[pkt.edge]
        if (!edge) continue
        const a = nodes[edge.from]
        const b = nodes[edge.to]
        if (!a || !b) continue
        const px = (a.x + (b.x - a.x) * pkt.progress) * w
        const py = (a.y + (b.y - a.y) * pkt.progress) * h

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 6)
        glow.addColorStop(0, pkt.color)
        glow.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = pkt.color
        ctx.beginPath()
        ctx.arc(px, py, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }

      // --- Nodes ---
      for (const node of nodes) {
        const px = node.x * w
        const py = node.y * h
        const pulse = prefersReducedMotion
          ? 0.85
          : Math.sin(frame * 0.04 + node.pulsePhase) * 0.3 + 0.7

        if (node.type === "core") {
          // Big violet glow
          const grad = ctx.createRadialGradient(px, py, 0, px, py, node.radius * 5)
          grad.addColorStop(0, `rgba(167, 139, 250, ${0.7 * pulse})`)
          grad.addColorStop(0.4, `rgba(124, 58, 237, ${0.35 * pulse})`)
          grad.addColorStop(1, "rgba(124, 58, 237, 0)")
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(px, py, node.radius * 5, 0, Math.PI * 2)
          ctx.fill()

          // Solid core
          ctx.fillStyle = `rgba(196, 181, 253, ${0.95 * pulse})`
          ctx.beginPath()
          ctx.arc(px, py, node.radius, 0, Math.PI * 2)
          ctx.fill()

          // Hexagon ring
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.7 * pulse})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          for (let i = 0; i <= 6; i++) {
            const a = (i / 6) * Math.PI * 2 + frame * 0.005
            const rx = px + Math.cos(a) * (node.radius + 5)
            const ry = py + Math.sin(a) * (node.radius + 5)
            if (i === 0) ctx.moveTo(rx, ry)
            else ctx.lineTo(rx, ry)
          }
          ctx.stroke()
        } else if (node.type === "lab") {
          // Cyan glow
          const grad = ctx.createRadialGradient(px, py, 0, px, py, node.radius * 3)
          grad.addColorStop(0, `rgba(103, 232, 249, ${0.5 * pulse})`)
          grad.addColorStop(1, "rgba(103, 232, 249, 0)")
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(px, py, node.radius * 3, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(165, 243, 252, ${0.9 * pulse})`
          ctx.beginPath()
          ctx.arc(px, py, node.radius, 0, Math.PI * 2)
          ctx.fill()
        } else if (node.type === "target") {
          // Rose/amber - threat target
          const color = `rgba(251, 113, 133, ${0.85 * pulse})`
          ctx.fillStyle = color
          ctx.beginPath()
          // Square marker for targets
          const s = node.radius
          ctx.fillRect(px - s, py - s, s * 2, s * 2)
          // Crosshair
          ctx.strokeStyle = `rgba(251, 113, 133, ${0.5 * pulse})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(px - s * 2.2, py)
          ctx.lineTo(px - s * 1.2, py)
          ctx.moveTo(px + s * 1.2, py)
          ctx.lineTo(px + s * 2.2, py)
          ctx.moveTo(px, py - s * 2.2)
          ctx.lineTo(px, py - s * 1.2)
          ctx.moveTo(px, py + s * 1.2)
          ctx.lineTo(px, py + s * 2.2)
          ctx.stroke()
        } else {
          // Student - small slate dot
          ctx.fillStyle = `rgba(148, 163, 184, ${0.7 * pulse})`
          ctx.beginPath()
          ctx.arc(px, py, node.radius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Labels
        if (showLabels && (node.type === "core" || node.type === "lab" || node.type === "target")) {
          ctx.font = "10px var(--font-geist-mono), monospace"
          ctx.fillStyle = "rgba(203, 213, 225, 0.65)"
          ctx.textAlign = "center"
          ctx.fillText(node.label, px, py + node.radius + 12)
        }
      }

      // --- Event overlays ---
      for (const ev of eventsRef.current) {
        const alpha = Math.min(1, ev.ttl / 30)
        const px = ev.x * w
        const py = ev.y * h
        ctx.font = "bold 11px var(--font-geist-mono), monospace"
        ctx.textAlign = "center"

        // Background pill
        const textWidth = ctx.measureText(ev.text).width
        ctx.fillStyle = `rgba(8, 8, 16, ${0.75 * alpha})`
        ctx.fillRect(px - textWidth / 2 - 6, py - 9, textWidth + 12, 18)

        // Border
        ctx.strokeStyle = ev.color.replace(/[\d.]+\)$/, `${0.5 * alpha})`)
        ctx.lineWidth = 1
        ctx.strokeRect(px - textWidth / 2 - 6, py - 9, textWidth + 12, 18)

        // Text
        ctx.fillStyle = ev.color.replace(/[\d.]+\)$/, `${alpha})`)
        ctx.fillText(ev.text, px, py + 4)
      }
    },
    [graph, prefersReducedMotion, showLabels]
  )

  // Animation loop
  React.useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      if (!canvas || !container || !ctx) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener("resize", resize)

    let frame = 0
    let lastEventFrame = 0
    const cfg = graph.cfg

    function tick() {
      if (!canvas || !ctx || !container) return
      const rect = container.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      // Advance packets
      if (!prefersReducedMotion) {
        for (const pkt of graph.packets) {
          pkt.progress += pkt.speed
          if (pkt.progress > 1) {
            pkt.progress = 0
            // Possibly reassign to a new edge
            pkt.edge = Math.floor(Math.random() * graph.edges.length)
            pkt.color = Math.random() < 0.5
              ? "rgba(167, 139, 250, 0.95)"
              : "rgba(103, 232, 249, 0.95)"
          }
        }

        // Decay events
        eventsRef.current = eventsRef.current.filter((e) => e.ttl > 0)
        for (const e of eventsRef.current) e.ttl -= 1

        // Occasionally spawn event
        if (frame - lastEventFrame > cfg.eventInterval && Math.random() < 0.04) {
          const msg = EVENT_MESSAGES[Math.floor(Math.random() * EVENT_MESSAGES.length)]
          // Pick a random node to anchor the event near
          const node = graph.nodes[Math.floor(Math.random() * graph.nodes.length)]
          if (node) {
            eventsRef.current.push({
              id: eventIdRef.current++,
              text: msg.text,
              x: Math.max(0.1, Math.min(0.9, node.x + (Math.random() - 0.5) * 0.1)),
              y: Math.max(0.1, Math.min(0.9, node.y - 0.06)),
              ttl: 120,
              maxTtl: 120,
              color: msg.color,
            })
            lastEventFrame = frame
          }
        }
      }

      drawFrame(ctx, w, h, frame)
      frame++
      if (!prefersReducedMotion) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    tick()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [graph, prefersReducedMotion, drawFrame])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg",
        variant === "hero" && "min-h-[400px]",
        variant === "section" && "min-h-[280px]",
        variant === "compact" && "min-h-[180px]",
        className
      )}
      role="img"
      aria-label="Live threat map showing connected labs, students, and target machines with packet flow"
    >
      {/* Atmospheric backdrop */}
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.6 0.2 295 / 0.08), transparent 60%)",
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />
      {/* Scanline overlay */}
      <div className="scanlines pointer-events-none absolute inset-0" aria-hidden />
    </div>
  )
}
