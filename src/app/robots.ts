import type { MetadataRoute } from "next"

/**
 * Next.js native robots.txt — generates /robots.txt
 * This overrides the /api/robots.txt route for the root path.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/auth/",
          "/api/me",
          "/api/parent",
          "/api/school/",
          "/api/instructor/",
          "/api/admin/",
          "/api/affiliate/me",
          "/api/affiliate/join",
          "/api/affiliate/track",
          "/api/messages/",
          "/api/payment/",
          "/api/coupons/verify",
        ],
      },
    ],
    sitemap: "https://academy.guardianx.cloud/api/sitemap.xml",
    host: "https://academy.guardianx.cloud",
  }
}
