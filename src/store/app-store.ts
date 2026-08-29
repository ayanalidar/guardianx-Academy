"use client"

import { create } from "zustand"

export type View =
  | { name: "dashboard" }
  | { name: "catalog" }
  | { name: "course"; courseId: string }
  | { name: "lesson"; lessonId: string; courseId: string }
  | { name: "learning" }
  | { name: "notes" }
  | { name: "live" }
  | { name: "labs" }
  | { name: "lab"; labSlug: string }
  | { name: "certificates" }
  | { name: "achievements" }
  | { name: "leaderboard" }
  | { name: "instructor" }
  | { name: "community" }
  | { name: "profile" }
  | { name: "assignments" }
  | { name: "messaging" }
  | { name: "study-groups" }
  | { name: "office-hours" }
  | { name: "auth" }

interface AppState {
  view: View
  sidebarOpen: boolean
  navigate: (view: View) => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: { name: "dashboard" },
  sidebarOpen: false,
  navigate: (view) => {
    set({ view, sidebarOpen: false })
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
