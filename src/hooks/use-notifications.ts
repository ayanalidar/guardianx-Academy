"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  icon: string
  color: string
  link: { name: string; [k: string]: any } | null
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const qc = useQueryClient()
  const { data, isLoading, refetch } = useQuery<{ notifications: AppNotification[]; unreadCount: number }>({
    queryKey: ["notifications"],
    queryFn: () => api("/api/notifications"),
    refetchInterval: 30000, // poll every 30s for new notifications
  })

  const markAllRead = useMutation({
    mutationFn: () => api("/api/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const deleteNotif = useMutation({
    mutationFn: (id: string) => api(`/api/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    refetch,
    markAllRead,
    markRead,
    deleteNotif,
  }
}
