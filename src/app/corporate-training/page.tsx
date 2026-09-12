import { PublicPageShell } from "@/components/platform/public-page-shell"
import { CorporateTrainingView } from "@/views/corporate-training"

export const metadata = {
  title: "Corporate Training — Cyber Security Training for Teams | GuardianX Academy",
  description:
    "Customized cyber security training for SOC, IT, GRC, and leadership teams. On-site, virtual, or hybrid delivery. Custom curriculum, dedicated batches, hands-on labs, L&D reporting. Request a proposal — our team responds within 1 business day.",
}

export default function Page() {
  return (
    <PublicPageShell>
      <CorporateTrainingView />
    </PublicPageShell>
  )
}
