import { PublicPageShell } from "@/components/platform/public-page-shell"
import { BatchDetailClient } from "./batch-detail-client"

export const metadata = {
  title: "Batch Details | GuardianX Academy",
  description: "View batch schedule, instructor, seats, and enroll in live cyber security training cohorts.",
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <PublicPageShell>
      <BatchDetailClient slug={params} />
    </PublicPageShell>
  )
}
