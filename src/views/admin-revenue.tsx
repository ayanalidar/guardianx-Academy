"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/app-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, TrendingUp, DollarSign, Users, BookOpen,
  Award, Download, Calendar,
} from "lucide-react"

export function RevenueAnalyticsView() {
  const { navigate } = useAppStore()

  const monthlyData = [
    { month: "Jan", revenue: 45000, students: 12 },
    { month: "Feb", revenue: 62000, students: 18 },
    { month: "Mar", revenue: 55000, students: 15 },
    { month: "Apr", revenue: 78000, students: 22 },
    { month: "May", revenue: 95000, students: 28 },
    { month: "Jun", revenue: 88000, students: 25 },
    { month: "Jul", revenue: 110000, students: 32 },
    { month: "Aug", revenue: 125000, students: 35 },
    { month: "Sep", revenue: 98000, students: 28 },
    { month: "Oct", revenue: 142000, students: 40 },
    { month: "Nov", revenue: 135000, students: 38 },
    { month: "Dec", revenue: 158000, students: 45 },
  ]

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue))
  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0)
  const totalStudents = monthlyData.reduce((sum, d) => sum + d.students, 0)
  const avgPerStudent = totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0

  const topCourses = [
    { name: "CEH", revenue: 285000, students: 48, color: "bg-violet-500" },
    { name: "Security+", revenue: 195000, students: 35, color: "bg-cyan-500" },
    { name: "CCNA", revenue: 165000, students: 30, color: "bg-amber-500" },
    { name: "CISSP", revenue: 220000, students: 22, color: "bg-emerald-500" },
    { name: "WAPT", revenue: 95000, students: 15, color: "bg-rose-500" },
  ]

  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ name: "admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Admin
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" /> Revenue Analytics
            </h1>
          </div>
          <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1.5" /> Export Report</Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `₹${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-emerald-300", tint: "bg-emerald-500/10" },
            { label: "Total Students", value: totalStudents, icon: Users, color: "text-violet-300", tint: "bg-violet-500/10" },
            { label: "Avg / Student", value: `₹${avgPerStudent.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-cyan-300", tint: "bg-cyan-500/10" },
            { label: "Active Batches", value: 5, icon: BookOpen, color: "text-amber-300", tint: "bg-amber-500/10" },
          ].map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("inline-flex p-2 rounded-lg", s.tint)}><s.icon className={cn("h-4 w-4", s.color)} /></div>
                <div><div className="text-xl font-bold">{s.value}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Revenue chart */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-violet-400" /> Monthly Revenue</h2>
          <div className="flex items-end gap-2 h-48">
            {monthlyData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[9px] text-muted-foreground font-mono">₹{(d.revenue / 1000).toFixed(0)}K</div>
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md transition-all hover:from-violet-500 hover:to-violet-300"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  title={`${d.month}: ₹${d.revenue.toLocaleString("en-IN")} (${d.students} students)`}
                />
                <div className="text-[9px] text-muted-foreground">{d.month}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top courses */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-4">Top Courses by Revenue</h2>
          <div className="space-y-3">
            {topCourses.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <Badge className={cn("text-[9px] text-white border-0 w-16 justify-center", c.color)}>{c.name}</Badge>
                <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                  <div className={cn("h-full rounded-md flex items-center px-2", c.color)} style={{ width: `${(c.revenue / topCourses[0].revenue) * 100}%` }}>
                    <span className="text-[10px] text-white font-mono">₹{(c.revenue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{c.students} students</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Note */}
        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-300 font-semibold">DEMO DATA:</span> Revenue figures shown are illustrative for the analytics dashboard preview. Connect to a real payment/enrollment system for live data.
          </p>
        </Card>
      </div>
    </div>
  )
}
