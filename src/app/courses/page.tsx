import { PublicPageShell } from "@/components/platform/public-page-shell"
import { CourseCatalogView } from "@/views/course-catalog"
export const metadata = { title: "Cybersecurity Courses & Certifications | GuardianX Academy", description: "Browse 29+ cybersecurity certification courses including CEH, CISSP, CCNA, CCNP, RHCSA, WAPT, OSCP, and CyberArk PAM. Live instructor-led training with hands-on labs.", keywords: ["cybersecurity courses", "CEH training", "CISSP course", "CCNA certification", "ethical hacking course", "India"] }
export default function Page() { return <PublicPageShell><CourseCatalogView /></PublicPageShell> }
