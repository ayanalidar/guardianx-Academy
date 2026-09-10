import { PublicPageShell } from "@/components/platform/public-page-shell"
import { VerifyView } from "@/views/verify"
export const metadata = { title: "Verify Certificate | GuardianX Academy", description: "Public certificate verification. Enter a credential ID to verify any GuardianX Academy certification." }
export default function Page() { return <PublicPageShell><VerifyView /></PublicPageShell> }
