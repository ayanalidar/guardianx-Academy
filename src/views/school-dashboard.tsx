"use client"

import * as React from "react"
import { SchoolDashboardInner } from "./school-dashboard-inner"

export function SchoolDashboardView() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading school dashboard...</div>}>
      <ErrorBoundary>
        <SchoolDashboardInner />
      </ErrorBoundary>
    </React.Suspense>
  )
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  componentDidCatch(error: any, info: any) {
    console.error("SchoolDashboard error:", error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">School Dashboard Error</h2>
          <pre className="text-xs text-muted-foreground text-left bg-card p-4 rounded-lg overflow-auto max-w-2xl mx-auto">
            {this.state.error?.message ?? "Unknown error"}
            {"\n\n"}
            {this.state.error?.stack ?? ""}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg bg-violet-500 text-white"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
