"use client"

import * as React from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"

/**
 * NetworkVisualization - GuardianX signature visual element.
 * A living network graph representing threat intelligence / attack surfaces.
 * Appears differently across hero, sections, and footer.
 *
 * Variants:
 * - "hero": large, dense, slow rotation
 * - "section": medium, pinned, scroll-reactive
 * - "minimal": small accent
 */

interface Node {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  type: "core" | "node" | "satellite"
}

interface NetworkVisualizationProps {
  variant?: "hero" | "section" | "minimal"
  className?: string
  scrollProgress?: MotionValue<number>
  nodeCount?: number
}

export function NetworkVisualization({
  variant = "section",
  className,
  scrollProgress,
  nodeCount,
}: NetworkVisualizationProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const animationRef = React.useRef<number>(0)
  const mouseRef = React.useRef({ x: 0, y: 0 })

  const count = nodeCount ?? (variant === "hero" ? 80 : variant === "section" ? 50 : 25)

  const nodes = React.useMemo<Node[]>(() => {
    const arr: Node[] = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = variant === "hero" ? 150 + Math.random() * 200 : variant === "section" ? 100 + Math.random() * 150 : 50 + Math.random() * 80
      arr.push({
        id: i,
        x: Math.cos(angle) * r + (Math.random() - 0.5) * 80,
        y: Math.sin(angle) * r + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
        type: i % 12 === 0 ? "core" : i % 4 === 0 ? "satellite" : "node",
      })
    }
    return arr
  }, [count, variant])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function resize() {
      if (!canvas || !container) return
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"
      ctx?.scale(dpr, dpr)
    }

    resize()
    window.addEventListener("resize", resize)

    function handleMouse(e: MouseEvent) {
      if (!container) return
      const rect = container.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      }
    }
    container.addEventListener("mousemove", handleMouse)

    let frame = 0
    function draw() {
      if (!canvas || !ctx || !container) return
      const rect = container.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2

      ctx.clearRect(0, 0, rect.width, rect.height)

      // Update positions
      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        // Gentle attraction to center
        const dx = -n.x * 0.0008
        const dy = -n.y * 0.0008
        n.vx += dx
        n.vy += dy
        // Mouse repulsion
        const mdx = n.x - mouseRef.current.x
        const mdy = n.y - mouseRef.current.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < 120 && mdist > 0) {
          const force = (120 - mdist) / 120 * 0.5
          n.vx += (mdx / mdist) * force
          n.vy += (mdy / mdist) * force
        }
        // Damping
        n.vx *= 0.99
        n.vy *= 0.99
      })

      // Draw connections
      const maxDist = variant === "hero" ? 120 : variant === "section" ? 90 : 60
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.25
            // Color based on connection
            if (nodes[i].type === "core" || nodes[j].type === "core") {
              ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})` // violet
            } else if (nodes[i].type === "satellite" || nodes[j].type === "satellite") {
              ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.8})` // cyan
            } else {
              ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.5})` // slate
            }
            ctx.beginPath()
            ctx.moveTo(cx + nodes[i].x, cy + nodes[i].y)
            ctx.lineTo(cx + nodes[j].x, cy + nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach((n, i) => {
        const px = cx + n.x
        const py = cy + n.y
        const pulse = Math.sin(frame * 0.02 + i * 0.5) * 0.3 + 0.7

        if (n.type === "core") {
          // Core nodes - violet with glow
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, n.radius * 4)
          gradient.addColorStop(0, `rgba(167, 139, 250, ${pulse * 0.8})`)
          gradient.addColorStop(0.5, `rgba(124, 58, 237, ${pulse * 0.3})`)
          gradient.addColorStop(1, "rgba(124, 58, 237, 0)")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(px, py, n.radius * 4, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(196, 181, 253, ${pulse})`
          ctx.beginPath()
          ctx.arc(px, py, n.radius, 0, Math.PI * 2)
          ctx.fill()
        } else if (n.type === "satellite") {
          // Satellite nodes - cyan
          ctx.fillStyle = `rgba(103, 232, 249, ${pulse * 0.8})`
          ctx.beginPath()
          ctx.arc(px, py, n.radius, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Regular nodes - subtle
          ctx.fillStyle = `rgba(148, 163, 184, ${pulse * 0.4})`
          ctx.beginPath()
          ctx.arc(px, py, n.radius, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      frame++
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", resize)
      container.removeEventListener("mousemove", handleMouse)
    }
  }, [nodes, variant])

  // Scroll-reactive transform - always call hooks unconditionally
  const scale = useTransform(scrollProgress ?? { get: () => 0, on: () => () => {} } as any, [0, 1], [1, 1.15])
  const rotate = useTransform(scrollProgress ?? { get: () => 0, on: () => () => {} } as any, [0, 1], [0, 10])

  const shouldApplyTransform = !!scrollProgress

  return (
    <div ref={containerRef} className={"relative overflow-hidden " + (className ?? "")}>
      <motion.canvas
        ref={canvasRef}
        style={shouldApplyTransform ? { scale, rotate } : undefined}
        className="w-full h-full"
      />
    </div>
  )
}
