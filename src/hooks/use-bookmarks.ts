"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useBookmarks() {
  const qc = useQueryClient()
  const { data } = useQuery<{ bookmarks: { courseId: string }[] }>({
    queryKey: ["bookmarks"],
    queryFn: () => api("/api/bookmarks"),
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
  }
}
