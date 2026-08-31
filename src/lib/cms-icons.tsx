"use client"

/**
 * Maps an icon-name string stored in the CMS (e.g. "GraduationCap",
 * "Shield", "Building2") to the matching lucide-react component.
 *
 * The CMS stores icons as strings so admins can edit them in the
 * Content Studio dashboard. Consumer views use this helper to look
 * up the actual component at render time.
 *
 * Falls back to the `Circle` icon if the name is missing or unknown,
 * so we never crash the UI on a bad string.
 */

import {
  AlertTriangle, Activity, Award, BadgeCheck, BookOpen, Briefcase,
  Building, Building2, Calendar, CheckCircle2, Circle, Clock, Cloud,
  Code2, Cpu, Database, Eye, FileCheck, Fingerprint, FlaskConical,
  Github, Globe, GraduationCap, Landmark, Layers, Linkedin, Lock,
  Mail, MapPin, MessageSquare, Mic, Network, Phone, PlayCircle,
  Radio, Rocket, Server, Shield, ShieldCheck, Star, Target, Terminal,
  Tv, Twitter, Users, Wifi, Youtube, Zap, TrendingUp, Trophy,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  AlertTriangle, Activity, Award, BadgeCheck, BookOpen, Briefcase,
  Building, Building2, Calendar, CheckCircle2, Circle, Clock, Cloud,
  Code2, Cpu, Database, Eye, FileCheck, Fingerprint, FlaskConical,
  Github, Globe, GraduationCap, Landmark, Layers, Linkedin, Lock,
  Mail, MapPin, MessageSquare, Mic, Network, Phone, PlayCircle,
  Radio, Rocket, Server, Shield, ShieldCheck, Star, Target, Terminal,
  Tv, Twitter, Users, Wifi, Youtube, Zap, TrendingUp, Trophy,
}

/**
 * Look up an icon component by name. Returns `Circle` as a safe
 * fallback if the name is missing or unknown.
 */
export function getCmsIcon(name?: string | null): LucideIcon {
  if (!name) return Circle
  return ICONS[name] ?? Circle
}
