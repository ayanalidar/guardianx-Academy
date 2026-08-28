"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Shield, LayoutDashboard, BookOpen, GraduationCap, StickyNote,
  Radio, FlaskConical, Award, Users, User, LogOut, Menu, X,
  Search, Sun, Moon, Bell, Terminal, ChevronRight, Settings,
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
import { useTheme } from "next-themes"
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
  { label: "Notes", icon: StickyNote, view: { name: "notes" } },
  { label: "Live Sessions", icon: Radio, view: { name: "live" } },
  { label: "Cyber Labs", icon: FlaskConical, view: { name: "labs" } },
  { label: "Certificates", icon: Award, view: { name: "certificates" } },
  { label: "Community", icon: Users, view: { name: "community" } },
]

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 group">
      <div className="relative">
        <Shield className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />
        <div className="absolute inset-0 bg-emerald-500/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-left">
        <div className="font-bold text-lg leading-none tracking-tight">
          Guardian<span className="text-emerald-400">X</span>
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
          onClick={() => { navigate({ name: "catalog" }); onNavigate?.() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
        >
          <Terminal className="h-4 w-4" />
          <span>Instructor Tools</span>
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
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, navigate } = useAppStore()
  const { user, stats } = useUser()

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

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, labs, notes..."
              className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-border"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value
                  if (q.trim()) navigate({ name: "catalog" })
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-emerald-400 font-mono">SECURE</span>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </Button>
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
              <span className="font-mono">GuardianX LMS · v1.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span>© 2025 GuardianX Security Education</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-mono">Encrypted end-to-end</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
