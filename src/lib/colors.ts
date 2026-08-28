export const COURSE_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string; ring: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    gradient: "from-emerald-500/20 via-emerald-600/5 to-transparent",
    ring: "ring-emerald-500/30",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    gradient: "from-cyan-500/20 via-cyan-600/5 to-transparent",
    ring: "ring-cyan-500/30",
  },
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/30",
    gradient: "from-teal-500/20 via-teal-600/5 to-transparent",
    ring: "ring-teal-500/30",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    gradient: "from-red-500/20 via-red-600/5 to-transparent",
    ring: "ring-red-500/30",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/30",
    gradient: "from-violet-500/20 via-violet-600/5 to-transparent",
    ring: "ring-violet-500/30",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    gradient: "from-amber-500/20 via-amber-600/5 to-transparent",
    ring: "ring-amber-500/30",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    gradient: "from-orange-500/20 via-orange-600/5 to-transparent",
    ring: "ring-orange-500/30",
  },
}

export function colorFor(name: string) {
  return COURSE_COLORS[name] ?? COURSE_COLORS.emerald
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Hard: "text-red-400 bg-red-500/10 border-red-500/30",
  Insane: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
}

export const LEVEL_COLORS: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Advanced: "text-red-400 bg-red-500/10 border-red-500/30",
}

export const NOTE_COLORS = [
  { id: "default", bg: "bg-card", border: "border-border" },
  { id: "emerald", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { id: "amber", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { id: "cyan", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { id: "violet", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  { id: "rose", bg: "bg-rose-500/10", border: "border-rose-500/30" },
]
