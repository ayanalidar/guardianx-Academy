import dynamic from "next/dynamic"
const CyberRangeView = dynamic(() => import("@/views/cyber-range").then(m => ({ default: m.CyberRangeView })), { ssr: false })
export const metadata = {
  title: "Cyber Range — Hands-On Hacking Labs | GuardianX Academy",
  description: "Spin up real isolated targets in seconds. Probe, break, and capture flags in a real cyber range environment.",
}
export default function Page() { return <CyberRangeView /> }
