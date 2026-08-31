import { PrismaClient } from '@prisma/client'

/**
 * Resolve the DATABASE_URL.
 *
 * The sandbox shell exports `DATABASE_URL=file:...` (SQLite) for the local
 * dev environment, but the production schema (`prisma/schema.prisma`) and the
 * real database are PostgreSQL on Neon. Next.js does not override env vars
 * that are already set in the shell, so we read `.env` directly and prefer
 * the value found there when the shell-provided URL is the SQLite fallback.
 *
 * Implementation note: the `fs`/`path` imports are deferred behind a runtime
 * `require` call so this module stays safe to bundle for the browser (only
 * the server-side PrismaClient path actually invokes it).
 */
function resolveDatabaseUrl(): string | undefined {
  const shellUrl = process.env.DATABASE_URL
  if (shellUrl && !shellUrl.startsWith('file:')) {
    return shellUrl
  }
  // Skip on the browser — this code only runs server-side anyway.
  if (typeof window !== 'undefined') return shellUrl
  try {
    // Lazy require so the bundler doesn't try to ship `fs` to the browser.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any
    const _require: NodeRequire = g.require
    const fs = _require('fs') as typeof import('fs')
    const path = _require('path') as typeof import('path')
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      const match = content.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m)
      if (match && match[1] && !match[1].startsWith('file:')) {
        return match[1]
      }
    }
  } catch {
    // ignore — fall through to whatever the shell provided
  }
  return shellUrl
}

const datasourceUrl = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db