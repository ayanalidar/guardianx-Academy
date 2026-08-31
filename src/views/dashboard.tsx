"use client"

/**
 * GUARDIANX // MISSION CONTROL
 * ----------------------------
 * Security Operations Center (SOC) for learning. A real-time operator
 * dashboard that surfaces the user's next mission, in-progress courses,
 * active lab environments, daily objective, achievements, leaderboard
 * standing, skill profile, and a chronological activity feed.
 *
 * All sections gracefully degrade: loading skeletons, intentional empty
 * states with CTAs, and color-coded status indicators throughout.
 */

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  Activity, ArrowRight, Award, BookMarked, BookOpen, Brain, Bug,
  ChevronRight, Clock, Crosshair, Crown, Flame, FlaskConical,
  GraduationCap, Library, Radar, Shield, ShieldCheck, StickyNote,
  Target, Terminal, TrendingUp, Trophy, Zap,
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useUser } from "@/hooks/use-user"
import { api } from "@/lib/api"
import { levelFromXp, rankTitle } from "@/lib/gamification"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "@/components/platform/motion-system"
import {
  LabCard, type LabDifficulty, MissionCard, RankBadge, StatTile,
  StatusDot, XPBar,
} from "@/components/cyber"

/* ============================================================
   Types
   ============================================================ */

interface CourseListItem {
  id: string; slug: string; title: string; shortName: string
  description: string; category: string; level: string; durationHours: number
  rating: number; studentsCount: number; color: string; thumbnail: string | null
  tags: string; certBody: string
  instructor: { id: string; name: string; title: string | null }
  lessonCount: number; moduleCount: number
  enrollment?: {
    progress: number; completed: boolean; lastAccessed: string | null
    enrolledAt: string
  } | null
}

interface LabListItem {
  id: string; slug: string; title: string; description: string
  longDescription: string; category: string; difficulty: string
  durationMin: number; points: number; tags: string; scenario: string
  objectives: string; hints: string; flag: string; commands: string
  virtualEnv: string; color: string; published: boolean
  progress: {
    status: string; flagFound: boolean; hintsUsed: number
    timeSpentMs: number; startedAt: string | null
    completedAt: string | null; updatedAt: string
  } | null
}

interface LeaderboardEntry {
  rank: number; id: string; name: string; title: string | null
  avatar: string | null; xp: number; level: number
  rankTitle: string; isMe: boolean
}

interface AchievementItem {
  code: string; title: string; description: string
  icon: string; color: string; xp: number; tier: string
  earned: boolean; earnedAt: string | null
}

interface ActivityItem {
  id: string; type: string; xp: number; meta: string
  date: string; createdAt: string
}

/* ============================================================
   Helpers
   ============================================================ */

const DIFFICULTY_MAP: Record<string, LabDifficulty> = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
  Insane: "Insane",
}

const ACTIVITY_META: Record<
  string,
  { icon: typeof BookOpen; label: string; color: string; tint: string }
> = {
  lesson_completed: {
    icon: BookOpen, label: "Lesson Completed", color: "text-cyan-300", tint: "bg-cyan-500/10",
  },
  lab_solved: {
    icon: Terminal, label: "Lab Solved", color: "text-violet-300", tint: "bg-violet-500/10",
  },
  quiz_passed: {
    icon: Brain, label: "Quiz Passed", color: "text-amber-300", tint: "bg-amber-500/10",
  },
  note_created: {
    icon: StickyNote, label: "Note Created", color: "text-emerald-300", tint: "bg-emerald-500/10",
  },
  course_enrolled: {
    icon: BookMarked, label: "Course Enrolled", color: "text-cyan-300", tint: "bg-cyan-500/10",
  },
  cert_earned: {
    icon: Award, label: "Certification Earned", color: "text-amber-300", tint: "bg-amber-500/10",
  },
}

const ACHIEVEMENT_ICON_MAP: Record<string, typeof BookOpen> = {
  BookOpen, GraduationCap, Terminal, Bug, Trophy, Brain, StickyNote,
  Library, Flame, Award, TrendingUp, ShieldCheck, BookMarked,
}

const ACHIEVEMENT_COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  red: "border-rose-500/40 bg-rose-500/10 text-rose-300",
}

const SKILL_CATEGORIES = [
  { key: "Web Security", label: "Web", color: "from-violet-500 to-violet-400" },
  { key: "Network", label: "Network", color: "from-cyan-500 to-cyan-400" },
  { key: "Cryptography", label: "Crypto", color: "from-amber-500 to-amber-400" },
  { key: "Forensics", label: "Forensics", color: "from-emerald-500 to-emerald-400" },
  { key: "Reverse Engineering", label: "Reverse", color: "from-rose-500 to-rose-400" },
  { key: "Governance", label: "Governance", color: "from-sky-500 to-sky-400" },
]

function relativeTime(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  })
}

function deriveServices(lab: LabListItem): string[] {
  const t = (lab.tags || "").toLowerCase()
  const out: string[] = []
  if (t.includes("ssh") || lab.commands?.includes("ssh")) out.push("SSH")
  if (t.includes("http") || t.includes("web")) out.push("HTTP")
  if (t.includes("ftp") || t.includes("smb")) out.push("FTP")
  if (t.includes("dns") || t.includes("smtp")) out.push("DNS")
  if (t.includes("mysql") || t.includes("sql")) out.push("MySQL")
  if (out.length === 0) out.push("SSH", "HTTP")
  return out.slice(0, 3)
}

function pseudoIp(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const a = (Math.abs(h) % 200) + 10
  const b = (Math.abs(h >> 8) % 200) + 10
  return `10.10.${a % 250}.${b % 250}`
}

/* ============================================================
   DashboardView — main export (kept name for back-compat)
   ============================================================ */

export function DashboardView() {
  const { user, stats, gamification, isLoading: userLoading } = useUser()

  const { data: meData } = useQuery<{
    activities?: ActivityItem[]
  }>({
    queryKey: ["me"],
    queryFn: async () => {
      try { return await api("/api/me") } catch { return { activities: [] } }
    },
    retry: false,
  })

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ courses: CourseListItem[] }>({
    queryKey: ["courses", "dashboard-enrolled"],
    queryFn: async () => {
      try { return await api(`/api/courses?enrolled=true&userId=${user?.id ?? ""}&status=in-progress`) } catch { return { courses: [] } }
    },
    enabled: !!user?.id,
    retry: false,
  })

  const { data: labsData, isLoading: labsLoading } = useQuery<{ labs: LabListItem[] }>({
    queryKey: ["labs", "dashboard"],
    queryFn: async () => {
      try { return await api("/api/labs") } catch { return { labs: [] } }
    },
    retry: false,
  })

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery<{
    topUsers: LeaderboardEntry[]
    currentUser: LeaderboardEntry | null
    totalUsers: number
  }>({
    queryKey: ["leaderboard", "dashboard"],
    queryFn: async () => {
      try { return await api("/api/leaderboard") } catch { return { topUsers: [], currentUser: null, totalUsers: 0 } }
    },
    retry: false,
  })

  const { data: achievementsData, isLoading: achievementsLoading } = useQuery<{
    achievements: AchievementItem[]
    earnedCount: number
    totalCount: number
  }>({
    queryKey: ["achievements", "dashboard"],
    queryFn: async () => {
      try { return await api("/api/achievements") } catch { return { achievements: [], earnedCount: 0, totalCount: 0 } }
    },
    enabled: !!user?.id,
    retry: false,
  })

  const activities = meData?.activities ?? []
  const enrolledCourses = (coursesData?.courses ?? []).filter(
    (c) => c.enrollment && !c.enrollment.completed,
  )
  const labs = labsData?.labs ?? []

  // Current mission = first lab the user hasn't completed
  const currentMission = labs.find(
    (l) => !l.progress || l.progress.status !== "completed",
  )

  // Active labs = labs the user has started (in-progress)
  const activeLabs = labs.filter((l) => l.progress?.status === "in_progress")

  // Skill profile = completion percentage per category
  const skillProfile = React.useMemo(() => {
    return SKILL_CATEGORIES.map((cat) => {
      const total = labs.filter((l) => l.category === cat.key).length
      const solved = labs.filter(
        (l) => l.category === cat.key && l.progress?.status === "completed",
      ).length
      const pct = total > 0 ? Math.round((solved / total) * 100) : 0
      return { ...cat, total, solved, pct }
    })
  }, [labs])

  const xp = gamification?.xp ?? 0
  const levelInfo = gamification?.levelInfo ?? levelFromXp(0)
  const rank = gamification?.rank ?? rankTitle(1)
  const streak = gamification?.streak ?? 0
  const level = gamification?.level ?? 1

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background — SOC grid */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ====================================================
            1. HEADER STRIP — WELCOME BACK, [NAME]
            ==================================================== */}
        <HeaderStrip
          userName={user?.name ?? "Operator"}
          rank={rank}
          level={level}
          loading={userLoading}
          labCount={labs.length}
        />

        {/* ====================================================
            2. STATS ROW — 4 StatTiles
            ==================================================== */}
        <StatsRow
          level={level}
          levelInfo={levelInfo}
          xp={xp}
          streak={streak}
          rank={rank}
          loading={userLoading}
        />

        {/* ====================================================
            3. MAIN GRID — LEFT (60%) + RIGHT (40%)
            ==================================================== */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-6">
            {/* CURRENT MISSION */}
            <ScrollReveal>
              <CurrentMission
                lab={currentMission}
                loading={labsLoading}
              />
            </ScrollReveal>

            {/* CONTINUE LEARNING */}
            <ScrollReveal delay={0.05}>
              <ContinueLearning
                courses={enrolledCourses.slice(0, 3)}
                loading={coursesLoading}
              />
            </ScrollReveal>

            {/* ACTIVE LABS */}
            <ScrollReveal delay={0.1}>
              <ActiveLabs
                labs={activeLabs}
                loading={labsLoading}
              />
            </ScrollReveal>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* DAILY OBJECTIVE */}
            <ScrollReveal>
              <DailyObjective labsSolvedToday={0} />
            </ScrollReveal>

            {/* ACHIEVEMENTS */}
            <ScrollReveal delay={0.05}>
              <AchievementsPanel
                achievements={achievementsData?.achievements ?? []}
                earnedCount={achievementsData?.earnedCount ?? 0}
                totalCount={achievementsData?.totalCount ?? 0}
                loading={achievementsLoading}
              />
            </ScrollReveal>

            {/* LEADERBOARD */}
            <ScrollReveal delay={0.1}>
              <LeaderboardPanel
                topUsers={leaderboardData?.topUsers ?? []}
                currentUser={leaderboardData?.currentUser ?? null}
                totalUsers={leaderboardData?.totalUsers ?? 0}
                loading={leaderboardLoading}
              />
            </ScrollReveal>

            {/* SKILL PROFILE */}
            <ScrollReveal delay={0.15}>
              <SkillProfile skills={skillProfile} />
            </ScrollReveal>
          </div>
        </div>

        {/* ====================================================
            4. ACTIVITY FEED — recent activity timeline
            ==================================================== */}
        <ScrollReveal>
          <ActivityFeed activities={activities.slice(0, 5)} loading={userLoading} />
        </ScrollReveal>
      </div>
    </div>
  )
}

/* ============================================================
   1. Header Strip
   ============================================================ */

function HeaderStrip({
  userName, rank, level, loading, labCount,
}: {
  userName: string
  rank: string
  level: number
  loading: boolean
  labCount: number
}) {
  const [now, setNow] = React.useState<Date>(() => new Date())
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm",
        "scanlines px-4 sm:px-6 py-4",
      )}
    >
      <div className="absolute inset-0 bg-grid-fine opacity-30 pointer-events-none" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT — brand + user identity */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            aria-hidden
          >
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/90">
              GUARDIANX // MISSION CONTROL
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                <span className="text-muted-foreground font-normal">Welcome back,</span>{" "}
                <span className="text-foreground">{userName}</span>
              </h1>
              {!loading && (
                <RankBadge rank={rank} level={level} size="sm" />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — live status indicators */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <StatusDot status="online" pulse size="sm" label="Systems Online" />
          <StatusDot
            status={labCount > 0 ? "online" : "idle"}
            pulse={labCount > 0}
            size="sm"
            label={`${labCount} Labs Available`}
          />
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3.5 text-cyan-400" aria-hidden />
            <span className="tabular-nums text-cyan-200/90">{formatClock(now)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

/* ============================================================
   2. Stats Row — 4 StatTiles
   ============================================================ */

function StatsRow({
  level, levelInfo, xp, streak, rank, loading,
}: {
  level: number
  levelInfo: { currentLevelXp: number; nextLevelXp: number; progress: number }
  xp: number
  streak: number
  rank: string
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[112px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[64px] rounded-xl" />
      </div>
    )
  }

  return (
    <section aria-label="Operator metrics" className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={ShieldCheck}
          label={`Level ${level} · ${levelInfo.currentLevelXp}/${levelInfo.nextLevelXp} XP`}
          value={level}
          suffix=""
          color="text-violet-300"
          tint="bg-violet-500/10"
        />
        <StatTile
          icon={Zap}
          label="Total XP"
          value={xp}
          color="text-amber-300"
          tint="bg-amber-500/10"
        />
        <StatTile
          icon={Flame}
          label="Streak"
          value={streak}
          suffix="days"
          color="text-rose-300"
          tint="bg-rose-500/10"
        />
        <StatTile
          icon={Crown}
          label="Current Rank"
          value={rank}
          color="text-emerald-300"
          tint="bg-emerald-500/10"
        />
      </div>
      <div className="card-premium rounded-xl px-4 py-3">
        <XPBar
          current={levelInfo.currentLevelXp}
          max={levelInfo.nextLevelXp}
          level={level}
        />
      </div>
    </section>
  )
}

/* ============================================================
   3a. Current Mission — MissionCard or empty state
   ============================================================ */

function CurrentMission({
  lab, loading,
}: {
  lab: LabListItem | undefined
  loading: boolean
}) {
  const { navigate } = useAppStore()

  if (loading) {
    return (
      <section aria-label="Current mission">
        <SectionHeader icon={Crosshair} label="Current Mission" tone="violet" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </section>
    )
  }

  if (!lab) {
    return (
      <section aria-label="Current mission">
        <SectionHeader icon={Crosshair} label="Current Mission" tone="violet" />
        <EmptyState
          title="No Active Mission"
          description="Your next mission is waiting. Browse the lab catalog and pick your first target."
          ctaLabel="Explore Labs"
          onCta={() => navigate({ name: "labs" })}
          icon={Crosshair}
          accent="violet"
        />
      </section>
    )
  }

  return (
    <section aria-label="Current mission">
      <SectionHeader icon={Crosshair} label="Current Mission" tone="violet" />
      <MissionCard
        title={lab.title}
        objective={lab.description || "Capture the flag to complete this mission."}
        difficulty={DIFFICULTY_MAP[lab.difficulty] ?? "Medium"}
        xp={lab.points}
        timeElapsed={lab.progress?.startedAt ? relativeTime(lab.progress.startedAt) : undefined}
        onLaunch={() => navigate({ name: "lab", labSlug: lab.slug })}
        onSubmit={() => navigate({ name: "lab", labSlug: lab.slug })}
      />
    </section>
  )
}

/* ============================================================
   3b. Continue Learning — courses in progress
   ============================================================ */

function ContinueLearning({
  courses, loading,
}: {
  courses: CourseListItem[]
  loading: boolean
}) {
  const { navigate } = useAppStore()

  return (
    <section aria-label="Continue learning">
      <SectionHeader
        icon={BookOpen}
        label="Continue Learning"
        tone="cyan"
        actionLabel="View All Courses"
        onAction={() => navigate({ name: "learning" })}
      />

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No Courses In Progress"
          description="You haven't started any courses yet. Browse the catalog and enroll to begin your training."
          ctaLabel="Browse Catalog"
          onCta={() => navigate({ name: "catalog" })}
          icon={BookOpen}
          accent="cyan"
        />
      ) : (
        <div className="grid gap-3">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ name: "course", courseId: c.id })}
              className="group card-premium relative flex items-center gap-4 rounded-xl p-4 text-left"
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-lg border border-border/50 font-mono text-sm font-bold",
                  "bg-violet-500/10 text-violet-200",
                )}
                aria-hidden
              >
                {c.shortName.slice(0, 4)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-semibold text-sm text-foreground group-hover:text-violet-200 transition-colors">
                    {c.title}
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                    {c.enrollment?.progress ?? 0}%
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                  {c.category} · {c.lessonCount} lessons · {c.durationHours}h
                </p>
                <div className="mt-2">
                  <Progress value={c.enrollment?.progress ?? 0} className="h-1.5" />
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-violet-300 transition-colors" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

/* ============================================================
   3c. Active Labs — running lab environments
   ============================================================ */

function ActiveLabs({
  labs, loading,
}: {
  labs: LabListItem[]
  loading: boolean
}) {
  const { navigate } = useAppStore()

  return (
    <section aria-label="Active labs">
      <SectionHeader
        icon={FlaskConical}
        label="Active Labs"
        tone="emerald"
        actionLabel="Browse Labs"
        onAction={() => navigate({ name: "labs" })}
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] rounded-xl" />
          ))}
        </div>
      ) : labs.length === 0 ? (
        <EmptyState
          title="No Active Labs"
          description="Start a new lab environment. Browse the cyber range and spin up your first target."
          ctaLabel="Browse Labs"
          onCta={() => navigate({ name: "labs" })}
          icon={FlaskConical}
          accent="emerald"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {labs.slice(0, 4).map((lab) => (
            <LabCard
              key={lab.id}
              title={lab.title}
              category={lab.category}
              difficulty={DIFFICULTY_MAP[lab.difficulty] ?? "Medium"}
              xp={lab.points}
              status="online"
              ip={pseudoIp(lab.id)}
              services={deriveServices(lab)}
              onClick={() => navigate({ name: "lab", labSlug: lab.slug })}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/* ============================================================
   3d. Daily Objective
   ============================================================ */

function DailyObjective({ labsSolvedToday }: { labsSolvedToday: number }) {
  const target = 1
  const done = Math.min(labsSolvedToday, target)
  const complete = done >= target
  const progressPct = Math.round((done / target) * 100)

  return (
    <section aria-label="Daily objective">
      <SectionHeader icon={Target} label="Daily Objective" tone="amber" />
      <div className="card-premium relative overflow-hidden rounded-xl p-5 scanlines">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.15 85 / 0.4), transparent 70%)",
          }}
        />
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">
                Complete one Web Security lab
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Resets at 00:00 UTC
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 font-mono text-[10px]",
                complete
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300",
              )}
            >
              {complete ? "COMPLETE" : "IN PROGRESS"}
            </Badge>
          </div>

          <div>
            <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
              <span className="uppercase tracking-wider text-muted-foreground">
                Progress
              </span>
              <span className="tabular-nums text-foreground">
                {done}/{target}
              </span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Reward
            </span>
            <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-amber-300">
              <Zap className="size-3.5" aria-hidden />
              +250 XP
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   3e. Achievements — recent badges (grid of 6)
   ============================================================ */

function AchievementsPanel({
  achievements, earnedCount, totalCount, loading,
}: {
  achievements: AchievementItem[]
  earnedCount: number
  totalCount: number
  loading: boolean
}) {
  const { navigate } = useAppStore()
  const earned = achievements.filter((a) => a.earned).slice(0, 6)

  return (
    <section aria-label="Achievements">
      <SectionHeader
        icon={Award}
        label="Achievements"
        tone="violet"
        actionLabel="View All"
        onAction={() => navigate({ name: "achievements" })}
      />

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="card-premium rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Earned Badges
            </span>
            <span className="font-mono text-[11px] tabular-nums text-violet-300">
              {earnedCount} / {totalCount}
            </span>
          </div>

          {earned.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-6 text-center">
              <Award className="mx-auto size-6 text-muted-foreground/60" aria-hidden />
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                No badges earned yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Complete lessons and labs to unlock achievements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {earned.map((a) => {
                const Icon = ACHIEVEMENT_ICON_MAP[a.icon] ?? Award
                const colorClass =
                  ACHIEVEMENT_COLOR_MAP[a.color] ?? ACHIEVEMENT_COLOR_MAP.violet
                return (
                  <div
                    key={a.code}
                    title={`${a.title} — ${a.description}`}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-transform hover:scale-[1.04]",
                      colorClass,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    <span className="font-mono text-[9px] uppercase tracking-wider leading-tight">
                      {a.title}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

/* ============================================================
   3f. Leaderboard — Top 5 + user's rank
   ============================================================ */

function LeaderboardPanel({
  topUsers, currentUser, totalUsers, loading,
}: {
  topUsers: LeaderboardEntry[]
  currentUser: LeaderboardEntry | null
  totalUsers: number
  loading: boolean
}) {
  const { navigate } = useAppStore()
  const top5 = topUsers.slice(0, 5)
  const showUserRow =
    currentUser && !top5.some((u) => u.id === currentUser.id)

  return (
    <section aria-label="Leaderboard">
      <SectionHeader
        icon={Trophy}
        label="Leaderboard"
        tone="amber"
        actionLabel="View Full"
        onAction={() => navigate({ name: "leaderboard" })}
      />

      {loading ? (
        <Skeleton className="h-[260px] rounded-xl" />
      ) : (
        <div className="card-premium rounded-xl p-4 space-y-1.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Top Operators
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {totalUsers.toLocaleString()} total
            </span>
          </div>

          {top5.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
              <Trophy className="mx-auto size-6 text-muted-foreground/60" aria-hidden />
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                No rankings yet
              </p>
            </div>
          ) : (
            <ol className="space-y-1">
              {top5.map((u) => (
                <LeaderboardRow key={u.id} entry={u} />
              ))}
              {showUserRow && currentUser && (
                <>
                  <li className="my-1 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    <span className="h-px flex-1 bg-border/40" />
                    <span>· · ·</span>
                    <span className="h-px flex-1 bg-border/40" />
                  </li>
                  <LeaderboardRow entry={currentUser} />
                </>
              )}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const rankColor =
    entry.rank === 1
      ? "text-amber-300"
      : entry.rank === 2
        ? "text-slate-300"
        : entry.rank === 3
          ? "text-orange-300"
          : "text-muted-foreground"

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
        entry.isMe
          ? "border border-violet-500/40 bg-violet-500/10"
          : "hover:bg-muted/30",
      )}
    >
      <span
        className={cn(
          "w-6 shrink-0 text-center font-mono text-sm font-bold tabular-nums",
          rankColor,
        )}
        aria-hidden
      >
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {entry.name}
          {entry.isMe && (
            <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wider text-violet-300">
              · YOU
            </span>
          )}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Lvl {entry.level} · {entry.rankTitle}
        </p>
      </div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-amber-300">
        {entry.xp.toLocaleString()} XP
      </span>
    </li>
  )
}

/* ============================================================
   3g. Skill Profile — 6 skill bars
   ============================================================ */

function SkillProfile({
  skills,
}: {
  skills: Array<{
    key: string; label: string; color: string
    total: number; solved: number; pct: number
  }>
}) {
  const { navigate } = useAppStore()
  return (
    <section aria-label="Skill profile">
      <SectionHeader
        icon={Radar}
        label="Skill Profile"
        tone="cyan"
        actionLabel="Explore Skill Tree"
        onAction={() => navigate({ name: "skill-tree" })}
      />
      <div className="card-premium rounded-xl p-4 space-y-3">
        {skills.map((s) => (
          <div key={s.key} className="space-y-1">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="uppercase tracking-wider text-foreground/90">
                {s.label}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {s.solved}/{s.total} · {s.pct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full border border-border/40 bg-[oklch(0.1_0.008_270)]">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", s.color)}
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   4. Activity Feed — recent activity timeline
   ============================================================ */

function ActivityFeed({
  activities, loading,
}: {
  activities: ActivityItem[]
  loading: boolean
}) {
  const { navigate } = useAppStore()

  return (
    <section aria-label="Recent activity">
      <SectionHeader
        icon={Activity}
        label="Activity Feed"
        tone="emerald"
        actionLabel="View Analytics"
        onAction={() => navigate({ name: "learning-analytics" })}
      />

      {loading ? (
        <Skeleton className="h-[220px] rounded-xl" />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No Activity Yet"
          description="Your recent activity will appear here as you complete lessons, solve labs, and earn achievements."
          ctaLabel="Start Learning"
          onCta={() => navigate({ name: "catalog" })}
          icon={Activity}
          accent="emerald"
        />
      ) : (
        <div className="card-premium rounded-xl p-4 sm:p-5">
          <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border/50">
            {activities.map((a, idx) => {
              const meta = ACTIVITY_META[a.type] ?? {
                icon: Activity,
                label: a.type.replace(/_/g, " "),
                color: "text-muted-foreground",
                tint: "bg-muted/30",
              }
              const Icon = meta.icon
              return (
                <li
                  key={a.id}
                  className="relative flex items-start gap-3"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span
                    className={cn(
                      "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50",
                      meta.tint,
                      meta.color,
                    )}
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <p className="text-sm font-medium text-foreground">
                        {meta.label}
                      </p>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {relativeTime(a.createdAt)}
                      </span>
                    </div>
                    {a.meta && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground font-mono">
                        {a.meta}
                      </p>
                    )}
                    {a.xp > 0 && (
                      <span className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                        <Zap className="size-3" aria-hidden />
                        +{a.xp} XP
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}

/* ============================================================
   Shared building blocks
   ============================================================ */

const TONE_MAP: Record<string, { text: string; icon: string }> = {
  violet: { text: "text-violet-300", icon: "text-violet-300" },
  cyan: { text: "text-cyan-300", icon: "text-cyan-300" },
  emerald: { text: "text-emerald-300", icon: "text-emerald-300" },
  amber: { text: "text-amber-300", icon: "text-amber-300" },
  rose: { text: "text-rose-300", icon: "text-rose-300" },
}

function SectionHeader({
  icon: Icon, label, tone = "violet", actionLabel, onAction,
}: {
  icon: typeof BookOpen
  label: string
  tone?: keyof typeof TONE_MAP | string
  actionLabel?: string
  onAction?: () => void
}) {
  const t = TONE_MAP[tone] ?? TONE_MAP.violet
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-3.5", t.icon)} aria-hidden />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/90">
          {label}
        </h2>
      </div>
      {actionLabel && onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="h-7 gap-1 px-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {actionLabel}
          <ChevronRight className="size-3" aria-hidden />
        </Button>
      )}
    </div>
  )
}

const ACCENT_MAP: Record<string, { border: string; bg: string; text: string }> = {
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/5", text: "text-violet-300" },
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/5", text: "text-cyan-300" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-300" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-300" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/5", text: "text-rose-300" },
}

function EmptyState({
  title, description, ctaLabel, onCta, icon: Icon, accent = "violet",
}: {
  title: string
  description: string
  ctaLabel: string
  onCta: () => void
  icon: typeof BookOpen
  accent?: keyof typeof ACCENT_MAP | string
}) {
  const a = ACCENT_MAP[accent] ?? ACCENT_MAP.violet
  return (
    <div
      className={cn(
        "card-premium relative overflow-hidden rounded-xl border border-dashed p-8 text-center",
        a.border, a.bg,
      )}
    >
      <div className="absolute inset-0 bg-grid-fine opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <div
          className={cn(
            "mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border",
            a.border, a.bg, a.text,
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </div>
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
        <Button
          onClick={onCta}
          size="sm"
          className={cn(
            "mt-4 gap-1.5 font-mono text-[11px] uppercase tracking-wider",
            "bg-primary hover:bg-primary/90",
          )}
        >
          {ctaLabel}
          <ArrowRight className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
