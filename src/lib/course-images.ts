/**
 * Course category → image mapping
 * Each category gets a distinctive visual identity.
 */

export const COURSE_IMAGES: Record<string, string> = {
  "Ethical Hacking": "/courses/ethical-hacking.png",
  "Networking": "/courses/network-security.png",
  "Web Security": "/courses/web-security.png",
  "Cloud Security": "/courses/cloud-security.png",
  "Forensics": "/courses/digital-forensics.png",
  "System Administration": "/courses/soc-blue-team.png",
  "Security Management": "/courses/security-management.png",
  "Identity & Access": "/courses/iam.png",
  "Malware Analysis": "/courses/malware-analysis.png",
  "Penetration Testing": "/courses/penetration-testing.png",
  "AI Security": "/courses/ai-security.png",
  "Incident Response": "/courses/incident-response.png",
}

/**
 * Get the best matching image for a course based on its category/title.
 */
export function getCourseImage(course: { category?: string; title?: string; shortName?: string; thumbnail?: string | null }): string {
  // If course has a custom thumbnail, use it
  if (course.thumbnail) return course.thumbnail

  // Match by category
  if (course.category && COURSE_IMAGES[course.category]) {
    return COURSE_IMAGES[course.category]
  }

  // Match by title keywords
  const title = (course.title || "").toLowerCase()
  const shortName = (course.shortName || "").toLowerCase()

  if (title.includes("ethical hack") || shortName.includes("ceh")) return COURSE_IMAGES["Ethical Hacking"]
  if (title.includes("network") || shortName.includes("ccna") || shortName.includes("ccnp")) return COURSE_IMAGES["Networking"]
  if (title.includes("web") || shortName.includes("wapt")) return COURSE_IMAGES["Web Security"]
  if (title.includes("cloud")) return COURSE_IMAGES["Cloud Security"]
  if (title.includes("forensic")) return COURSE_IMAGES["Forensics"]
  if (title.includes("admin") || shortName.includes("rhcsa")) return COURSE_IMAGES["System Administration"]
  if (title.includes("management") || shortName.includes("cissp")) return COURSE_IMAGES["Security Management"]
  if (title.includes("identity") || shortName.includes("pam") || shortName.includes("cyberark")) return COURSE_IMAGES["Identity & Access"]
  if (title.includes("malware") || title.includes("reverse")) return COURSE_IMAGES["Malware Analysis"]
  if (title.includes("penetrat")) return COURSE_IMAGES["Penetration Testing"]
  if (title.includes("ai ") || title.includes("artificial")) return COURSE_IMAGES["AI Security"]
  if (title.includes("incident") || title.includes("response")) return COURSE_IMAGES["Incident Response"]

  // Default
  return COURSE_IMAGES["Ethical Hacking"]
}
