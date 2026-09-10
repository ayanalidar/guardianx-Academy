import { PublicPageShell } from "@/components/platform/public-page-shell"
import { PricingView } from "@/views/pricing"
export const metadata = { title: "Pricing & Subscription Plans | GuardianX Academy", description: "Affordable cybersecurity training plans. Free, Pro, and Enterprise subscriptions with flexible pricing." }
export default function Page() { return <PublicPageShell><PricingView /></PublicPageShell> }
