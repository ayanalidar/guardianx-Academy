"use client"

import * as React from "react"
import { useUser } from "@/hooks/use-user"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User, Mail, Shield, Award, GraduationCap, FlaskConical, StickyNote,
  Target, TrendingUp, Calendar, Settings, LogOut, Edit3,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useAppStore } from "@/store/app-store"
import { LEVEL_COLORS } from "@/lib/colors"

export function ProfileView() {
  const { user, stats, isLoading } = useUser()
  const { navigate } = useAppStore()

  if (isLoading || !user) {
    return <Skeleton className="h-96" />
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const statCards = [
    { label: "Courses Enrolled", value: stats?.enrollments ?? 0, icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Courses Completed", value: stats?.completed ?? 0, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Labs Solved", value: stats?.labsDone ?? 0, icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Notes Created", value: stats?.notes ?? 0, icon: StickyNote, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Certificates", value: stats?.certificates ?? 0, icon: Shield, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Avg Quiz Score", value: `${stats?.avgScore ?? 0}%`, icon: Target, color: "text-rose-400", bg: "bg-rose-500/10" },
  ]

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="overflow-hidden relative">
        <div className="h-32 bg-gradient-to-br from-emerald-950/50 via-background to-cyan-950/30 relative scanlines">
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background rounded-xl">
                <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-2xl font-mono rounded-xl h-full">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {user.name}
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{user.role}</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">{user.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" /> {user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              <Button variant="outline" size="sm" onClick={() => navigate({ name: "learning" })}>
                <GraduationCap className="h-4 w-4 mr-1.5" /> My Learning
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
              </Button>
            </div>
          </div>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">{user.bio}</p>
          )}
        </div>
      </Card>

      {/* Stats grid */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" /> Your Stats
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="p-5 flex items-center gap-4 card-hover">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Browse Courses", icon: GraduationCap, view: { name: "catalog" } as const, color: "text-emerald-400" },
          { label: "Practice Labs", icon: FlaskConical, view: { name: "labs" } as const, color: "text-cyan-400" },
          { label: "Join Live", icon: Award, view: { name: "live" } as const, color: "text-amber-400" },
          { label: "My Notes", icon: StickyNote, view: { name: "notes" } as const, color: "text-violet-400" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.view)}>
            <Card className="p-4 flex items-center gap-3 card-hover h-full">
              <a.icon className={`h-5 w-5 ${a.color}`} />
              <span className="text-sm font-medium">{a.label}</span>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
