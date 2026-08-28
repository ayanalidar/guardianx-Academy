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

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
  title: string | null
  bio: string | null
}

export function useUser() {
  const { data, isLoading, refetch } = useQuery<{ user: CurrentUser | null; stats: UserStats }>({
    queryKey: ["me"],
    queryFn: () => api("/api/me"),
  })
  return {
    user: data?.user ?? null,
    stats: data?.stats,
    isLoading,
    refetch,
  }
}
