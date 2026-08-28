"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { AuthScreen } from "@/components/platform/auth-screen"
import { AppShell } from "@/components/platform/app-shell"
import { useAppStore } from "@/store/app-store"
import { DashboardView } from "@/views/dashboard"
import { CourseCatalogView } from "@/views/course-catalog"
import { CourseDetailView } from "@/views/course-detail"
import { LessonView } from "@/views/lesson-view"
import { MyLearningView } from "@/views/my-learning"
import { MyNotesView } from "@/views/my-notes"
import { LiveSessionsView } from "@/views/live-sessions"
import { LabsView } from "@/views/labs"
import { LabDetailView } from "@/views/lab-detail"
import { CertificatesView } from "@/views/certificates"
import { AchievementsView } from "@/views/achievements"
import { LeaderboardView } from "@/views/leaderboard"
import { InstructorDashboardView } from "@/views/instructor-dashboard"
import { CommunityView } from "@/views/community"
import { ProfileView } from "@/views/profile"

function ViewRouter() {
  const { view } = useAppStore()
  // key forces remount + fade-in on navigation
  return (
    <div key={JSON.stringify(view)} className="page-transition">
      {view.name === "dashboard" && <DashboardView />}
      {view.name === "catalog" && <CourseCatalogView />}
      {view.name === "course" && <CourseDetailView />}
      {view.name === "lesson" && <LessonView />}
      {view.name === "learning" && <MyLearningView />}
      {view.name === "notes" && <MyNotesView />}
      {view.name === "live" && <LiveSessionsView />}
      {view.name === "labs" && <LabsView />}
      {view.name === "lab" && <LabDetailView />}
      {view.name === "certificates" && <CertificatesView />}
      {view.name === "achievements" && <AchievementsView />}
      {view.name === "leaderboard" && <LeaderboardView />}
      {view.name === "instructor" && <InstructorDashboardView />}
      {view.name === "community" && <CommunityView />}
      {view.name === "profile" && <ProfileView />}
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-grid">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-emerald-400 font-mono text-xs">GX</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono">INITIALIZING SECURE SESSION...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  )
}
