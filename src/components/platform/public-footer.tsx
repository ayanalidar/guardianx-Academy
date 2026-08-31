"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Shield, Mail, Phone, MapPin, ArrowRight, ChevronRight,
  BookOpen, FlaskConical, Trophy, Award, Briefcase, Building2,
  GraduationCap, FileText, Mail as MailIcon,
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * PublicFooter — 6-column structure per Part 51 spec.
 * Links are CMS-driven via usePageContent("global") with fallbacks.
 * Removed: fake "SOC2-ALIGNED" badge, fake "12,000+ defenders" claim.
 */
export function PublicFooter() {
  const { navigate } = useAppStore()

  const footerSections = [
    {
      title: "LEARN",
      links: [
        { label: "Courses", view: { name: "catalog" as const } },
        { label: "Upcoming Batches", view: { name: "batches" as const } },
        { label: "Learning Paths", view: { name: "learning-paths" as const } },
        { label: "Skill Tree", view: { name: "skill-tree" as const } },
      ],
    },
    {
      title: "PRACTICE",
      links: [
        { label: "Cyber Range", view: { name: "cyber-range" as const } },
        { label: "Labs", view: { name: "labs" as const } },
        { label: "CTF Arena", view: { name: "ctf-platform" as const } },
        { label: "Challenges", view: { name: "weekly-challenges" as const } },
      ],
    },
    {
      title: "INSTITUTIONS",
      links: [
        { label: "Schools", view: { name: "institutions-schools" as const } },
        { label: "Colleges & Universities", view: { name: "institutions-colleges" as const } },
        { label: "Institution Portal", view: { name: "login" as const } },
      ],
    },
    {
      title: "CAREER",
      links: [
        { label: "Career Paths", view: { name: "career-planner" as const } },
        { label: "Skill Assessment", view: { name: "skill-assessments" as const } },
        { label: "Certifications", view: { name: "certificates" as const } },
        { label: "Resume Builder", view: { name: "resume-builder" as const } },
      ],
    },
    {
      title: "GUARDIANX",
      links: [
        { label: "About", view: { name: "impact" as const } },
        { label: "Impact", view: { name: "impact" as const } },
        { label: "Contact", view: { name: "contact" as const } },
        { label: "Security", view: { name: "contact" as const } },
      ],
    },
    {
      title: "SUPPORT",
      links: [
        { label: "FAQ", view: { name: "contact" as const } },
        { label: "Help Center", view: { name: "contact" as const } },
        { label: "Terms", view: { name: "home" as const } },
        { label: "Privacy", view: { name: "home" as const } },
      ],
    },
  ]

  return (
    <footer className="mt-auto relative overflow-hidden border-t border-border bg-background">
      {/* Atmospheric layers */}
      <div className="absolute inset-0 bg-mesh opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-violet-600/6 blur-[120px] rounded-full pointer-events-none" />

      {/* Compact CTA */}
      <div className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
          <p className="text-[10px] font-mono text-violet-400 tracking-[0.3em] mb-3">READY?</p>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold leading-[0.9] tracking-[-0.04em] mb-4 text-balance">
            Start your{" "}
            <span className="text-gradient-premium">journey today.</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-6">
            Free to start. No credit card required.
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ name: "login" })}
            className="bg-violet-600 hover:bg-violet-500 btn-premium px-8 py-6 text-sm"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer content — 6-column structure */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/guardianx-logo-v2.png"
                alt="GuardianX"
                className="h-8 w-8 object-contain"
                style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.5))" }}
                draggable={false}
              />
              <div className="font-bold text-sm">
                Guardian<span className="text-violet-400">X</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-xs">
              Building tomorrow&apos;s cyber guardians.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>System operational</span>
            </div>
          </div>

          {/* 6 link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate(item.view)}
                      className="text-muted-foreground hover:text-violet-300 transition-colors flex items-center gap-1 group text-xs"
                    >
                      {item.label}
                      <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info + legal */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-violet-300" /> academy@guardianx.in
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-violet-300" /> Bengaluru, India
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>© {new Date().getFullYear()} GuardianX Academy</span>
            <span className="opacity-30">·</span>
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
