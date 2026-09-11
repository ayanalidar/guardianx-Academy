// prisma/quiz-seed.ts
// Cyber Security Foundation Quiz — 100-question seed bank
// 8 categories × ~12-13 questions each, distributed across Easy/Hard/Advanced
// Written for the general public, IT freshers, and students — not CEH/CISSP level.
// All answers fact-checked; explanations teach WHY the correct answer is right.

export interface SeedQuestion {
  category:
    | "Phishing"
    | "Passwords"
    | "Social Engineering"
    | "Web Safety"
    | "Mobile Security"
    | "Data Privacy"
    | "Malware"
    | "Wi-Fi Safety";
  difficulty: "Easy" | "Hard" | "Advanced";
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export const QUIZ_QUESTIONS: SeedQuestion[] = [
  // ---------------------------------------------------------------------------
  // CATEGORY 1: PHISHING — 13 questions (5 Easy, 5 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 1 — Phishing / Easy
  {
    category: "Phishing",
    difficulty: "Easy",
    question:
      "You receive an email from 'support@arnazon.com' (note the spelling) asking you to click a link to reset your Amazon password. What should you do?",
    optionA: "Click the link and reset your password as requested",
    optionB: "Reply to the email asking if it's legitimate",
    optionC:
      "Delete the email — Amazon would use 'amazon.com', not 'arnazon.com', and never asks password resets via email links",
    optionD: "Forward it to all your contacts to warn them",
    correctAnswer: "C",
    explanation:
      "The misspelled domain 'arnazon.com' (with 'rn' instead of 'm') is a classic phishing trick. Legitimate companies use their exact domain. Never click password-reset links in unsolicited emails — go directly to the site by typing the URL yourself.",
  },

  // 2 — Phishing / Easy
  {
    category: "Phishing",
    difficulty: "Easy",
    question:
      "You get an SMS from 'Bank-Alert': 'Your account is suspended. Tap http://bit.ly/2xY to verify now.' What is this?",
    optionA: "A legitimate bank notification",
    optionB:
      "Smishing — SMS-based phishing that uses shortened links to hide a fake banking site",
    optionC: "A regular promotional SMS",
    optionD: "A network carrier test message",
    correctAnswer: "B",
    explanation:
      "Smishing is phishing over SMS. Shortened URLs (bit.ly) hide the real destination, and banks never suspend accounts via a tap-to-verify SMS link. Verify by typing your bank's official URL or opening the official app.",
  },

  // 3 — Phishing / Easy
  {
    category: "Phishing",
    difficulty: "Easy",
    question:
      "An email says you've won $1M in a lottery you never entered and asks for your bank details to 'release the funds.' What is this?",
    optionA: "A genuine prize notification",
    optionB: "A bank marketing campaign",
    optionC: "A newsletter sign-up",
    optionD:
      "An advance-fee fraud / lottery scam — never share bank details; you can't win a contest you didn't enter",
    correctAnswer: "D",
    explanation:
      "Advance-fee fraud convinces you a windfall is coming if you share details or pay a 'processing fee.' Real lotteries never email random people asking for bank info; ignore and report it.",
  },

  // 4 — Phishing / Easy
  {
    category: "Phishing",
    difficulty: "Easy",
    question:
      "You receive an email from 'IT Support' with subject 'Mailbox Quota Exceeded — Verify Now' and a verify link. What's the safest action?",
    optionA:
      "Don't click — contact IT through a known internal channel (e.g., your IT helpdesk number or portal URL) to confirm",
    optionB: "Click the link and enter your credentials to free up space",
    optionC: "Reply with your username and password to 'authenticate'",
    optionD: "Forward it to colleagues so they can verify too",
    correctAnswer: "A",
    explanation:
      "IT will never ask you to 'verify' via an email link. Always reach IT through the official helpdesk number, portal, or in-person — not via the link in the suspicious email.",
  },

  // 5 — Phishing / Easy
  {
    category: "Phishing",
    difficulty: "Easy",
    question:
      "An email titled 'Netflix: Account Suspended' greets you as 'Dear Customer' and demands you click to confirm payment. What's the red flag?",
    optionA: "Netflix never sends emails",
    optionB:
      "Generic greeting ('Dear Customer') combined with urgency — real services address you by name and rarely demand instant action",
    optionC: "The subject line contains the word 'Netflix'",
    optionD: "The email was sent in the evening",
    correctAnswer: "B",
    explanation:
      "Legitimate services know your name and rarely use blanket 'Dear Customer' greetings. Paired with urgency ('act now or lose access'), this is a classic phishing pattern.",
  },

  // 6 — Phishing / Hard
  {
    category: "Phishing",
    difficulty: "Hard",
    question:
      "An email appears to come from your CEO urgently asking you to buy gift cards and send the codes. The sender shows as ceo@yourcompany.com but the reply-to address is a personal Gmail. What's the red flag?",
    optionA: "CEOs never send emails about gift cards",
    optionB: "The email is too short",
    optionC:
      "The reply-to address differs from the sender — a reply-to mismatch attack where replies go to the attacker, not the CEO",
    optionD: "Gmail is more secure than corporate email",
    correctAnswer: "C",
    explanation:
      "Sender display can be spoofed; the reply-to is where your response actually goes. A reply-to pointing to a personal email for a 'business' request is a hallmark of Business Email Compromise (BEC) gift-card fraud.",
  },

  // 7 — Phishing / Hard
  {
    category: "Phishing",
    difficulty: "Hard",
    question:
      "You get an email from 'service@paypal.com' but on hovering over the 'Log In' button, the URL shows http://paypal.com.security-update.cc/login. What's the trap?",
    optionA: "The link uses paypal.com so it's safe",
    optionB: "Hovering is not a reliable check",
    optionC: "The email is from PayPal's marketing team",
    optionD:
      "The actual destination domain is 'security-update.cc' — paypal.com is just a subdomain prefix to deceive you",
    correctAnswer: "D",
    explanation:
      "Reading a URL left-to-right is misleading. The real domain is the rightmost part before the first slash — here 'security-update.cc,' not paypal.com. Always inspect the actual registered domain.",
  },

  // 8 — Phishing / Hard
  {
    category: "Phishing",
    difficulty: "Hard",
    question:
      "Your phone rings: 'This is Microsoft Support — your PC is sending error reports; we need remote access to fix it.' What is this?",
    optionA:
      "A tech-support scam — Microsoft never proactively calls users about infections or asks for remote access",
    optionB: "A genuine Microsoft callback",
    optionC: "A carrier network alert",
    optionD: "Your ISP performing maintenance",
    correctAnswer: "A",
    explanation:
      "Microsoft, Apple, and Google never cold-call users about infections. The attacker's goal is remote access + payment for 'repairs.' Hang up; never give a stranger remote control of your device.",
  },

  // 9 — Phishing / Hard
  {
    category: "Phishing",
    difficulty: "Hard",
    question:
      "An email from 'Chase Bank' shows a green padlock (valid TLS) in your email client. Does that prove it's really from Chase?",
    optionA: "Yes — the padlock guarantees the sender is Chase",
    optionB:
      "No — TLS only encrypts the email in transit; it doesn't verify the sender's identity",
    optionC: "Yes — padlocks only appear for banks",
    optionD: "No — green padlocks appear only for spam",
    correctAnswer: "B",
    explanation:
      "A padlock confirms the connection was encrypted (TLS), not that the sender is legitimate. Any domain can obtain a TLS certificate, so a padlock alone is not proof of authenticity.",
  },

  // 10 — Phishing / Hard
  {
    category: "Phishing",
    difficulty: "Hard",
    question:
      "A QR sticker on a parking meter says 'PAY HERE' but the URL is pay-by-card.verify-meter.site. Best action?",
    optionA: "Pay through the QR — it's faster",
    optionB: "Pay through the QR but only with a debit card",
    optionC:
      "Don't pay through it — it's likely 'quishing' (QR phishing) with a fake payment page overlaid on the meter",
    optionD: "Take a photo and post it on social media",
    correctAnswer: "C",
    explanation:
      "Quishing uses malicious QR codes to bypass human URL-scrutiny. Verify the official parking app or meter label, and pay through the legitimate city/payment URL — not a random sticker.",
  },

  // 11 — Phishing / Advanced
  {
    category: "Phishing",
    difficulty: "Advanced",
    question:
      "You receive an email containing a large image that looks like a login page; clicking anywhere on it opens a browser. What attack is this?",
    optionA: "Cryptojacking",
    optionB: "Ransomware dropper via steganography",
    optionC: "A legitimate SSO preview",
    optionD:
      "Image-based phishing — the entire image is a clickable link to a credential-harvesting page, designed to bypass text-based email filters",
    correctAnswer: "D",
    explanation:
      "Embedding the lure as an image sidesteps scanners that flag suspicious URLs in body text. The image's link may also be an image map that points to the attacker's site.",
  },

  // 12 — Phishing / Advanced
  {
    category: "Phishing",
    difficulty: "Advanced",
    question:
      "A phishing email knows your real name, a recent order number, and the last 4 digits of your card. What enables such a targeted 'spear phishing' email?",
    optionA:
      "A data breach — leaked customer PII lets attackers craft convincing, personalized spear-phishing emails",
    optionB: "Lucky guessing",
    optionC: "A grammar check tool",
    optionD: "Email standard RFC features",
    correctAnswer: "A",
    explanation:
      "When a service is breached, attackers reuse stolen PII (name, order history, partial card numbers) to craft highly convincing spear-phishing emails. The fix is breach-aware: treat unsolicited 'order confirmation' or 'refund' emails with skepticism.",
  },

  // 13 — Phishing / Advanced
  {
    category: "Phishing",
    difficulty: "Advanced",
    question:
      "A link reads 'https://www.аррlе.com' but the 'а' characters are actually Cyrillic. What is this technique called?",
    optionA: "Cache poisoning",
    optionB:
      "Homograph / IDN spoofing — visually identical characters from another script deceive users about the real domain",
    optionC: "SQL injection",
    optionD: "DNS hijacking",
    correctAnswer: "B",
    explanation:
      "Internationalized Domain Names (IDN) allow non-Latin characters. Attackers mix Latin and Cyrillic letters that look identical (а, е, о) to register deceptive domains. Many browsers show 'Punycode' (xn--...) to warn; treat such URLs as suspicious.",
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 2: PASSWORDS — 13 questions (5 Easy, 5 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 14 — Passwords / Easy
  {
    category: "Passwords",
    difficulty: "Easy",
    question: "Which of these is the strongest password?",
    optionA: "P@ssw0rd",
    optionB: "123456",
    optionC: "correct-horse-battery-staple",
    optionD: "YourPetName2024",
    correctAnswer: "C",
    explanation:
      "Length beats complexity. A 26-character passphrase like 'correct-horse-battery-staple' has far more entropy than short, predictable patterns like 'P@ssw0rd' or names with a year appended, which attackers try first.",
  },

  // 15 — Passwords / Easy
  {
    category: "Passwords",
    difficulty: "Easy",
    question:
      "Should you reuse the same password for your email and a shopping site?",
    optionA: "Yes — easier to remember",
    optionB:
      "No — if the shopping site is breached, attackers will use credential stuffing to log into your email too",
    optionC: "Yes, as long as it's long",
    optionD: "Yes, but only for non-bank sites",
    correctAnswer: "B",
    explanation:
      "Credential stuffing tests stolen username/password pairs across many sites. Since your email is the 'master key' for password resets, reusing passwords puts everything at risk. Use a unique password per site.",
  },

  // 16 — Passwords / Easy
  {
    category: "Passwords",
    difficulty: "Easy",
    question:
      "A service offers SMS or an authenticator app for 2FA. Why is the app safer?",
    optionA: "SMS is faster",
    optionB: "Apps cost money",
    optionC: "SMS uses less battery",
    optionD:
      "SMS can be intercepted via SIM-swap attacks; authenticator apps generate codes locally without a phone number",
    correctAnswer: "D",
    explanation:
      "Attackers can social-engineer your carrier into porting your number to their SIM (SIM swap), then receive your SMS 2FA codes. Authenticator apps (and especially FIDO2 keys) are not bound to your phone number, so they resist this attack.",
  },

  // 17 — Passwords / Easy
  {
    category: "Passwords",
    difficulty: "Easy",
    question:
      "You have 100+ online accounts. What's the best way to use a unique strong password for each one without memorizing all of them?",
    optionA:
      "Use a reputable password manager — you remember only the master password; it generates and stores the rest",
    optionB: "Write them all on a sticky note",
    optionC: "Use the same password for all",
    optionD: "Use your birthday with a different number for each",
    correctAnswer: "A",
    explanation:
      "A password manager generates strong, unique passwords per site and encrypts them with your master password. You only need to remember one strong passphrase. Enable 2FA on the manager itself.",
  },

  // 18 — Passwords / Easy
  {
    category: "Passwords",
    difficulty: "Easy",
    question:
      "An email says 'Your account was compromised! Click here to set a new password.' Best step?",
    optionA: "Click the link to reset quickly",
    optionB: "Reply with your current password to verify",
    optionC:
      "Don't click — open a new tab and type the site's official URL yourself, then reset from inside your account settings",
    optionD: "Forward the email to family",
    correctAnswer: "C",
    explanation:
      "Clicking the link would land you on the attacker's fake reset page. Going to the site directly (by typing the URL or using a saved bookmark) ensures you're interacting with the real service.",
  },

  // 19 — Passwords / Hard
  {
    category: "Passwords",
    difficulty: "Hard",
    question:
      "If you use a password manager, what's the one password you still must remember?",
    optionA: "Your email password",
    optionB:
      "The master password — it encrypts your vault and cannot be recovered if forgotten",
    optionC: "Your bank password",
    optionD: "Your phone unlock PIN",
    correctAnswer: "B",
    explanation:
      "The master password decrypts the vault; if lost, your stored passwords are unrecoverable. Choose a long, memorable passphrase, enable 2FA on the manager, and keep a written backup in a secure location (e.g., a safe).",
  },

  // 20 — Passwords / Hard
  {
    category: "Passwords",
    difficulty: "Hard",
    question: "Which 2FA method is most resistant to phishing?",
    optionA: "SMS code",
    optionB: "Email code",
    optionC: "Authenticator app code",
    optionD:
      "FIDO2/WebAuthn security key — it cryptographically binds the login to the legitimate domain, so it won't work on a phishing site",
    correctAnswer: "D",
    explanation:
      "SMS, email, and even authenticator-app codes can be phished (an attacker can relay them to the real site in real time). FIDO2 keys refuse to authenticate to look-alike domains because the origin is cryptographically verified, blocking phishing by design.",
  },

  // 21 — Passwords / Hard
  {
    category: "Passwords",
    difficulty: "Hard",
    question:
      "You reuse one password across 5 sites. One of them is breached. Why are the other 4 also at risk?",
    optionA:
      "Credential stuffing — attackers test the stolen username/password pair against many other sites automatically",
    optionB: "The breach affects all sites simultaneously",
    optionC: "Passwords are stored centrally on the internet",
    optionD: "Reusing passwords slows down the browser",
    correctAnswer: "A",
    explanation:
      "Once credentials leak, bots try them across hundreds of services within minutes. This is why every account must have a unique password — and why breached passwords should be rotated immediately.",
  },

  // 22 — Passwords / Hard
  {
    category: "Passwords",
    difficulty: "Hard",
    question:
      "A website forces you to change your password every 90 days. Per NIST SP 800-63B, what's current best practice?",
    optionA: "Force changes every 30 days for stronger security",
    optionB: "Force changes only on Mondays",
    optionC:
      "Don't force periodic changes — require a change only on suspected compromise; forced rotation encourages weaker, predictable patterns",
    optionD: "Force changes only if the password is < 8 chars",
    correctAnswer: "C",
    explanation:
      "NIST 800-63B (2017) found that forced periodic rotation leads users to 'Summer2024,' 'Password1!' increments, and reused passwords. Better practice: long passwords, changed only when compromise is suspected.",
  },

  // 23 — Passwords / Hard
  {
    category: "Passwords",
    difficulty: "Hard",
    question:
      "An attacker calls your mobile carrier pretending to be you, convinces them to port your number to a new SIM they control, then reads your SMS 2FA codes. What's this attack?",
    optionA: "Phishing",
    optionB:
      "SIM swap — they hijack your phone number to intercept SMS-based 2FA",
    optionC: "Smishing",
    optionD: "Cookie theft",
    correctAnswer: "B",
    explanation:
      "SIM swapping social-engineers the carrier. Once your number is on the attacker's SIM, they receive your SMS 2FA codes and reset passwords on your accounts. Use authenticator apps or FIDO2 keys to sidestep this.",
  },

  // 24 — Passwords / Advanced
  {
    category: "Passwords",
    difficulty: "Advanced",
    question: "In password hashing, what is a 'pepper'?",
    optionA: "A per-user random value stored next to the password hash",
    optionB: "A second password the user must remember",
    optionC: "A type of key-derivation function",
    optionD:
      "A site-wide secret added to each password before hashing, stored separately from the database",
    correctAnswer: "D",
    explanation:
      "A pepper is a single secret shared across all password hashes, kept outside the database (e.g., in a secrets manager or HSM). Even if the DB leaks, attackers can't brute-force hashes without also stealing the pepper. (A 'salt' is the per-user random value.)",
  },

  // 25 — Passwords / Advanced
  {
    category: "Passwords",
    difficulty: "Advanced",
    question:
      "Why are bcrypt, scrypt, and argon2 preferred over plain SHA-256 for hashing passwords?",
    optionA:
      "They're intentionally slow and memory-hard, dramatically raising the cost of brute-forcing stolen hashes",
    optionB: "They produce shorter hashes",
    optionC: "They are required by HTTPS",
    optionD: "They encrypt the password so it can be reversed",
    correctAnswer: "A",
    explanation:
      "SHA-256 is designed to be fast — great for files, bad for passwords because attackers can try billions per second on GPUs. bcrypt/scrypt/argon2 are deliberately slow and memory-hard (argon2 is the current OWASP recommendation), so cracking is economically impractical.",
  },

  // 26 — Passwords / Advanced
  {
    category: "Passwords",
    difficulty: "Advanced",
    question:
      "A breach database shows your password as md5('yourpassword'). Why is this dangerous?",
    optionA: "MD5 hashes can be reversed by a quantum computer instantly",
    optionB:
      "MD5 is fast and unsalted — rainbow tables and GPU brute force crack common passwords in seconds",
    optionC: "MD5 hashes are case-insensitive",
    optionD: "MD5 stores the password in plain text",
    correctAnswer: "B",
    explanation:
      "MD5 is cryptographically broken and extremely fast to compute, and unsalted hashes are vulnerable to precomputed rainbow tables. Modern sites use argon2/bcrypt with a unique per-user salt. If you see your password exposed in any breach, change it everywhere immediately.",
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 3: SOCIAL ENGINEERING — 12 questions (5 Easy, 4 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 27 — Social Engineering / Easy
  {
    category: "Social Engineering",
    difficulty: "Easy",
    question:
      "A smiling person in a suit follows you through a secure door without swiping their own badge. What should you do?",
    optionA: "Hold the next door for them too",
    optionB: "Ignore it — they look professional",
    optionC: "Take a photo for LinkedIn",
    optionD:
      "Politely ask for their ID/badge, or escort them to reception — never let unknown people 'tailgate' through secure doors",
    correctAnswer: "D",
    explanation:
      "Tailgating (or piggybacking) exploits social courtesy to bypass physical access controls. Trained staff ask to see a badge or direct visitors to reception; many serious breaches begin with someone walking through an open door.",
  },

  // 28 — Social Engineering / Easy
  {
    category: "Social Engineering",
    difficulty: "Easy",
    question:
      "A caller says 'I'm from your bank — for security, please verify your date of birth and the last transaction.' What's the right action?",
    optionA:
      "Hang up and call the bank on the number printed on your card — never verify ID details to an inbound caller",
    optionB: "Read out your DOB and last transaction to help them",
    optionC: "Ask them to call back later",
    optionD: "Reply via SMS with your account number",
    correctAnswer: "A",
    explanation:
      "Legitimate banks never ask you to verify identity on inbound calls. Hang up, wait a minute (or use another line — some scammers hold the line open), then dial the number on the back of your card.",
  },

  // 29 — Social Engineering / Easy
  {
    category: "Social Engineering",
    difficulty: "Easy",
    question:
      "A teary caller tells your elderly parent 'Grandma, it's me — I'm in jail, please wire $5,000 bail, don't tell mom.' What scam is this?",
    optionA: "A real emergency call",
    optionB:
      "Grandparent / impersonation scam — verify identity with a personal question, then call other family before sending money",
    optionC: "A bank wire fraud alert",
    optionD: "A fundraising drive",
    correctAnswer: "B",
    explanation:
      "The grandparent scam weaponizes urgency and 'don't tell anyone.' Always verify with a question only the real relative would know, hang up, and call them back on a known number before wiring any money.",
  },

  // 30 — Social Engineering / Easy
  {
    category: "Social Engineering",
    difficulty: "Easy",
    question:
      "A USB stick labeled 'Salary Increases 2025 — CONFIDENTIAL' is left in the lobby. Best action?",
    optionA: "Plug it into your work PC to see what's on it",
    optionB: "Plug it into a colleague's PC instead",
    optionC:
      "Don't plug it in — hand it to IT/Security; 'USB drop' attacks use curiosity to install malware",
    optionD: "Take it home to inspect later",
    correctAnswer: "C",
    explanation:
      "USB drops (Stuxnet-style) prey on curiosity. A 'lost' stick can auto-run malicious payloads, emulate a keyboard, or exploit USB drivers. Hand it to IT — never plug unknown media into any device.",
  },

  // 31 — Social Engineering / Easy
  {
    category: "Social Engineering",
    difficulty: "Easy",
    question:
      "A LinkedIn 'recruiter' messages you offering a remote role paying 2× market rate and asks for your SSN/Aadhaar to 'run a background check.' Red flag?",
    optionA: "Remote jobs don't exist",
    optionB: "Background checks are illegal",
    optionC: "LinkedIn doesn't host recruiters",
    optionD:
      "Job scam — never send SSN/Aadhaar before a verified interview; confirm the company/recruiter via their official site",
    correctAnswer: "D",
    explanation:
      "Identity thieves pose as recruiters to harvest SSN/Aadhaar for account openings. Real recruiters interview you first, then onboard via official channels. Verify the recruiter's profile, email domain, and company website before sharing any PII.",
  },

  // 32 — Social Engineering / Hard
  {
    category: "Social Engineering",
    difficulty: "Hard",
    question:
      "A 'delivery driver' enters your office, tells reception he needs to 'print a delivery slip on your PC for 2 minutes,' and waits. What's happening?",
    optionA:
      "Pretexting + impersonation — the attacker uses a plausible excuse (delivery) to get physical access to a corporate computer",
    optionB: "Standard courier practice",
    optionC: "A software demo",
    optionD: "A building inspection",
    correctAnswer: "A",
    explanation:
      "Pretexting fabricates a scenario (delivery, IT vendor, fire marshal) to gain trust and access. Don't let any visitor use a corporate machine unsupervised; verify with the recipient of the supposed delivery and escort visitors at all times.",
  },

  // 33 — Social Engineering / Hard
  {
    category: "Social Engineering",
    difficulty: "Hard",
    question:
      "A caller claims 'This is IT — we noticed a suspicious login on your account. To stop it, please read me the 6-digit code we just texted you.' What are they after?",
    optionA: "Your full password",
    optionB:
      "Your MFA code — they already have your password and need the second factor to complete login (an MFA-bypass vishing attack)",
    optionC: "Your phone number",
    optionD: "Your IP address",
    correctAnswer: "B",
    explanation:
      "This is MFA-bypass vishing. The attacker has your password and has triggered a real MFA prompt; talking you into reading the code lets them complete the login. IT will never ask you to read out an MFA code — hang up and report it.",
  },

  // 34 — Social Engineering / Hard
  {
    category: "Social Engineering",
    difficulty: "Hard",
    question:
      "A caller claims to be a police officer: 'Your name appeared in a money-laundering case; transfer your savings to a safe account pending investigation.' What scam is this?",
    optionA: "Real police procedure",
    optionB: "A bank's anti-fraud callback",
    optionC:
      "Authority-impersonation scam — police/banks never move your money to a 'safe account'; this is social-engineering theft",
    optionD: "A tax-refund notification",
    correctAnswer: "C",
    explanation:
      "Real police and banks never ask you to move funds to a 'safe account.' The authority + urgency + secrecy combo is engineered to disable critical thinking. Hang up, wait, then call your bank's official fraud line.",
  },

  // 35 — Social Engineering / Hard
  {
    category: "Social Engineering",
    difficulty: "Hard",
    question:
      "A contractor you've never met says 'Your boss told me to grab the server room keys — he's in a meeting.' Best response?",
    optionA: "Hand over the keys quickly",
    optionB: "Leave the keys at the front desk for him",
    optionC: "Lend him your own badge",
    optionD:
      "Verify directly with your boss via a known channel (call, Slack, etc.) before granting access — out-of-band verification",
    correctAnswer: "D",
    explanation:
      "Out-of-band verification means using a different channel than the request arrived on to confirm. A name drop ('boss said') is a pretext. Always confirm unusual access requests through a trusted channel before acting.",
  },

  // 36 — Social Engineering / Advanced
  {
    category: "Social Engineering",
    difficulty: "Advanced",
    question:
      "An attacker sends you a small 'free sample' gift, then later asks for a favor (e.g., a referral). Which persuasion principle is being weaponized?",
    optionA:
      "Reciprocity — people feel obligated to return favors, even unsolicited ones",
    optionB: "Scarcity",
    optionC: "Social proof",
    optionD: "Authority",
    correctAnswer: "A",
    explanation:
      "Robert Cialdini's principle of reciprocity: receiving something (even uninvited) creates a psychological debt. Attackers exploit this to nudge targets into compliance they'd otherwise refuse. The defense is recognizing the manipulation and declining politely.",
  },

  // 37 — Social Engineering / Advanced
  {
    category: "Social Engineering",
    difficulty: "Advanced",
    question:
      "An attacker calls your helpdesk, claims to be you, and provides your name, employee ID, and manager's name (scraped from LinkedIn) to convince the agent to reset your password. What technique is this?",
    optionA: "Brute force",
    optionB:
      "Vishing + OSINT-enabled account takeover — the attacker uses public info to defeat helpdesk identity checks (pretexting)",
    optionC: "SQL injection",
    optionD: "DNS hijacking",
    correctAnswer: "B",
    explanation:
      "Open-source intelligence (OSINT) on LinkedIn, company sites, and breach data lets attackers assemble enough 'proof' to social-engineer helpdesks. Defenses: require out-of-band verification, security questions with non-public answers, and trained helpdesk staff to spot pretexting.",
  },

  // 38 — Social Engineering / Advanced
  {
    category: "Social Engineering",
    difficulty: "Advanced",
    question:
      "Fake 'IT Support Line: 1-800-555-FAKE' flyers are taped onto the office printer. Employees call it and 'verify' their credentials. What's this?",
    optionA: "Whaling",
    optionB: "Smishing",
    optionC:
      "Physical-world pretexting / 'IT support' bait — attackers seed the real world with contact info to harvest credentials",
    optionD: "A trustable internal directory",
    correctAnswer: "C",
    explanation:
      "Blending physical-world (flyers, USB drops, lobby signage) with social-engineering calls is a known insider-threat vector. Verify support numbers from internal directories or your badge, not from random printed material.",
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 4: WEB SAFETY — 12 questions (5 Easy, 4 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 39 — Web Safety / Easy
  {
    category: "Web Safety",
    difficulty: "Easy",
    question:
      "You're about to enter your credit card on http://example.com vs https://example.com. Which is safer?",
    optionA: "http:// — it's faster",
    optionB: "https:// — TLS encrypts data between your browser and the server",
    optionC: "They're identical",
    optionD: "http:// — it's more compatible",
    correctAnswer: "B",
    explanation:
      "HTTPS uses TLS to encrypt the connection, so an eavesdropper on your network can't read your card number. Never enter payment info on plain HTTP pages — and always verify the domain, since HTTPS alone doesn't prove legitimacy.",
  },

  // 40 — Web Safety / Easy
  {
    category: "Web Safety",
    difficulty: "Easy",
    question:
      "A browser popup screams 'Your PC is infected with 37 viruses! Click OK to clean now.' Safest action?",
    optionA:
      "Close the browser tab/window (Ctrl+W or close tab) — don't click anything in the popup",
    optionB: "Click OK to clean the viruses",
    optionC: "Click 'Cancel' — it's clearly safe",
    optionD: "Minimize and continue browsing",
    correctAnswer: "A",
    explanation:
      "Scareware popups use every button (OK, Cancel, even the X) to either run a script or push a fake AV installer. Close the whole tab with a keyboard shortcut; if it persists, kill the browser via Task Manager.",
  },

  // 41 — Web Safety / Easy
  {
    category: "Web Safety",
    difficulty: "Easy",
    question:
      "A 'free movie' site asks you to install a 'special video player / codec' to stream the film. Best action?",
    optionA: "Install it — codecs are harmless",
    optionB: "Install it, then uninstall later",
    optionC:
      "Don't install — fake codecs/players are a common malware delivery vector; use legitimate streaming services instead",
    optionD: "Install only if it's signed by Microsoft",
    correctAnswer: "C",
    explanation:
      "'Missing codec' or 'HD player' prompts on pirate streaming sites frequently deliver adware, Trojans, or cryptominers. Stick to legitimate streaming apps; never install software prompted by a random website.",
  },

  // 42 — Web Safety / Easy
  {
    category: "Web Safety",
    difficulty: "Easy",
    question:
      "The address bar shows a padlock, but the domain is amaz0n-login.xyz. Is it safe to enter your card?",
    optionA: "Yes — the padlock means it's Amazon",
    optionB: "Yes — padlocks prove legitimacy",
    optionC: "Yes — .xyz domains are trusted for commerce",
    optionD:
      "No — a padlock only confirms HTTPS; the actual domain isn't Amazon. Check the domain carefully before entering data",
    correctAnswer: "D",
    explanation:
      "The padlock means the connection is encrypted, not that you're on the legitimate site. Anyone can get a free TLS cert for any domain they own. Always verify the actual domain name, not just the lock icon.",
  },

  // 43 — Web Safety / Easy
  {
    category: "Web Safety",
    difficulty: "Easy",
    question:
      "A website asks for your mother's maiden name as a security question. What's a safer strategy?",
    optionA:
      "Use a unique, fake answer stored in your password manager — real answers are often public and guessable",
    optionB: "Use your real maiden name so you'll remember",
    optionC: "Use the same answer on every site",
    optionD: "Use 'password123' so it's strong",
    correctAnswer: "A",
    explanation:
      "Maiden names, birthplaces, and pet names are easily discovered from social media or public records. Use a different random string per site, saved in your password manager, so a breach on one site doesn't expose the others.",
  },

  // 44 — Web Safety / Hard
  {
    category: "Web Safety",
    difficulty: "Hard",
    question:
      "You're on https://www.yourbank.com but a form on the page asks you to 'enter your card PIN for verification.' Red flag?",
    optionA: "It's safe — the URL is HTTPS",
    optionB:
      "Banks never ask for your PIN online — never enter a card PIN on any website",
    optionC: "It's safe if the form has a padlock",
    optionD: "It's safe if the bank's logo is shown",
    correctAnswer: "B",
    explanation:
      "PINs are only ever entered at ATMs and physical POS keypads — never on web pages. Any site requesting your PIN is fraudulent, regardless of HTTPS or branding. Close it and report to your bank.",
  },

  // 45 — Web Safety / Hard
  {
    category: "Web Safety",
    difficulty: "Hard",
    question:
      "Your browser warns: 'This site's certificate has expired. Connection is not secure.' What does this mean?",
    optionA: "Your clock is correct — ignore it",
    optionB: "The site is offline",
    optionC:
      "The server's TLS certificate expired — the site's identity can't be verified and the connection may be intercepted; do not enter sensitive info",
    optionD: "Your antivirus needs an update",
    correctAnswer: "C",
    explanation:
      "An expired cert breaks chain-of-trust verification — your browser can't confirm you're connected to the real site. While often just an admin oversight, it can also indicate interception. Don't bypass the warning for sensitive tasks.",
  },

  // 46 — Web Safety / Hard
  {
    category: "Web Safety",
    difficulty: "Hard",
    question:
      "A site offers 'Login with Facebook,' but the OAuth consent window's URL is on facebook.security-check.cc, not facebook.com. What's the risk?",
    optionA: "It's safe — OAuth is secure by design",
    optionB: "It's safe if it shows your profile picture",
    optionC: "It's safe because Facebook owns OAuth",
    optionD:
      "It's OAuth phishing — a fake consent screen on a lookalike domain harvests your Facebook credentials and any tokens you grant",
    correctAnswer: "D",
    explanation:
      "Real OAuth flows happen on the provider's actual domain (facebook.com, accounts.google.com). A 'consent screen' on a different domain is a phishing trap designed to capture your password and any OAuth permissions you grant.",
  },

  // 47 — Web Safety / Hard
  {
    category: "Web Safety",
    difficulty: "Hard",
    question:
      "You searched 'free PDF of [paid textbook]' and clicked a result. Suddenly 6 popups appear offering 'Java update,' 'Adobe Flash,' and 'driver update.' Best action?",
    optionA:
      "Close all tabs immediately and run a malware scan — 'free' premium content often bundles adware/PUPs",
    optionB: "Click each update popup one by one",
    optionC: "Download the Java update — it must be legit",
    optionD: "Allow notifications to keep watching",
    correctAnswer: "A",
    explanation:
      "Pirated-content sites are prime adware/PUP distribution channels. Fake 'update' popups install unwanted software, hijack browsers, and enable push notifications for more scams. Close tabs, clear notifications permissions, and run a reputable malware scan.",
  },

  // 48 — Web Safety / Advanced
  {
    category: "Web Safety",
    difficulty: "Advanced",
    question:
      "You visit 'your bank' at bank.com.login.secure-authenticate.net with a valid green padlock. Is it legitimate?",
    optionA: "Yes — bank.com is in the URL",
    optionB:
      "No — the real domain is secure-authenticate.net; 'bank.com' is just a subdomain. The padlock only confirms HTTPS, not the brand",
    optionC: "Yes — green padlocks prove banking sites",
    optionD: "Yes — long URLs are always legitimate",
    correctAnswer: "B",
    explanation:
      "Domain ownership is read right-to-left before the first slash. The registered domain here is secure-authenticate.net, owned by an attacker who added 'bank.com.login.secure-authenticate' as a subdomain to deceive you. Always identify the actual registered domain.",
  },

  // 49 — Web Safety / Advanced
  {
    category: "Web Safety",
    difficulty: "Advanced",
    question:
      "A website sends the Strict-Transport-Security (HSTS) header. What attack does this primarily prevent?",
    optionA: "XSS",
    optionB: "CSRF",
    optionC:
      "SSL stripping — HSTS forces the browser to always use HTTPS, even if the user types http:// or clicks an http link",
    optionD: "SQL injection",
    correctAnswer: "C",
    explanation:
      "Without HSTS, a man-in-the-middle can downgrade an http:// link to intercept traffic before HTTPS kicks in. HSTS instructs the browser to silently rewrite all requests to HTTPS for that domain for a specified duration, defeating SSL-stripping attacks.",
  },

  // 50 — Web Safety / Advanced
  {
    category: "Web Safety",
    difficulty: "Advanced",
    question:
      "An attacker registers amaz0n.com (with a zero) and obtains a valid TLS certificate. Why does the browser show a green padlock?",
    optionA: "The attacker stole Amazon's cert",
    optionB: "The browser is buggy",
    optionC: "CAs verify brand ownership",
    optionD:
      "CAs only verify domain control, not brand ownership — anyone who owns a domain can get a TLS cert for it",
    correctAnswer: "D",
    explanation:
      "TLS CAs confirm you control the domain (via DNS or HTTP challenge), not that you own the brand. So amaz0n.com legitimately gets a cert with a valid padlock despite being a lookalike. The padlock ≠ 'this is the brand you think it is.'",
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 5: MOBILE SECURITY — 12 questions (5 Easy, 4 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 51 — Mobile Security / Easy
  {
    category: "Mobile Security",
    difficulty: "Easy",
    question:
      "A free 'Flashlight' app requests access to your Contacts, Camera, and Location. Best action?",
    optionA: "Accept all permissions — they're required",
    optionB: "Accept but only Contacts",
    optionC: "Accept only Camera",
    optionD:
      "Don't install — a flashlight only needs the screen backlight; excessive permissions signal data harvesting or malware",
    correctAnswer: "D",
    explanation:
      "Apps that request permissions far beyond their function (a flashlight needing Contacts/Location) are likely harvesting data or are malware. On Android/iOS, deny permissions selectively or pick a different app with sensible permission requests.",
  },

  // 52 — Mobile Security / Easy
  {
    category: "Mobile Security",
    difficulty: "Easy",
    question:
      "Why is installing apps only from the official Google Play / Apple App Store safer than side-loading?",
    optionA:
      "Official stores scan apps, require developer verification, and offer kill-switches to remove malicious apps remotely",
    optionB: "Apps outside stores are illegal",
    optionC: "Official stores are always free",
    optionD: "Side-loaded apps don't run",
    correctAnswer: "A",
    explanation:
      "Google Play Protect and Apple's App Review perform automated and human checks, flag or remove malware, and require developer identity verification. Side-loaded apps bypass these protections — though not perfect, official stores dramatically reduce risk.",
  },

  // 53 — Mobile Security / Easy
  {
    category: "Mobile Security",
    difficulty: "Easy",
    question:
      "You get a text from 'FedEx: package delayed, update address at fedex-track.live.' What is this?",
    optionA: "A legitimate FedEx SMS",
    optionB:
      "Smishing — fake delivery SMS with a lookalike domain to harvest personal data",
    optionC: "A network test message",
    optionD: "A marketing opt-in",
    correctAnswer: "B",
    explanation:
      "Delivery scams surge during holiday seasons. The URL fedex-track.live is not fedex.com. Never tap; check your delivery status in the official carrier app or by typing the carrier's URL yourself.",
  },

  // 54 — Mobile Security / Easy
  {
    category: "Mobile Security",
    difficulty: "Easy",
    question: "Your phone shows 'System update available — security patch.' Best practice?",
    optionA: "Delay indefinitely to avoid bugs",
    optionB: "Skip — updates break things",
    optionC:
      "Install promptly — security patches fix known vulnerabilities that attackers actively exploit",
    optionD: "Wait until the phone gets slow",
    correctAnswer: "C",
    explanation:
      "Patch gaps are weaponized quickly — once a vulnerability is publicly disclosed, attackers add it to their toolkits. Enable automatic updates; install security patches as soon as they're available to close known holes.",
  },

  // 55 — Mobile Security / Easy
  {
    category: "Mobile Security",
    difficulty: "Easy",
    question: "Your phone has Smart Lock enabled to stay unlocked at home. What's the risk?",
    optionA: "No risk — home is safe",
    optionB: "Battery drains faster",
    optionC: "Screen brightness breaks",
    optionD:
      "If your phone is stolen near home or your home is burgled, the device is already unlocked — disable Smart Lock for sensitive locations",
    correctAnswer: "D",
    explanation:
      "'Trusted places' unlock uses GPS proximity; if your phone is snatched on your street or stolen during a home break-in, the thief bypasses your lock screen. Disable Smart Lock or restrict it to truly trusted locations.",
  },

  // 56 — Mobile Security / Hard
  {
    category: "Mobile Security",
    difficulty: "Hard",
    question:
      "A friend shares an .apk from a forum so you can install a paid app 'for free.' Risks?",
    optionA:
      "Side-loaded APKs bypass store review — often repackaged with malware (banking trojans, adware, spyware)",
    optionB: "APKs are always safe if signed",
    optionC: "APKs are smaller than Play Store apps",
    optionD: "Side-loaded apps run faster",
    correctAnswer: "A",
    explanation:
      "Cracked APKs are frequently repackaged to include hidden malware. Even if the original app is legitimate, the crack may add permission requests, keylogging, or remote-access payloads. Install only from Play Store / App Store / verified developer sites.",
  },

  // 57 — Mobile Security / Hard
  {
    category: "Mobile Security",
    difficulty: "Hard",
    question: "You're selling your old phone. Best way to protect your data before handing it over?",
    optionA: "Just delete the photos app",
    optionB:
      "Sign out of all accounts → factory data erase → remove SIM/SD card → ensure encryption was on during use",
    optionC: "Reset network settings only",
    optionD: "Just remove the lock screen PIN",
    correctAnswer: "B",
    explanation:
      "A simple 'delete' leaves recoverable data. Proper prep: sign out (so accounts don't stay linked), remove SIM/SD, then trigger a full factory data erase. Modern phones with encryption on make the wiped data unrecoverable.",
  },

  // 58 — Mobile Security / Hard
  {
    category: "Mobile Security",
    difficulty: "Hard",
    question: "Your banking app shows 'Rooted/jailbroken device detected — features limited.' Why?",
    optionA: "The app needs root to work",
    optionB: "Rooted devices are faster",
    optionC:
      "Root/jailbreak breaks app sandboxing and TLS pinning — banking apps refuse full function to protect your money",
    optionD: "The app is buggy on stock OS",
    correctAnswer: "C",
    explanation:
      "Root/jailbreak removes OS-enforced app isolation, allowing malware to read other apps' data, capture the screen, and tamper with TLS certificate checks. Banking apps therefore restrict features (or refuse to run) on rooted/jailbroken devices.",
  },

  // 59 — Mobile Security / Hard
  {
    category: "Mobile Security",
    difficulty: "Hard",
    question: "Your phone's Bluetooth is always on and set to 'discoverable.' Risk?",
    optionA: "None — Bluetooth is always safe",
    optionB: "Battery improves",
    optionC: "Wi-Fi speeds up",
    optionD:
      "Increased attack surface — Bluetooth vulnerabilities (e.g., BlueBorne-class) can allow remote code execution; turn it off when not in use",
    correctAnswer: "D",
    explanation:
      "Always-on discoverable Bluetooth increases exposure to remote exploitation, tracking, and pairing attacks. Disable Bluetooth when not actively in use, and keep firmware updated to patch Bluetooth stack vulnerabilities.",
  },

  // 60 — Mobile Security / Advanced
  {
    category: "Mobile Security",
    difficulty: "Advanced",
    question:
      "An iOS app's privacy label says 'Data Not Collected,' but the app bundles a popular analytics SDK. Is the label truthful?",
    optionA:
      "No — privacy labels must include data collected by bundled third-party SDKs; mislabeling is an App Review violation",
    optionB: "Yes — only the developer's own data counts",
    optionC: "Yes — SDKs run in a separate sandbox",
    optionD: "Yes — labels are self-declared and unverified",
    correctAnswer: "A",
    explanation:
      "Apple's App Privacy labels require developers to account for all data collection, including by third-party SDKs integrated into the app. Mislabeling can lead to app removal. If you spot a mismatch, you can report it via Apple's fraud form.",
  },

  // 61 — Mobile Security / Advanced
  {
    category: "Mobile Security",
    difficulty: "Advanced",
    question: "A banking app uses certificate pinning. What does it prevent?",
    optionA: "Phishing emails",
    optionB:
      "Man-in-the-middle attacks using custom CA certificates (e.g., on corporate Wi-Fi or malicious hotspots) — the app refuses CAs not pinned by the bank",
    optionC: "App crashes",
    optionD: "Battery drain",
    correctAnswer: "B",
    explanation:
      "Certificate pinning hard-codes the expected server certificate (or its public key) inside the app. If a MITM presents a different cert — even one trusted by the OS — the app refuses the connection, defeating MITM proxies and rogue hotspots.",
  },

  // 62 — Mobile Security / Advanced
  {
    category: "Mobile Security",
    difficulty: "Advanced",
    question: "You sideload an app via AltStore (not on the App Store). What protection do you lose?",
    optionA: "The app won't run at all",
    optionB: "Your Apple ID is automatically blocked",
    optionC:
      "Apple's notarization + App Review — no automated malware scan, no kill-switch, no developer identity verification",
    optionD: "Nothing — sideloaded apps are identical to App Store apps",
    correctAnswer: "C",
    explanation:
      "AltStore uses your personal Apple ID to re-sign apps every 7 days, but it bypasses Apple's App Review, notarization, and remote-kill mechanisms. Sideloaded apps may be unvetted — only run software from sources you trust completely.",
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 6: DATA PRIVACY — 12 questions (5 Easy, 4 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 63 — Data Privacy / Easy
  {
    category: "Data Privacy",
    difficulty: "Easy",
    question:
      "A Facebook quiz asks 'What was your first pet's name + your birthplace? Share your result!' Why is this risky?",
    optionA: "Quizzes are safe entertainment",
    optionB: "Quizzes are encrypted",
    optionC: "Quiz results are private",
    optionD:
      "These answers are classic security-question solutions — attackers harvest them for account takeover and profile-based phishing",
    correctAnswer: "D",
    explanation:
      "'Fun' quizzes ask the same questions your bank uses for identity verification: pet names, mother's maiden name, first school, birthplace. Aggregated, they enable account-takeover and targeted spear phishing. Don't share PII via social quizzes.",
  },

  // 64 — Data Privacy / Easy
  {
    category: "Data Privacy",
    difficulty: "Easy",
    question: "You're selling an old laptop. Best way to wipe personal data?",
    optionA:
      "Backup → sign out of accounts → factory reset / 'secure erase' the drive (not just delete files) → verify",
    optionB: "Just delete the Documents folder",
    optionC: "Empty the Recycle Bin only",
    optionD: "Format only the C: drive quickly",
    correctAnswer: "A",
    explanation:
      "'Delete' only removes the file index — the data remains until overwritten. A full factory reset or secure-erase (which triggers the SSD's built-in ATA secure-erase command) actually clears the storage. Sign out of accounts first so the next owner can't reactivate sessions.",
  },

  // 65 — Data Privacy / Easy
  {
    category: "Data Privacy",
    difficulty: "Easy",
    question: "An open Wi-Fi hotspot 'Free_Airport_WiFi' has no password. Risk of logging into your bank?",
    optionA: "No risk — HTTPS protects everything",
    optionB:
      "Others on the same open network may attempt to intercept your traffic; avoid sensitive logins on open Wi-Fi — use mobile data or a VPN",
    optionC: "No risk — open Wi-Fi is encrypted",
    optionD: "No risk if the network name is 'official'",
    correctAnswer: "B",
    explanation:
      "Open networks have no per-pair encryption — anyone nearby can capture frames. While HTTPS protects content, DNS lookups, SNI, and captive-portal hijacks still leak info. For banking, switch to mobile data or use a trusted VPN.",
  },

  // 66 — Data Privacy / Easy
  {
    category: "Data Privacy",
    difficulty: "Easy",
    question:
      "An email says 'We've updated our privacy policy — click to review.' Should you click immediately?",
    optionA: "Yes — it's required by law",
    optionB: "Yes — privacy emails are always safe",
    optionC:
      "No — verify the sender/domain first; 'privacy policy update' is a common phishing lure",
    optionD: "Yes — but only if the email has a logo",
    correctAnswer: "C",
    explanation:
      "Phishers exploit routine events (privacy policy updates, TOS changes) to bait clicks. Inspect the actual sender and the link destination, or navigate to the service's site directly to read the policy.",
  },

  // 67 — Data Privacy / Easy
  {
    category: "Data Privacy",
    difficulty: "Easy",
    question: "A retail cashier asks for your phone number 'for digital receipts.' Best privacy practice?",
    optionA: "Always give your real number",
    optionB: "Give the cashier your home landline",
    optionC: "Give your friend's number",
    optionD:
      "Decline or use a secondary/VOIP number — minimize PII you share with retailers",
    correctAnswer: "D",
    explanation:
      "Each data point you share can be sold, breached, or used for marketing/profiling. Decline unnecessary PII, or route receipts to a secondary number. The fewer places your real phone number lives, the lower your exposure.",
  },

  // 68 — Data Privacy / Hard
  {
    category: "Data Privacy",
    difficulty: "Hard",
    question:
      "An app's privacy policy says 'we may share data with affiliates and partners.' What does this mean in practice?",
    optionA:
      "Your data may flow to unknown third parties — accept the risk, pick a different app, or decline non-essential data",
    optionB: "Your data stays fully encrypted end-to-end",
    optionC: "The app is GDPR-certified",
    optionD: "'Affiliates' means law enforcement only",
    correctAnswer: "A",
    explanation:
      "'Affiliates and partners' is broad — your data may be shared with ad networks, analytics firms, or sibling companies with their own (weaker) privacy practices. Where possible, decline non-essential data sharing or choose apps with stricter policies.",
  },

  // 69 — Data Privacy / Hard
  {
    category: "Data Privacy",
    difficulty: "Hard",
    question: "'Sign in with Google' vs creating a fresh account with email/password. Trade-off?",
    optionA: "Google sign-in shares your Google password with the app",
    optionB:
      "Google sign-in reduces password reuse but shares your name/email/profile with the app; a fresh account isolates data but adds another password",
    optionC: "Google sign-in is always worse for privacy",
    optionD: "A fresh account is always more private",
    correctAnswer: "B",
    explanation:
      "With Google Sign-In, the app gets an OAuth token (not your Google password) and your basic profile. Trade-off: no new password to reuse/breach, but the app learns your Google identity. Pick based on sensitivity: throwaway accounts for low-trust apps, dedicated identity for sensitive ones.",
  },

  // 70 — Data Privacy / Hard
  {
    category: "Data Privacy",
    difficulty: "Hard",
    question:
      "A cookie banner makes 'Accept All' prominent and hides 'Reject' behind three menus. This is an example of:",
    optionA: "A legal compliance banner",
    optionB: "Standard UX practice",
    optionC:
      "A dark pattern — manipulation designed to make you 'consent' to tracking",
    optionD: "A security warning",
    correctAnswer: "C",
    explanation:
      "'Dark patterns' use UX tricks (pre-ticked boxes, hidden reject buttons, fake countdowns) to manufacture consent. Under GDPR/CPRA, consent must be freely given and as easy to refuse as to grant. Reject All should be one click; equal prominence is required.",
  },

  // 71 — Data Privacy / Hard
  {
    category: "Data Privacy",
    difficulty: "Hard",
    question: "You want to reduce the personal info data brokers hold about you. Best steps?",
    optionA: "Nothing — they always have everything",
    optionB: "Delete your email account",
    optionC: "Stop using the internet",
    optionD:
      "Submit opt-out requests on broker sites (Spokeo, Whitepages, etc.), use removal services, and minimize PII you share online going forward",
    correctAnswer: "D",
    explanation:
      "Data brokers aggregate public records, breach data, and app-sharing. You can opt out per broker (free, manual) or use removal services (paid, convenient). Pair removal with prevention: minimize PII you volunteer in apps, surveys, and social quizzes.",
  },

  // 72 — Data Privacy / Advanced
  {
    category: "Data Privacy",
    difficulty: "Advanced",
    question:
      "Under GDPR Article 33, a controller must notify the supervisory authority of a personal-data breach within:",
    optionA: "72 hours of becoming aware",
    optionB: "7 days",
    optionC: "30 days",
    optionD: "90 days",
    correctAnswer: "A",
    explanation:
      "GDPR requires breach notification to the supervisory authority within 72 hours of awareness, unless the breach is unlikely to risk individuals' rights/freedoms. Affected individuals must also be informed when there's high risk to them.",
  },

  // 73 — Data Privacy / Advanced
  {
    category: "Data Privacy",
    difficulty: "Advanced",
    question: "Under GDPR, what is the 'right to be forgotten'?",
    optionA: "The right to never be photographed",
    optionB:
      "The right to erasure — you can request deletion of your personal data, subject to legal exceptions",
    optionC: "The right to be anonymous online always",
    optionD: "The right to delete search results about yourself only",
    correctAnswer: "B",
    explanation:
      "GDPR Article 17 grants individuals the right to have their personal data erased when it's no longer necessary, consent is withdrawn, or processing was unlawful. Exceptions include legal obligations, freedom of expression, and public-interest archiving.",
  },

  // 74 — Data Privacy / Advanced
  {
    category: "Data Privacy",
    difficulty: "Advanced",
    question:
      "A US company says 'we don't sell your data — we only share it with partners for analytics.' Under CCPA/CPRA, what consumer right does this affect?",
    optionA: "Right to access — only access is affected",
    optionB: "Right to deletion — only deletion is affected",
    optionC:
      "Right to opt out of 'sale or share' — CPRA expanded 'sale' to include 'sharing' for cross-context behavioral advertising",
    optionD: "Right to repair",
    correctAnswer: "C",
    explanation:
      "The CPRA (effective 2023) amended CCPA so consumers can opt out of both 'selling' and 'sharing' (which covers disclosure for cross-context behavioral advertising). 'Don't sell, only share' doesn't bypass the opt-out obligation.",
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 7: MALWARE — 13 questions (5 Easy, 5 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 75 — Malware / Easy
  {
    category: "Malware",
    difficulty: "Easy",
    question:
      "Popups suddenly appear claiming 'Your computer has 37 viruses — click OK to clean.' What is this?",
    optionA: "A real virus alert from Windows Defender",
    optionB: "A successful antivirus scan",
    optionC: "A system optimization prompt",
    optionD:
      "Scareware / fake AV — close the browser; don't click anything in the popup",
    correctAnswer: "D",
    explanation:
      "Scareware manufactures fake infection alerts to scare you into installing rogue 'antivirus' software (often itself malware). Don't trust popups about infections; rely on your real antivirus's dashboard, not browser alerts.",
  },

  // 76 — Malware / Easy
  {
    category: "Malware",
    difficulty: "Easy",
    question:
      "Your files are renamed '.locked' and a ransom note demands Bitcoin to decrypt them. What happened?",
    optionA:
      "Ransomware — don't pay; isolate the device and restore files from offline backups",
    optionB: "A Windows update renamed them",
    optionC: "Cloud sync renamed them",
    optionD: "Antivirus quarantined them",
    correctAnswer: "A",
    explanation:
      "Ransomware encrypts your files; paying funds crime and offers no guarantee of recovery. Disconnect the device from networks, report it, and restore from clean offline backups. Prevent infections with patching, email filtering, and offline backups.",
  },

  // 77 — Malware / Easy
  {
    category: "Malware",
    difficulty: "Easy",
    question: "A friend emails a 'cool screensaver' attachment named holiday.scr. Is it safe to open?",
    optionA: "Yes — .scr files are just images",
    optionB:
      "No — .scr is a Windows executable often used to deliver malware; treat unknown attachments with extreme caution",
    optionC: "Yes — friends never send malware",
    optionD: "Yes — .scr files are always safe",
    correctAnswer: "B",
    explanation:
      ".scr is the screensaver executable format on Windows — it runs as a program. Malware authors abuse it because users assume it's an image. Don't open unexpected .scr, .exe, .bat, .vbs, or .js attachments, even from friends (their account may be compromised).",
  },

  // 78 — Malware / Easy
  {
    category: "Malware",
    difficulty: "Easy",
    question: "Your antivirus subscription expired 6 months ago. Best action?",
    optionA: "Keep using it as-is — it still works fine",
    optionB: "Uninstall it — AV is unnecessary",
    optionC:
      "Renew or replace with a current reputable AV — out-of-date AV misses newly discovered threats",
    optionD: "Install two AVs at once for double protection",
    correctAnswer: "C",
    explanation:
      "AV needs current signatures and heuristics to detect new malware. An expired AV is essentially blind to threats discovered after the expiration date. Keep your AV updated and active; Windows Defender (built-in) is a solid free option that updates via Windows Update.",
  },

  // 79 — Malware / Easy
  {
    category: "Malware",
    difficulty: "Easy",
    question:
      "A 'software crack' installer asks you to disable Windows Defender 'to complete installation.' Risk?",
    optionA: "None — cracks are safe if you disable AV",
    optionB: "None — AV false-positives are common",
    optionC: "It's safe if you re-enable AV after",
    optionD:
      "Cracks/keygens frequently bundle malware; asking you to disable AV is a red flag — the crack likely contains a trojan",
    correctAnswer: "D",
    explanation:
      "Cracks and keygens often contain trojans, miners, or backdoors. The 'disable your antivirus' instruction is engineered so the payload can run undetected. Avoid pirated software; use legitimate licenses or open-source alternatives.",
  },

  // 80 — Malware / Hard
  {
    category: "Malware",
    difficulty: "Hard",
    question: "Ransomware encrypts your files. You pay the ransom. What's the realistic outcome?",
    optionA:
      "No guarantee of decryption; you fund criminal enterprise and may be re-targeted. Restore from backups; don't pay",
    optionB: "You always get your files back",
    optionC: "Paying guarantees immunity forever",
    optionD: "Paying automatically uninstalls the malware",
    correctAnswer: "A",
    explanation:
      "Studies (e.g., Coveware reports) show many victims who pay still don't fully recover data, and paying marks you as a willing payer — inviting future attacks. The robust defense is offline, tested backups combined with timely patching.",
  },

  // 81 — Malware / Hard
  {
    category: "Malware",
    difficulty: "Hard",
    question: "A Word document says 'Enable Macros to view the protected content.' Risks?",
    optionA: "None — macros are required to read Word files",
    optionB:
      "Malicious macros can download and run malware — never enable macros on documents from unknown or unexpected sources",
    optionC: "Macros make the document smaller",
    optionD: "Macros are encrypted",
    correctAnswer: "B",
    explanation:
      "Office macros are full programs. Attackers weaponize them to download payloads (e.g., Emotet, IcedID). Modern Office blocks macros from the internet by default; never enable macros on unexpected attachments, even from 'clients' or 'invoices.'",
  },

  // 82 — Malware / Hard
  {
    category: "Malware",
    difficulty: "Hard",
    question:
      "After installing free software, your browser homepage changed and an unfamiliar toolbar appeared. Likely cause?",
    optionA: "Browser upgrade",
    optionB: "Windows theme change",
    optionC:
      "PUP (potentially unwanted program) bundled in the installer — always choose 'Custom install' and decline extras",
    optionD: "ISP rebranding",
    correctAnswer: "C",
    explanation:
      "Free-software installers often bundle browser hijackers, toolbars, and adware that pay the developer per install. Choose 'Custom/Advanced install' and decline every 'recommended extra' before finishing. Run a malware scan if your homepage changed without consent.",
  },

  // 83 — Malware / Hard
  {
    category: "Malware",
    difficulty: "Hard",
    question:
      "Your computer's CPU sits at 100% when idle, the fan spins constantly, and your electric bill jumped. Possible cause?",
    optionA: "Windows indexing files",
    optionB: "Antivirus scan",
    optionC: "Browser tabs open",
    optionD:
      "Cryptominer / cryptojacking malware — silently mining cryptocurrency using your hardware",
    correctAnswer: "D",
    explanation:
      "Cryptojacking malware hijacks CPU/GPU to mine cryptocurrency for the attacker, leaving your device slow and hot. Check Task Manager/Activity Monitor for unknown high-CPU processes; run a malware scan; remove browser extensions you don't recognize.",
  },

  // 84 — Malware / Hard
  {
    category: "Malware",
    difficulty: "Hard",
    question:
      "A ransomware gang exfiltrates your files before encrypting them, then threatens to publish them if you don't pay. What's this called?",
    optionA:
      "Double-extortion ransomware — combines encryption (availability) with leak threats (confidentiality)",
    optionB: "Single-extortion",
    optionC: "Scareware",
    optionD: "Adware",
    correctAnswer: "A",
    explanation:
      "Modern ransomware (Maze, LockBit, BlackCat) doesn't just encrypt — it copies data first. Even victims with backups face extortion: pay or your data leaks. This makes prevention (segmentation, access controls, EDR) more critical than backups alone.",
  },

  // 85 — Malware / Advanced
  {
    category: "Malware",
    difficulty: "Advanced",
    question: "How does fileless malware typically persist on an infected machine?",
    optionA: "By writing a .exe to the Startup folder",
    optionB:
      "It lives in RAM, often via PowerShell/WMI/.NET — no on-disk executable, evading signature-based AV",
    optionC: "By encrypting your documents",
    optionD: "By installing a browser toolbar",
    correctAnswer: "B",
    explanation:
      "Fileless malware injects malicious code into legitimate processes (PowerShell, WMI, .NET assemblies) so nothing touching disk is a 'virus.' Without on-disk artifacts, signature AV has little to match. EDR that monitors in-memory behavior is needed to detect it.",
  },

  // 86 — Malware / Advanced
  {
    category: "Malware",
    difficulty: "Advanced",
    question:
      "A malware sample checks CPU count, recent user files, and the MAC OUI, then stays dormant when run inside a researcher's sandbox. What is this?",
    optionA: "Polymorphism",
    optionB: "Encryption",
    optionC:
      "Sandbox evasion / environment-aware malware — detects analysis environments and changes behavior to avoid detection",
    optionD: "Ransomware",
    correctAnswer: "C",
    explanation:
      "Environment-aware malware looks for sandbox tells: few CPUs, no recent user files, VM MAC addresses, low mouse movement, specific usernames. When analysis is detected, it acts benign or exits. EDR uses kernel-level hooks and dynamic unpacking to counter this.",
  },

  // 87 — Malware / Advanced
  {
    category: "Malware",
    difficulty: "Advanced",
    question: "EDR flagged lateral movement using PsExec and Mimikatz. What does Mimikatz do?",
    optionA: "Sniffs Wi-Fi",
    optionB: "Sends phishing emails",
    optionC: "Encrypts files",
    optionD:
      "Dumps credentials (NTLM hashes, Kerberos tickets) from LSASS memory for credential theft and lateral movement",
    correctAnswer: "D",
    explanation:
      "Mimikatz extracts plaintext passwords, NTLM hashes, and Kerberos tickets from LSASS process memory, enabling pass-the-hash, pass-the-ticket, and golden-ticket attacks. Its appearance in telemetry almost always indicates post-compromise lateral movement.",
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 8: WI-FI SAFETY — 13 questions (5 Easy, 5 Hard, 3 Advanced)
  // ---------------------------------------------------------------------------

  // 88 — Wi-Fi Safety / Easy
  {
    category: "Wi-Fi Safety",
    difficulty: "Easy",
    question:
      "At a coffee shop, you see two networks: 'Cafe-Guest' (password posted on the wall) and 'Free_Cafe_WiFi' (open). Safer choice?",
    optionA: "The open one — open Wi-Fi is safer",
    optionB:
      "The password-protected 'Cafe-Guest' — open networks allow anyone to monitor traffic; WPA2/WPA3 encryption protects each client",
    optionC: "Either — they're equivalent",
    optionD: "Whichever has a stronger signal",
    correctAnswer: "B",
    explanation:
      "Even a shared password enables per-client encryption (WPA2/WPA3 PSK), so other patrons can't trivially sniff your traffic. Open networks have no such encryption. Still treat any public Wi-Fi as untrusted — use a VPN for sensitive tasks.",
  },

  // 89 — Wi-Fi Safety / Easy
  {
    category: "Wi-Fi Safety",
    difficulty: "Easy",
    question: "Hotel Wi-Fi 'password' is your room number + last name. Is this secure?",
    optionA:
      "No — these are easily guessable by anyone on-site; treat hotel Wi-Fi as public and use a VPN for sensitive tasks",
    optionB: "Yes — only guests can guess it",
    optionC: "Yes — the hotel encrypts everything",
    optionD: "Yes — room numbers are secret",
    correctAnswer: "A",
    explanation:
      "Captive-portal 'passwords' derived from public info (room numbers, names) authenticate you to the portal but don't encrypt your traffic on the air. Use a VPN or mobile data for banking; treat hotel Wi-Fi as untrusted.",
  },

  // 90 — Wi-Fi Safety / Easy
  {
    category: "Wi-Fi Safety",
    difficulty: "Easy",
    question: "You're on airport Wi-Fi and need to log in to your bank. Safest action?",
    optionA: "Just log in — airports have enterprise Wi-Fi",
    optionB: "Use a 'private' or incognito window — that makes it safe",
    optionC:
      "Switch to mobile data or use a trusted VPN — public Wi-Fi is not appropriate for banking",
    optionD: "Ask the barista for the password",
    correctAnswer: "C",
    explanation:
      "Public/airport Wi-Fi is untrusted — you don't know who operates it or who's listening. For sensitive tasks like banking, switch to mobile data (cellular) or use a reputable VPN that encrypts your traffic end-to-end.",
  },

  // 91 — Wi-Fi Safety / Easy
  {
    category: "Wi-Fi Safety",
    difficulty: "Easy",
    question:
      "While on hotel Wi-Fi, a popup says 'Router firmware outdated — click to update now.' Best action?",
    optionA: "Click — firmware updates are important",
    optionB: "Click — popups on hotel Wi-Fi are official",
    optionC: "Click only if it has the hotel logo",
    optionD:
      "Ignore — you don't manage the hotel's router; this is a phishing attempt to install malware or steal credentials",
    correctAnswer: "D",
    explanation:
      "You can't update someone else's router from your browser. This popup is either malicious JavaScript injected into the captive portal or a malicious hotspot. Never install 'router updates' prompted by a public Wi-Fi network.",
  },

  // 92 — Wi-Fi Safety / Easy
  {
    category: "Wi-Fi Safety",
    difficulty: "Easy",
    question: "Your home router still uses the default admin password 'admin/admin.' Best action?",
    optionA:
      "Change it immediately to a strong, unique password — defaults are publicly documented and easily exploited",
    optionB: "Keep it — defaults are safest",
    optionC: "Change it only if you suspect hacking",
    optionD: "Change it to 'password'",
    correctAnswer: "A",
    explanation:
      "Default admin credentials for every router model are published online. Attackers (and automated bots) scan the internet for routers still using them. Change both the admin password and the Wi-Fi password, and disable remote admin if unneeded.",
  },

  // 93 — Wi-Fi Safety / Hard
  {
    category: "Wi-Fi Safety",
    difficulty: "Hard",
    question:
      "A network named exactly like your home Wi-Fi ('MyHomeNet') appears at a coffee shop, open, and your phone auto-connects. Risk?",
    optionA: "None — same SSID means it's your home network",
    optionB:
      "Evil-twin attack — an attacker spoofs your known SSID to make your device auto-join, then intercepts traffic",
    optionC: "Just a coincidence",
    optionD: "A carrier misconfiguration",
    correctAnswer: "B",
    explanation:
      "Devices auto-join 'known' SSIDs by name. Attackers exploit this by broadcasting a same-named open network; your phone silently connects and the attacker intercepts or proxies your traffic. Disable auto-join for open networks; use a VPN.",
  },

  // 94 — Wi-Fi Safety / Hard
  {
    category: "Wi-Fi Safety",
    difficulty: "Hard",
    question:
      "The captive portal login page on http://captive.hotel.local asks for your email to 'authenticate.' Risk?",
    optionA: "None — captive portals are always encrypted",
    optionB: "None — email isn't sensitive",
    optionC:
      "HTTP (not HTTPS) captive portals can be sniffed and tampered; never enter sensitive info on a plain HTTP page",
    optionD: "None — it's required by hotel policy",
    correctAnswer: "C",
    explanation:
      "Captive portals often run on plain HTTP, so anyone on the same Wi-Fi can read or modify your traffic. Email addresses (and any PII) you enter can be captured. Provide a secondary/throwaway email, and avoid sensitive logins until you're on HTTPS or VPN.",
  },

  // 95 — Wi-Fi Safety / Hard
  {
    category: "Wi-Fi Safety",
    difficulty: "Hard",
    question: "On public Wi-Fi, you only visit HTTPS sites. Are you fully protected?",
    optionA: "Yes — HTTPS makes everything private",
    optionB: "Yes — public Wi-Fi is fine for banking if HTTPS is used",
    optionC: "Yes — DNS is encrypted by HTTPS",
    optionD:
      "Largely protected for content, but DNS lookups, SNI, and IP addresses can still leak metadata; use a VPN for full privacy",
    correctAnswer: "D",
    explanation:
      "HTTPS encrypts page content, but your DNS queries (which domain you visit) and SNI (server name in the TLS handshake) are often visible, along with destination IPs. A VPN tunnels everything, hiding even these metadata leaks — useful on hostile networks.",
  },

  // 96 — Wi-Fi Safety / Hard
  {
    category: "Wi-Fi Safety",
    difficulty: "Hard",
    question:
      "An 'Open Wi-Fi: FREE_VENUE' network's captive portal asks you to install a 'security certificate' to continue. Best action?",
    optionA:
      "Don't install — installing an attacker's root CA cert lets them MITM your HTTPS traffic across all sites",
    optionB: "Install — it improves security",
    optionC: "Install but only for the current session",
    optionD: "Install if the prompt looks official",
    correctAnswer: "A",
    explanation:
      "A malicious root CA certificate lets the attacker generate valid-looking certs for any site, defeating HTTPS. Installing one is one of the most damaging things you can do on a hostile network. Never install certs prompted by public Wi-Fi.",
  },

  // 97 — Wi-Fi Safety / Hard
  {
    category: "Wi-Fi Safety",
    difficulty: "Hard",
    question: "Your home Wi-Fi uses WEP encryption. Why is that a problem?",
    optionA: "WEP is faster",
    optionB:
      "WEP is cryptographically broken — crackable in minutes; upgrade to WPA2 or WPA3 immediately",
    optionC: "WEP isn't compatible with phones",
    optionD: "WEP limits your bandwidth",
    correctAnswer: "B",
    explanation:
      "WEP's RC4 key reuse makes it trivially crackable with tools like Aircrack-ng in under a minute. WPA2 (AES) is the minimum recommended; WPA3 (SAE) is the current standard. If your router only supports WEP, replace it.",
  },

  // 98 — Wi-Fi Safety / Advanced
  {
    category: "Wi-Fi Safety",
    difficulty: "Advanced",
    question: "The 2017 KRACK attack exploited a vulnerability in which protocol's handshake?",
    optionA: "WEP's IV reuse",
    optionB: "WPA3's SAE handshake",
    optionC:
      "WPA2's 4-way handshake — key reinstallation let attackers decrypt traffic by replaying handshake messages",
    optionD: "TLS 1.2 handshake",
    correctAnswer: "C",
    explanation:
      "KRACK (Key Reinstallation AttaCK) abused how clients reinstalled an already-in-use WPA2 pairwise key during the 4-way handshake, allowing nonce reuse → keystream reuse → traffic decryption. Patched in clients; WPA3's SAE handshake avoids the issue.",
  },

  // 99 — Wi-Fi Safety / Advanced
  {
    category: "Wi-Fi Safety",
    difficulty: "Advanced",
    question: "What does a Wi-Fi deauthentication attack do?",
    optionA: "It encrypts your traffic",
    optionB: "It speeds up your connection",
    optionC: "It hides your SSID",
    optionD:
      "Forcibly disconnects clients from a legitimate AP — to force them onto an evil twin, or as a denial-of-service",
    correctAnswer: "D",
    explanation:
      "Deauth frames exploit the unencrypted management frame layer in 802.11 to spoof 'disconnect' messages from the AP. Attackers use this to force clients onto their evil-twin AP, or simply as DoS. WPA3's Management Frame Protection (802.11w) mitigates this.",
  },

  // 100 — Wi-Fi Safety / Advanced
  {
    category: "Wi-Fi Safety",
    difficulty: "Advanced",
    question:
      "An evil-twin AP uses your home Wi-Fi's SSID nearby. What protection does WPA3 (SAE) offer over WPA2?",
    optionA: "WPA3 encrypts the SSID itself",
    optionB:
      "WPA3's SAE handshake prevents offline dictionary attacks; WPA2's 4-way handshake capture allows offline password cracking",
    optionC: "WPA3 makes the password longer automatically",
    optionD: "WPA3 blocks any device from broadcasting the same SSID",
    correctAnswer: "B",
    explanation:
      "With WPA2, an attacker who captures the 4-way handshake can crack the password offline. WPA3 replaces this with SAE (Dragonfly), which requires an active interactive attack per guess — offline dictionary attacks fail. Upgrade to WPA3 where possible, especially for open networks (WPA3 OWE).",
  },
];
