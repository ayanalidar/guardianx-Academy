"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Trophy, Zap, Flame, Crown, Sparkles } from "lucide-react"

// Listens for gamification events embedded in mutation responses and shows celebratory toasts.
// Mutations return { gamification: { newAchievements, leveledUp, newLevel } } — we surface those here.
export function GamificationToaster() {
  const qc = useQueryClient()

  React.useEffect(() => {
    // patch fetch to intercept gamification payloads — but that's heavy.
    // Instead, expose a global helper that mutations can call.
    ;(window as any).__showGamificationToast = (g: any) => {
      if (!g) return
      if (g.leveledUp) {
        toast.success(`Level Up! You reached level ${g.newLevel}`, {
          icon: <Crown className="h-4 w-4 text-amber-400" />,
          duration: 5000,
        })
        qc.invalidateQueries({ queryKey: ["me"] })
        qc.invalidateQueries({ queryKey: ["achievements"] })
      }
      if (g.newAchievements?.length) {
        for (const ach of g.newAchievements) {
          toast.success(`Achievement Unlocked: ${ach.title}`, {
            description: `${ach.description} (+${ach.xp} XP)`,
            icon: <Trophy className="h-4 w-4 text-amber-400" />,
            duration: 6000,
          })
        }
      }
    }
    return () => { delete (window as any).__showGamificationToast }
  }, [qc])

  return null
}

export function showGamification(g: any) {
  if (typeof window !== "undefined") {
    ;(window as any).__showGamificationToast?.(g)
  }
}
