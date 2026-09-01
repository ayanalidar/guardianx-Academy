"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { AuthScreen } from "@/components/platform/auth-screen"
import { AppShell } from "@/components/platform/app-shell"
import { PublicPageShell } from "@/components/platform/public-page-shell"
import { ErrorBoundary } from "@/components/platform/error-boundary"
import { useAppStore } from "@/store/app-store"
import { hydrateFromHash } from "@/store/app-store"
import { HomeView } from "@/views/home"
import { ImpactView } from "@/views/impact"
import { ContactView } from "@/views/contact"
import { InstitutionsSchoolsView } from "@/views/institutions-schools"
import { InstitutionsCollegesView } from "@/views/institutions-colleges"
import { InstitutionsUniversitiesView } from "@/views/institutions-universities"
import { DashboardView } from "@/views/dashboard"
import { CourseCatalogView } from "@/views/course-catalog"
import { BatchesView } from "@/views/batches"
import { ExamsView } from "@/views/exams"
import { CredentialsView } from "@/views/credentials"
import { InvoiceGeneratorView } from "@/views/invoice-generator"
import { ProposalMakerView } from "@/views/proposal-maker"
import { LeadCrmView } from "@/views/admin-lead-crm"
import { BatchCalendarView } from "@/views/admin-batch-calendar"
import { StudentProgressView } from "@/views/admin-student-progress"
import { RevenueAnalyticsView } from "@/views/admin-revenue"
import { CertBulkIssuanceView } from "@/views/admin-cert-bulk"
import { EmailCampaignView } from "@/views/admin-email-campaign"
import { InstructorAssignmentView } from "@/views/admin-instructor-assignment"
import { AuditLogView } from "@/views/admin-audit-log"
import { PlatformHealthView } from "@/views/admin-platform-health"
import { NotificationCenterView } from "@/views/admin-notifications"
import { SupportView } from "@/views/support"
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
// New feature views (heavy) — lazy-loaded with ssr:false for faster initial page render
import { AIAssistantView } from "@/views/ai-assistant"
import { ThreatFeedView } from "@/views/threat-feed"
import { CodeReviewView } from "@/views/code-review"
import { CareerPlannerView } from "@/views/career-planner"
import { JobBoardView } from "@/views/job-board"
import { ParentPortalView } from "@/views/parent-portal"
import { CMSDashboardView } from "@/views/cms-dashboard"
const MockInterviewView = dynamic(() => import("@/views/mock-interview").then(m => ({ default: m.MockInterviewView })), { ssr: false })
const ResumeBuilderView = dynamic(() => import("@/views/resume-builder").then(m => ({ default: m.ResumeBuilderView })), { ssr: false })
const CTFPlatformView = dynamic(() => import("@/views/ctf-platform").then(m => ({ default: m.CTFPlatformView })), { ssr: false })
const WeeklyChallengesView = dynamic(() => import("@/views/weekly-challenges").then(m => ({ default: m.WeeklyChallengesView })), { ssr: false })
const TeamMissionsView = dynamic(() => import("@/views/team-missions").then(m => ({ default: m.TeamMissionsView })), { ssr: false })
const LearningAnalyticsView = dynamic(() => import("@/views/learning-analytics").then(m => ({ default: m.LearningAnalyticsView })), { ssr: false })
const SkillAssessmentsView = dynamic(() => import("@/views/skill-assessments").then(m => ({ default: m.SkillAssessmentsView })), { ssr: false })
const PrerequisitesVisualizerView = dynamic(() => import("@/views/prerequisites-visualizer").then(m => ({ default: m.PrerequisitesVisualizerView })), { ssr: false })
const LabSnapshotsView = dynamic(() => import("@/views/lab-snapshots").then(m => ({ default: m.LabSnapshotsView })), { ssr: false })
const CyberRangeView = dynamic(() => import("@/views/cyber-range").then(m => ({ default: m.CyberRangeView })), { ssr: false })
const LearningPathsView = dynamic(() => import("@/views/learning-paths").then(m => ({ default: m.LearningPathsView })), { ssr: false })
const SkillTreeView = dynamic(() => import("@/views/skill-tree").then(m => ({ default: m.SkillTreeView })), { ssr: false })
const BugBountyView = dynamic(() => import("@/views/bug-bounty").then(m => ({ default: m.BugBountyView })), { ssr: false })
const CourseStudioView = dynamic(() => import("@/views/course-studio").then(m => ({ default: m.CourseStudioView })), { ssr: false })
const ExamDetailView = dynamic(() => import("@/views/exam-detail").then(m => ({ default: m.ExamDetailView })), { ssr: false })

// Public views that show the header + footer (accessible without login)
const PUBLIC_VIEWS = new Set([
  "home", "impact", "contact", "institutions", "institutions-schools",
  "institutions-colleges", "institutions-universities",
  "catalog", "batches", "course", "cyber-range", "learning-paths", "skill-tree",
  "exams", "credentials", "support",
])

function ViewRouter() {
  const { view } = useAppStore()
  // key forces remount + fade-in on navigation
  return (
    <div key={JSON.stringify(view)} className="page-transition">
      {view.name === "home" && <HomeView />}
      {view.name === "impact" && <ImpactView />}
      {view.name === "contact" && <ContactView />}
      {/* "institutions" redirects to institutions-schools — no combined page anymore */}
      {(view.name === "institutions" || view.name === "institutions-schools") && <InstitutionsSchoolsView />}
      {view.name === "institutions-colleges" && <InstitutionsCollegesView />}
      {view.name === "institutions-universities" && <InstitutionsUniversitiesView />}
      {view.name === "dashboard" && <DashboardView />}
      {view.name === "catalog" && <CourseCatalogView />}
      {view.name === "batches" && <BatchesView />}
      {view.name === "exams" && <ExamsView />}
      {view.name === "credentials" && <CredentialsView />}
      {view.name === "invoice-generator" && <InvoiceGeneratorView />}
      {view.name === "proposal-maker" && <ProposalMakerView />}
      {view.name === "admin-lead-crm" && <LeadCrmView />}
      {view.name === "admin-batch-calendar" && <BatchCalendarView />}
      {view.name === "admin-student-progress" && <StudentProgressView />}
      {view.name === "admin-revenue" && <RevenueAnalyticsView />}
      {view.name === "admin-cert-bulk" && <CertBulkIssuanceView />}
      {view.name === "admin-email-campaign" && <EmailCampaignView />}
      {view.name === "admin-instructor-assignment" && <InstructorAssignmentView />}
      {view.name === "admin-audit-log" && <AuditLogView />}
      {view.name === "admin-platform-health" && <PlatformHealthView />}
      {view.name === "admin-notifications" && <NotificationCenterView />}
      {view.name === "support" && <SupportView />}
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
      {view.name === "learning-paths" && <LearningPathsView />}
      {view.name === "skill-tree" && <SkillTreeView />}
      {view.name === "bug-bounty" && <BugBountyView />}
      {view.name === "parent-portal" && <ParentPortalView />}
      {view.name === "course-studio" && <CourseStudioView />}
      {view.name === "cms" && <CMSDashboardView />}
      {/* Exam platform */}
      {view.name === "exam-detail" && <ExamDetailView />}
    </div>
  )
}

export default function Home() {
  const { view } = useAppStore()
  const [session, setSession] = React.useState<any>(null)
  const [sessionChecked, setSessionChecked] = React.useState(false)
  const [, forceRender] = React.useState(0)

  // Listen for navigation events — re-fetch the session after every navigate.
  // This is critical for the post-login flow: signIn() sets the session cookie,
  // then auth-screen calls navigate({name:"dashboard"}); without re-fetching
  // the session here, page.tsx still thinks session=null and bounces back to
  // the AuthScreen. Re-fetching on the navigate event ensures the session
  // state is fresh right before we decide which shell to render.
  React.useEffect(() => {
    const handler = () => {
      // Force re-render...
      forceRender((v: number) => v + 1)
      // ...and re-fetch the session in case it just changed (login/logout).
      fetch("/api/auth/session", { credentials: "include" })
        .then(r => r.json())
        .then(data => { setSession(data?.user ? data : null); setSessionChecked(true) })
        .catch(() => { /* keep existing session state */ })
    }
    window.addEventListener("guardianx-navigate", handler)
    return () => window.removeEventListener("guardianx-navigate", handler)
  }, [forceRender])

  // Hydrate the view from the URL hash after mount. This makes deep
  // links, refresh, and direct-URL entry work — e.g. visiting
  // `/#/batches` loads straight into the BatchesView. We do this in
  // a useEffect (not at module load) to avoid SSR hydration mismatches.
  React.useEffect(() => {
    hydrateFromHash()
  }, [])

  // Check session via fetch instead of useSession hook (avoids CLIENT_FETCH_ERROR blocking).
  // Re-runs whenever the view name changes so that after a successful login +
  // navigate(), the session state is refreshed before the shell decision.
  React.useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then(data => { setSession(data?.user ? data : null); setSessionChecked(true) })
      .catch(() => { setSession(null); setSessionChecked(true) })
  }, [view.name])

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
  // BUT: if the view is still the default "home" and the user just logged in,
  // redirect to their role-appropriate dashboard instead.
  if (session && view.name === "home") {
    // Auto-redirect to role dashboard on first load after login
    const role = (session as any)?.user?.role
    const targetView = role === "ADMIN" ? "admin" : role === "INSTRUCTOR" ? "instructor" : "dashboard"
    if (view.name !== targetView) {
      // Use a microtask to avoid setState during render
      Promise.resolve().then(() => {
        useAppStore.getState().navigate({ name: targetView as any })
      })
    }
  }

  if (PUBLIC_VIEWS.has(view.name) && view.name !== "home") {
    return (
      <PublicPageShell>
        <ViewRouter />
      </PublicPageShell>
    )
  }

  // If logged in and view is "home" (shouldn't happen after redirect above, but fallback)
  if (session && view.name === "home") {
    return (
      <AppShell>
        <ViewRouter />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <ErrorBoundary>
        <ViewRouter />
      </ErrorBoundary>
    </AppShell>
  )
}
