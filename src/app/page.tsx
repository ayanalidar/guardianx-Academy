"use client"

import * as React from "react"
import { AuthScreen } from "@/components/platform/auth-screen"
import { AppShell } from "@/components/platform/app-shell"
import { PublicPageShell } from "@/components/platform/public-page-shell"
import { useAppStore } from "@/store/app-store"
import { HomeView } from "@/views/home"
import { ImpactView } from "@/views/impact"
import { ContactView } from "@/views/contact"
import { PartnerInstitutionsView } from "@/views/partner-institutions"
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
import { SchoolDashboardView } from "@/views/school-dashboard"
import { AdminDashboardView } from "@/views/admin-dashboard"
import { CommunityView } from "@/views/community"
import { ProfileView } from "@/views/profile"
import { AssignmentsView } from "@/views/assignments"
import { MessagingView } from "@/views/messaging"
import { StudyGroupsView } from "@/views/study-groups"
import { OfficeHoursView } from "@/views/office-hours"
// New feature views
import { AIAssistantView } from "@/views/ai-assistant"
import { ThreatFeedView } from "@/views/threat-feed"
import { CodeReviewView } from "@/views/code-review"
import { CareerPlannerView } from "@/views/career-planner"
import { JobBoardView } from "@/views/job-board"
import { MockInterviewView } from "@/views/mock-interview"
import { ResumeBuilderView } from "@/views/resume-builder"
import { CTFPlatformView } from "@/views/ctf-platform"
import { WeeklyChallengesView } from "@/views/weekly-challenges"
import { TeamMissionsView } from "@/views/team-missions"
import { LearningAnalyticsView } from "@/views/learning-analytics"
import { SkillAssessmentsView } from "@/views/skill-assessments"
import { PrerequisitesVisualizerView } from "@/views/prerequisites-visualizer"
import { LabSnapshotsView } from "@/views/lab-snapshots"
import { CyberRangeView } from "@/views/cyber-range"
import { BugBountyView } from "@/views/bug-bounty"
import { ParentPortalView } from "@/views/parent-portal"
import { CourseStudioView } from "@/views/course-studio"

// Public views that show the header + footer (accessible without login)
const PUBLIC_VIEWS = new Set(["home", "impact", "contact", "institutions", "catalog", "course"])

function ViewRouter() {
  const { view } = useAppStore()
  // key forces remount + fade-in on navigation
  return (
    <div key={JSON.stringify(view)} className="page-transition">
      {view.name === "home" && <HomeView />}
      {view.name === "impact" && <ImpactView />}
      {view.name === "contact" && <ContactView />}
      {view.name === "institutions" && <PartnerInstitutionsView />}
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
      {view.name === "school" && <SchoolDashboardView />}
      {view.name === "admin" && <AdminDashboardView />}
      {view.name === "community" && <CommunityView />}
      {view.name === "profile" && <ProfileView />}
      {view.name === "assignments" && <AssignmentsView />}
      {view.name === "messaging" && <MessagingView />}
      {view.name === "study-groups" && <StudyGroupsView />}
      {view.name === "office-hours" && <OfficeHoursView />}
      {/* New feature views */}
      {view.name === "ai-assistant" && <AIAssistantView />}
      {view.name === "threat-feed" && <ThreatFeedView />}
      {view.name === "code-review" && <CodeReviewView />}
      {view.name === "career-planner" && <CareerPlannerView />}
      {view.name === "job-board" && <JobBoardView />}
      {view.name === "mock-interview" && <MockInterviewView />}
      {view.name === "resume-builder" && <ResumeBuilderView />}
      {view.name === "ctf-platform" && <CTFPlatformView />}
      {view.name === "weekly-challenges" && <WeeklyChallengesView />}
      {view.name === "team-missions" && <TeamMissionsView />}
      {view.name === "learning-analytics" && <LearningAnalyticsView />}
      {view.name === "skill-assessments" && <SkillAssessmentsView />}
      {view.name === "prerequisites-visualizer" && <PrerequisitesVisualizerView />}
      {view.name === "lab-snapshots" && <LabSnapshotsView />}
      {view.name === "cyber-range" && <CyberRangeView />}
      {view.name === "bug-bounty" && <BugBountyView />}
      {view.name === "parent-portal" && <ParentPortalView />}
      {view.name === "course-studio" && <CourseStudioView />}
    </div>
  )
}

export default function Home() {
  const { view } = useAppStore()
  const [session, setSession] = React.useState<any>(null)
  const [sessionChecked, setSessionChecked] = React.useState(false)
  const [, forceRender] = React.useState(0)

  // Listen for navigation events (fallback for when Zustand re-render doesn't trigger)
  React.useEffect(() => {
    const handler = () => {
      setSession(prev => prev) // Force re-render
      forceRender((v: number) => v + 1)
    }
    window.addEventListener("guardianx-navigate", handler)
    return () => window.removeEventListener("guardianx-navigate", handler)
  }, [])

  // Check session via fetch instead of useSession hook (avoids CLIENT_FETCH_ERROR blocking)
  React.useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then(data => { setSession(data?.user ? data : null); setSessionChecked(true) })
      .catch(() => { setSession(null); setSessionChecked(true) })
  }, [])

  // Force re-render when view changes
  React.useEffect(() => {
    const handler = () => forceRender((v: number) => v + 1)
    const unsub = useAppStore.subscribe(handler)
    return () => { unsub() }
  }, [forceRender])

  const isPublicView = PUBLIC_VIEWS.has(view.name) || view.name === "login"

  if (!sessionChecked && !isPublicView) {
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

  // If logged in and view is a public page (home/impact/contact), still show the app shell
  // so the user can navigate back to their dashboard via the sidebar.
  // If NOT logged in:
  //   - "login" view → show AuthScreen (full-screen, has its own header)
  //   - public views (home/impact/contact) → show PublicPageShell with header + footer
  //   - any other view → redirect to login
  if (!session) {
    if (view.name === "login") {
      return <AuthScreen />
    }
    if (PUBLIC_VIEWS.has(view.name)) {
      return (
        <PublicPageShell>
          <ViewRouter />
        </PublicPageShell>
      )
    }
    // Default: show login screen for any authenticated view when not logged in
    return <AuthScreen />
  }

  // Logged in: if user explicitly navigates to a public view, show it with public shell
  if (PUBLIC_VIEWS.has(view.name)) {
    return (
      <PublicPageShell>
        <ViewRouter />
      </PublicPageShell>
    )
  }

  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  )
}
