"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useSession } from "next-auth/react"

export function useBookmarks() {
  const { status } = useSession()
  const qc = useQueryClient()
  const isAuthenticated = status === "authenticated"

  const { data } = useQuery<{ bookmarks: { courseId: string }[] }>({
    queryKey: ["bookmarks"],
    queryFn: () => api("/api/bookmarks"),
    enabled: isAuthenticated, // Only fetch when authenticated
  })
  const bookmarkedIds = new Set((data?.bookmarks ?? []).map((b) => b.courseId))

  const toggle = useMutation({
    mutationFn: (courseId: string) =>
      api("/api/bookmarks", { method: "POST", body: JSON.stringify({ courseId }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  })

  return {
    bookmarkedIds,
    isBookmarked: (courseId: string) => bookmarkedIds.has(courseId),
    toggle: toggle.mutate,
    toggleAsync: toggle.mutateAsync,
    isToggling: toggle.isPending,
    isAuthenticated,
  }
}
