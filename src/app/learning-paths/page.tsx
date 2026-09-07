import { PublicPageShell } from "@/components/platform/public-page-shell"
import { LearningPathsView } from "@/views/learning-paths"
export const metadata = { title: "Cybersecurity Career Learning Paths | GuardianX Academy", description: "Structured learning paths from beginner to job-ready. Penetration tester, SOC analyst, cloud security engineer, and more." }
export default function Page() { return <PublicPageShell><LearningPathsView /></PublicPageShell> }
