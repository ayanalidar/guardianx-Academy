/**
 * Sentry error tracking configuration.
 *
 * Set SENTRY_DSN env var to enable. If not set, Sentry is silently
 * disabled — the app runs normally without error tracking.
 *
 * To get a DSN: create a free account at sentry.io, create a new project
 * (Next.js), copy the DSN, and set it as SENTRY_DSN on Vercel.
 */

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for
    // performance monitoring. Lower in production (e.g. 0.1) to reduce
    // volume.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Debug mode for development — set to false in production
    debug: false,
    // Release tracking — uses the git commit hash if available
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    // Environment
    environment: process.env.NODE_ENV || "development",
    // Ignore common noise errors
    ignoreErrors: [
      // NextAuth client fetch errors (non-critical)
      "NEXTAUTH_CLIENT_FETCH_ERROR",
      "JWEDecrypt",
      // Browser extension errors
      "top-level document",
      // Hydration mismatch (we handle these gracefully)
      "Hydration",
    ],
  })
}

export { Sentry }
