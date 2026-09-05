import type { MetadataRoute } from "next"

/**
 * Next.js native sitemap — generates /sitemap.xml
 * This covers the non-hash URLs that crawlers can directly index.
 * The hash-routed SPA pages are covered by /api/sitemap.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://academy.guardianx.cloud"
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/particle-logo-demo.html`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
