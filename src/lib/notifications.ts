import { db } from "@/lib/db"

// Create a notification for a user.
export async function createNotification(params: {
  userId: string
  type: string // achievement | level_up | course_update | live_start | reply | streak | welcome | certificate | lab_solved | quiz_passed
  title: string
  message: string
  icon?: string
  color?: string
  link?: string // JSON-encoded view target
}): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        icon: params.icon ?? "bell",
        color: params.color ?? "emerald",
        link: params.link ?? null,
      },
    })
  } catch (e) {
    console.error("[notification] failed to create:", e)
  }
}

// Award-related helper that also fires a notification.
export async function notifyAchievement(userId: string, achievement: { code: string; title: string; description: string; xp: number; icon?: string; color?: string }) {
  await createNotification({
    userId,
    type: "achievement",
    title: `Achievement Unlocked: ${achievement.title}`,
    message: `${achievement.description} (+${achievement.xp} XP)`,
    icon: achievement.icon ?? "trophy",
    color: achievement.color ?? "amber",
    link: JSON.stringify({ name: "achievements" }),
  })
}

export async function notifyLevelUp(userId: string, newLevel: number, rank: string) {
  await createNotification({
    userId,
    type: "level_up",
    title: `Level Up! You reached level ${newLevel}`,
    message: `You've been promoted to ${rank}. Keep going!`,
    icon: "crown",
    color: "amber",
    link: JSON.stringify({ name: "achievements" }),
  })
}

export async function notifyCertificate(userId: string, courseTitle: string, courseId: string) {
  await createNotification({
    userId,
    type: "certificate",
    title: `Certificate Earned: ${courseTitle}`,
    message: "Congratulations! Your certificate of completion is ready.",
    icon: "award",
    color: "amber",
    link: JSON.stringify({ name: "certificates" }),
  })
}
