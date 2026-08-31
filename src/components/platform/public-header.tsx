"use client"

import * as React from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Shield, Sun, Moon, Home as HomeIcon, TrendingUp, Mail, LogIn, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/app-store"
import { AnimatedLogoMark } from "@/components/platform/animated-logo"

/**
 * PublicHeader — minimal floating navigation.
 * Transforms on scroll: transparent → glass surface → compact.
 */
export function PublicHeader() {
  const { theme, setTheme } = useTheme()
  const { navigate, view } = useAppStore()
  const [mounted, setMounted] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const { scrollY } = useScroll()
  const lastScroll = React.useRef(0)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40)
    // Hide on scroll down, show on scroll up (after threshold)
    if (latest > 300 && latest > lastScroll.current + 10) {
      setHidden(true)
    } else if (latest < lastScroll.current - 10 || latest < 100) {
      setHidden(false)
    }
    lastScroll.current = latest
  })

  React.useEffect(() => setMounted(true), [])

  const navItems = [
    { label: "Home", view: { name: "home" as const }, icon: HomeIcon },
    { label: "Courses", view: { name: "catalog" as const }, icon: Shield },
    { label: "Partners", view: { name: "institutions" as const }, icon: Building2 },
    { label: "Impact", view: { name: "impact" as const }, icon: TrendingUp },
    { label: "Contact", view: { name: "contact" as const }, icon: Mail },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: hidden ? -100 : 0,
        opacity: 1,
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4"
    >
      <motion.div
        animate={{
          maxWidth: scrolled ? "64rem" : "80rem",
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-500 px-5 sm:px-6",
          scrolled
            ? "h-14 rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
            : "h-16 rounded-2xl border border-transparent bg-transparent"
        )}
      >
        {/* Logo */}
        <motion.button
          onClick={() => navigate({ name: "home" })}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 group"
        >
          <AnimatedLogoMark size={36} />
          <div className="text-left">
            <div className="font-bold text-sm leading-none tracking-tight">
              Guardian<span className="text-violet-400">X</span>
            </div>
          </div>
        </motion.button>

        {/* Center nav */}
        <nav className={cn(
          "flex items-center gap-1 transition-all",
          scrolled ? "glass-subtle rounded-full p-0.5" : ""
        )}>
          {navItems.map((item) => {
            const active = view.name === item.view.name
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.view)}
                className={cn(
                  "relative px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5",
                  active ? "text-violet-300" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-violet-500/10 border border-violet-500/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          <Button
            size="sm"
            onClick={() => navigate({ name: "login" })}
            className="bg-violet-600 hover:bg-violet-500 btn-premium h-8 px-4 text-xs"
          >
            <LogIn className="h-3 w-3 mr-1" />
            <span>Login</span>
          </Button>
        </div>
      </motion.div>
    </motion.header>
  )
}
