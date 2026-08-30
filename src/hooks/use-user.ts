"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface UserStats {
  enrollments: number
  completed: number
  notes: number
  labsDone: number
  certificates: number
  avgScore: number
}

export interface GamificationInfo {
  xp: number
  level: number
  streak: number
  rank: string
  levelInfo: { level: number; currentLevelXp: number; nextLevelXp: number; progress: number }
}

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
  title: string | null
  bio: string | null
  schoolId: string | null
}

export function useUser() {
  const { data, isLoading, refetch } = useQuery<{ user: CurrentUser | null; stats: UserStats; gamification: GamificationInfo }>({
    queryKey: ["me"],
    queryFn: () => api("/api/me"),
  })
  return {
    user: data?.user ?? null,
    stats: data?.stats,
    gamification: data?.gamification,
    isLoading,
    refetch,
  }
}
