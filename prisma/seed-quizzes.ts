import { db } from "../src/lib/db"

interface QuizDef {
  lessonTitle: string
  title: string
  questions: { text: string; options: string[]; answerIndex: number; explanation?: string }[]
}

const QUIZZES: QuizDef[] = [
  {
    lessonTitle: "Command-Line Mastery",
    title: "Linux Command-Line Fundamentals",
    questions: [
      { text: "Which command recursively copies a directory?", options: ["cp src dst", "cp -r src dst", "cp -f src dst", "copy src dst"], answerIndex: 1, explanation: "The -r flag enables recursive copy for directories." },
      { text: "What does `chmod 755` set?", options: ["rwxr-xr-x", "rwxrwxrwx", "rw-r--r--", "r-xr-xr-x"], answerIndex: 0, explanation: "755 = owner rwx, group r-x, others r-x." },
      { text: "Which command finds files by name?", options: ["find / -name '*.conf'", "search '*.conf'", "locate name '*.conf'", "grep '*.conf'"], answerIndex: 0, explanation: "find with -name flag searches by filename pattern." },
    ],
  },
  {
    lessonTitle: "Users, Groups & sudo",
    title: "User Management Quiz",
    questions: [
      { text: "Which command adds a user to the wheel group?", options: ["usermod -G wheel alice", "usermod -aG wheel alice", "groupadd alice wheel", "adduser wheel alice"], answerIndex: 1, explanation: "-aG appends to the group without removing from others." },
      { text: "What file configures sudo privileges?", options: ["/etc/sudoers", "/etc/passwd", "/etc/shadow", "/etc/group"], answerIndex: 0, explanation: "/etc/sudoers — always edit with visudo." },
      { text: "Which command safely edits sudoers?", options: ["vim /etc/sudoers", "visudo", "nano /etc/sudoers", "sudoedit"], answerIndex: 1, explanation: "visudo validates syntax before saving." },
    ],
  },
  {
    lessonTitle: "Partitioning, LVM & Filesystems",
    title: "Storage & LVM Quiz",
    questions: [
      { text: "What is the correct LVM layer order?", options: ["LV → VG → PV", "PV → VG → LV", "VG → PV → LV", "PV → LV → VG"], answerIndex: 1, explanation: "Physical Volume → Volume Group → Logical Volume." },
      { text: "Which command grows an XFS filesystem?", options: ["resize2fs", "xfs_growfs", "lvextend --fs", "fsck"], answerIndex: 1, explanation: "xfs_growfs grows XFS; resize2fs is for ext4." },
      { text: "Which command extends a logical volume?", options: ["lvextend", "vgextend", "pvextend", "resize"], answerIndex: 0, explanation: "lvextend -L +5G /dev/vg/lv extends by 5GB." },
    ],
  },
  {
    lessonTitle: "SELinux Fundamentals",
    title: "SELinux Quiz",
    questions: [
      { text: "Which SELinux mode logs violations but doesn't enforce?", options: ["enforcing", "permissive", "disabled", "audit"], answerIndex: 1, explanation: "Permissive mode logs but doesn't block." },
      { text: "Which command temporarily sets SELinux to permissive?", options: ["setenforce 0", "setenforce 1", "semanage permissive", "chcon 0"], answerIndex: 0, explanation: "setenforce 0 = permissive, setenforce 1 = enforcing." },
      { text: "What command restores default file contexts?", options: ["restorecon", "chcon", "setfiles", "semanage fcontext"], answerIndex: 0, explanation: "restorecon resets to the policy-defined context." },
    ],
  },
  {
    lessonTitle: "systemd & Service Management",
    title: "systemd Quiz",
    questions: [
      { text: "Which command enables a service to start on boot?", options: ["systemctl start", "systemctl enable", "systemctl mask", "systemctl init"], answerIndex: 1, explanation: "enable creates the symlink for boot startup; start runs it now." },
      { text: "Which target corresponds to multi-user (runlevel 3)?", options: ["graphical.target", "multi-user.target", "rescue.target", "init.target"], answerIndex: 1, explanation: "multi-user.target = CLI multi-user mode." },
      { text: "Which command follows journal logs in real-time?", options: ["journalctl -f", "journalctl --tail", "tail /var/log/messages", "systemctl log -f"], answerIndex: 0, explanation: "journalctl -f follows logs (like tail -f)." },
    ],
  },
  {
    lessonTitle: "Cross-Site Scripting (XSS)",
    title: "XSS Quiz",
    questions: [
      { text: "Which XSS type persists in the database and affects every viewer?", options: ["Reflected", "Stored", "DOM-based", "CSRF"], answerIndex: 1, explanation: "Stored XSS is saved server-side and hits all viewers." },
      { text: "Which HTTP header helps mitigate XSS?", options: ["X-Frame-Options", "Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options"], answerIndex: 1, explanation: "CSP restricts which scripts may execute." },
      { text: "Which cookie attribute prevents JavaScript from reading cookies?", options: ["Secure", "HttpOnly", "SameSite", "Domain"], answerIndex: 1, explanation: "HttpOnly prevents JS (document.cookie) access." },
    ],
  },
  {
    lessonTitle: "Authentication & Session Attacks",
    title: "Auth Attacks Quiz",
    questions: [
      { text: "Which attack replays captured credentials across many sites?", options: ["Brute force", "Credential stuffing", "Session fixation", "XSS"], answerIndex: 1, explanation: "Credential stuffing uses breached creds across multiple services." },
      { text: "What JWT vulnerability allows forging tokens without a secret?", options: ["alg:none", "kid injection", "weak HMAC", "RS256→HS256"], answerIndex: 0, explanation: "Setting alg to 'none' removes signature verification." },
      { text: "Which protocol enables enterprise single sign-on via XML?", options: ["OAuth 2.0", "OIDC", "SAML", "Kerberos"], answerIndex: 2, explanation: "SAML uses XML assertions for SSO." },
    ],
  },
  {
    lessonTitle: "SSRF, XXE & File Upload",
    title: "Advanced Web Attacks Quiz",
    questions: [
      { text: "SSRF targeting which IP can leak cloud IAM credentials?", options: ["127.0.0.1", "169.254.169.254", "10.0.0.1", "192.168.1.1"], answerIndex: 1, explanation: "169.254.169.254 is the cloud metadata endpoint." },
      { text: "Which XML entity type enables XXE file reading?", options: ["INTERNAL", "EXTERNAL", "SYSTEM", "ENTITY"], answerIndex: 2, explanation: "SYSTEM entities can read local files via file:// protocol." },
      { text: "Which bypass allows uploading a PHP shell as an image?", options: ["Rename to .php.jpg", "Double extension (shell.php.jpg)", "Magic bytes of GIF89a", "All of the above"], answerIndex: 3, explanation: "All are valid upload bypass techniques." },
    ],
  },
  {
    lessonTitle: "Risk Management & Frameworks",
    title: "Risk Management Quiz",
    questions: [
      { text: "Buying cyber-insurance is which risk response?", options: ["Mitigate", "Transfer", "Accept", "Avoid"], answerIndex: 1, explanation: "Insurance transfers financial risk to a third party." },
      { text: "RPO (Recovery Point Objective) defines:", options: ["Max downtime", "Max data loss", "Recovery cost", "Recovery team size"], answerIndex: 1, explanation: "RPO = maximum tolerable data loss measured in time." },
      { text: "Which framework uses Categorize→Select→Implement→Assess→Authorize→Monitor?", options: ["ISO 27001", "NIST RMF", "COBIT", "ITIL"], answerIndex: 1, explanation: "NIST Risk Management Framework uses this 6-step cycle." },
    ],
  },
  {
    lessonTitle: "Authentication, Authorization & Accountability",
    title: "IAM Fundamentals Quiz",
    questions: [
      { text: "Which is NOT an authentication factor?", options: ["Something you know", "Something you have", "Something you are", "Something you want"], answerIndex: 3, explanation: "The three standard factors are knowledge, possession, and inherence." },
      { text: "Which access control model uses labels and clearances?", options: ["DAC", "MAC", "RBAC", "ABAC"], answerIndex: 1, explanation: "Mandatory Access Control uses security labels." },
      { text: "Kerberos uses which type of credential?", options: ["JWT", "Ticket (TGT/TGS)", "SAML assertion", "Session cookie"], answerIndex: 1, explanation: "Kerberos uses ticket-granting tickets." },
    ],
  },
  {
    lessonTitle: "Social Engineering Fundamentals",
    title: "Social Engineering Quiz",
    questions: [
      { text: "Which attack uses phone calls?", options: ["Phishing", "Vishing", "Smishing", "Tailgating"], answerIndex: 1, explanation: "Vishing = voice phishing via phone calls." },
      { text: "Leaving infected USBs in a parking lot is:", options: ["Pretexting", "Baiting", "Phishing", "Quid pro quo"], answerIndex: 1, explanation: "Baiting offers something enticing to lure victims." },
      { text: "Impersonating an authority figure uses which Cialdini principle?", options: ["Reciprocity", "Authority", "Scarcity", "Liking"], answerIndex: 1, explanation: "Authority — people comply with perceived authority figures." },
    ],
  },
  {
    lessonTitle: "Session Hijacking Techniques",
    title: "Session Hijacking Quiz",
    questions: [
      { text: "Which cookie attribute prevents JavaScript access?", options: ["Secure", "HttpOnly", "SameSite", "Domain"], answerIndex: 1, explanation: "HttpOnly prevents XSS from stealing cookies via document.cookie." },
      { text: "Session fixation is prevented by:", options: ["Regenerating session ID on login", "Using HTTPS", "Short timeouts", "All of the above"], answerIndex: 3, explanation: "All three help prevent session fixation." },
      { text: "Which tool intercepts and modifies HTTP cookies?", options: ["Wireshark", "Burp Suite", "Nmap", "Metasploit"], answerIndex: 1, explanation: "Burp Suite Proxy intercepts/modifies HTTP traffic including cookies." },
    ],
  },
  {
    lessonTitle: "IDS/IPS Evasion Techniques",
    title: "IDS Evasion Quiz",
    questions: [
      { text: "Which Nmap flag uses decoy IPs to evade detection?", options: ["-D", "-S", "-f", "--spoof"], answerIndex: 0, explanation: "-D RND:10 generates 10 random decoy source IPs." },
      { text: "Fragmenting packets evades IDS by:", options: ["Encrypting payload", "Splitting signatures across packets", "Changing ports", "Spoofing source IP"], answerIndex: 1, explanation: "Fragmentation splits the attack signature so IDS can't match it." },
      { text: "Which tunneling protocol can carry attacks through DNS?", options: ["ICMP", "DNS tunneling", "HTTP proxy", "SSH tunnel"], answerIndex: 1, explanation: "DNS tunneling encodes attack data in DNS queries." },
    ],
  },
  {
    lessonTitle: "Why Privileged Access Management?",
    title: "PAM Fundamentals Quiz",
    questions: [
      { text: "Privileged accounts are the #1 target because they:", options: ["Have complex passwords", "Provide broad system access", "Are rarely monitored", "Can't be compromised"], answerIndex: 1, explanation: "Privileged accounts grant administrative access to critical systems." },
      { text: "Which is NOT a core PAM pillar?", options: ["Password vaulting", "Session brokering", "Threat detection", "Email encryption"], answerIndex: 3, explanation: "Email encryption is not a PAM function." },
      { text: "Just-in-Time (JIT) access means:", options: ["Always-on admin", "Time-boxed temporary access", "Permanent elevation", "No access needed"], answerIndex: 1, explanation: "JIT grants access for a limited time window, then auto-revokes." },
    ],
  },
  {
    lessonTitle: "CyberArk Architecture",
    title: "CyberArk Architecture Quiz",
    questions: [
      { text: "Which CyberArk component auto-rotates passwords?", options: ["EPV", "CPM", "PSM", "PVWA"], answerIndex: 1, explanation: "Central Policy Manager (CPM) rotates credentials per policy." },
      { text: "Which component brokers SSH sessions natively (no jump host)?", options: ["PSM", "PSMP", "PTA", "CPM"], answerIndex: 1, explanation: "PSM for SSH (PSMP) provides native SSH proxying." },
      { text: "Requiring two approvers for password retrieval is called:", options: ["MFA", "Dual control", "Rotation", "Reconciliation"], answerIndex: 1, explanation: "Dual control requires two authorized users to approve." },
    ],
  },
  {
    lessonTitle: "Incident Response Lifecycle",
    title: "Incident Response Quiz",
    questions: [
      { text: "What is the FIRST phase of NIST incident response?", options: ["Detection", "Preparation", "Containment", "Recovery"], answerIndex: 1, explanation: "Preparation builds the capability before an incident occurs." },
      { text: "Which forensic data is MOST volatile?", options: ["Hard disk", "RAM", "CPU cache", "Network logs"], answerIndex: 2, explanation: "CPU cache is most volatile, then RAM, then disk." },
      { text: "MTTR stands for:", options: ["Mean Time to Recovery", "Mean Time to Respond", "Maximum Tolerable Recovery", "Mean Time to Repair"], answerIndex: 1, explanation: "MTTR = Mean Time to Respond in security operations." },
    ],
  },
]

async function main() {
  console.log("Adding quizzes to lessons...")
  let added = 0
  for (const qd of QUIZZES) {
    const lesson = await db.lesson.findFirst({ where: { title: qd.lessonTitle }, include: { quiz: true } })
    if (!lesson) { console.log(`  ? Lesson not found: ${qd.lessonTitle}`); continue }
    if (lesson.quiz) { console.log(`  = ${qd.lessonTitle} (already has quiz)`); continue }
    const quiz = await db.quiz.create({ data: { lessonId: lesson.id, title: qd.title, description: "Test your knowledge" } })
    for (const q of qd.questions) {
      await db.question.create({ data: { quizId: quiz.id, text: q.text, options: q.options.join("|"), answerIndex: q.answerIndex, explanation: q.explanation } })
    }
    added++
    console.log(`  + ${qd.lessonTitle} (${qd.questions.length} questions)`)
  }
  console.log(`Done. Added ${added} quizzes.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
