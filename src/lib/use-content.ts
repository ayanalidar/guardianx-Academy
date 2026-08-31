"use client"

import { useQuery } from "@tanstack/react-query"

/**
 * Fetch all editable content for a given page (e.g. "home", "global", "impact").
 * Returns the shape: { page, sections: { [section]: { [key]: value } } }
 *
 * The endpoint is PUBLIC (no auth) so it works on logged-out pages too.
 */
export function usePageContent(page: string) {
  return useQuery({
    queryKey: ["cms-content", page],
    queryFn: async () => {
      const res = await fetch(`/api/cms/${page}`)
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 60_000,
  })
}

/**
 * Safely get a string value from CMS data.
 */
export function getContent(
  data: any,
  section: string,
  key: string,
  fallback = ""
): string {
  const v = data?.sections?.[section]?.[key]
  return typeof v === "string" ? v : fallback
}

/**
 * Safely get an array value from CMS data.
 */
export function getContentArray<T = any>(
  data: any,
  section: string,
  key: string,
  fallback: T[] = []
): T[] {
  const v = data?.sections?.[section]?.[key]
  return Array.isArray(v) ? (v as T[]) : fallback
}

/**
 * Safely get any (object | primitive) value from CMS data.
 */
export function getContentValue<T = any>(
  data: any,
  section: string,
  key: string,
  fallback: T
): T {
  const v = data?.sections?.[section]?.[key]
  return v === undefined ? fallback : (v as T)
}
