import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { levelFromXp, rankTitle } from "@/lib/gamification"

/**
 * GET /api/leaderboard
 *
 * Global leaderboard ranked by total XP. Returns the top 10 users and the
 * calling user's own entry (with `isMe` flag) so the dashboard can highlight
 * the current user's row even if they are not in the top 10.
 *
 * Response shape:
 *   {
 *     topUsers: [{ rank, id, name, title, avatar, xp, level, rankTitle, isMe }],
 *     currentUser: { rank, id, name, title, avatar, xp, level, rankTitle, isMe } | null,
 *     totalUsers: number
 *   }
 */
export async function GET() {
  const currentUser = await getCurrentUser()

  const [allUsers, totalUsers] = await Promise.all([
    db.user.findMany({
      orderBy: { xp: "desc" },
      select: {
        id: true,
        name: true,
        title: true,
        avatar: true,
        xp: true,
        level: true,
      },
    }),
    db.user.count(),
  ])

  const ranked = allUsers.map((u, idx) => {
    const levelInfo = levelFromXp(u.xp)
    return {
      rank: idx + 1,
      id: u.id,
      name: u.name,
      title: u.title,
      avatar: u.avatar,
      xp: u.xp,
      level: levelInfo.level,
      rankTitle: rankTitle(levelInfo.level),
      isMe: currentUser?.id === u.id,
    }
  })

  const topUsers = ranked.slice(0, 10)
  const currentUserEntry = currentUser
    ? ranked.find((r) => r.id === currentUser.id) ?? null
    : null

  return NextResponse.json({
    topUsers,
    currentUser: currentUserEntry,
    totalUsers,
  })
}
