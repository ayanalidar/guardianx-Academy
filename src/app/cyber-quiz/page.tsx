import { PublicPageShell } from "@/components/platform/public-page-shell"
import { CyberQuizLandingView } from "@/views/cyber-quiz-landing"

export const metadata = {
  title: "Cyber Security Foundation Quiz — Free Public Quiz + ₹199 Certificate | GuardianX Academy",
  description:
    "Test your cyber awareness with 30 questions across 8 domains. Pass at 50% to unlock a verifiable Cyber Security Foundation certificate + detailed progress report. Shareable to LinkedIn + WhatsApp. ₹199 one-time fee.",
}

export default function Page() {
  return (
    <PublicPageShell>
      <CyberQuizLandingView />
    </PublicPageShell>
  )
}
