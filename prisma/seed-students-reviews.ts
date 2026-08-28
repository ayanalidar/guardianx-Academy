import { db } from "../src/lib/db"
import bcrypt from "bcryptjs"

const DEMO_STUDENTS = [
  { name: "Aisha Khan", email: "aisha@guardianx.io", xp: 1850, level: 5, title: "Junior Penetration Tester", bio: "Transitioning from dev to security. CEH certified." },
  { name: "Marcus Webb", email: "marcus@guardianx.io", xp: 3420, level: 8, title: "Security Analyst", bio: "Blue teamer learning red team tricks." },
  { name: "Priya Sharma", email: "priya@guardianx.io", xp: 920, level: 3, title: "Network Engineer", bio: "CCNA completed, working on CCNP." },
  { name: "Diego Santos", email: "diego@guardianx.io", xp: 5100, level: 11, title: "Senior Security Engineer", bio: "CISSP holder. 12 years in InfoSec." },
  { name: "Yuki Tanaka", email: "yuki@guardianx.io", xp: 2400, level: 6, title: "AppSec Specialist", bio: "Web app pentesting enthusiast." },
  { name: "Lena Müller", email: "lena@guardianx.io", xp: 460, level: 2, title: "IT Support → Security", bio: "Just getting started on my cyber journey." },
  { name: "Omar Hassan", email: "omar@guardianx.io", xp: 2780, level: 7, title: "Cloud Security Engineer", bio: "RHCSA + AWS Security. Loves automation." },
  { name: "Sofia Rossi", email: "sofia@guardianx.io", xp: 6800, level: 13, title: "PAM Architect", bio: "CyberArk certified. IAM/PAM specialist." },
]

async function main() {
  console.log("Seeding demo students + reviews...")
  const hash = bcrypt.hashSync("student123", 10)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  // create students
  for (const s of DEMO_STUDENTS) {
    const existing = await db.user.findUnique({ where: { email: s.email } })
    if (existing) {
      await db.user.update({ where: { id: existing.id }, data: { xp: s.xp, level: s.level, title: s.title, bio: s.bio, role: "STUDENT", lastActiveDate: todayStr, streak: Math.floor(Math.random() * 12) + 1 } })
    } else {
      await db.user.create({
        data: {
          email: s.email,
          name: s.name,
          passwordHash: hash,
          role: "STUDENT",
          title: s.title,
          bio: s.bio,
          xp: s.xp,
          level: s.level,
          streak: Math.floor(Math.random() * 12) + 1,
          lastActiveDate: todayStr,
        },
      })
    }
  }
  console.log(`Upserted ${DEMO_STUDENTS.length} demo students`)

  // seed some user activity for the heatmap (so recent activity feed isn't empty)
  for (const s of DEMO_STUDENTS.slice(0, 5)) {
    const user = await db.user.findUnique({ where: { email: s.email } })
    if (!user) continue
    for (let i = 0; i < 4; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      await db.userActivity.create({
        data: { userId: user.id, type: ["lesson_completed", "lab_solved", "quiz_passed"][i % 3], xp: [15, 200, 50][i % 3], date: ds },
      }).catch(() => {})
    }
  }

  // seed some course reviews
  const courses = await db.course.findMany({ select: { id: true, slug: true } })
  const reviewSeeds = [
    { courseSlug: "ceh", rating: 5, title: "Excellent real-world content", content: "The Nmap and exploitation modules alone are worth the price. Sarah's teaching style is incredibly practical." },
    { courseSlug: "ceh", rating: 4, title: "Great for CEH prep", content: "Passed my CEH exam last month thanks to this course. Would love more mobile security content." },
    { courseSlug: "ccna", rating: 5, title: "Best CCNA course online", content: "Raj explains subnetting in a way that finally clicked. The VLAN labs are fantastic." },
    { courseSlug: "ccna", rating: 4, title: "Solid foundation", content: "Very thorough. The OSI model lesson is the clearest explanation I've seen." },
    { courseSlug: "wapt", rating: 5, title: "Burp Suite mastery", content: "I went from never using Burp to feeling confident in real engagements. The OWASP module is gold." },
    { courseSlug: "wapt", rating: 5, title: "Practical and deep", content: "The SSRF and API security sections are eye-opening. Highly recommend for any web pentester." },
    { courseSlug: "cissp", rating: 5, title: "CISSP in 3 months", content: "The 8-domain breakdown is perfectly structured. Passed CISSP on first attempt. Thank you!" },
    { courseSlug: "rhcsa", rating: 4, title: "LVM section is perfect", content: "SELinux finally makes sense. The systemd module saved me hours at work." },
    { courseSlug: "cyberark-iam-pam", rating: 5, title: "Industry-relevant", content: "As a PAM consultant, this is the most accurate CyberArk course I've taken. PSMP coverage is rare." },
    { courseSlug: "ccnp-enterprise", rating: 4, title: "Deep BGP coverage", content: "Route reflectors and path attributes explained better than my official Cisco materials." },
  ]

  let reviewCount = 0
  for (const rs of reviewSeeds) {
    const course = courses.find((c) => c.slug === rs.courseSlug)
    if (!course) continue
    // pick a random demo student
    const studentEmail = DEMO_STUDENTS[reviewCount % DEMO_STUDENTS.length].email
    const student = await db.user.findUnique({ where: { email: studentEmail } })
    if (!student) continue
    const existing = await db.courseReview.findUnique({ where: { userId_courseId: { userId: student.id, courseId: course.id } } })
    if (existing) continue
    // ensure enrolled (required for review)
    const enrollExisting = await db.enrollment.findUnique({ where: { userId_courseId: { userId: student.id, courseId: course.id } } })
    if (!enrollExisting) {
      await db.enrollment.create({ data: { userId: student.id, courseId: course.id, progress: 100, completed: true } })
    }
    const created = await db.courseReview.create({
      data: { courseId: course.id, userId: student.id, rating: rs.rating, title: rs.title, content: rs.content },
    }).catch(() => null)
    if (created) reviewCount++
  }
  console.log(`Seeded ${reviewCount} course reviews`)

  // recompute course ratings from reviews
  for (const course of courses) {
    const reviews = await db.courseReview.findMany({ where: { courseId: course.id }, select: { rating: true } })
    if (reviews.length) {
      const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      await db.course.update({ where: { id: course.id }, data: { rating: Math.round(avg * 10) / 10 } })
    }
  }
  console.log("Updated course ratings")

  console.log("Done.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
