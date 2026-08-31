// Seed GuardianX exam platform — certs, exams, questions
// Run with: DATABASE_URL="..." bunx tsx prisma/seed-exams.ts
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  console.log("Seeding GuardianX exam platform...")

  // ============================================================
  // 1) GUARDIAN CERTIFICATIONS
  // ============================================================
  const certifications = [
    {
      slug: "gx-certified-security-analyst",
      name: "GX Certified Security Analyst",
      description:
        "Entry-to-intermediate certification validating core security analysis skills: threat identification, vulnerability assessment, log analysis, and security operations fundamentals.",
      level: "Intermediate",
      domains: JSON.stringify([
        "Web Security",
        "Network Security",
        "Security Operations",
        "Threat Intelligence",
      ]),
      skills: JSON.stringify([
        "Threat Identification",
        "Vulnerability Assessment",
        "Log Analysis",
        "SIEM Fundamentals",
        "Incident Triage",
      ]),
      passingScore: 70,
      validityPeriod: 36,
      icon: "ShieldCheck",
      color: "text-emerald-300",
      published: true,
    },
    {
      slug: "gx-certified-penetration-tester",
      name: "GX Certified Penetration Tester",
      description:
        "Advanced certification for offensive-security practitioners. Validates hands-on ability to enumerate, exploit, pivot, and report across web, network, and host targets.",
      level: "Advanced",
      domains: JSON.stringify([
        "Web Security",
        "Network Security",
        "Privilege Escalation",
        "Exploitation",
      ]),
      skills: JSON.stringify([
        "Recon & Enumeration",
        "Web Exploitation",
        "Network Attacks",
        "Privilege Escalation",
        "Pivot & Lateral Movement",
        "Reporting",
      ]),
      passingScore: 70,
      validityPeriod: 24,
      icon: "Swords",
      color: "text-rose-300",
      published: true,
    },
    {
      slug: "gx-certified-soc-analyst",
      name: "GX Certified SOC Analyst",
      description:
        "Defensive-security certification for SOC analysts. Validates detection engineering, alert triage, threat hunting, and incident-response workflows in a 24/7 operations context.",
      level: "Intermediate",
      domains: JSON.stringify([
        "DFIR",
        "Network Security",
        "Security Operations",
        "Threat Intelligence",
      ]),
      skills: JSON.stringify([
        "Alert Triage",
        "Threat Hunting",
        "Log Correlation",
        "Detection Engineering",
        "Incident Response",
        "MITRE ATT&CK",
      ]),
      passingScore: 70,
      validityPeriod: 36,
      icon: "Radar",
      color: "text-cyan-300",
      published: true,
    },
    {
      slug: "gx-certified-grc-professional",
      name: "GX Certified GRC Professional",
      description:
        "Certification for governance, risk, and compliance professionals. Validates policy frameworks, risk assessment methodologies, audit readiness, and regulatory mapping.",
      level: "Intermediate",
      domains: JSON.stringify([
        "GRC",
        "Risk Management",
        "Compliance",
        "Policy Frameworks",
      ]),
      skills: JSON.stringify([
        "Risk Assessment",
        "ISO 27001",
        "NIST CSF",
        "Audit & Compliance",
        "Policy Writing",
        "Vendor Risk",
      ]),
      passingScore: 70,
      validityPeriod: 36,
      icon: "Scale",
      color: "text-violet-300",
      published: true,
    },
  ]

  const certRows: { id: string; slug: string }[] = []
  for (const c of certifications) {
    const row = await db.guardianCertification.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    })
    certRows.push({ id: row.id, slug: row.slug })
    console.log(`  ✓ Cert: ${c.name}`)
  }

  // ============================================================
  // 2) EXAMS — one per certification
  // ============================================================
  const exams = [
    {
      slug: "gx-security-analyst-exam",
      title: "GX Security Analyst Certification Exam",
      description:
        "Proctored 50-question exam covering web, network, and operational security. 120 minutes. Passing score 70%.",
      certificationId: certRows[0].id,
      duration: 120,
      passingScore: 70,
      maxAttempts: 3,
      questionCount: 50,
      sections: JSON.stringify([
        { title: "Web Security", questionCount: 15, domains: ["Web Security"] },
        { title: "Network Security", questionCount: 15, domains: ["Network Security"] },
        { title: "Security Operations", questionCount: 12, domains: ["Security Operations"] },
        { title: "Threat Intelligence", questionCount: 8, domains: ["Threat Intelligence"] },
      ]),
      questionType: "mcq",
      proctoringEnabled: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      status: "published",
    },
    {
      slug: "gx-penetration-tester-exam",
      title: "GX Penetration Tester Certification Exam",
      description:
        "Advanced proctored exam covering reconnaissance, exploitation, privilege escalation, and reporting. 120 minutes, 50 questions.",
      certificationId: certRows[1].id,
      duration: 120,
      passingScore: 70,
      maxAttempts: 3,
      questionCount: 50,
      sections: JSON.stringify([
        { title: "Recon & Enumeration", questionCount: 12, domains: ["Web Security", "Network Security"] },
        { title: "Web Exploitation", questionCount: 15, domains: ["Web Security"] },
        { title: "Network Attacks", questionCount: 13, domains: ["Network Security"] },
        { title: "Privilege Escalation", questionCount: 10, domains: ["Privilege Escalation"] },
      ]),
      questionType: "hybrid",
      proctoringEnabled: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      status: "published",
    },
    {
      slug: "gx-soc-analyst-exam",
      title: "GX SOC Analyst Certification Exam",
      description:
        "Proctored exam validating SOC analyst skills — detection, triage, hunting, IR. 120 minutes, 50 questions, hybrid format.",
      certificationId: certRows[2].id,
      duration: 120,
      passingScore: 70,
      maxAttempts: 3,
      questionCount: 50,
      sections: JSON.stringify([
        { title: "DFIR", questionCount: 15, domains: ["DFIR"] },
        { title: "Network Security", questionCount: 12, domains: ["Network Security"] },
        { title: "Security Operations", questionCount: 13, domains: ["Security Operations"] },
        { title: "Threat Intelligence", questionCount: 10, domains: ["Threat Intelligence"] },
      ]),
      questionType: "hybrid",
      proctoringEnabled: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      status: "published",
    },
    {
      slug: "gx-grc-professional-exam",
      title: "GX GRC Professional Certification Exam",
      description:
        "Proctored exam for governance, risk, and compliance practitioners. Frameworks, risk assessment, audit readiness. 120 minutes, 50 questions.",
      certificationId: certRows[3].id,
      duration: 120,
      passingScore: 70,
      maxAttempts: 3,
      questionCount: 50,
      sections: JSON.stringify([
        { title: "GRC Foundations", questionCount: 15, domains: ["GRC"] },
        { title: "Risk Management", questionCount: 12, domains: ["Risk Management"] },
        { title: "Compliance & Audit", questionCount: 13, domains: ["Compliance"] },
        { title: "Policy Frameworks", questionCount: 10, domains: ["Policy Frameworks"] },
      ]),
      questionType: "mcq",
      proctoringEnabled: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      status: "published",
    },
  ]

  const examRows: { id: string; slug: string }[] = []
  for (const e of exams) {
    const row = await db.exam.upsert({
      where: { slug: e.slug },
      update: e,
      create: e,
    })
    examRows.push({ id: row.id, slug: row.slug })
    console.log(`  ✓ Exam: ${e.title}`)
  }

  // Link each certification to its exam (back-reference)
  for (let i = 0; i < certRows.length; i++) {
    await db.guardianCertification.update({
      where: { id: certRows[i].id },
      data: { examId: examRows[i].id },
    })
  }

  // ============================================================
  // 3) QUESTIONS — 5 per exam, 20 total
  //    Domains: Web Security, Network Security, GRC, DFIR
  // ============================================================
  type Q = {
    examId: string
    type: string
    domain: string
    skill?: string
    difficulty: string
    question: string
    options: string[]
    correctAnswer: string // JSON
    explanation?: string
    points: number
    tags: string[]
  }

  const questions: Q[] = [
    // ============ Exam 0 — Security Analyst ============
    {
      examId: examRows[0].id,
      type: "mcq",
      domain: "Web Security",
      skill: "Threat Identification",
      difficulty: "medium",
      question: "Which vulnerability class is BEST described by 'untrusted input reflected into a page without encoding'?",
      options: [
        "SQL Injection",
        "Cross-Site Scripting (XSS)",
        "Server-Side Request Forgery (SSRF)",
        "Insecure Direct Object Reference (IDOR)",
      ],
      correctAnswer: JSON.stringify(1),
      explanation:
        "Reflected untrusted input rendered into a victim's browser without encoding is the canonical definition of Reflected XSS.",
      points: 1,
      tags: JSON.stringify(["owasp", "xss", "web"]),
    },
    {
      examId: examRows[0].id,
      type: "mcq",
      domain: "Network Security",
      skill: "Vulnerability Assessment",
      difficulty: "easy",
      question: "Which port does HTTPS use by default?",
      options: ["80", "443", "22", "21"],
      correctAnswer: JSON.stringify(1),
      explanation: "HTTPS runs on TCP/443 by default; HTTP uses TCP/80.",
      points: 1,
      tags: JSON.stringify(["networking", "ports"]),
    },
    {
      examId: examRows[0].id,
      type: "truefalse",
      domain: "Security Operations",
      skill: "Log Analysis",
      difficulty: "easy",
      question: "SIEM platforms primarily aggregate and correlate log data from multiple sources to surface security events.",
      options: ["True", "False"],
      correctAnswer: JSON.stringify(0),
      explanation:
        "SIEM (Security Information & Event Management) systems aggregate, normalize, and correlate logs to detect and prioritize events.",
      points: 1,
      tags: JSON.stringify(["siem", "soc"]),
    },
    {
      examId: examRows[0].id,
      type: "mcq",
      domain: "Threat Intelligence",
      skill: "Incident Triage",
      difficulty: "medium",
      question: "In the MITRE ATT&CK framework, which tactic represents 'the adversary trying to get into your network'?",
      options: ["Execution", "Initial Access", "Persistence", "Exfiltration"],
      correctAnswer: JSON.stringify(1),
      explanation: "Initial Access is the tactic describing how an adversary first enters the network.",
      points: 1,
      tags: JSON.stringify(["mitre", "attack", "triage"]),
    },
    {
      examId: examRows[0].id,
      type: "mcq",
      domain: "Web Security",
      skill: "Threat Identification",
      difficulty: "hard",
      question: "A JWT token is signed with `alg:none`. What is the PRIMARY risk?",
      options: [
        "Token leakage via logs",
        "Algorithm confusion allowing unsigned tokens to be accepted",
        "Excessive token lifetime",
        "Cross-origin read blocking",
      ],
      correctAnswer: JSON.stringify(1),
      explanation:
        "The `alg:none` attack lets an attacker strip the signature; if the server accepts unsigned tokens, integrity is broken.",
      points: 2,
      tags: JSON.stringify(["jwt", "auth", "owasp"]),
    },

    // ============ Exam 1 — Penetration Tester ============
    {
      examId: examRows[1].id,
      type: "mcq",
      domain: "Web Security",
      skill: "Web Exploitation",
      difficulty: "medium",
      question: "Which payload would BEST demonstrate a blind SQL injection on a numeric `id` parameter?",
      options: [
        `1' OR '1'='1`,
        `1 AND 1=1`,
        `<script>alert(1)</script>`,
        `../../../etc/passwd`,
      ],
      correctAnswer: JSON.stringify(1),
      explanation:
        "For a numeric parameter (no quotes), `1 AND 1=1` (vs `1 AND 1=2`) is the standard boolean-based blind test. The quoted payload would only work for string contexts.",
      points: 1,
      tags: JSON.stringify(["sqli", "owasp", "web"]),
    },
    {
      examId: examRows[1].id,
      type: "mcq",
      domain: "Network Security",
      skill: "Recon & Enumeration",
      difficulty: "easy",
      question: "Which nmap flag enables OS fingerprinting?",
      options: ["-sV", "-O", "-A", "-Pn"],
      correctAnswer: JSON.stringify(1),
      explanation: "`-O` enables OS detection. `-sV` is service version detection; `-A` is aggressive (includes -O, -sV, scripts, traceroute).",
      points: 1,
      tags: JSON.stringify(["nmap", "recon"]),
    },
    {
      examId: examRows[1].id,
      type: "multiple",
      domain: "Privilege Escalation",
      skill: "Privilege Escalation",
      difficulty: "hard",
      question: "Which of the following are COMMON Linux privilege-escalation vectors? (Select all that apply.)",
      options: [
        "SUID binaries with known vulnerabilities",
        "World-writable cron scripts running as root",
        "Kernel CVEs (e.g. DirtyCow)",
        "A user with UID 1000 instead of 0",
      ],
      correctAnswer: JSON.stringify([0, 1, 2]),
      explanation:
        "SUID, misconfigured cron, and kernel CVEs are classic privesc paths. UID 1000 is a normal non-root user and is not itself an escalation vector.",
      points: 2,
      tags: JSON.stringify(["linux", "privesc", "privilege-escalation"]),
    },
    {
      examId: examRows[1].id,
      type: "mcq",
      domain: "Web Security",
      skill: "Web Exploitation",
      difficulty: "medium",
      question: "An application fetches a URL supplied by the user without validation. Which vulnerability is MOST likely?",
      options: ["XSS", "SSRF", "CSRF", "XXE"],
      correctAnswer: JSON.stringify(1),
      explanation: "Server-Side Request Forgery (SSRF) occurs when the server fetches an attacker-supplied URL, often reaching internal services.",
      points: 1,
      tags: JSON.stringify(["ssrf", "owasp"]),
    },
    {
      examId: examRows[1].id,
      type: "truefalse",
      domain: "Network Security",
      skill: "Pivot & Lateral Movement",
      difficulty: "medium",
      question: "Pass-the-Hash allows an attacker to authenticate as a user by presenting the NTLM hash instead of the cleartext password.",
      options: ["True", "False"],
      correctAnswer: JSON.stringify(0),
      explanation: "Pass-the-Hash (PtH) reuses NTLM password hashes for authentication — cleartext is not required.",
      points: 1,
      tags: JSON.stringify(["windows", "pth", "lateral"]),
    },

    // ============ Exam 2 — SOC Analyst ============
    {
      examId: examRows[2].id,
      type: "mcq",
      domain: "DFIR",
      skill: "Incident Response",
      difficulty: "medium",
      question: "In the SANS PICERL incident-response lifecycle, what does 'C' stand for?",
      options: ["Containment", "Communication", "Compliance", "Collection"],
      correctAnswer: JSON.stringify(0),
      explanation: "PICERL = Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.",
      points: 1,
      tags: JSON.stringify(["ir", "sans", "picerl"]),
    },
    {
      examId: examRows[2].id,
      type: "mcq",
      domain: "Security Operations",
      skill: "Alert Triage",
      difficulty: "easy",
      question: "Which metric measures the AVERAGE time an alert sits before a SOC analyst picks it up?",
      options: ["MTTR", "MTTD", "MTTA", "MTBF"],
      correctAnswer: JSON.stringify(2),
      explanation: "MTTA = Mean Time To Acknowledge. MTTR is recovery, MTTD is detection.",
      points: 1,
      tags: JSON.stringify(["soc", "metrics"]),
    },
    {
      examId: examRows[2].id,
      type: "multiple",
      domain: "DFIR",
      skill: "Threat Hunting",
      difficulty: "hard",
      question: "Which of these are considered reliable indicators of compromise (IOCs) for a host? (Select all that apply.)",
      options: [
        "Unexpected scheduled-task creation",
        "A process spawning from a non-standard directory like `\\Public\\`",
        "New outbound connection to a known-bad IP",
        "User has 3 browsers installed",
      ],
      correctAnswer: JSON.stringify([0, 1, 2]),
      explanation:
        "Persistence (scheduled tasks), suspicious process locations, and C2 callbacks are high-confidence IOCs. Multiple browsers installed is normal user behavior.",
      points: 2,
      tags: JSON.stringify(["dfir", "ioc", "hunting"]),
    },
    {
      examId: examRows[2].id,
      type: "mcq",
      domain: "Network Security",
      skill: "Log Correlation",
      difficulty: "medium",
      question: "In Zeek (Bro) logs, which log file records DNS queries observed on the wire?",
      options: ["conn.log", "dns.log", "http.log", "weird.log"],
      correctAnswer: JSON.stringify(1),
      explanation: "Zeek's `dns.log` records DNS queries and responses; `conn.log` covers connection metadata.",
      points: 1,
      tags: JSON.stringify(["zeek", "network", "dns"]),
    },
    {
      examId: examRows[2].id,
      type: "truefalse",
      domain: "Threat Intelligence",
      skill: "MITRE ATT&CK",
      difficulty: "easy",
      question: "MITRE ATT&CK techniques are organized by tactics that represent the adversary's technical objectives.",
      options: ["True", "False"],
      correctAnswer: JSON.stringify(0),
      explanation: "Tactics represent the 'why' (objectives like Initial Access, Exfiltration); techniques are the 'how'.",
      points: 1,
      tags: JSON.stringify(["mitre", "attack"]),
    },

    // ============ Exam 3 — GRC Professional ============
    {
      examId: examRows[3].id,
      type: "mcq",
      domain: "GRC",
      skill: "ISO 27001",
      difficulty: "medium",
      question: "ISO/IEC 27001 is PRIMARILY a specification for:",
      options: [
        "A risk-assessment methodology",
        "An Information Security Management System (ISMS)",
        "A cloud-security control catalog",
        "A penetration-testing standard",
      ],
      correctAnswer: JSON.stringify(1),
      explanation: "ISO/IEC 27001 specifies requirements for establishing, implementing, and improving an ISMS.",
      points: 1,
      tags: JSON.stringify(["iso27001", "isms"]),
    },
    {
      examId: examRows[3].id,
      type: "mcq",
      domain: "Risk Management",
      skill: "Risk Assessment",
      difficulty: "medium",
      question: "In a quantitative risk assessment, Annualized Loss Expectancy (ALE) is calculated as:",
      options: [
        "SLE × ARO",
        "AV × EF",
        "MTTR × MTTD",
        "Risk = Threat × Vulnerability",
      ],
      correctAnswer: JSON.stringify(0),
      explanation: "ALE = SLE × ARO. SLE = AV × EF (Asset Value × Exposure Factor).",
      points: 1,
      tags: JSON.stringify(["risk", "ale", "quantitative"]),
    },
    {
      examId: examRows[3].id,
      type: "mcq",
      domain: "Compliance",
      skill: "Audit & Compliance",
      difficulty: "easy",
      question: "Which framework is BEST suited for assessing maturity of an organization's cybersecurity capability across functions like Identify, Protect, Detect, Respond, Recover?",
      options: ["PCI DSS", "NIST CSF", "ITIL", "COBIT 5"],
      correctAnswer: JSON.stringify(1),
      explanation: "The NIST Cybersecurity Framework (CSF) organizes cybersecurity into 5 core functions and provides a maturity-tier model.",
      points: 1,
      tags: JSON.stringify(["nist", "csf", "framework"]),
    },
    {
      examId: examRows[3].id,
      type: "multiple",
      domain: "GRC",
      skill: "Policy Writing",
      difficulty: "medium",
      question: "Which of the following are TYPICALLY required components of an information-security policy? (Select all that apply.)",
      options: [
        "Purpose and scope",
        "Roles and responsibilities",
        "Enforcement and exceptions",
        "Source code of the SIEM",
      ],
      correctAnswer: JSON.stringify([0, 1, 2]),
      explanation: "Policies state purpose/scope, roles, and enforcement. SIEM source code is a technical artifact, not a policy component.",
      points: 2,
      tags: JSON.stringify(["policy", "grc"]),
    },
    {
      examId: examRows[3].id,
      type: "truefalse",
      domain: "Compliance",
      skill: "Vendor Risk",
      difficulty: "easy",
      question: "PCI DSS applies to ANY organization that stores, processes, or transmits cardholder data, regardless of size.",
      options: ["True", "False"],
      correctAnswer: JSON.stringify(0),
      explanation: "PCI DSS scope is determined by data handling, not by organization size — small merchants must still comply.",
      points: 1,
      tags: JSON.stringify(["pci", "compliance"]),
    },
  ]

  // Clear existing questions for these exams (idempotent re-seed)
  for (const e of examRows) {
    await db.questionBank.deleteMany({ where: { examId: e.id } })
  }

  for (const q of questions) {
    await db.questionBank.create({
      data: {
        examId: q.examId,
        type: q.type,
        domain: q.domain,
        skill: q.skill,
        difficulty: q.difficulty,
        question: q.question,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
        tags: q.tags,
      },
    })
  }
  console.log(`  ✓ Seeded ${questions.length} questions across ${examRows.length} exams`)

  console.log("\n✅ Exam platform seed complete.")
  console.log(`   Certifications: ${certRows.length}`)
  console.log(`   Exams:          ${examRows.length}`)
  console.log(`   Questions:      ${questions.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
