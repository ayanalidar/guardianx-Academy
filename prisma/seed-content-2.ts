import { db } from "../src/lib/db"

async function main() {
  console.log("Adding more course modules...")

  // CCNP — add SD-WAN deep dive module
  const ccnp = await db.course.findUnique({ where: { slug: "ccnp-enterprise" }, include: { modules: { select: { title: true } } } })
  if (ccnp && !ccnp.modules.some((m) => m.title.includes("Advanced BGP"))) {
    const mod = await db.module.create({ data: { courseId: ccnp.id, title: "Module 03 — Advanced BGP & Route Manipulation", description: "Master BGP attributes, path manipulation, and route reflectors.", order: 2 } })
    await db.lesson.create({
      data: {
        moduleId: mod.id, title: "BGP Path Attributes Deep Dive", type: "reading", durationMin: 40, order: 0,
        content: `# BGP Path Attributes\n\nBGP uses path attributes to select the best route.\n\n## Well-Known Mandatory\n- **ORIGIN** — IGP(0), EGP(1), INCOMPLETE(3)\n- **AS_PATH** — sequence of ASNs the route traversed\n- **NEXT_HOP** — IP to forward to\n\n## Well-Known Discretionary\n- **LOCAL_PREF** — preference within AS (higher = preferred, default 100)\n- **ATOMIC_AGGREGATE** — route was aggregated\n\n## Optional Transitive\n- **MULTI_EXIT_DISC (MED)** — hint to neighbor AS about preferred entry (lower = preferred)\n- **COMMUNITIES** — tagging for policy\n\n## Path Selection Order\n1. Weight (Cisco proprietary)\n2. LOCAL_PREF\n3. Locally originated\n4. AS_PATH length\n5. ORIGIN\n6. MED\n7. eBGP over iBGP\n8. Oldest route\n9. Lowest router ID`,
      },
    })
    await db.lesson.create({
      data: {
        moduleId: mod.id, title: "Route Reflectors & Confederations", type: "reading", durationMin: 35, order: 1,
        content: `# Scaling iBGP\n\nFull-mesh iBGP doesn't scale (N² connections).\n\n## Route Reflectors (RR)\nA RR reflects routes to iBGP clients.\n- **RR Server** — reflects routes between clients\n- **Clients** — peer only with RR\n- **Non-clients** — must be fully meshed with RR\n\n\`\`\`\nrouter bgp 65000\n neighbor 10.0.0.2 route-reflector-client\n\`\`\`\n\n## Confederations\nSplit a large AS into sub-ASs.\n- Uses AS_CONFED_SEQUENCE in AS_PATH\n- iBGP between sub-AS members\n- eBGP between sub-ASs (but keeps IGPs)\n\n## Best Practice\nUse RRs in a redundant cluster (two RRs per cluster).`,
      },
    })
    console.log("  + CCNP: Advanced BGP module")
  }

  // WAPT — add Business Logic & Race Conditions module
  const wapt = await db.course.findUnique({ where: { slug: "wapt" }, include: { modules: { select: { title: true } } } })
  if (wapt && !wapt.modules.some((m) => m.title.includes("Business Logic"))) {
    const mod = await db.module.create({ data: { courseId: wapt.id, title: "Module 04 — Business Logic & Race Conditions", description: "Exploit application logic flaws and race conditions.", order: 3 } })
    await db.lesson.create({
      data: {
        moduleId: mod.id, title: "Business Logic Vulnerabilities", type: "reading", durationMin: 35, order: 0,
        content: `# Business Logic Flaws\n\nExploit the application's intended logic, not technical bugs.\n\n## Common Patterns\n- **Price manipulation** — negative quantities, decimal overflow\n- **Coupon abuse** — reuse, stacking, expired acceptance\n- **Race conditions** — withdraw money twice simultaneously\n- **Workflow bypass** — skip payment step\n- **Privilege escalation** — change role in profile edit\n\n## Example: Negative Cart\n\`\`\`json\n{ "items": [{"id": 1, "qty": -5}, {"id": 2, "qty": 1}] }\n\`\`\`\nTotal = -5×$100 + 1×$50 = -$450 (store owes you!)\n\n## Testing\n- Think like an attacker, not a user\n- Test edge cases: 0, -1, MAX_INT, NULL\n- Test state transitions out of order\n- Test concurrent operations`,
      },
    })
    await db.lesson.create({
      data: {
        moduleId: mod.id, title: "Race Conditions & TOCTOU", type: "reading", durationMin: 30, order: 1,
        content: `# Race Conditions\n\nTime-of-Check to Time-of-Use (TOCTOU) — exploit the gap between checking and acting.\n\n## Classic: Withdrawal Race\n\`\`\`\n1. Check balance >= $100  ✓\n2. (attacker sends 2nd request)\n3. Deduct $100\n4. (2nd request also deducts $100)\n→ Balance: -$100\n\`\`\`\n\n## Exploitation\nSend many concurrent requests:\n\`\`\`bash\nfor i in $(seq 1 50); do\n  curl -X POST http://target/withdraw -d 'amount=100' &\ndone\n\`\`\`\n\n## Defense\n- **Database locks** — SELECT...FOR UPDATE\n- **Idempotency keys** — prevent duplicate processing\n- **Atomic operations** — UPDATE balance SET bal = bal - 100 WHERE bal >= 100`,
      },
    })
    console.log("  + WAPT: Business Logic module")
  }

  // CyberArk — add Conjur & Secrets Management module
  const cyberark = await db.course.findUnique({ where: { slug: "cyberark-iam-pam" }, include: { modules: { select: { title: true } } } })
  if (cyberark && !cyberark.modules.some((m) => m.title.includes("Conjur"))) {
    const mod = await db.module.create({ data: { courseId: cyberark.id, title: "Module 04 — Conjur & Secrets Management for DevOps", description: "Manage secrets for applications, containers, and CI/CD pipelines.", order: 3 } })
    await db.lesson.create({
      data: {
        moduleId: mod.id, title: "CyberArk Conjur Open Source", type: "reading", durationMin: 32, order: 0,
        content: `# CyberArk Conjur\n\nConjur is CyberArk's open-source secrets manager for DevOps.\n\n## Key Concepts\n- **Hosts** — applications/containers that need secrets\n- **Variables** — the secrets themselves\n- **Policy** — YAML-like declarative permissions\n\n## Policy Example\n\`\`\`yaml\n- !policy\n  id: db\n  body:\n    - !variable password\n    - !group users\n    - !permit\n      role: !group users\n      privilege: [read, execute]\n      resource: !variable password\n\`\`\`\n\n## Authentication\n- Applications auth with API keys\n- Kubernetes/CNCF integration via service account tokens\n- Works with Jenkins, GitLab CI, Ansible, Terraform\n\n## vs Vault (EPV)\n- Conjur: DevOps, API-first, cloud-native\n- EPV: IT/admin privileged accounts, enterprise PAM`,
      },
    })
    await db.lesson.create({
      data: {
        moduleId: mod.id, title: "CI/CD Secret Management", type: "reading", durationMin: 28, order: 1,
        content: `# Secrets in CI/CD\n\nHardcoded secrets in pipelines = #1 cause of breaches.\n\n## Best Practices\n1. **Never commit secrets** to Git (.env, config files)\n2. **Use a secrets manager** (Conjur, HashiCorp Vault, AWS Secrets Manager)\n3. **Rotate secrets** automatically\n4. **Audit access** — who read what when\n5. **Separate dev/staging/prod** secrets\n\n## Jenkins + Conjur\n\`\`\`groovy\nwithCredentials([conjur(secret: 'db/password', variable: 'DB_PASS')]) {\n  sh 'psql -h db -u app -p $DB_PASS'\n}\n\`\`\n\n## Kubernetes Secrets\n- Use Sealed Secrets or External Secrets Operator\n- Never store in plain K8s Secrets (base64 ≠ encrypted)\n- Use Conjur authenticator with service account JWT`,
      },
    })
    console.log("  + CyberArk: Conjur module")
  }

  console.log("Done!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
