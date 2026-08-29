"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, Terminal, Zap, Lock, Mail, User, GraduationCap, ChevronRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { toast } from "sonner"
import { CertificateVerifyCard } from "@/components/platform/certificate-verify-card"

const DEMO_ACCOUNTS = [
  { label: "Student", email: "student@guardianx.io", password: "student123", icon: GraduationCap, color: "text-emerald-400" },
  { label: "Instructor", email: "instructor@guardianx.io", password: "instructor123", icon: User, color: "text-cyan-400" },
  { label: "Admin", email: "admin@guardianx.io", password: "admin123", icon: Shield, color: "text-amber-400" },
]

export function AuthScreen() {
  const router = useRouter()
  const { navigate } = useAppStore()
  const [loading, setLoading] = React.useState(false)
  const [showPass, setShowPass] = React.useState(false)
  const [loginEmail, setLoginEmail] = React.useState("student@guardianx.io")
  const [loginPass, setLoginPass] = React.useState("student123")
  const [regName, setRegName] = React.useState("")
  const [regEmail, setRegEmail] = React.useState("")
  const [regPass, setRegPass] = React.useState("")

  // After successful auth, fetch the user's role and route accordingly.
  // Instructors and admins go to the Instructor dashboard; everyone else to the student dashboard.
  async function routeByRole() {
    try {
      const data = await api<{ user: { role: string } | null }>("/api/me")
      const role = data?.user?.role
      if (role === "INSTRUCTOR" || role === "ADMIN") {
        navigate({ name: "instructor" })
      } else {
        navigate({ name: "dashboard" })
      }
    } catch {
      // fall back to default dashboard
      navigate({ name: "dashboard" })
    }
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
    // route by role after refresh
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
    try {
      const r = await fetch("/api/auth/session")
      const session = await r.json()
      const role = session?.user?.role
      if (role === "ADMIN") {
        navigate({ name: "admin" })
      } else if (role === "INSTRUCTOR") {
        navigate({ name: "instructor" })
      } else {
        navigate({ name: "dashboard" })
      }
    } catch {
      navigate({ name: "dashboard" })
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background bg-grid relative overflow-hidden">
      {/* Left: branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative scanlines border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-transparent to-cyan-950/30 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/guardianx-academy-logo.png" alt="GuardianX Academy" className="h-10 w-10 rounded-lg object-cover logo-img logo-animated logo-glow" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Guardian<span className="text-emerald-400">X</span> Academy
              </h1>
              <p className="text-xs text-muted-foreground font-mono">Building Tomorrow&apos;s Cyber Guardians</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              SYSTEM ONLINE
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Master Cyber Security.
              <br />
              <span className="text-gradient-emerald">Become a Guardian.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md">
              Industry-leading certification prep, live screen-sharing workshops, and hands-on offensive security labs — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: Terminal, label: "CEH · CISSP · CCNA", desc: "8+ certification tracks" },
              { icon: Zap, label: "Live Workshops", desc: "Screen-share & 2-way voice" },
              { icon: Shield, label: "Hands-on Labs", desc: "Real CTF challenges" },
              { icon: GraduationCap, label: "Verifiable Certs", desc: "Industry recognized" },
            ].map((f) => (
              <div key={f.label} className="rounded-lg border border-border bg-card/50 backdrop-blur p-4">
                <f.icon className="h-5 w-5 text-emerald-400 mb-2" />
                <div className="text-sm font-medium">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3" />
            <span>Encrypted • SOC2-aligned • Built for defenders</span>
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <Shield className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold">
              Guardian<span className="text-emerald-400">X</span>
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold">Sign in to continue</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Access your learning dashboard, labs, and live sessions.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      className="pl-9 pr-9"
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Authenticating..." : "Sign In"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </form>
            </TabsContent>

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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-mono">
                QUICK DEMO ACCESS
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => quickLogin(acc.email, acc.password)}
                  className="group rounded-lg border border-border bg-card/50 hover:bg-card hover:border-emerald-500/40 p-3 transition-all text-left"
                >
                  <acc.icon className={`h-4 w-4 mb-1.5 ${acc.color}`} />
                  <div className="text-xs font-medium">{acc.label}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">1-click</div>
                </button>
              ))}
            </div>
          </div>

          {/* Verify Your Certificate — public lookup */}
          <div className="mt-6">
            <CertificateVerifyCard />
          </div>
        </div>
      </div>
    </div>
  )
}
