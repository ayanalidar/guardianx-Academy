import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

/**
 * PWA manifest info endpoint.
 * Returns metadata describing the installable GuardianX PWA — used by the
 * frontend (e.g. an "Install App" prompt) to verify the manifest is reachable
 * and to surface install instructions to the user.
 *
 * Auth is OPTIONAL: when a logged-in user calls this endpoint we include
 * personalised fields (their role + a deep-link back to their dashboard).
 * Anonymous callers still get the manifest summary so the install flow works
 * pre-login.
 */
export async function GET() {
  const user = await getCurrentUser()

  const manifest = {
    name: "GuardianX Academy — Cyber Security LMS & Labs",
    short_name: "GuardianX",
    description:
      "Master cyber security certifications (CEH, CCNA, CCNP, RHCSA, WAPT, CISSP, CyberArk PAM) with GuardianX LMS — study materials, live screen-sharing sessions, and hands-on practice labs.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#7c3aed",
    icons: [
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/guardianx-logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/guardianx-logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Dashboard", url: "/?source=pwa&goto=dashboard" },
      { name: "Cyber Labs", url: "/?source=pwa&goto=labs" },
      { name: "My Learning", url: "/?source=pwa&goto=learning" },
      { name: "Live Sessions", url: "/?source=pwa&goto=live" },
    ],
  }

  return NextResponse.json({
    pwa: {
      manifestUrl: "/manifest.json",
      serviceWorkerUrl: "/sw.js",
      installable: true,
      themeColor: "#7c3aed",
      backgroundColor: "#0a0a0f",
      displayName: "GuardianX Academy",
      shortName: "GuardianX",
      startUrl: user ? `/?source=pwa&goto=dashboard` : `/?source=pwa`,
      description: manifest.description,
      categories: ["education", "productivity", "security"],
      icons: manifest.icons,
      shortcuts: manifest.shortcuts,
    },
    user: user
      ? {
          authenticated: true as const,
          role: user.role,
          startView: "dashboard",
        }
      : { authenticated: false as const, startView: "home" },
    serviceWorker: {
      url: "/sw.js",
      scope: "/",
      version: "guardianx-sw-v1",
      features: [
        "app-shell-precache",
        "network-first-navigation",
        "cache-first-static-assets",
        "offline-fallback",
      ],
    },
    generatedAt: new Date().toISOString(),
  })
}
