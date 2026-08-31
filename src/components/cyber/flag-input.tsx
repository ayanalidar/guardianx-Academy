"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Loader2, Send, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * FlagInput - specialized input for capturing CTF / lab flags.
 *
 *  - Mono font, "GX{...}" format enforced visually with prefix + suffix chips
 *  - Enter key submits
 *  - Loading state shows spinner, success/error shows colored ring + icon
 *  - Accessible: label, aria-invalid, aria-describedby for result message
 *
 * Validation rule: a valid flag looks like `GX{anything-here}`. The component
 * strips the visual prefix/suffix and reconstructs the canonical flag form on
 * submit so users can type just the inner payload.
 */

export interface FlagInputProps {
  placeholder?: string
  onSubmit?: (flag: string) => void
  loading?: boolean
  result?: "correct" | "incorrect" | null
  className?: string
  /** Disable the input entirely (e.g. after submission) */
  disabled?: boolean
  /** Optional label above the input */
  label?: string
}

const DEFAULT_PLACEHOLDER = "________________"

export function FlagInput({
  placeholder = DEFAULT_PLACEHOLDER,
  onSubmit,
  loading = false,
  result = null,
  className,
  disabled = false,
  label = "Capture the flag",
}: FlagInputProps) {
  const [value, setValue] = React.useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip any literal "GX{" / "}" the user types - we add them visually
    let v = e.target.value
    v = v.replace(/^GX\{/i, "").replace(/\}$/, "")
    setValue(v)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || disabled) return
    const trimmed = value.trim()
    if (!trimmed) return
    const flag = `GX{${trimmed}}`
    onSubmit?.(flag)
  }

  const stateRing =
    result === "correct"
      ? "ring-2 ring-emerald-500/60 border-emerald-500/50"
      : result === "incorrect"
      ? "ring-2 ring-rose-500/60 border-rose-500/50"
      : "focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50"

  const inputId = React.useId()
  const statusId = `${inputId}-status`

  const statusText =
    result === "correct"
      ? "Flag accepted. Mission complete."
      : result === "incorrect"
      ? "Incorrect flag. Try again."
      : null

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-stretch gap-2 rounded-lg border bg-[oklch(0.1_0.01_270)] transition-all",
          stateRing,
          disabled && "opacity-60"
        )}
      >
        {/* Prefix chip */}
        <div
          aria-hidden
          className="flex select-none items-center gap-1.5 rounded-l-lg border-r border-border/40 bg-[oklch(0.13_0.01_270)] px-3 font-mono text-sm font-semibold text-violet-300"
        >
          <Terminal className="size-3.5" />
          <span>GX&#123;</span>
        </div>

        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || loading}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Flag value"
          aria-invalid={result === "incorrect"}
          aria-describedby={statusText ? statusId : undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-1 py-2 font-mono text-sm text-cyan-100 outline-none",
            "placeholder:text-muted-foreground/70"
          )}
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        />

        {/* Suffix chip */}
        <div
          aria-hidden
          className="flex select-none items-center rounded-r-lg border-l border-border/40 bg-[oklch(0.13_0.01_270)] px-3 font-mono text-sm font-semibold text-violet-300"
        >
          &#125;
        </div>

        <div className="flex items-center pr-2">
          <Button
            type="submit"
            size="icon"
            disabled={loading || disabled || !value.trim()}
            aria-label="Submit flag"
            className={cn(
              "size-8 shrink-0",
              result === "correct"
                ? "bg-emerald-600 hover:bg-emerald-600/90"
                : result === "incorrect"
                ? "bg-rose-600 hover:bg-rose-600/90"
                : ""
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <Loader2 className="size-4 animate-spin" />
                </motion.span>
              ) : result === "correct" ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <Check className="size-4" />
                </motion.span>
              ) : result === "incorrect" ? (
                <motion.span
                  key="err"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <X className="size-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <Send className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Status line */}
      <div className="mt-2 h-4">
        <AnimatePresence mode="wait">
          {statusText && (
            <motion.p
              key={statusText}
              id={statusId}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "font-mono text-xs",
                result === "correct" ? "text-emerald-300" : "text-rose-300"
              )}
              role={result === "incorrect" ? "alert" : "status"}
            >
              {result === "correct" ? "[+] " : "[-] "}
              {statusText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
