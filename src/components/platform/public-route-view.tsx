"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAppStore, type View } from "@/store/app-store"
import { viewToHash } from "@/lib/url-router"
import { PublicPageShell } from "@/components/platform/public-page-shell"
import { HomeView } from "@/views/home"
import { ImpactView } from "@/views/impact"
import { ContactView } from "@/views/contact"
import { InstitutionsSchoolsView } from "@/views/institutions-schools"
import { InstitutionsCollegesView } from "@/views/institutions-colleges"
import { InstitutionsUniversitiesView } from "@/views/institutions-universities"
import { CourseCatalogView } from "@/views/course-catalog"
import { BatchesView } from "@/views/batches"
import { ExamsView } from "@/views/exams"
import { CredentialsView } from "@/views/credentials"
import { VerifyView } from "@/views/verify"
import { SupportView } from "@/views/support"
import { InstructorsView } from "@/views/instructors"
import { InstructorDetailView } from "@/views/instructor-detail"
import { EventsView } from "@/views/events"
import { EventDetailView } from "@/views/event-detail"
import { BlogView } from "@/views/blog"
import { BlogPostView } from "@/views/blog-post"
import { CertLandingView } from "@/views/cert-landing"
import { PricingView } from "@/views/pricing"
import { CourseDetailView } from "@/views/course-detail"
import dynamic from "next/dynamic"

const LearningPathsView = dynamic(() => import("@/views/learning-paths").then(m => ({ default: m.LearningPathsView })), { ssr: false })
const CyberRangeView = dynamic(() => import("@/views/cyber-range").then(m => ({ default: m.CyberRangeView })), { ssr: false })

/* ============================================================
   PublicRouteView — wraps a public page rendered at a real
   Next.js route (e.g. /courses, /blog/<slug>) with:
     1. The PublicPageShell (header + footer).
     2. The initial view component, server-rendered for SEO.
     3. A tiny client-side effect that:
        - Hydrates the Zustand store with the initial view so
          the existing view components (which read `useAppStore().view`)
          work without modification.
        - Watches for in-app navigation (the header / footer still
          call `navigate()` which uses hash routing). When the user
          navigates to a different view, we redirect to the matching
          real route (fast client-side navigation via Next.js router)
          or fall back to the SPA root with the original hash (for
          views that don't have a real route — e.g. dashboard, login).
   ============================================================ */

const VIEW_TO_REAL_PATH: Partial<Record<string, (v: View) => string>> = {
  home: () => "/",
  catalog: () => "/courses",
  batches: () => "/batches",
  instructors: () => "/instructors",
  events: () => "/events",
  blog: () => "/blog",
  "learning-paths": () => "/learning-paths",
  "cyber-range": () => "/cyber-range",
  contact: () => "/contact",
  pricing: () => "/pricing",
  // "institutions" is an alias for "institutions-schools" (per page.tsx
  // ViewRouter) — both route to the schools page.
  institutions: () => "/institutions/schools",
  "institutions-schools": () => "/institutions/schools",
  "institutions-colleges": () => "/institutions/colleges",
  "institutions-universities": () => "/institutions/universities",
  verify: () => "/verify",
  "blog-post": (v) => (v.name === "blog-post" ? `/blog/${encodeURIComponent(v.slug)}` : "/blog"),
  "instructor-detail": (v) => (v.name === "instructor-detail" ? `/instructors/${encodeURIComponent(v.instructorId)}` : "/instructors"),
  "event-detail": (v) => (v.name === "event-detail" ? `/events/${encodeURIComponent(v.eventSlug)}` : "/events"),
  course: (v) => (v.name === "course" ? `/courses/${encodeURIComponent(v.courseId)}` : "/courses"),
}

function renderView(view: View): React.ReactNode {
  switch (view.name) {
    case "home": return <HomeView />
    case "impact": return <ImpactView />
    case "contact": return <ContactView />
    case "institutions":
    case "institutions-schools": return <InstitutionsSchoolsView />
    case "institutions-colleges": return <InstitutionsCollegesView />
    case "institutions-universities": return <InstitutionsUniversitiesView />
    case "catalog": return <CourseCatalogView />
    case "batches": return <BatchesView />
    case "exams": return <ExamsView />
    case "credentials": return <CredentialsView />
    case "verify": return <VerifyView />
    case "support": return <SupportView />
    case "instructors": return <InstructorsView />
    case "instructor-detail": return <InstructorDetailView />
    case "events": return <EventsView />
    case "event-detail": return <EventDetailView />
    case "blog": return <BlogView />
    case "blog-post": return "slug" in view ? <BlogPostView slug={view.slug} /> : <BlogView />
    case "cert-landing": return "certSlug" in view ? <CertLandingView certSlug={view.certSlug} /> : null
    case "pricing": return <PricingView />
    case "course": return <CourseDetailView />
    case "learning-paths": return <LearningPathsView />
    case "cyber-range": return <CyberRangeView />
    default: return null
  }
}

function viewToHref(view: View): string {
  const hash = viewToHash(view)
  // viewToHash returns "/course/abc" → we want "/#/course/abc"
  return `/#${hash.startsWith("/") ? hash : `/${hash}`}`
}

export function PublicRouteView({ initialView }: { initialView: View }) {
  const view = useAppStore((s) => s.view)
  const router = useRouter()
  const didInit = React.useRef(false)

  // Hydrate the store with the initial view on mount. We use a ref so
  // this only fires once per mount (not on every re-render). The store
  // is the single source of truth for the existing view components.
  React.useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    const current = useAppStore.getState().view
    if (JSON.stringify(current) !== JSON.stringify(initialView)) {
      useAppStore.setState({ view: initialView, sidebarOpen: false })
    }
  }, [initialView])

  // Watch for in-app navigation. The header / footer still call
  // `navigate()` which updates the store + pushes a hash. When the
  // view changes to something other than the initial view, redirect
  // to the matching real route (Next.js router, no full reload) or
  // fall back to a hard navigation to the SPA root with the hash
  // (for views that don't have a real route — e.g. dashboard, login).
  React.useEffect(() => {
    if (!didInit.current) return
    if (view.name === initialView.name) return
    const builder = VIEW_TO_REAL_PATH[view.name]
    if (builder) {
      const path = builder(view)
      if (path === "/") {
        // Home is the SPA root — use hash navigation
        window.location.href = viewToHref(view)
      } else {
        // Real route — fast client-side navigation
        router.push(path)
      }
    } else {
      // No real route — go to the SPA root with the hash
      window.location.href = viewToHref(view)
    }
  }, [view, initialView, router])

  return (
    <PublicPageShell>
      {renderView(initialView)}
    </PublicPageShell>
  )
}
