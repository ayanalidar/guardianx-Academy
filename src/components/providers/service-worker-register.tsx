"use client"

import * as React from "react"

/**
 * Registers the GuardianX service worker on the client.
 *
 * - Runs once after mount in production AND dev (so PWA installability works
 *   in the preview environment).
 * - Listens for the `controllerchange` event to inform the user when a new
 *   version has been downloaded and is ready to activate.
 * - On `message { type: "SKIP_WAITING" }` we explicitly tell the waiting SW
 *   to skip waiting — the SW itself already calls `self.skipWaiting()`, this
 *   is just defensive in case a future version doesn't.
 */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    // Disable SW registration in dev mode to prevent caching issues
    // and reduce memory pressure during development.
    if (process.env.NODE_ENV === "development") {
      // Unregister any existing SWs in dev
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister().catch(() => undefined))
      }).catch(() => undefined)
      return
    }

    let refreshing = false
    const onControllerChange = () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              newWorker.postMessage?.({ type: "SKIP_WAITING" })
            }
          })
        })
        const interval = setInterval(() => {
          reg.update().catch(() => undefined)
        }, 60 * 60 * 1000)
        return () => clearInterval(interval)
      } catch (err) {
        console.warn("[GuardianX PWA] Service worker registration failed:", err)
      }
    }
    register()

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  return null
}
