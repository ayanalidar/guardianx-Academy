"use client"

import { create } from "zustand"
import {
  pushViewToHash,
  replaceViewInHash,
  readViewFromHash,
} from "@/lib/url-router"

export type View =
  | { name: "home" }
  | { name: "impact" }
  | { name: "contact" }
  | { name: "login" }
  | { name: "institutions" }
  | { name: "institutions-schools" }
  | { name: "institutions-colleges" }
  | { name: "institutions-universities" }
  | { name: "dashboard" }
  | { name: "catalog" }
  | { name: "batches" }
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
  | { name: "learning-paths" }
  | { name: "skill-tree" }
  | { name: "bug-bounty" }
  | { name: "parent-portal" }
  | { name: "course-studio" }
  | { name: "cms" }
  // Exam platform
  | { name: "exams" }
  | { name: "exam-detail"; examId: string }
  | { name: "credentials" }
  | { name: "invoice-generator" }
  | { name: "proposal-maker" }
  | { name: "admin-lead-crm" }
  | { name: "admin-batch-calendar" }
  | { name: "admin-student-progress" }
  | { name: "admin-revenue" }
  | { name: "admin-cert-bulk" }
  | { name: "admin-email-campaign" }
  | { name: "admin-instructor-assignment" }
  | { name: "admin-audit-log" }
  | { name: "admin-platform-health" }
  | { name: "admin-notifications" }
  | { name: "support" }

interface AppState {
  view: View
  sidebarOpen: boolean
  navigate: (view: View) => void
  setSidebarOpen: (open: boolean) => void
}

/* --------------------------------------------------------------- *
 *  SSR safety: initialize with `home` so the server-rendered HTML  *
 *  matches the first client render. The page.tsx component calls   *
 *  `hydrateFromHash()` in a useEffect after mount to sync the     *
 *  store with any deep-link URL hash (e.g. user opened            *
 *  `/#/batches` directly). This avoids hydration mismatches.     *
 * --------------------------------------------------------------- */
const initialView: View = { name: "home" }

export const useAppStore = create<AppState>((set) => ({
  view: initialView,
  sidebarOpen: false,
  navigate: (view) => {
    set({ view, sidebarOpen: false })
    if (typeof window !== "undefined") {
      // Push the new view into the URL hash so the address bar updates
      // and the back button works.
      pushViewToHash(view)
      window.scrollTo({ top: 0, behavior: "smooth" })
      // Dispatch a custom event for components that might not re-render
      window.dispatchEvent(new CustomEvent("guardianx-navigate", { detail: view }))
    }
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))

/** Read the URL hash and sync the store. Called by page.tsx on mount
 *  (after hydration) so deep links + refresh + direct-URL entry work
 *  without causing SSR mismatches. Returns the hydrated view. */
export function hydrateFromHash(): View {
  if (typeof window === "undefined") return { name: "home" }
  const fromHash = readViewFromHash()
  const current = useAppStore.getState().view
  if (JSON.stringify(fromHash) !== JSON.stringify(current)) {
    useAppStore.setState({ view: fromHash, sidebarOpen: false })
    window.dispatchEvent(new CustomEvent("guardianx-navigate", { detail: fromHash }))
  }
  // Normalize the URL hash so the address bar shows a clean canonical
  // hash for the loaded view (e.g. `/` instead of empty).
  replaceViewInHash(fromHash)
  return fromHash
}

/* --------------------------------------------------------------- *
 *  Browser back/forward support. When the user hits back/forward, *
 *  the URL hash changes; we sync the store to match. We attach    *
 *  the listeners at module load (client-only) so they're active    *
 *  before any navigation happens.                                 *
 * --------------------------------------------------------------- */
if (typeof window !== "undefined") {
  const onHashChange = () => {
    const next = readViewFromHash()
    const current = useAppStore.getState().view
    // Only update if the parsed view actually differs — avoids loops
    if (JSON.stringify(next) !== JSON.stringify(current)) {
      useAppStore.setState({ view: next, sidebarOpen: false })
      window.dispatchEvent(new CustomEvent("guardianx-navigate", { detail: next }))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  window.addEventListener("popstate", onHashChange)
  window.addEventListener("hashchange", onHashChange)
}
