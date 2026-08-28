import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { levelFromXp } from "@/lib/gamification"

// Recommends courses based on:
// 1. Not yet enrolled
// 2. Level match (beginner→intermediate→advanced progression)
// 3. Category interest (based on enrolled course categories)
// 4. High ratings
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ recommendations: [] })

  const [enrollments, allCourses, gamified] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: user.id },
      include: { course: { select: { id: true, category: true, level: true } } },
    }),
    db.course.findMany({
      where: { published: true },
      include: {
        instructor: { select: { id: true, name: true, title: true } },
        modules: { select: { id: true, lessons: { select: { id: true } } } },
        _count: { select: { enrollments: true } },
      },
    }),
    db.user.findUnique({ where: { id: user.id }, select: { xp: true, level: true } }),
  ])

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId))
  const enrolledCategories = new Set(enrollments.map((e) => e.course.category))
  const enrolledLevels = enrollments.map((e) => e.course.level)

  const userLevel = levelFromXp(gamified?.xp ?? 0).level

  // Score each non-enrolled course
  const scored = allCourses
    .filter((c) => !enrolledCourseIds.has(c.id))
    .map((c) => {
      let score = 0
      // Category match: +30 if user has enrolled in same category
      if (enrolledCategories.has(c.category)) score += 30
      // Level progression: recommend next level up
      const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 }
      const maxEnrolledLevel = Math.max(0, ...enrolledLevels.map((l) => levelOrder[l as keyof typeof levelOrder] ?? 0))
      const courseLevel = levelOrder[c.level as keyof typeof levelOrder] ?? 1
      if (courseLevel === maxEnrolledLevel + 1) score += 25 // natural progression
      if (courseLevel === maxEnrolledLevel) score += 15 // same level
      // High rating bonus
      score += (c.rating - 4) * 10 // 4.5★ = +5, 5★ = +10
      // Popularity bonus
      score += Math.min(c.studentsCount / 1000, 10)
      // User level match
      if (userLevel >= 5 && courseLevel === 3) score += 10 // advanced users like advanced courses
      if (userLevel <= 3 && courseLevel === 1) score += 10 // beginners like beginner courses

      const lessonCount = c.modules.reduce((acc, m) => acc + m.lessons.length, 0)
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        shortName: c.shortName,
        description: c.description,
        category: c.category,
        level: c.level,
        durationHours: c.durationHours,
        rating: c.rating,
        studentsCount: c.studentsCount,
        color: c.color,
        certBody: c.certBody,
        instructor: c.instructor,
        lessonCount,
        score: Math.round(score),
        reasons: getReasons(c, enrolledCategories, enrolledLevels, maxEnrolledLevel),
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  return NextResponse.json({ recommendations: scored })
}

function getReasons(course: any, enrolledCategories: Set<string>, enrolledLevels: string[], maxEnrolledLevel: number): string[] {
  const reasons: string[] = []
  if (enrolledCategories.has(course.category)) reasons.push(`Matches your ${course.category} interest`)
  const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 }
  const courseLevel = levelOrder[course.level as keyof typeof levelOrder] ?? 1
  if (courseLevel === maxEnrolledLevel + 1) reasons.push("Natural next step")
  if (course.rating >= 4.7) reasons.push(`Highly rated (${course.rating}★)`)
  if (course.studentsCount > 10000) reasons.push("Popular choice")
  return reasons.slice(0, 2)
}
