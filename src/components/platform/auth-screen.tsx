"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Shield, Terminal, Zap, Lock, Mail, User, GraduationCap, ChevronRight,
  Eye, EyeOff, Building2, Hash, BadgeCheck,
  CheckCircle2, Users, BookOpen, ArrowRight, Globe, Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { toast } from "sonner"
import { CertificateVerifyCard } from "@/components/platform/certificate-verify-card"
import { PublicHeader } from "@/components/platform/public-header"
import { cn } from "@/lib/utils"
import { usePageContent, getContent } from "@/lib/use-content"
import { AnimatedLogo } from "@/components/platform/animated-logo"

// Demo accounts - only shown in development, never in production
const IS_DEV = process.env.NODE_ENV !== "production"
const DEMO_ACCOUNTS = IS_DEV ? [
  { label: "Student", email: "student@academy.guardianx.cloud", password: "student123", icon: GraduationCap, color: "text-violet-300", tint: "bg-violet-500/10 border-violet-500/30" },
  { label: "Instructor", email: "instructor@academy.guardianx.cloud", password: "instructor123", icon: User, color: "text-cyan-300", tint: "bg-cyan-500/10 border-cyan-500/30" },
  { label: "Admin", email: "admin@academy.guardianx.cloud", password: "admin123", icon: Shield, color: "text-amber-300", tint: "bg-amber-500/10 border-amber-500/30" },
] : []

const FEATURES = [
  { icon: Terminal, title: "Certification Tracks", desc: "CEH · CISSP · CCNA · CCNP · RHCSA + 22 more" },
  { icon: Zap, title: "Live Workshops", desc: "Screen-share with two-way voice & whiteboard" },
  { icon: Shield, title: "Hands-on Labs", desc: "31 real offensive-security CTF challenges" },
  { icon: GraduationCap, title: "Verifiable Certs", desc: "Public verification for employers & recruiters" },
  { icon: Building2, title: "School Portal", desc: "Multi-tenant dashboards for institutions" },
  { icon: BadgeCheck, title: "Industry Recognized", desc: "Trusted by 12,000+ cyber defenders" },
]

const STATS = [
  { value: "12K+", label: "Learners", icon: Users, color: "text-violet-300" },
  { value: "27+", label: "Courses", icon: BookOpen, color: "text-cyan-300" },
  { value: "31", label: "Labs", icon: Shield, color: "text-amber-300" },
]

export function AuthScreen() {
  const router = useRouter()
  const { navigate } = useAppStore()
  const [loading, setLoading] = React.useState(false)
  const [showPass, setShowPass] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("login")

  // CMS-driven hero copy - falls back to defaults.
  const cms = usePageContent("auth")
  const cmsData = cms.data
  const heroTitle = getContent(cmsData, "hero", "title", "Master Cyber Security.")
  const heroTitleAccent = getContent(cmsData, "hero", "titleAccent", "Become a Guardian.")
  const heroDesc = getContent(cmsData, "hero", "description", "Industry-leading certification prep, live screen-sharing workshops, and hands-on offensive security labs - all in one platform built for defenders.")
  const heroTagline = getContent(cmsData, "hero", "tagline", "cyber security · certification · labs")
  const trustFooter = getContent(cmsData, "hero", "trustFooter", "Encrypted · SOC2-aligned · Built for defenders")
  const loginTitle = getContent(cmsData, "tabs", "loginTitle", "Sign in to continue")
  const loginSubtitle = getContent(cmsData, "tabs", "loginSubtitle", "Access your learning dashboard, labs, and live sessions.")
  const schoolTitle = getContent(cmsData, "tabs", "schoolTitle", "Institution Portal Login")
  const schoolSubtitle = getContent(cmsData, "tabs", "schoolSubtitle", "Access your school, college, or university dashboard.")
  const registerTitle = getContent(cmsData, "tabs", "registerTitle", "Create your account")
  const registerSubtitle = getContent(cmsData, "tabs", "registerSubtitle", "Start your cyber security journey today.")

  // Standard login state - empty by default (no pre-filled credentials)
  const [loginEmail, setLoginEmail] = React.useState("")
  const [loginPass, setLoginPass] = React.useState("")

  // School portal login state
  const [schoolCode, setSchoolCode] = React.useState("")
  const [schoolEmail, setSchoolEmail] = React.useState("")
  const [schoolPass, setSchoolPass] = React.useState("")

  // Register state
  const [regName, setRegName] = React.useState("")
  const [regEmail, setRegEmail] = React.useState("")
  const [regPass, setRegPass] = React.useState("")

  // After successful auth, fetch the user's role and route accordingly.
  // Retries up to 3 times with 300ms delay to handle session propagation.
  async function routeByRole() {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await api<{ user: { role: string } | null }>("/api/me")
        const role = data?.user?.role
        if (role) {
          if (role === "SCHOOL_ADMIN") {
            navigate({ name: "school" })
          } else if (role === "INSTRUCTOR") {
            navigate({ name: "instructor" })
          } else if (role === "ADMIN") {
            navigate({ name: "admin" })
          } else {
            navigate({ name: "dashboard" })
          }
          return
        }
      } catch {
        // ignore and retry
      }
      await new Promise(r => setTimeout(r, 300))
    }
    // Fallback: go to dashboard
    navigate({ name: "dashboard" })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", {
      email: loginEmail,
      password: loginPass,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      toast.error("Invalid credentials")
      return
    }
    toast.success("Welcome back, Guardian!")
    router.refresh()
    setTimeout(routeByRole, 200)
  }

  async function handleSchoolLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("school-login", {
      schoolCode,
      adminEmail: schoolEmail,
      password: schoolPass,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      toast.error("Invalid school credentials. Check your school code, email, and password.")
      return
    }
    toast.success("Welcome to your School Portal!")
    router.refresh()
    setTimeout(routeByRole, 200)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: regName, email: regEmail, password: regPass, role: "STUDENT" }),
      })
      const res = await signIn("credentials", { email: regEmail, password: regPass, redirect: false })
      setLoading(false)
      if (res?.error) throw new Error(res.error)
      toast.success("Account created! Welcome to GuardianX.")
      router.refresh()
      setTimeout(routeByRole, 200)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || "Registration failed")
    }
  }

  async function quickLogin(email: string, password: string) {
    setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      toast.error("Invalid credentials")
      return
    }
    toast.success("Welcome back, Guardian!")
    router.refresh()
    setTimeout(routeByRole, 200)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <PublicHeader />

      {/* ===== Content starts BELOW the fixed header (pt-20) ===== */}
      <main className="flex-1 pt-20 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* ============================================================
                LEFT - Branding (desktop only)
                ============================================================ */}
            <section className="hidden lg:flex lg:flex-col gap-8 lg:sticky lg:top-28">
              {/* Logo + tagline */}
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-mono w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
                  SYSTEM ONLINE
                </div>
                <div className="flex items-center gap-4">
                  <AnimatedLogo size={84} parallax={false} />
                  <div>
                    <div className="text-xl font-bold tracking-tight leading-none">
                      Guardian<span className="text-violet-400">X</span> Academy
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{heroTagline}</div>
                  </div>
                </div>
                <h1 className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance">
                  {heroTitle}
                  <br />
                  <span className="text-gradient-premium">{heroTitleAccent}</span>
                </h1>
                <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                  {heroDesc}
                </p>
              </div>

              {/* Feature highlights - solid cards */}
              <div className="grid grid-cols-2 gap-3">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="group rounded-xl border border-border bg-card shadow-lg p-4 transition-all hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-20px_oklch(0.6_0.2_295_/_0.25)]"
                  >
                    <div className="inline-flex p-2 rounded-lg bg-violet-500/10 mb-3 transition-transform group-hover:scale-110">
                      <f.icon className="h-4 w-4 text-violet-300" />
                    </div>
                    <div className="text-sm font-semibold mb-0.5">{f.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* Stats strip - solid card */}
              <div className="rounded-xl border border-border bg-card shadow-lg p-5">
                <div className="grid grid-cols-3 gap-4">
                  {STATS.map((s, i) => (
                    <div key={s.label} className={cn("flex items-center gap-3", i < STATS.length - 1 && "border-r border-border pr-4")}>
                      <s.icon className={cn("h-5 w-5", s.color)} />
                      <div>
                        <div className="text-xl font-bold leading-none">{s.value}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust footer */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Lock className="h-3 w-3 text-cyan-300" />
                <span>{trustFooter}</span>
              </div>
            </section>

            {/* ============================================================
                RIGHT - Auth form (solid card, shadow-lg)
                ============================================================ */}
            <section className="w-full">
              {/* Mobile logo (shown only on small screens) */}
              <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10">
                  <Shield className="h-5 w-5 text-violet-300" strokeWidth={1.8} />
                </div>
                <div className="text-xl font-bold tracking-tight">
                  Guardian<span className="text-violet-400">X</span>
                </div>
              </div>

              {/* Form card - solid, shadowed */}
              <Card className="bg-card shadow-lg border border-border p-6 sm:p-8">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-bold tracking-tight">
                    {activeTab === "school"
                      ? schoolTitle
                      : activeTab === "register"
                        ? registerTitle
                        : loginTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {activeTab === "school"
                      ? schoolSubtitle
                      : activeTab === "register"
                        ? registerSubtitle
                        : loginSubtitle}
                  </p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="school">
                      <Building2 className="h-3.5 w-3.5 mr-1.5" /> School
                    </TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  {/* ===== Sign In tab ===== */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            className="pl-9"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            onClick={() => setShowPass((s) => !s)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            {showPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {showPass ? "Hide" : "Show"}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPass ? "text" : "password"}
                            className="pl-9"
                            placeholder="••••••••"
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full btn-premium py-2.5" disabled={loading}>
                        {loading ? "Authenticating..." : "Sign In"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveTab("school")}
                        className="text-cyan-300 hover:text-cyan-200 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Building2 className="h-3 w-3" /> Login as Institution →
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className="text-violet-300 hover:text-violet-200 font-medium transition-colors"
                      >
                        Create account →
                      </button>
                    </div>
                  </TabsContent>

                  {/* ===== School Portal tab ===== */}
                  <TabsContent value="school">
                    <form onSubmit={handleSchoolLogin} className="space-y-4">
                      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 mb-2">
                        <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium mb-1">
                          <Building2 className="h-3.5 w-3.5" /> Institution Login
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Each school, college, and university has a unique{" "}
                          <span className="font-mono text-cyan-300">School Code</span> for secure multi-tenant access.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schoolCode">School Code</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="schoolCode"
                            type="text"
                            className="pl-9 font-mono uppercase"
                            placeholder="GXS-DELHI-001"
                            value={schoolCode}
                            onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolEmail">Admin Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="schoolEmail"
                            type="email"
                            className="pl-9"
                            placeholder="admin@yourschool.edu"
                            value={schoolEmail}
                            onChange={(e) => setSchoolEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolPass">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="schoolPass"
                            type={showPass ? "text" : "password"}
                            className="pl-9 pr-9"
                            placeholder="••••••••"
                            value={schoolPass}
                            onChange={(e) => setSchoolPass(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full btn-premium py-2.5 bg-cyan-500 text-cyan-950 hover:bg-cyan-400"
                        disabled={loading}
                      >
                        {loading ? "Authenticating..." : "Access Institution Portal"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← Back to individual login
                      </button>
                    </div>
                  </TabsContent>

                  {/* ===== Register tab ===== */}
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            className="pl-9"
                            placeholder="Jane Doe"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-email"
                            type="email"
                            className="pl-9"
                            placeholder="you@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-password"
                            type="password"
                            className="pl-9"
                            placeholder="Min 6 characters"
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full btn-premium py-2.5" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                        By signing up, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* ===== Certificate Verify Card - solid wrapper below the form ===== */}
              <div className="mt-6">
                <CertificateVerifyCard />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
