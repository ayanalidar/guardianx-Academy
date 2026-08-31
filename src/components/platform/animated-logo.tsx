"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

/* ============================================================
   GuardianX Animated Logo — DeepSeek-style 3D morphing hero
   - Layer 1: WebGL-like crystalline 3D shield rotating on Y-axis
   - Layer 2: Real transparent logo PNG with parallax tilt
   - Layer 3: Orbital particle ring (Canvas)
   - Layer 4: Inner energy core glow pulse
   - Layer 5: Outer atmospheric bloom + scan arc
   ============================================================ */

interface AnimatedLogoProps {
  size?: number
  className?: string
  /** show the orbiting particles ring */
  showParticles?: boolean
  /** show the morphing crystalline shards */
  showShards?: boolean
  /** show the scan arc */
  showScanArc?: boolean
  /** mouse parallax follows cursor */
  parallax?: boolean
}

export function AnimatedLogo({
  size = 320,
  className,
  showParticles = true,
  showShards = true,
  showScanArc = true,
  parallax = true,
}: AnimatedLogoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  // mouse parallax
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [18, -18]), {
    stiffness: 120,
    damping: 18,
    mass: 0.6,
  })
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 18,
    mass: 0.6,
  })
  const logoX = useSpring(useTransform(mx, [-0.5, 0.5], [12, -12]), {
    stiffness: 80,
    damping: 16,
  })
  const logoY = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), {
    stiffness: 80,
    damping: 16,
  })

  React.useEffect(() => {
    if (!parallax) return
    const handler = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      mx.set(Math.max(-0.5, Math.min(0.5, x)))
      my.set(Math.max(-0.5, Math.min(0.5, y)))
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [parallax, mx, my])

  /* ----- Orbital particle ring (Canvas) ----- */
  React.useEffect(() => {
    if (!showParticles) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const px = size
    canvas.width = px * dpr
    canvas.height = px * dpr
    canvas.style.width = `${px}px`
    canvas.style.height = `${px}px`
    ctx.scale(dpr, dpr)

    const cx = px / 2
    const cy = px / 2
    const r = px * 0.42

    type P = {
      a: number
      r: number
      speed: number
      size: number
      hue: number
      alpha: number
      orbit: number
    }
    const N = 56
    const particles: P[] = Array.from({ length: N }, (_, i) => ({
      a: (i / N) * Math.PI * 2,
      r: r + (Math.random() - 0.5) * 18,
      speed: 0.0015 + Math.random() * 0.002,
      size: 0.8 + Math.random() * 2.2,
      hue: Math.random() > 0.5 ? 285 : 195,
      alpha: 0.3 + Math.random() * 0.6,
      orbit: Math.random() > 0.5 ? 1 : -1,
    }))

    let raf = 0
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, px, px)
      t += 0.016

      // outer faint ring stroke
      ctx.save()
      ctx.strokeStyle = "rgba(124, 58, 237, 0.18)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = "rgba(56, 189, 248, 0.10)"
      ctx.beginPath()
      ctx.arc(cx, cy, r + 14, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // particles
      particles.forEach((p) => {
        p.a += p.speed * p.orbit
        const wob = Math.sin(t * 1.4 + p.a * 6) * 4
        const x = cx + Math.cos(p.a) * (p.r + wob)
        const y = cy + Math.sin(p.a) * (p.r + wob) * 0.55 // elliptical
        const z = Math.sin(p.a) // depth cue
        const scale = 0.5 + (z + 1) * 0.5
        const a = p.alpha * (0.4 + (z + 1) * 0.3)
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        ctx.fillStyle =
          p.hue === 285
            ? `hsla(285, 90%, 70%, ${a})`
            : `hsla(195, 90%, 70%, ${a})`
        ctx.shadowBlur = 12
        ctx.shadowColor =
          p.hue === 285 ? "rgba(124, 58, 237, 0.8)" : "rgba(56, 189, 248, 0.8)"
        ctx.beginPath()
        ctx.arc(x, y, p.size * scale, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [size, showParticles])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: size,
        height: size,
        perspective: 1200,
        position: "relative",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer atmospheric bloom */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.35), rgba(56,189,248,0.15) 35%, transparent 65%)",
          filter: "blur(40px)",
        }}
        animate={{
          opacity: [0.55, 0.9, 0.55],
          scale: [0.92, 1.05, 0.92],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scan arc — sweeping radar style */}
      {showScanArc && (
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ transformOrigin: "center" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div
            style={{
              position: "absolute",
              inset: "8%",
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(124,58,237,0.0) 280deg, rgba(124,58,237,0.45) 358deg, transparent 360deg)",
              maskImage:
                "radial-gradient(circle, transparent 38%, black 39%, black 100%)",
              WebkitMaskImage:
                "radial-gradient(circle, transparent 38%, black 39%, black 100%)",
            }}
          />
        </motion.div>
      )}

      {/* 3D Scene container */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
        }}
      >
        {/* Crystalline shards — morphing hexagon ring */}
        {showShards && (
          <motion.div
            aria-hidden
            className="absolute inset-[10%]"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateZ: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2
              const tx = Math.cos(angle) * size * 0.4
              const ty = Math.sin(angle) * size * 0.4
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: size * 0.12,
                    height: size * 0.36,
                    marginLeft: -size * 0.06,
                    marginTop: -size * 0.18,
                    transform: `translate(${tx}px, ${ty}px) rotate(${
                      (angle * 180) / Math.PI + 90
                    }deg)`,
                    background:
                      "linear-gradient(180deg, rgba(124,58,237,0.0), rgba(124,58,237,0.35), rgba(56,189,248,0.15), rgba(124,58,237,0.0))",
                    border: "1px solid rgba(124,58,237,0.25)",
                    borderRadius: "8px",
                    backdropFilter: "blur(2px)",
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scaleY: [0.9, 1.05, 0.9],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              )
            })}
          </motion.div>
        )}

        {/* Hex frame */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-[6%]"
          style={{ overflow: "visible" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <motion.polygon
            points="50,4 90,27 90,73 50,96 10,73 10,27"
            fill="none"
            stroke="url(#gx-logo-grad)"
            strokeWidth="0.8"
            strokeOpacity={0.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, rotate: 360 }}
            transition={{
              pathLength: { duration: 2, ease: "easeInOut" },
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            }}
            style={{ transformOrigin: "center" }}
          />
          <polygon
            points="50,8 86,29 86,71 50,92 14,71 14,29"
            fill="none"
            stroke="rgba(56,189,248,0.18)"
            strokeWidth="0.4"
            strokeDasharray="2 3"
          />
          <defs>
            <linearGradient id="gx-logo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Inner energy core */}
        <motion.div
          aria-hidden
          className="absolute inset-[28%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(167,139,250,0.6), rgba(124,58,237,0.2) 50%, transparent 75%)",
            filter: "blur(8px)",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* The actual transparent logo PNG */}
        <motion.img
          src="/guardianx-logo-v2.png"
          alt="GuardianX Logo"
          className="absolute inset-[18%] object-contain select-none pointer-events-none"
          style={{
            x: logoX,
            y: logoY,
            transform: "translateZ(40px)",
            filter: `drop-shadow(0 0 24px rgba(124,58,237,${
              isHovered ? 0.85 : 0.5
            })) drop-shadow(0 0 60px rgba(56,189,248,0.35))`,
          }}
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          draggable={false}
        />

        {/* Highlight glints on logo */}
        <motion.div
          aria-hidden
          className="absolute inset-[18%] pointer-events-none"
          style={{ borderRadius: "50%", overflow: "hidden" }}
        >
          <motion.div
            className="absolute -inset-1"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.15) 55%, transparent 70%)",
            }}
            animate={{ x: ["-60%", "120%"] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2.5,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Particle canvas overlay */}
      {showParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Bottom shadow reflection */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -size * 0.06,
          width: size * 0.7,
          height: size * 0.08,
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.5), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
    </div>
  )
}

/* Lightweight variant for nav/footer */
export function AnimatedLogoMark({
  size = 36,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <motion.img
        src="/guardianx-logo-v2.png"
        alt="GuardianX"
        className="w-full h-full object-contain"
        style={{
          filter: "drop-shadow(0 0 6px rgba(124,58,237,0.6))",
        }}
        animate={{ rotate: [0, 0] }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        draggable={false}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.3), transparent 65%)",
          filter: "blur(6px)",
          zIndex: -1,
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  )
}
