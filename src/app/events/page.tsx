import { PublicPageShell } from "@/components/platform/public-page-shell"
import { EventsView } from "@/views/events"
export const metadata = { title: "Cybersecurity Events, Workshops & CTFs | GuardianX Academy", description: "Join cybersecurity workshops, webinars, CTF competitions, campus programs, and bootcamps. Live online and on-campus events." }
export default function Page() { return <PublicPageShell><EventsView /></PublicPageShell> }
