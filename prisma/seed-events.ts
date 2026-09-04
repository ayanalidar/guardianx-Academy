// Seed public-facing cybersecurity events (workshops / webinars / CTFs / campus / bootcamp).
// Run with: bunx tsx prisma/seed-events.ts
// Idempotent: upsert by slug. New events created via admin API are preserved.

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

type SeedEvent = {
  slug: string
  title: string
  description: string
  longDescription: string
  type: string
  category: string
  startDate: string
  startIsoDate: string
  endDate: string
  time: string
  venue: string
  mode: string
  organizer: string
  instructor?: string
  capacity: number
  registered: number
  fee: string
  status: string
  imageUrl?: string
  tags: string
  featured: boolean
  order: number
  published: boolean
}

const EVENTS: SeedEvent[] = [
  {
    slug: "web-application-pentesting-workshop-2026",
    title: "Web Application Penetration Testing Workshop",
    description:
      "A 2-evening intensive workshop on OWASP Top 10, manual exploitation, and modern web pentest tooling — Burp Suite, ffuf, sqlmap.",
    longDescription:
      "This hands-on workshop takes you from the basics of HTTP and web app architecture to advanced exploitation techniques. We'll cover the OWASP Top 10 in depth, walk through real-world bug-bounty cases, and give you access to a live vulnerable target lab for the duration of the workshop. By the end you'll be able to perform a structured external + authenticated web pentest and write a professional-grade report. Suitable for SOC analysts transitioning to offensive security, junior pentesters, and CTF players wanting to level up.",
    type: "workshop",
    category: "Offensive Security",
    startDate: "October 15, 2026",
    startIsoDate: "2026-10-15",
    endDate: "October 16, 2026",
    time: "7:00 PM - 9:00 PM IST",
    venue: "Online (Zoom + GuardianX Labs)",
    mode: "Live Online",
    organizer: "GuardianX",
    instructor: "Alex Mercer",
    capacity: 100,
    registered: 42,
    fee: "Free",
    status: "Open",
    tags: "OWASP|Burp Suite|Web Pentest|Bug Bounty",
    featured: true,
    order: 1,
    published: true,
  },
  {
    slug: "career-paths-in-cybersecurity-2026",
    title: "Career Paths in Cybersecurity 2026",
    description:
      "A free live webinar mapping the cyber job market for 2026 — SOC, pentesting, GRC, cloud security, IAM, and the certifications that actually move the needle.",
    longDescription:
      "Confused about which certification to chase next, or which role fits your background? In this 90-minute webinar, our career team walks through the 2026 cyber hiring landscape: which roles are growing, which are oversaturated, what salaries look like across India/APAC/US, and which 1-2 certifications actually move the needle for each path. We'll close with an open Q&A so bring your questions. Recording will be shared with everyone who registers.",
    type: "webinar",
    category: "Career",
    startDate: "October 20, 2026",
    startIsoDate: "2026-10-20",
    endDate: "October 20, 2026",
    time: "7:00 PM - 9:00 PM IST",
    venue: "Online (YouTube Live)",
    mode: "Live Online",
    organizer: "GuardianX",
    capacity: 500,
    registered: 184,
    fee: "Free",
    status: "Open",
    tags: "Career|Certifications|Webinar",
    featured: true,
    order: 2,
    published: true,
  },
  {
    slug: "guardianx-ctf-championship-2026",
    title: "GuardianX CTF Championship 2026",
    description:
      "48-hour online Jeopardy CTF. 25 challenges across web, crypto, pwn, forensics, reverse engineering, and OSINT. Cash prizes + GuardianX certs.",
    longDescription:
      "The GuardianX CTF Championship returns for 2026 — a 48-hour online Jeopardy-style capture-the-flag competition with 25 challenges across web exploitation, cryptography, binary exploitation (pwn), forensics, reverse engineering, and OSINT. Solo or teams of up to 4. Prize pool: ₹50,000 for the top 3 teams plus GuardianX CTF Champion credentials. Challenges are designed to be approachable for intermediate players but with hard-mode flags for the veterans. Solutions walk-through will be live-streamed after the event.",
    type: "ctf",
    category: "Competitions",
    startDate: "November 5, 2026",
    startIsoDate: "2026-11-05",
    endDate: "November 7, 2026",
    time: "Starts 6:00 PM IST (Fri) — Ends 6:00 PM IST (Sun)",
    venue: "Online (GuardianX CTF Platform)",
    mode: "Live Online",
    organizer: "GuardianX",
    capacity: 1000,
    registered: 312,
    fee: "₹500",
    status: "Open",
    tags: "CTF|Jeopardy|Crypto|Pwn|Web",
    featured: true,
    order: 3,
    published: true,
  },
  {
    slug: "school-cyber-awareness-program-2026",
    title: "School Cyber Awareness Program",
    description:
      "An on-campus cyber-awareness session for school students of grades 8-12 — covering safe browsing, social media hygiene, phishing, and digital footprint.",
    longDescription:
      "GuardianX runs this 90-minute on-campus session free of charge for schools across India. The session is interactive, age-appropriate (grades 8-12), and covers safe browsing habits, social media privacy settings, phishing & scams, digital footprint management, and what to do if something goes wrong. Students receive a GuardianX Cyber Awareness certificate. Schools interested in hosting a session can request a date via the Contact page — we coordinate with school administration for the venue, A/V, and timing.",
    type: "campus",
    category: "Awareness",
    startDate: "November 10, 2026",
    startIsoDate: "2026-11-10",
    endDate: "November 10, 2026",
    time: "10:00 AM - 11:30 AM IST",
    venue: "On-Campus (your school)",
    mode: "On-Campus",
    organizer: "GuardianX Outreach",
    capacity: 200,
    registered: 60,
    fee: "Free",
    status: "Open",
    tags: "Awareness|School|K-12|Outreach",
    featured: false,
    order: 4,
    published: true,
  },
  {
    slug: "ethical-hacking-bootcamp-2026",
    title: "Ethical Hacking Bootcamp",
    description:
      "A 5-day evening bootcamp covering the ethical-hacker lifecycle, with daily hands-on labs in the GuardianX cyber range. For beginners + early-career IT.",
    longDescription:
      "A 5-day evening bootcamp designed to take you from zero-to-comfortable with the ethical-hacker methodology. Each evening covers one phase of the kill-chain — Recon, Scanning, Enumeration, Exploitation, Post-Exploitation — with a 90-minute live session followed by hands-on lab work in the GuardianX cyber range. You'll finish with a working pentest report you can show employers. Suitable for beginners and early-career IT professionals considering a move into security. Certificates of completion issued to all participants who finish the labs.",
    type: "bootcamp",
    category: "Offensive Security",
    startDate: "November 15, 2026",
    startIsoDate: "2026-11-15",
    endDate: "November 19, 2026",
    time: "7:00 PM - 9:30 PM IST",
    venue: "Online (Zoom + GuardianX Cyber Range)",
    mode: "Live Online",
    organizer: "GuardianX",
    instructor: "Dr. Sarah Chen",
    capacity: 50,
    registered: 28,
    fee: "₹2000",
    status: "Open",
    tags: "Bootcamp|Ethical Hacking|Hands-on|Labs",
    featured: true,
    order: 5,
    published: true,
  },
]

async function main() {
  console.log(`\n[seed-events] Upserting ${EVENTS.length} events...`)

  for (const e of EVENTS) {
    await db.event.upsert({
      where: { slug: e.slug },
      update: {
        title: e.title,
        description: e.description,
        longDescription: e.longDescription,
        type: e.type,
        category: e.category,
        startDate: e.startDate,
        startIsoDate: e.startIsoDate,
        endDate: e.endDate,
        time: e.time,
        venue: e.venue,
        mode: e.mode,
        organizer: e.organizer,
        instructor: e.instructor,
        capacity: e.capacity,
        registered: e.registered,
        fee: e.fee,
        status: e.status,
        imageUrl: e.imageUrl,
        tags: e.tags,
        featured: e.featured,
        order: e.order,
        published: e.published,
      },
      create: {
        slug: e.slug,
        title: e.title,
        description: e.description,
        longDescription: e.longDescription,
        type: e.type,
        category: e.category,
        startDate: e.startDate,
        startIsoDate: e.startIsoDate,
        endDate: e.endDate,
        time: e.time,
        venue: e.venue,
        mode: e.mode,
        organizer: e.organizer,
        instructor: e.instructor,
        capacity: e.capacity,
        registered: e.registered,
        fee: e.fee,
        status: e.status,
        imageUrl: e.imageUrl,
        tags: e.tags,
        featured: e.featured,
        order: e.order,
        published: e.published,
      },
    })
    console.log(`  ✓ ${e.type.padEnd(8)} | ${e.title}`)
  }

  const total = await db.event.count()
  console.log(`\n[seed-events] Done. Total Event rows: ${total}`)
}

main()
  .catch((err) => {
    console.error("[seed-events] FAILED:", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
