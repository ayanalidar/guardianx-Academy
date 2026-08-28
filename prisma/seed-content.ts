import { db } from "../src/lib/db"

async function main() {
  console.log("Adding more course content...")

  // Add new modules + lessons to CEH
  const ceh = await db.course.findUnique({ where: { slug: "ceh" }, include: { modules: { select: { id: true, title: true, order: true } } } })
  if (ceh) {
    const existingModuleTitles = ceh.modules.map((m) => m.title)
    const newModules = [
      {
        title: "Module 06 — Social Engineering",
        description: "Master the art of human hacking and psychological manipulation.",
        order: 5,
        lessons: [
          {
            title: "Social Engineering Fundamentals",
            type: "reading",
            durationMin: 28,
            content: `# Social Engineering\n\nSocial engineering exploits **human psychology** rather than technical vulnerabilities.\n\n## The Human Element\n"Humans are the weakest link in any security system." — Kevin Mitnick\n\n## Attack Vectors\n- **Phishing** — fraudulent emails mimicking trusted brands\n- **Vishing** — voice-based phishing (phone calls)\n- **Smishing** — SMS-based phishing\n- **Pretexting** — creating a fabricated scenario\n- **Baiting** — leaving infected USB drives\n- **Tailgating** — following authorized personnel\n\n## Psychological Principles (Cialdini)\n1. **Reciprocity** — giving something to get something\n2. **Authority** — impersonating authority figures\n3. **Scarcity** — creating urgency ("limited time")\n4. **Social Proof** — "everyone else is doing it"\n5. **Commitment** — small yes → big yes\n6. **Liking** — building rapport\n\n## Defense\n- Security awareness training\n- Verify requests through secondary channels\n- Zero-trust mindset`,
          },
          {
            title: "Phishing Campaign Analysis",
            type: "pdf",
            pdfPages: 14,
            durationMin: 25,
            content: "Walkthrough of real-world phishing campaigns: email headers, spoofed domains, credential harvesting pages, and MFA bypass kits.",
          },
          {
            title: "Quiz: Social Engineering",
            type: "reading",
            durationMin: 10,
            content: "Test your social engineering knowledge.",
            quiz: {
              title: "Social Engineering",
              questions: [
                {
                  text: "Which attack uses phone calls to trick victims?",
                  options: ["Phishing", "Vishing", "Smishing", "Tailgating"],
                  answerIndex: 1,
                  explanation: "Vishing = Voice phishing, using phone calls.",
                },
                {
                  text: "Leaving an infected USB in the parking lot is an example of:",
                  options: ["Pretexting", "Baiting", "Phishing", "Quid pro quo"],
                  answerIndex: 1,
                  explanation: "Baiting offers something enticing (free USB) to lure the victim.",
                },
              ],
            },
          },
        ],
      },
      {
        title: "Module 07 — Session Hijacking & Web Attacks",
        description: "Hijack user sessions and execute advanced web attacks.",
        order: 6,
        lessons: [
          {
            title: "Session Hijacking Techniques",
            type: "reading",
            durationMin: 32,
            content: `# Session Hijacking\n\nStealing or predicting a user's session token to impersonate them.\n\n## Session Token Theft\n- **XSS** — steal \`document.cookie\`\n- **Network sniffing** — unencrypted HTTP\n- **Session fixation** — force a known session ID\n- **Predictable session IDs** — weak RNG\n\n## Tools\n- **Burp Suite** — intercept/modify cookies\n- **OWASP ZAP** — automated scanning\n- **Firesheep** (legacy) — HTTP sidejacking\n\n## Defense\n- **HTTPS everywhere** (TLS)\n- **HttpOnly + Secure cookies**\n- **Regenerate session ID on login**\n- **Short session timeouts**\n- **CSRF tokens**`,
          },
          {
            title: "CSRF & SSRF Deep Dive",
            type: "reading",
            durationMin: 30,
            content: `# CSRF (Cross-Site Request Forgery)\nForce an authenticated user's browser to send a request to your site.\n\n## Example\n\`\`\`html\n<form action="https://bank.com/transfer" method="POST">\n  <input name="to" value="attacker">\n  <input name="amount" value="10000">\n</form>\n<script>document.forms[0].submit()</script>\n\`\`\`\n\n## Defense\n- **Anti-CSRF tokens** (synchronizer pattern)\n- **SameSite cookies** (Lax/Strict)\n- **Origin/Referer header validation**\n- **Re-authentication** for sensitive actions\n\n# SSRF (Server-Side Request Forgery)\nMake the server send requests to attacker-chosen URLs.\n\n## Impact\n- Access internal services (cloud metadata!)\n- Port scanning internal network\n- Reading local files (file:// protocol)\n\n## Defense\n- Allowlist outbound domains\n- Block private IP ranges\n- Disable unused URL schemes (file://, gopher://)`,
          },
        ],
      },
      {
        title: "Module 08 — Evading IDS, Firewalls & Honeypots",
        description: "Bypass security controls and detect decoy systems.",
        order: 7,
        lessons: [
          {
            title: "IDS/IPS Evasion Techniques",
            type: "reading",
            durationMin: 35,
            content: `# IDS/IPS Evasion\n\nIntrusion Detection Systems (IDS) inspect traffic for malicious patterns. Evasion aims to bypass detection.\n\n## Techniques\n- **Fragmentation** — split packets across boundaries\n- **Tunneling** — encapsulate attacks in ICMP/HTTP/DNS\n- **Encoding** — URL encoding, Unicode, base64\n- **Timing** — slow scans to avoid threshold alerts\n- **Decoy scanning** — \`nmap -D RND:10\`\n- **Spoofed source IP** — \`nmap -S fake_ip\`\n\n## Snort Rule Evasion\n- Polymorphic payloads\n- NOP sled variations\n- Alternate shellcode encoders (shikata_ga_nai)\n\n## Honeypot Detection\n- Check for honeyd signatures\n- Unusual open ports or services\n- Timing analysis (honeypots respond instantly)`,
          },
          {
            title: "Firewall Bypass & Pivot",
            type: "pdf",
            pdfPages: 18,
            durationMin: 35,
            content: "Techniques for bypassing firewalls: tunneling through allowed ports, DNS tunneling, ICMP tunneling, and pivoting through compromised hosts with ProxyChains/Chisel.",
          },
        ],
      },
    ]

    for (const m of newModules) {
      if (!existingModuleTitles.includes(m.title)) {
        const module_ = await db.module.create({ data: { courseId: ceh.id, title: m.title, description: m.description, order: m.order } })
        for (let li = 0; li < m.lessons.length; li++) {
          const l = m.lessons[li] as any
          const lesson = await db.lesson.create({
            data: { moduleId: module_.id, title: l.title, type: l.type, content: l.content, pdfPages: l.pdfPages ?? 0, durationMin: l.durationMin ?? 15, order: li },
          })
          if (l.quiz) {
            const quiz = await db.quiz.create({ data: { lessonId: lesson.id, title: l.quiz.title, description: "Test your knowledge" } })
            for (const q of l.quiz.questions) {
              await db.question.create({ data: { quizId: quiz.id, text: q.text, options: q.options.join("|"), answerIndex: q.answerIndex, explanation: q.explanation } })
            }
          }
        }
        console.log(`  + CEH: ${m.title}`)
      }
    }
  }

  // Add a new module to CCNA
  const ccna = await db.course.findUnique({ where: { slug: "ccna" }, include: { modules: { select: { id: true, title: true } } } })
  if (ccna) {
    const has = ccna.modules.some((m) => m.title.includes("IPv6"))
    if (!has) {
      const mod = await db.module.create({ data: { courseId: ccna.id, title: "Module 05 — IPv6 Fundamentals", description: "Understand IPv6 addressing and transition mechanisms.", order: 4 } })
      await db.lesson.create({
        data: {
          moduleId: mod.id, title: "IPv6 Addressing & Subnetting", type: "reading", durationMin: 35, order: 0,
          content: `# IPv6\n\n128-bit addresses written as 8 groups of 4 hex digits: \`2001:0db8:85a3:0000:0000:8a2e:0370:7334\`\n\n## Compression Rules\n- Leading zeros omitted: \`0db8\` → \`db8\`\n- Consecutive zero groups → \`::\` (once only)\n- Example: \`2001:db8::8a2e:370:7334\`\n\n## Address Types\n- **Global Unicast** (2000::/3) — public, routable\n- **Link-Local** (fe80::/10) — auto-config, single segment\n- **Unique Local** (fc00::/7) — private (like RFC1918)\n- **Loopback** (::1) — like 127.0.0.1\n- **Multicast** (ff00::/8)\n\n## Subnetting\nUnlike IPv4, IPv6 subnets are typically /64 (64-bit network + 64-bit host).\n- Site gets /48 → 65,536 × /64 subnets\n- Typical LAN: /64\n\n## SLAAC (Stateless Address Autoconfiguration)\nHosts derive their IP from the network prefix (RA) + MAC (EUI-64).\nNo DHCP server needed.\n\n## Transition\n- **Dual-stack** — run IPv4 + IPv6 simultaneously\n- **Tunneling** — 6to4, Teredo, GRE\n- **NAT64/DNS64** — translate between protocols`,
        },
      })
      await db.lesson.create({
        data: {
          moduleId: mod.id, title: "IPv6 Routing & OSPFv3", type: "pdf", pdfPages: 16, durationMin: 28, order: 1,
          content: "OSPFv3 for IPv6, BGP MP-BGP, static IPv6 routes, and neighbor discovery protocol (NDP) deep dive.",
        },
      })
      console.log("  + CCNA: Module 05 — IPv6 Fundamentals")
    }
  }

  // Add a new module to CISSP
  const cissp = await db.course.findUnique({ where: { slug: "cissp" }, include: { modules: { select: { id: true, title: true } } } })
  if (cissp) {
    const has = cissp.modules.some((m) => m.title.includes("Security Operations"))
    if (!has) {
      const mod = await db.module.create({ data: { courseId: cissp.id, title: "Domain 7 — Security Operations", description: "Operate, monitor, and incident response.", order: 2 } })
      await db.lesson.create({
        data: {
          moduleId: mod.id, title: "Incident Response Lifecycle", type: "reading", durationMin: 38, order: 0,
          content: `# Incident Response (NIST SP 800-61)\n\n## 4 Phases\n1. **Preparation** — policies, tools, training, contacts\n2. **Detection & Analysis** — IDS alerts, SIEM, user reports\n3. **Containment, Eradication & Recovery** — isolate, remove, restore\n4. **Post-Incident Activity** — lessons learned, improve\n\n## SOC Tiers\n- **Tier 1** — Triage (initial assessment)\n- **Tier 2** — Investigation (deep analysis)\n- **Tier 3** — Threat hunting (proactive)\n- **SOC Manager** — coordination\n\n## Key Metrics\n- **MTTD** (Mean Time to Detect)\n- **MTTR** (Mean Time to Respond)\n- **MTTC** (Mean Time to Contain)\n\n## Forensics\n- **Order of Volatility** — CPU cache → RAM → Swap → Disk → Network (collect most volatile first)\n- **Chain of Custody** — document every handler\n- **Write blockers** — prevent modification`,
        },
      })
      await db.lesson.create({
        data: {
          moduleId: mod.id, title: "Quiz: Security Operations", type: "reading", durationMin: 10, order: 1,
          content: "Test your incident response knowledge.",
          quiz: {
            title: "Security Operations",
            questions: [
              {
                text: "What is the FIRST phase of the NIST incident response lifecycle?",
                options: ["Detection", "Preparation", "Containment", "Recovery"],
                answerIndex: 1,
                explanation: "Preparation comes first — building the capability before an incident occurs.",
              },
              {
                text: "In forensic collection, which data source should be collected FIRST (most volatile)?",
                options: ["Hard disk", "RAM", "CPU cache", "Network logs"],
                answerIndex: 2,
                explanation: "CPU cache is most volatile, then RAM, then swap, then disk.",
              },
              {
                text: "MTTR stands for:",
                options: ["Mean Time to Recovery", "Mean Time to Respond", "Maximum Tolerable Recovery Rate", "Mean Time to Repair"],
                answerIndex: 1,
                explanation: "MTTR = Mean Time to Respond in a security operations context.",
              },
            ],
          },
        },
      })
      console.log("  + CISSP: Domain 7 — Security Operations")
    }
  }

  console.log("Done!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
