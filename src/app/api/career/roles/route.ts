import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Career Path Planner — list career roles (auto-seeds 10 roles)
// ============================================================

const SEED_ROLES = [
  {
    title: "SOC Analyst (Tier 1)",
    description:
      "Entry-level security operations center analyst. Monitors SIEM alerts, triages events, escalates true positives, and writes initial incident reports.",
    avgSalary: "$55,000 – $75,000",
    requiredSkills: JSON.stringify([
      "SIEM (Splunk / Sentinel)",
      "Network fundamentals",
      "Log analysis",
      "Incident response basics",
      "Threat intelligence",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "18%",
    category: "security",
  },
  {
    title: "SOC Analyst (Tier 2/3)",
    description:
      "Senior SOC analyst. Performs deep-dive investigations, threat hunting, malware triage, and leads minor incident response engagements.",
    avgSalary: "$80,000 – $110,000",
    requiredSkills: JSON.stringify([
      "Threat hunting",
      "Malware analysis basics",
      "EDR operations",
      "MITRE ATT&CK",
      "Scripting (Python/Bash)",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "21%",
    category: "security",
  },
  {
    title: "Penetration Tester",
    description:
      "Authorized offensive security professional. Conducts network, web app, and red-team engagements to find exploitable weaknesses before adversaries do.",
    avgSalary: "$95,000 – $140,000",
    requiredSkills: JSON.stringify([
      "OWASP Top 10",
      "Burp Suite / Nmap / Metasploit",
      "Bash & Python scripting",
      "Privilege escalation",
      "Report writing",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "24%",
    category: "security",
  },
  {
    title: "Security Engineer",
    description:
      "Designs, deploys, and maintains defensive security infrastructure — firewalls, IDS/IPS, EDR, WAF, and identity systems. Bridges blue-team and DevOps.",
    avgSalary: "$110,000 – $150,000",
    requiredSkills: JSON.stringify([
      "Network security architecture",
      "Cloud security (AWS/Azure)",
      "IAM / PAM",
      "Endpoint hardening",
      "Automation (Terraform/Ansible)",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "27%",
    category: "security",
  },
  {
    title: "Cloud Security Engineer",
    description:
      "Specializes in securing cloud-native workloads. Implements CSPM, CI/CD security, container hardening, and zero-trust architectures across AWS/Azure/GCP.",
    avgSalary: "$130,000 – $180,000",
    requiredSkills: JSON.stringify([
      "AWS / Azure / GCP security",
      "Kubernetes hardening",
      "IAM policies",
      "DevSecOps",
      "Cloud forensics",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "32%",
    category: "cloud",
  },
  {
    title: "Application Security Engineer",
    description:
      "Embeds security into SDLC. Performs code review, SAST/DAST, threat modeling, and works with developers to remediate vulnerabilities early.",
    avgSalary: "$120,000 – $170,000",
    requiredSkills: JSON.stringify([
      "Secure code review",
      "SAST / DAST tools",
      "Threat modeling",
      "OAuth / OIDC",
      "CI/CD pipelines",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "29%",
    category: "security",
  },
  {
    title: "Incident Response & DFIR Specialist",
    description:
      "Leads forensic investigations during and after breaches. Performs disk/memory forensics, threat actor attribution, and containment.",
    avgSalary: "$115,000 – $160,000",
    requiredSkills: JSON.stringify([
      "Digital forensics",
      "Memory analysis (Volatility)",
      "Incident response frameworks",
      "Malware reverse engineering",
      "Chain of custody",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "26%",
    category: "security",
  },
  {
    title: "IAM / PAM Specialist",
    description:
      "Designs identity governance, privileged access management, and zero-trust access architectures. Implements CyberArk, Okta, and Azure AD.",
    avgSalary: "$105,000 – $145,000",
    requiredSkills: JSON.stringify([
      "CyberArk / BeyondTrust",
      "Okta / Azure AD",
      "OAuth / SAML / SCIM",
      "Zero Trust",
      "PAM vaulting",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "23%",
    category: "governance",
  },
  {
    title: "Security Architect",
    description:
      "Defines enterprise security architecture. Designs controls, reference architectures, and integrates security across the entire IT landscape.",
    avgSalary: "$150,000 – $200,000",
    requiredSkills: JSON.stringify([
      "Enterprise architecture (SABSA/TOGAF)",
      "Risk frameworks (NIST/ISO 27001)",
      "Cloud & on-prem security",
      "Cryptography",
      "Network segmentation",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "20%",
    category: "security",
  },
  {
    title: "CISO (Chief Information Security Officer)",
    description:
      "Executive responsible for information security strategy, board-level reporting, regulatory compliance, and leading the entire security organization.",
    avgSalary: "$220,000 – $400,000+",
    requiredSkills: JSON.stringify([
      "Security strategy",
      "Board / executive communication",
      "Risk management",
      "Compliance (GDPR/SOC2/PCI)",
      "Budgeting",
    ]),
    recommendedCourses: JSON.stringify([]),
    growthRate: "15%",
    category: "governance",
  },
]

async function seedRolesIfEmpty() {
  const count = await db.careerRole.count()
  if (count > 0) return
  await db.careerRole.createMany({ data: SEED_ROLES })
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await seedRolesIfEmpty()

    const roles = await db.careerRole.findMany({
      orderBy: { category: "asc" },
    })

    return NextResponse.json({
      roles: roles.map((r) => ({
        ...r,
        requiredSkills: (() => {
          try {
            return JSON.parse(r.requiredSkills || "[]")
          } catch {
            return []
          }
        })(),
        recommendedCourses: (() => {
          try {
            return JSON.parse(r.recommendedCourses || "[]")
          } catch {
            return []
          }
        })(),
      })),
    })
  } catch (err: any) {
    console.error("[career/roles] GET error:", err?.message)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
