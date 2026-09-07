import { PublicPageShell } from "@/components/platform/public-page-shell"
import { InstructorsView } from "@/views/instructors"
export const metadata = { title: "Expert Cybersecurity Instructors | GuardianX Academy", description: "Learn from verified cybersecurity instructors with real-world experience in penetration testing, SOC, cloud security, GRC, and more." }
export default function Page() { return <PublicPageShell><InstructorsView /></PublicPageShell> }
