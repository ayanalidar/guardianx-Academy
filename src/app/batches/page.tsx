import { PublicPageShell } from "@/components/platform/public-page-shell"
import { BatchesView } from "@/views/batches"
export const metadata = { title: "Upcoming Certification Batches | GuardianX Academy", description: "Live instructor-led certification batches for CEH, Security+, CCNA, CISSP. Flexible schedules including weekday, weekend, morning, and evening batches." }
export default function Page() { return <PublicPageShell><BatchesView /></PublicPageShell> }
