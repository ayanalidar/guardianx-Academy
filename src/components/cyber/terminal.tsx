"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * CyberTerminal - a realistic terminal that types out command / output lines
 * character-by-character. Designed for lab briefings, hero animations, and
 * command simulation panels.
 *
 * Accessibility:
 *  - role="log" with aria-label="Terminal output"
 *  - aria-live="polite" so screen readers announce new output
 *  - Reduced-motion: skips typewriter effect, prints full lines instantly
 */

export type TerminalLineType = "command" | "output" | "success" | "error"

export interface TerminalLine {
  type: TerminalLineType
  text: string
}

export interface CyberTerminalProps {
  lines: TerminalLine[]
  autoPlay?: boolean
  /** ms per character */
  speed?: number
  prompt?: string
  className?: string
}

const LINE_STYLE: Record<TerminalLineType, string> = {
  command: "text-violet-200",
  output: "text-cyan-200/80",
  success: "text-emerald-300",
  error: "text-rose-300",
}

const LINE_PREFIX: Record<TerminalLineType, string> = {
  command: "",
  output: "",
  success: "[+] ",
  error: "[-] ",
}

export function CyberTerminal({
  lines,
  autoPlay = true,
  speed = 20,
  prompt = "guardian@kali:~$",
  className,
}: CyberTerminalProps) {
  const [visibleLineCount, setVisibleLineCount] = React.useState(0)
  const [visibleChars, setVisibleChars] = React.useState(0)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // If reduced motion or autoplay disabled, dump everything at once
  const skipTyping = !autoPlay || prefersReducedMotion

  // Reset when lines change
  React.useEffect(() => {
    setVisibleLineCount(0)
    setVisibleChars(0)
  }, [lines, speed, skipTyping])

  // Static render path
  React.useEffect(() => {
    if (!skipTyping) return
    setVisibleLineCount(lines.length)
    setVisibleChars(0)
  }, [lines, skipTyping])

  // Typewriter loop
  React.useEffect(() => {
    if (skipTyping) return
    if (visibleLineCount >= lines.length) return

    const currentLine = lines[visibleLineCount]
    if (!currentLine) return

    // Already fully shown - advance to next line after a brief pause
    if (visibleChars >= currentLine.text.length) {
      const pause = currentLine.type === "command" ? 220 : 90
      const t = setTimeout(() => {
        setVisibleLineCount((c) => c + 1)
        setVisibleChars(0)
      }, pause)
      return () => clearTimeout(t)
    }

    // Type next character (or chunk if very fast)
    const chunk = speed <= 5 ? 3 : speed <= 12 ? 2 : 1
    const t = setTimeout(() => {
      setVisibleChars((c) => c + chunk)
    }, speed)
    return () => clearTimeout(t)
  }, [lines, visibleLineCount, visibleChars, speed, skipTyping])

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleLineCount, visibleChars])

  const isComplete = visibleLineCount >= lines.length

  return (
    <div
      role="log"
      aria-label="Terminal output"
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/60 bg-[oklch(0.08_0.01_270)]",
        "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] scanlines",
        className
      )}
    >
      {/* Title bar - mac-style dots + title */}
      <div className="flex items-center gap-2 border-b border-border/40 bg-[oklch(0.12_0.01_270)] px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          guardian@kali - bash - 80×24
        </span>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        className="max-h-80 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
      >
        {lines.map((line, idx) => {
          if (idx > visibleLineCount) return null
          const isCurrent = idx === visibleLineCount && !isComplete
          const text =
            isCurrent && !skipTyping
              ? line.text.slice(0, visibleChars)
              : line.text

          return (
            <div
              key={idx}
              className={cn(
                "flex gap-2 whitespace-pre-wrap break-words",
                LINE_STYLE[line.type]
              )}
            >
              {line.type === "command" ? (
                <>
                  <span className="select-none text-emerald-400">{prompt}</span>
                  <span>{text}</span>
                  {isCurrent && (
                    <motion.span
                      aria-hidden
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="ml-0.5 inline-block text-emerald-300"
                    >
                      ▋
                    </motion.span>
                  )}
                </>
              ) : (
                <span>
                  {LINE_PREFIX[line.type]}
                  {text}
                  {isCurrent && skipTyping === false && (
                    <motion.span
                      aria-hidden
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="ml-0.5 inline-block"
                    >
                      ▋
                    </motion.span>
                  )}
                </span>
              )}
            </div>
          )
        })}

        {/* Idle prompt at end */}
        {isComplete && (
          <div className="flex gap-2 text-violet-200">
            <span className="select-none text-emerald-400">{prompt}</span>
            <motion.span
              aria-hidden
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              className="text-emerald-300"
            >
              ▋
            </motion.span>
          </div>
        )}
      </div>
    </div>
  )
}
