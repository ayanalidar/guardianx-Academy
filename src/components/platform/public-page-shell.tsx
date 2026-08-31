"use client"

import * as React from "react"
import { PublicHeader } from "@/components/platform/public-header"
import { PublicFooter } from "@/components/platform/public-footer"

/**
 * PublicPageShell — wraps public-facing pages with the sticky header + footer.
 * Used for Home, Impact, Contact, and other unauthenticated pages.
 */
export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background bg-mesh">
      <PublicHeader />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter />
    </div>
  )
}
