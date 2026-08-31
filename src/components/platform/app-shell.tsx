"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Shield, LayoutDashboard, BookOpen, GraduationCap, StickyNote,
  Radio, FlaskConical, Award, Users, User, LogOut, Menu, X,
  Search, Sun, Moon, Bell, Terminal, ChevronRight, Settings,
  Trophy, Zap, Flame, Crown, CheckCheck, Sparkles, Presentation,
  ClipboardList, MessageSquare, UsersRound, CalendarClock, Building2,
  Briefcase, FileText, Mic, Target, Network, Server, Bug, Camera,
  Code2, ShieldAlert, BarChart3, PenLine, Heart, FileEdit,
  FileBadge, ShieldCheck,
  Calendar, TrendingUp, DollarSign, UserCog, Activity, Mail,
} from "lucide-react"
import { useAppStore, type View } from "@/store/app-store"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"
import { useNotifications, type AppNotification } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  view: View
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, view: { name: "dashboard" } },
  { label: "Course Catalog", icon: BookOpen, view: { name: "catalog" } },
  { label: "My Learning", icon: GraduationCap, view: { name: "learning" } },
  { label: "Assignments", icon: ClipboardList, view: { name: "assignments" } },
  { label: "Notes", icon: StickyNote, view: { name: "notes" } },
  { label: "Live Sessions", icon: Radio, view: { name: "live" } },
  { label: "Cyber Labs", icon: FlaskConical, view: { name: "labs" } },
  { label: "AI Assistant", icon: Sparkles, view: { name: "ai-assistant" } },
  { label: "Threat Feed", icon: ShieldAlert, view: { name: "threat-feed" } },
  { label: "Code Review", icon: Code2, view: { name: "code-review" } },
  { label: "Career Planner", icon: Briefcase, view: { name: "career-planner" } },
  { label: "Job Board", icon: Search, view: { name: "job-board" } },
  { label: "Mock Interview", icon: Mic, view: { name: "mock-interview" } },
  { label: "Resume Builder", icon: FileText, view: { name: "resume-builder" } },
  { label: "CTF Platform", icon: Trophy, view: { name: "ctf-platform" } },
  { label: "Weekly Challenge", icon: Zap, view: { name: "weekly-challenges" } },
  { label: "Team Missions", icon: UsersRound, view: { name: "team-missions" } },
  { label: "Analytics", icon: BarChart3, view: { name: "learning-analytics" } },
  { label: "Skill Tests", icon: Target, view: { name: "skill-assessments" } },
  { label: "Prereq Graph", icon: Network, view: { name: "prerequisites-visualizer" } },
  { label: "Lab Snapshots", icon: Camera, view: { name: "lab-snapshots" } },
  { label: "Cyber Range", icon: Server, view: { name: "cyber-range" } },
  { label: "Bug Bounty", icon: Bug, view: { name: "bug-bounty" } },
  { label: "Office Hours", icon: CalendarClock, view: { name: "office-hours" } },
  { label: "Study Groups", icon: UsersRound, view: { name: "study-groups" } },
  { label: "Messages", icon: MessageSquare, view: { name: "messaging" } },
  { label: "Achievements", icon: Award, view: { name: "achievements" } },
  { label: "Leaderboards", icon: Crown, view: { name: "leaderboard" } },
  { label: "Certificates", icon: Award, view: { name: "certificates" } },
  { label: "Proctored Exams", icon: ShieldCheck, view: { name: "exams" } },
  { label: "GuardianX Credentials", icon: FileBadge, view: { name: "credentials" } },
  { label: "Community", icon: Users, view: { name: "community" } },
  { label: "Parent Portal", icon: Heart, view: { name: "parent-portal" } },
  { label: "Course Studio", icon: PenLine, view: { name: "course-studio" } },
]

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 group">
      <div className="relative">
        <img
          src="/guardianx-logo-v2.png"
          alt="GuardianX"
          className="h-9 w-9 object-contain transition-transform group-hover:scale-110"
          style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.6))" }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-violet-500/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-left">
        <div className="font-bold text-lg leading-none tracking-tight">
          Guardian<span className="text-violet-400">X</span>
        </div>
        <div className="text-[9px] text-muted-foreground font-mono tracking-widest">SECURE · LEARN · DEFEND</div>
      </div>
    </button>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { view, navigate } = useAppStore()
  const { user } = useUser()

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = view.name === item.view.name
        return (
          <button
            key={item.label}
            onClick={() => {
              navigate(item.view)
              onNavigate?.()
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
              active
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
            )}
          >
            {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-emerald-400 rounded-r" />}
            <item.icon className={cn("h-4 w-4 shrink-0", active && "text-emerald-400")} />
            <span className="flex-1 text-left">{item.label}</span>
            {active && <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )
      })}
      {user?.role === "INSTRUCTOR" || user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "instructor" }); onNavigate?.() }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border",
            view.name === "instructor"
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent"
          )}
        >
          {view.name === "instructor" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-cyan-400 rounded-r" />}
          <Presentation className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Instructor</span>
          {view.name === "instructor" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "SCHOOL_ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "school" }); onNavigate?.() }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border",
            view.name === "school"
              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent"
          )}
        >
          {view.name === "school" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-violet-400 rounded-r" />}
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">School Portal</span>
          {view.name === "school" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin" }); onNavigate?.() }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border",
            view.name === "admin"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent"
          )}
        >
          {view.name === "admin" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-amber-400 rounded-r" />}
          <Shield className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Admin Console</span>
          {view.name === "admin" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "cms" }); onNavigate?.() }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border",
            view.name === "cms"
              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent"
          )}
        >
          {view.name === "cms" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-violet-400 rounded-r" />}
          <FileEdit className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Content Studio</span>
          {view.name === "cms" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "invoice-generator" }); onNavigate?.() }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border",
            view.name === "invoice-generator"
              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent"
          )}
        >
          {view.name === "invoice-generator" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-violet-400 rounded-r" />}
          <FileText className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Invoice Generator</span>
          {view.name === "invoice-generator" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "proposal-maker" }); onNavigate?.() }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border",
            view.name === "proposal-maker"
              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent"
          )}
        >
          {view.name === "proposal-maker" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-violet-400 rounded-r" />}
          <FileText className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Proposal Maker</span>
          {view.name === "proposal-maker" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-lead-crm" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-lead-crm" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-lead-crm" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-amber-400 rounded-r" />}
          <Users className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Lead / CRM</span>
          {view.name === "admin-lead-crm" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-batch-calendar" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-batch-calendar" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-batch-calendar" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-cyan-400 rounded-r" />}
          <Calendar className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Batch Calendar</span>
          {view.name === "admin-batch-calendar" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-student-progress" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-student-progress" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-student-progress" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-emerald-400 rounded-r" />}
          <TrendingUp className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Student Progress</span>
          {view.name === "admin-student-progress" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-revenue" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-revenue" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-revenue" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-emerald-400 rounded-r" />}
          <DollarSign className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Revenue Analytics</span>
          {view.name === "admin-revenue" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-cert-bulk" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-cert-bulk" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-cert-bulk" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-violet-400 rounded-r" />}
          <Award className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Bulk Certificates</span>
          {view.name === "admin-cert-bulk" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-email-campaign" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-email-campaign" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-email-campaign" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-cyan-400 rounded-r" />}
          <Mail className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Email Campaigns</span>
          {view.name === "admin-email-campaign" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-instructor-assignment" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-instructor-assignment" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-instructor-assignment" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-amber-400 rounded-r" />}
          <UserCog className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Instructor Assign</span>
          {view.name === "admin-instructor-assignment" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-audit-log" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-audit-log" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-audit-log" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-violet-400 rounded-r" />}
          <Shield className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Audit Logs</span>
          {view.name === "admin-audit-log" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-platform-health" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-platform-health" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-platform-health" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-emerald-400 rounded-r" />}
          <Activity className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Platform Health</span>
          {view.name === "admin-platform-health" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      {user?.role === "ADMIN" ? (
        <button
          onClick={() => { navigate({ name: "admin-notifications" }); onNavigate?.() }}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative border", view.name === "admin-notifications" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent")}
        >
          {view.name === "admin-notifications" && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-amber-400 rounded-r" />}
          <Bell className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Notifications</span>
          {view.name === "admin-notifications" && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      ) : null}
    </nav>
  )
}

function SidebarFooter() {
  const { user, stats } = useUser()
  const { navigate } = useAppStore()
  if (!user) return null
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  return (
    <div className="mt-auto space-y-3">
      <div className="rounded-lg border border-border bg-card/50 p-3">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 border border-emerald-500/20">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.title}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-sm font-bold text-emerald-400">{stats?.enrollments ?? 0}</div>
            <div className="text-[9px] text-muted-foreground uppercase">Courses</div>
          </div>
          <div>
            <div className="text-sm font-bold text-cyan-400">{stats?.labsDone ?? 0}</div>
            <div className="text-[9px] text-muted-foreground uppercase">Labs</div>
          </div>
          <div>
            <div className="text-sm font-bold text-amber-400">{stats?.certificates ?? 0}</div>
            <div className="text-[9px] text-muted-foreground uppercase">Certs</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle theme"
      aria-label="Toggle dark/light theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, navigate } = useAppStore()
  const { user, stats, gamification } = useUser()
  const [commandOpen, setCommandOpen] = React.useState(false)

  // ⌘K / Ctrl+K to open command palette
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className="min-h-screen flex bg-background bg-grid">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/50 backdrop-blur p-4 sticky top-0 h-screen">
        <div className="mb-8 px-1">
          <Logo onClick={() => navigate({ name: "dashboard" })} />
        </div>
        <NavList />
        <SidebarFooter />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-4 flex flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-left">
              <Logo onClick={() => setSidebarOpen(false)} />
            </SheetTitle>
          </SheetHeader>
          <NavList onNavigate={() => setSidebarOpen(false)} />
          <SidebarFooter />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <button
            onClick={() => setCommandOpen(true)}
            className="relative flex-1 max-w-md flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/50 border border-transparent hover:border-border text-muted-foreground text-sm transition-colors group"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search courses, labs, notes...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background/60 text-[10px] font-mono">⌘K</kbd>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* XP / Level widget */}
            {gamification && (
              <button
                onClick={() => navigate({ name: "achievements" })}
                className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group"
                title={`${gamification.rank} · ${gamification.xp} XP`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                    {gamification.level}
                  </div>
                  <span className="text-xs font-mono text-emerald-400">{gamification.xp.toLocaleString()} XP</span>
                </div>
                <div className="h-1 w-12 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${gamification.levelInfo.progress}%` }} />
                </div>
                {gamification.streak > 0 && (
                  <div className="flex items-center gap-0.5 text-orange-400" title={`${gamification.streak}-day streak`}>
                    <Flame className="h-3.5 w-3.5" fill="currentColor" />
                    <span className="text-xs font-mono">{gamification.streak}</span>
                  </div>
                )}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-emerald-400 font-mono">SECURE</span>
            </div>
            <ThemeToggle />
            <NotificationsButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-accent p-1 pr-2">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                      {user?.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                    <Badge variant="outline" className="w-fit mt-1 text-[10px] border-emerald-500/30 text-emerald-400">
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ name: "profile" })}>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: "certificates" })}>
                  <Award className="h-4 w-4 mr-2" /> Certificates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: "notes" })}>
                  <StickyNote className="h-4 w-4 mr-2" /> My Notes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-400 focus:text-red-400">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>

        <footer className="mt-auto border-t border-border bg-sidebar/30 py-6 px-4 lg:px-8">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono">GuardianX LMS · v1.1.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span>© 2025 GuardianX Security Education</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-mono">Encrypted end-to-end</span>
            </div>
          </div>
        </footer>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}

// ---- Command Palette (⌘K) ----
function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { navigate } = useAppStore()
  const [q, setQ] = React.useState("")
  const [results, setResults] = React.useState<{ courses: any[]; labs: any[]; notes: any[] }>({ courses: [], labs: [], notes: [] })

  React.useEffect(() => {
    if (!q.trim()) {
      setResults({ courses: [], labs: [], notes: [] })
      return
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await r.json()
        setResults(data)
      } catch {}
    }, 150)
    return () => clearTimeout(t)
  }, [q])

  React.useEffect(() => {
    if (!open) setQ("")
  }, [open])

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, view: { name: "dashboard" } as const },
    { label: "Course Catalog", icon: BookOpen, view: { name: "catalog" } as const },
    { label: "My Learning", icon: GraduationCap, view: { name: "learning" } as const },
    { label: "Cyber Labs", icon: FlaskConical, view: { name: "labs" } as const },
    { label: "Achievements", icon: Trophy, view: { name: "achievements" } as const },
    { label: "Live Sessions", icon: Radio, view: { name: "live" } as const },
    { label: "My Notes", icon: StickyNote, view: { name: "notes" } as const },
    { label: "Certificates", icon: Award, view: { name: "certificates" } as const },
    { label: "Community", icon: Users, view: { name: "community" } as const },
    { label: "Profile", icon: User, view: { name: "profile" } as const },
  ]

  const go = (view: any) => {
    navigate(view)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">Search courses, labs, and navigate the platform.</DialogDescription>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses, labs, or jump to..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded border border-border">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {!q.trim() ? (
            <div className="p-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">Quick Navigation</div>
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => go(item.view)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 text-sm text-left transition-colors"
                >
                  <item.icon className="h-4 w-4 text-emerald-400" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 p-2">
              {results.courses.length === 0 && results.labs.length === 0 && results.notes.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  No results for "{q}"
                </div>
              )}
              {results.courses.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">Courses</div>
                  {results.courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go({ name: "course", courseId: c.id })}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 text-sm text-left transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="flex-1 truncate">{c.title}</span>
                      <Badge variant="outline" className="text-[9px]">{c.shortName}</Badge>
                    </button>
                  ))}
                </div>
              )}
              {results.labs.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">Labs</div>
                  {results.labs.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => go({ name: "lab", labSlug: l.slug })}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 text-sm text-left transition-colors"
                    >
                      <Terminal className="h-4 w-4 text-violet-400 shrink-0" />
                      <span className="flex-1 truncate">{l.title}</span>
                      <Badge variant="outline" className="text-[9px]">{l.difficulty}</Badge>
                    </button>
                  ))}
                </div>
              )}
              {results.notes.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">My Notes</div>
                  {results.notes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => n.lesson ? go({ name: "lesson", lessonId: n.lesson.id, courseId: n.lesson.courseId }) : go({ name: "notes" })}
                      className="w-full flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 text-sm text-left transition-colors"
                    >
                      <StickyNote className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{n.title}</div>
                        {n.content && <div className="truncate text-xs text-muted-foreground">{n.content}</div>}
                      </div>
                      {n.lesson && <Badge variant="outline" className="text-[9px] shrink-0">{n.lesson.courseShortName}</Badge>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---- Notifications Button + Dropdown ----
const NOTIF_ICONS: Record<string, any> = {
  trophy: Trophy, award: Award, crown: Crown, flame: Flame, zap: Zap,
  book: BookOpen, terminal: Terminal, shield: Shield, sparkles: Sparkles, bell: Bell,
}
const NOTIF_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  red: "bg-red-500/10 text-red-400 border-red-500/30",
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString()
}

function NotificationsButton() {
  const { navigate } = useAppStore()
  const { notifications, unreadCount, markAllRead, markRead, deleteNotif } = useNotifications()
  const [open, setOpen] = React.useState(false)

  function handleClick(n: AppNotification) {
    markRead.mutate(n.id)
    if (n.link) navigate(n.link as View)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold font-mono border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-[10px] text-muted-foreground hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-[360px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">Achievements, level-ups, and updates will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = NOTIF_ICONS[n.icon] ?? Bell
                const colorClass = NOTIF_COLORS[n.color] ?? NOTIF_COLORS.emerald
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "group/n relative w-full flex items-start gap-3 px-3 py-3 hover:bg-accent/50 text-left transition-colors cursor-pointer",
                      !n.read && "bg-emerald-500/[0.03]",
                    )}
                    onClick={() => handleClick(n)}
                  >
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-xs font-medium leading-snug line-clamp-2", !n.read && "text-foreground")}>{n.title}</p>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[9px] text-muted-foreground/70 font-mono mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id) }}
                      className="absolute right-2 top-2 opacity-0 group-hover/n:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/15 text-muted-foreground hover:text-red-400"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
