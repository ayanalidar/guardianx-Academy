"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, Youtube, ArrowRight, ChevronRight } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal, TextReveal, MagneticButton } from "@/components/platform/motion-system"
import { NetworkVisualization } from "@/components/platform/network-visualization"
import { Button } from "@/components/ui/button"

/**
 * PublicFooter — oversized CTA finale + footer.
 * Not a standard SaaS footer. A dramatic closing experience.
 */
export function PublicFooter() {
  const { navigate } = useAppStore()

  return (
    <footer className="mt-auto relative overflow-hidden border-t border-border bg-background">
      {/* Atmospheric layers */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[400px] opacity-20">
        <NetworkVisualization variant="section" className="w-full h-full" />
      </div>

      {/* Oversized CTA */}
      <div className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 lg:py-40 text-center">
          <ScrollReveal>
            <p className="text-[10px] font-mono text-violet-400 tracking-[0.3em] mb-8">READY?</p>
          </ScrollReveal>
          <h2 className="text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.9] tracking-[-0.04em] mb-8 text-balance">
            <TextReveal text="Start your" />
            <br />
            <span className="text-gradient-premium">
              <TextReveal text="journey today." delay={0.4} />
            </span>
          </h2>
          <ScrollReveal delay={0.3}>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Free to start. No credit card. Join 12,000+ defenders.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.5}>
            <MagneticButton strength={0.4} className="inline-block">
              <Button size="lg" onClick={() => navigate({ name: "login" })} className="bg-violet-600 hover:bg-violet-500 btn-premium px-12 py-8 text-lg shadow-[0_8px_40px_-8px] shadow-violet-500/50">
                Create Free Account
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </div>

      {/* Footer content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <ScrollReveal className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/guardianx-logo-v2.png"
                alt="GuardianX"
                className="h-9 w-9 object-contain"
                style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.6))" }}
                draggable={false}
              />
              <div className="font-bold text-sm">
                Guardian<span className="text-violet-400">X</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-xs">
              Building tomorrow&apos;s cyber guardians.
            </p>
            <Badge variant="outline" className="text-[9px] font-mono border-violet-500/20 bg-violet-500/5 text-violet-300">
              <span className="h-1 w-1 rounded-full bg-violet-400 pulse-dot mr-1.5" />
              SOC2-ALIGNED
            </Badge>
          </ScrollReveal>

          {/* Links */}
          <ScrollReveal delay={0.1}>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Courses", view: "login" as const },
                { label: "Cyber Labs", view: "login" as const },
                { label: "Live Sessions", view: "login" as const },
                { label: "Certifications", view: "login" as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate({ name: item.view })}
                    className="text-muted-foreground hover:text-violet-300 transition-colors flex items-center gap-1 group text-xs"
                  >
                    {item.label}
                    <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", view: "home" as const },
                { label: "Impact", view: "impact" as const },
                { label: "Contact", view: "contact" as const },
                { label: "School Portal", view: "login" as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate({ name: item.view })}
                    className="text-muted-foreground hover:text-violet-300 transition-colors flex items-center gap-1 group text-xs"
                  >
                    {item.label}
                    <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-violet-300" /> hello@guardianx.io
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-violet-300" /> +91 80 4567 8900
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-violet-300" /> Bengaluru, India
              </li>
            </ul>
            <div className="flex items-center gap-2 mt-4">
              {[Github, Linkedin, Twitter, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-8 w-8 rounded-lg border border-border bg-card/50 hover:bg-violet-500/10 hover:border-violet-500/30 flex items-center justify-center transition-all"
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground hover:text-violet-300" />
                </motion.a>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground font-mono">
            © {new Date().getFullYear()} GuardianX Academy
          </p>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <button className="hover:text-violet-300 transition-colors">Privacy</button>
            <span className="opacity-30">·</span>
            <button className="hover:text-violet-300 transition-colors">Terms</button>
            <span className="opacity-30">·</span>
            <button className="hover:text-violet-300 transition-colors">Security</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
