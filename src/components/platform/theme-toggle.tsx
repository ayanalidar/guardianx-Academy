"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Theme toggle button — switches between dark/light themes.
 * Used in the homepage, public page headers, and the app shell top bar.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={className ?? "h-9 w-9"} aria-hidden />
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className ?? "h-9 w-9"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle dark/light theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
