"use client"

import { create } from "zustand"

export type View =
  | { name: "home" }
  | { name: "impact" }
  | { name: "contact" }
  | { name: "login" }
  | { name: "institutions" }
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
  | { name: "school" }
  | { name: "admin" }
  | { name: "community" }
  | { name: "profile" }
  | { name: "assignments" }
  | { name: "messaging" }
  | { name: "study-groups" }
  | { name: "office-hours" }
  | { name: "auth" }
  // New feature views
  | { name: "ai-assistant" }
  | { name: "threat-feed" }
  | { name: "code-review" }
  | { name: "career-planner" }
  | { name: "job-board" }
  | { name: "mock-interview" }
  | { name: "resume-builder" }
  | { name: "ctf-platform" }
  | { name: "weekly-challenges" }
  | { name: "team-missions" }
  | { name: "learning-analytics" }
  | { name: "skill-assessments" }
  | { name: "prerequisites-visualizer" }
  | { name: "lab-snapshots" }
  | { name: "cyber-range" }
  | { name: "bug-bounty" }
  | { name: "parent-portal" }
  | { name: "course-studio" }

interface AppState {
  view: View
  sidebarOpen: boolean
  navigate: (view: View) => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: { name: "home" },
  sidebarOpen: false,
  navigate: (view) => {
    set({ view, sidebarOpen: false })
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
