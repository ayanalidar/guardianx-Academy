"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Lock } from "lucide-react"

/**
 * HolographicGlobe — animated wireframe globe with glowing nodes,
 * representing a global cybersecurity network. Pure CSS/SVG animation.
 */
export function HolographicGlobe({ className }: { className?: string }) {
  const nodes = React.useMemo(() => {
    // Generate nodes on a sphere using fibonacci sphere distribution
    const points = []
    const n = 60
    const phi = Math.PI * (3 - Math.sqrt(5)) // golden angle
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2 // y from 1 to -1
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius
      points.push({ x: x * 50, y: y * 50, z: z * 50 })
    }
    return points
  }, [])

  // Connection lines between nearby nodes
  const connections = React.useMemo(() => {
    const lines: { from: number; to: number }[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < 25) {
          lines.push({ from: i, to: j })
        }
      }
    }
    return lines
  }, [nodes])

  return (
    <div className={"relative " + (className ?? "")}>
      {/* Outer glow */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-[60px]"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.24 295 / 0.3), oklch(0.68 0.13 195 / 0.1) 50%, transparent 70%)",
        }}
      />

      {/* Rotating wireframe sphere */}
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="relative"
        style={{
          width: "320px",
          height: "320px",
          transformStyle: "preserve-3d",
          perspective: "800px",
        }}
      >
        {/* Latitude lines */}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <div
            key={"lat-" + angle}
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: "oklch(0.55 0.24 295 / 0.15)",
              transform: `rotateX(${angle}deg)`,
              transformStyle: "preserve-3d",
            }}
          />
        ))}

        {/* Longitude lines */}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <div
            key={"lon-" + angle}
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: "oklch(0.68 0.13 195 / 0.1)",
              transform: `rotateY(${angle}deg)`,
              transformStyle: "preserve-3d",
            }}
          />
        ))}

        {/* Glowing nodes */}
        {nodes.map((node, i) => (
          <motion.div
            key={"node-" + i}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${node.x}px)`,
              top: `calc(50% + ${node.y}px)`,
              width: "4px",
              height: "4px",
              background: i % 3 === 0
                ? "oklch(0.65 0.24 295)"
                : i % 3 === 1
                  ? "oklch(0.68 0.13 195)"
                  : "oklch(0.7 0.15 160)",
              boxShadow: `0 0 8px ${i % 3 === 0 ? "oklch(0.65 0.24 295)" : "oklch(0.68 0.13 195)"}`,
              transform: `translateZ(${node.z}px)`,
              opacity: 0.4 + (node.z + 50) / 100 * 0.6,
            }}
            animate={{
              opacity: [0.4 + (node.z + 50) / 100 * 0.6, 1, 0.4 + (node.z + 50) / 100 * 0.6],
            }}
            transition={{
              duration: 2 + (i % 5) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05,
            }}
          />
        ))}
      </motion.div>

      {/* Center shield with lock — the focal point */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Glow behind shield */}
          <div className="absolute inset-0 rounded-2xl blur-xl bg-violet-500/30 scale-150" />
          {/* Shield container */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-400/40 bg-violet-500/10 backdrop-blur-md shadow-[0_0_40px_-8px] shadow-violet-500/40">
            <Shield className="h-10 w-10 text-violet-300" strokeWidth={1.5} />
            <Lock className="h-4 w-4 text-cyan-300 absolute bottom-5 right-5" strokeWidth={2} />
          </div>
        </motion.div>
      </motion.div>

      {/* Orbiting particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 180
        return (
          <motion.div
            key={"orbit-" + i}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: i % 2 === 0 ? "oklch(0.65 0.24 295)" : "oklch(0.68 0.13 195)",
              boxShadow: `0 0 6px ${i % 2 === 0 ? "oklch(0.65 0.24 295)" : "oklch(0.68 0.13 195)"}`,
            }}
            animate={{
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI) * radius, Math.cos(angle) * radius],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI) * radius, Math.sin(angle) * radius],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )
      })}

      {/* Base ring — perspective platform */}
      <motion.div
        animate={{ rotateX: 0 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] h-[60px] rounded-[50%] border border-violet-400/20"
        style={{
          transform: "rotateX(75deg)",
          background: "radial-gradient(ellipse, oklch(0.55 0.24 295 / 0.1), transparent 70%)",
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-[50%] border border-cyan-400/10"
        />
      </motion.div>
    </div>
  )
}
