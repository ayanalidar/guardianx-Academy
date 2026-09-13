/**
 * Sentry server-side error tracking configuration.
 *
 * Set SENTRY_DSN env var to enable. If not set, Sentry is silently disabled.
 */

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: false,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    environment: process.env.NODE_ENV || "development",
    ignoreErrors: [
      "NEXTAUTH_CLIENT_FETCH_ERROR",
      "JWEDecrypt",
    ],
  })
}

export { Sentry }
