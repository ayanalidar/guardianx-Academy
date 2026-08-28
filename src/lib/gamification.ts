import { db } from "@/lib/db"

// XP rewards per activity
export const XP_REWARDS = {
  lesson_completed: 15,
  lab_solved: { Easy: 100, Medium: 200, Hard: 400, Insane: 800 } as Record<string, number>,
  quiz_passed: 50,
  note_created: 5,
  course_enrolled: 25,
  cert_earned: 300,
} as const

// Level curve: level N requires N*200 XP cumulative (1->2 needs 400, 2->3 needs 600, etc.)
export function xpForLevel(level: number): number {
  return level * 200
}

export function levelFromXp(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number } {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  const need = xpForLevel(level)
  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp: need,
    progress: Math.round((remaining / need) * 100),
  }
}

export function rankTitle(level: number): string {
  if (level >= 30) return "Cyber Legend"
  if (level >= 20) return "Security Expert"
  if (level >= 15) return "Senior Guardian"
  if (level >= 10) return "Guardian"
  if (level >= 5) return "Sentinel"
  if (level >= 2) return "Apprentice"
  return "Novice"
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Award XP, update streak, log activity, and check achievements.
export async function awardXp(
  userId: string,
  type: keyof typeof XP_REWARDS,
  xp: number,
  meta: string = ""
): Promise<{ newAchievements: any[]; leveledUp: boolean; newLevel: number }> {
  const today = todayStr()
  const user = await db.user.findUnique({ where: { id: userId }, select: { lastActiveDate: true, streak: true, xp: true, level: true } })
  if (!user) return { newAchievements: [], leveledUp: false, newLevel: 1 }

  // streak update
  let newStreak = user.streak
  if (user.lastActiveDate !== today) {
    if (user.lastActiveDate === yesterdayStr()) {
      newStreak = user.streak + 1
    } else {
      newStreak = 1
    }
  }

  const oldLevel = levelFromXp(user.xp).level
  const newXp = user.xp + xp
  const newLevel = levelFromXp(newXp).level
  const leveledUp = newLevel > oldLevel

  await db.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel, streak: newStreak, lastActiveDate: today },
  })

  // log activity (only one per type per day to avoid spam — but allow multiple)
  await db.userActivity.create({
    data: { userId, type, xp, meta, date: today },
  })

  // check achievements
  const newAchievements = await checkAchievements(userId, type)

  return { newAchievements, leveledUp, newLevel }
}

// Achievement definitions checked dynamically.
const ACHIEVEMENT_DEFS = [
  { code: "FIRST_LESSON", title: "First Steps", description: "Complete your first lesson", icon: "BookOpen", color: "emerald", xp: 25, tier: "bronze", check: async (s: any) => s.lessonsCompleted >= 1 },
  { code: "LESSONS_10", title: "Scholar", description: "Complete 10 lessons", icon: "GraduationCap", color: "cyan", xp: 100, tier: "bronze", check: async (s: any) => s.lessonsCompleted >= 10 },
  { code: "FIRST_LAB", title: "Script Kiddie No More", description: "Solve your first lab", icon: "Terminal", color: "violet", xp: 50, tier: "bronze", check: async (s: any) => s.labsSolved >= 1 },
  { code: "LABS_5", title: "Bug Hunter", description: "Solve 5 labs", icon: "Bug", color: "violet", xp: 150, tier: "silver", check: async (s: any) => s.labsSolved >= 5 },
  { code: "LABS_ALL", title: "Lab Conqueror", description: "Solve all labs", icon: "Trophy", color: "amber", xp: 500, tier: "gold", check: async (s: any) => s.labsTotal > 0 && s.labsSolved >= s.labsTotal },
  { code: "QUIZ_ACED", title: "Quiz Master", description: "Pass a quiz with 100%", icon: "Brain", color: "cyan", xp: 75, tier: "silver", check: async (s: any) => s.perfectQuizzes >= 1 },
  { code: "NOTE_TAKER", title: "Note Taker", description: "Create your first note", icon: "StickyNote", color: "amber", xp: 15, tier: "bronze", check: async (s: any) => s.notes >= 1 },
  { code: "NOTES_20", title: "Knowledge Keeper", description: "Create 20 notes", icon: "Library", color: "amber", xp: 100, tier: "silver", check: async (s: any) => s.notes >= 20 },
  { code: "STREAK_3", title: "On a Roll", description: "Maintain a 3-day streak", icon: "Flame", color: "orange", xp: 50, tier: "bronze", check: async (s: any) => s.streak >= 3 },
  { code: "STREAK_7", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "Flame", color: "red", xp: 150, tier: "silver", check: async (s: any) => s.streak >= 7 },
  { code: "COURSE_DONE", title: "Certified", description: "Complete your first course", icon: "Award", color: "amber", xp: 200, tier: "gold", check: async (s: any) => s.coursesCompleted >= 1 },
  { code: "LEVEL_5", title: "Rising Guardian", description: "Reach level 5", icon: "TrendingUp", color: "emerald", xp: 100, tier: "silver", check: async (s: any) => s.level >= 5 },
  { code: "LEVEL_10", title: "Guardian Elite", description: "Reach level 10", icon: "ShieldCheck", color: "emerald", xp: 300, tier: "gold", check: async (s: any) => s.level >= 10 },
  { code: "ENROLLED_3", title: "Lifelong Learner", description: "Enroll in 3 courses", icon: "BookMarked", color: "cyan", xp: 75, tier: "bronze", check: async (s: any) => s.enrollments >= 3 },
]

async function computeStats(userId: string) {
  const [lessonsCompleted, labsSolved, labsTotal, perfectQuizzes, notes, coursesCompleted, enrollments, user] = await Promise.all([
    db.lessonProgress.count({ where: { userId, completed: true } }),
    db.labProgress.count({ where: { userId, status: "completed" } }),
    db.lab.count({ where: { published: true } }),
    db.quizAttempt.count({ where: { userId, score: 100 } }),
    db.note.count({ where: { userId } }),
    db.enrollment.count({ where: { userId, completed: true } }),
    db.enrollment.count({ where: { userId } }),
    db.user.findUnique({ where: { id: userId }, select: { streak: true, level: true, xp: true } }),
  ])
  return {
    lessonsCompleted,
    labsSolved,
    labsTotal,
    perfectQuizzes,
    notes,
    coursesCompleted,
    enrollments,
    streak: user?.streak ?? 0,
    level: user?.level ?? 1,
    xp: user?.xp ?? 0,
  }
}

export async function checkAchievements(userId: string, _triggerType?: string) {
  const stats = await computeStats(userId)
  const earned = await db.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  })
  const earnedCodes = new Set(earned.map((e) => e.achievement.code))
  const newOnes: any[] = []

  for (const def of ACHIEVEMENT_DEFS) {
    if (earnedCodes.has(def.code)) continue
    const ok = await def.check(stats)
    if (ok) {
      // ensure achievement definition exists
      let ach = await db.achievement.findUnique({ where: { code: def.code } })
      if (!ach) {
        ach = await db.achievement.create({
          data: {
            code: def.code,
            title: def.title,
            description: def.description,
            icon: def.icon,
            color: def.color,
            xp: def.xp,
            tier: def.tier,
          },
        })
      }
      const ua = await db.userAchievement.create({
        data: { userId, achievementId: ach.id },
        include: { achievement: true },
      })
      newOnes.push(ua.achievement)
      // bonus XP from achievement
      await db.user.update({ where: { id: userId }, data: { xp: { increment: def.xp } } })
    }
  }
  return newOnes
}

export { ACHIEVEMENT_DEFS }
