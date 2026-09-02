import { db } from "../src/lib/db"

// Seed the three new content-management models (Certifications, SiteContent,
// PartnerInstitution) with the hardcoded data currently in the views so that
// the platform starts in a fully-populated state.

const CERTS = [
  // Ethical Hacking
  { short: "CEH", full: "Certified Ethical Hacker", body: "EC-Council", level: "Intermediate", category: "Ethical Hacking", color: "emerald", duration: "40h", desc: "Master footprinting, scanning, enumeration, system hacking, malware, sniffing, and social engineering.", popular: true },
  { short: "OSCP", full: "Offensive Security Certified Professional", body: "OffSec", level: "Advanced", category: "Ethical Hacking", color: "emerald", duration: "60h", desc: "Hands-on penetration testing with real-world exploit scenarios and a 24-hour practical exam." },
  { short: "eJPT", full: "Junior Penetration Tester", body: "INE", level: "Beginner", category: "Ethical Hacking", color: "emerald", duration: "30h", desc: "Entry-level practical penetration testing certification covering assessment methodologies." },
  { short: "PNPT", full: "Practical Network Penetration Tester", body: "TCM Security", level: "Intermediate", category: "Ethical Hacking", color: "emerald", duration: "45h", desc: "Internal and external network penetration testing with Active Directory exploitation." },
  // Networking
  { short: "CCNA", full: "Cisco Certified Network Associate", body: "Cisco", level: "Beginner", category: "Networking", color: "cyan", duration: "35h", desc: "Network fundamentals, IP connectivity, switching, VLANs, and network security basics.", popular: true },
  { short: "CCNP", full: "CCNP Enterprise", body: "Cisco", level: "Advanced", category: "Networking", color: "teal", duration: "60h", desc: "Advanced routing (OSPF, BGP), SD-WAN, SD-Access, and network automation." },
  { short: "CompTIA N+", full: "CompTIA Network+", body: "CompTIA", level: "Beginner", category: "Networking", color: "cyan", duration: "25h", desc: "Vendor-neutral networking fundamentals: OSI model, TCP/IP, routing, and troubleshooting." },
  { short: "Juniper JNCIA", full: "Juniper Networks Certified Associate", body: "Juniper", level: "Beginner", category: "Networking", color: "cyan", duration: "30h", desc: "Junos OS fundamentals, routing, and switching on Juniper devices." },
  // Web Security
  { short: "WAPT", full: "Web Application Penetration Testing", body: "GuardianX", level: "Intermediate", category: "Web Security", color: "violet", duration: "45h", desc: "OWASP Top 10, Burp Suite mastery, SQLi, XSS, SSRF, API security, and real exploit payloads.", popular: true },
  { short: "OSWE", full: "Offensive Security Web Expert", body: "OffSec", level: "Advanced", category: "Web Security", color: "violet", duration: "50h", desc: "White-box web application exploitation and source code auditing." },
  { short: "Burp Suite", full: "PortSwigger Burp Suite Certified", body: "PortSwigger", level: "Intermediate", category: "Web Security", color: "violet", duration: "35h", desc: "Master Burp Suite Professional for web application security testing." },
  // System Administration
  { short: "RHCSA", full: "Red Hat Certified System Administrator", body: "Red Hat", level: "Beginner", category: "System Administration", color: "red", duration: "30h", desc: "RHEL administration: users, storage (LVM), SELinux, systemd, and network configuration.", popular: true },
  { short: "RHCE", full: "Red Hat Certified Engineer", body: "Red Hat", level: "Advanced", category: "System Administration", color: "red", duration: "50h", desc: "Ansible automation, advanced RHEL configuration, and security hardening." },
  { short: "LPIC-1", full: "Linux Professional Institute Certified", body: "LPI", level: "Beginner", category: "System Administration", color: "red", duration: "25h", desc: "Vendor-neutral Linux administration: command line, file systems, processes." },
  // Security Management
  { short: "CISSP", full: "Certified Information Systems Security Professional", body: "ISC2", level: "Advanced", category: "Security Management", color: "amber", duration: "80h", desc: "8 domains of the CBK: risk management, asset security, architecture, IAM, operations, SDLC.", popular: true },
  { short: "CISM", full: "Certified Information Security Manager", body: "ISACA", level: "Advanced", category: "Security Management", color: "amber", duration: "60h", desc: "Information security management, governance, risk, and incident response." },
  { short: "CISA", full: "Certified Information Systems Auditor", body: "ISACA", level: "Advanced", category: "Security Management", color: "amber", duration: "55h", desc: "IT audit, control, and assurance of information systems." },
  { short: "ISO 27001", full: "ISO/IEC 27001 Lead Implementer", body: "ISO", level: "Intermediate", category: "Security Management", color: "amber", duration: "40h", desc: "Information Security Management System (ISMS) implementation and auditing." },
  // Identity & Access
  { short: "CYBERARK", full: "CyberArk IAM & PAM", body: "CyberArk", level: "Advanced", category: "Identity & Access", color: "orange", duration: "35h", desc: "CyberArk PAM suite: EPV, CPM, PSM/PSMP, Conjur, session brokering, and just-in-time access.", popular: true },
  { short: "SailPoint", full: "SailPoint IdentityNow", body: "SailPoint", level: "Advanced", category: "Identity & Access", color: "orange", duration: "40h", desc: "Identity governance, access management, and compliance automation." },
  { short: "Okta", full: "Okta Certified Professional", body: "Okta", level: "Intermediate", category: "Identity & Access", color: "orange", duration: "30h", desc: "Cloud identity and access management, SSO, MFA, and lifecycle management." },
  // Cloud Security
  { short: "AWS Sec", full: "AWS Security Specialty", body: "Amazon", level: "Advanced", category: "Cloud Security", color: "cyan", duration: "50h", desc: "AWS security: IAM, KMS, GuardDuty, Macie, WAF, and incident response in the cloud." },
  { short: "Azure SC-900", full: "Microsoft Security Fundamentals", body: "Microsoft", level: "Beginner", category: "Cloud Security", color: "cyan", duration: "20h", desc: "Azure security, compliance, and identity fundamentals." },
  { short: "CCSP", full: "Certified Cloud Security Professional", body: "ISC2", level: "Advanced", category: "Cloud Security", color: "cyan", duration: "55h", desc: "Cloud architecture, design, operations, and security across all major cloud providers." },
  // Forensics & Blue Team
  { short: "GCFA", full: "GIAC Certified Forensic Analyst", body: "GIAC", level: "Advanced", category: "Forensics & Blue Team", color: "teal", duration: "50h", desc: "Advanced digital forensics, incident response, and malware analysis." },
  { short: "CompTIA CySA+", full: "Cyber Security Analyst", body: "CompTIA", level: "Intermediate", category: "Forensics & Blue Team", color: "teal", duration: "35h", desc: "Threat detection, log analysis, and security operations center (SOC) skills." },
  { short: "Blue Team", full: "Blue Team Level 1 (BTL1)", body: "Security Blue Team", level: "Beginner", category: "Forensics & Blue Team", color: "teal", duration: "30h", desc: "Defensive security: phishing analysis, SIEM, incident response, and threat hunting." },
]

const SITE_CONTENT: Record<string, string> = {
  hero_badge: "SYSTEM ONLINE · 31 LABS · 27 CERTIFICATIONS · PROCTORED EXAMS",
  hero_title_1: "Master Cyber Security.",
  hero_title_2: "Become a Guardian.",
  hero_subtitle: "GuardianX Academy delivers industry-leading cyber security certification training through in-premises classes at schools, colleges, and universities — plus virtual batches for individual learners. Practice with real-world payloads, hands-on labs, and proctored examinations.",
  stats_students: "15,000+",
  stats_campuses: "50+",
  stats_certs: "8,500+",
  stats_placement: "94%",
  stats_students_label: "Students Trained",
  stats_campuses_label: "Partner Campuses",
  stats_certs_label: "Certifications Earned",
  stats_placement_label: "Job Placement",
  features_heading: "Everything You Need to Master Cyber Security",
  features_subheading: "From beginner networking to advanced exploitation — a complete ecosystem for cyber security education.",
  certs_cta_heading: "Explore Our Certification Programs",
  certs_cta_subheading: "From foundational networking to advanced exploitation and privileged access management — GuardianX Academy offers 27 certification tracks across cyber security, networking, cloud, and identity management. All certifications require passing a proctored examination.",
  journey_heading: "From Beginner to Certified Guardian",
  journey_subheading: "Four steps to launch your cyber security career.",
  tech_heading: "Enterprise-Grade Technology Stack",
  tech_subheading: "Built with modern, scalable, and secure technologies.",
  final_cta_heading: "Ready to Start Your Journey?",
  final_cta_subheading: "Join 15,000+ students mastering cyber security. Sign up free and get instant access to courses, labs, and live sessions.",
  certifications_hero_badge: "27 CERTIFICATION TRACKS",
  certifications_hero_title: "Certification Programs",
  certifications_hero_subtitle: "From foundational networking to advanced exploitation — GuardianX Academy prepares you for 27+ industry-recognized cyber security certifications across 8 domains.",
  partners_hero_badge: "PARTNER INSTITUTIONS PROGRAM",
  partners_hero_title_1: "Bring Cyber Security",
  partners_hero_title_2: "Training to Your Campus",
  partners_hero_subtitle: "GuardianX partners with schools, colleges, and universities to deliver industry-grade cyber security certification training directly at your premises — with in-person classes, hands-on labs, and proctored examinations. Virtual batches are also available for individual learners.",
}

const PARTNERS: Array<{
  name: string; shortName: string; type: string; location: string; city: string; country: string;
  established: number; studentsCount: string; mouSigned: string; mouDuration: string;
  partnershipLevel: string; coursesOffered: string[]; studentsTrained: number;
  certificationsEarned: number; labsSetup: number; facultyTrained: number; description: string;
  achievements: string[]; contactPerson: string; contactRole: string; email: string; phone: string;
  website: string; color: string
}> = [
  // ===== SCHOOLS =====
  {
    name: "Delhi Public School, Bangalore", shortName: "DPS", type: "school", location: "Kanakapura Road",
    city: "Bangalore", country: "India", established: 2001, studentsCount: "3,500+", mouSigned: "Jan 2024",
    mouDuration: "5 years", partnershipLevel: "Platinum",
    coursesOffered: ["Cyber Awareness (Grade 6-8)", "Safe Online Habits (Grade 9-10)", "Intro to Coding Security (Grade 11-12)"],
    studentsTrained: 1200, certificationsEarned: 0, labsSetup: 2, facultyTrained: 15,
    description: "One of Bangalore's premier K-12 institutions, DPS Bangalore has integrated GuardianX cyber awareness programs across middle and high school. Students participate in interactive CTF games, digital safety workshops, and age-appropriate security challenges.",
    achievements: ["Best Cyber Awareness Program Award 2024", "100% student participation in digital safety modules", "Inter-school CTF competition winners (3 years running)", "Featured in 'Cyber Safe Schools' national report"],
    contactPerson: "Dr. Meera Krishnan", contactRole: "Principal", email: "principal@dpsbangalore.edu.in",
    phone: "+91 80 2649 2001", website: "dpsbangalore.edu.in", color: "emerald",
  },
  {
    name: "Greenwood International School", shortName: "GIS", type: "school", location: "Whitefield",
    city: "Bangalore", country: "India", established: 2004, studentsCount: "2,200+", mouSigned: "Aug 2023",
    mouDuration: "3 years", partnershipLevel: "Gold",
    coursesOffered: ["Digital Citizenship (Grade 5-7)", "Cyber Safety Basics (Grade 8-10)", "Python Security Intro (Grade 11-12)"],
    studentsTrained: 850, certificationsEarned: 0, labsSetup: 1, facultyTrained: 8,
    description: "An IB World School focused on holistic education, Greenwood has adopted GuardianX for its digital literacy curriculum. The school runs a dedicated 'Cyber Guardians' club where students explore ethical hacking basics in a safe environment.",
    achievements: ["IB Cyber Security Excellence Award", "Cyber Guardians Club: 120+ active members", "Hosted inter-school cyber quiz 2024", "Parent awareness workshops: 500+ attendees"],
    contactPerson: "Mr. Rajiv Menon", contactRole: "Vice Principal — Technology",
    email: "tech@greenwood.edu.in", phone: "+91 80 2845 1100", website: "greenwood.edu.in", color: "emerald",
  },
  {
    name: "The Heritage School, Pune", shortName: "THS", type: "school", location: "Wakad",
    city: "Pune", country: "India", established: 2008, studentsCount: "1,800+", mouSigned: "Mar 2024",
    mouDuration: "3 years", partnershipLevel: "Silver",
    coursesOffered: ["Cyber Awareness (Grade 6-9)", "Safe Social Media (Grade 10-12)"],
    studentsTrained: 450, certificationsEarned: 0, labsSetup: 1, facultyTrained: 6,
    description: "A progressive CBSE school in Pune, Heritage integrated GuardianX cyber awareness modules into their value-added curriculum. The school hosts annual 'Cyber Safety Week' events with interactive sessions for students and parents.",
    achievements: ["Cyber Safety Week: 1000+ participants", "Student cyber ambassadors program launched", "Top 3 in Pune inter-school CTF 2024"],
    contactPerson: "Ms. Sunita Agarwal", contactRole: "Academic Coordinator",
    email: "academic@heritagepune.edu.in", phone: "+91 20 6678 4500", website: "heritagepune.edu.in", color: "emerald",
  },
  {
    name: "Sunrise Public School, Hyderabad", shortName: "SPS", type: "school", location: "Gachibowli",
    city: "Hyderabad", country: "India", established: 2010, studentsCount: "2,800+", mouSigned: "Sep 2023",
    mouDuration: "5 years", partnershipLevel: "Gold",
    coursesOffered: ["Digital Safety (Grade 3-5)", "Cyber Awareness (Grade 6-8)", "Intro to Cyber Security (Grade 9-12)"],
    studentsTrained: 920, certificationsEarned: 0, labsSetup: 2, facultyTrained: 12,
    description: "A tech-forward school in Hyderabad's IT corridor, Sunrise was one of GuardianX's earliest school partners. They have a dedicated 'Cyber Lab' with 30 terminals where students practice hands-on security challenges.",
    achievements: ["First school in Telangana with dedicated Cyber Lab", "Cyber ambassador program: 80 students", "Hosted GuardianX inter-school hackathon 2024", "Parent cyber safety workshops: 600+ parents trained"],
    contactPerson: "Mr. Vikram Reddy", contactRole: "Director — Technology Integration",
    email: "vikram@sunrisehyd.edu.in", phone: "+91 40 2312 7800", website: "sunrisehyd.edu.in", color: "emerald",
  },
  // ===== COLLEGES =====
  {
    name: "Bangalore Institute of Technology", shortName: "BIT", type: "college", location: "KR Circle",
    city: "Bangalore", country: "India", established: 1979, studentsCount: "6,500+", mouSigned: "Jun 2023",
    mouDuration: "5 years", partnershipLevel: "Platinum",
    coursesOffered: ["CCNA Certification Track", "RHCSA System Administration", "CEH Ethical Hacking", "WAPT Web Pentesting"],
    studentsTrained: 1850, certificationsEarned: 420, labsSetup: 4, facultyTrained: 22,
    description: "One of Karnataka's top engineering colleges, BIT has embedded GuardianX certification tracks into its Computer Science and Information Science electives. The college has a state-of-the-art Cyber Security Lab with 60 terminals, equipped for hands-on penetration testing and network security exercises. GuardianX instructors conduct weekly in-premises classes, and students take proctored exams on-site.",
    achievements: ["Best Cyber Security Education Partnership 2024", "420+ industry certifications earned by students", "95% CCNA pass rate (up from 60% pre-partnership)", "Hosted National Cyber Security Hackathon 2024", "Cyber Security Center of Excellence established", "Placement: 180+ students placed in security roles"],
    contactPerson: "Dr. Anita Krishnan", contactRole: "Professor & Head, Department of CSE",
    email: "hod.cse@bit-bangalore.edu.in", phone: "+91 80 2672 1783", website: "bit-bangalore.edu.in", color: "cyan",
  },
  {
    name: "Pune Institute of Computer Technology", shortName: "PICT", type: "college", location: "Dhankawadi",
    city: "Pune", country: "India", established: 1983, studentsCount: "4,200+", mouSigned: "Aug 2023",
    mouDuration: "3 years", partnershipLevel: "Gold",
    coursesOffered: ["CEH Certification Prep", "WAPT Web Application Security", "CyberArk PAM Fundamentals", "CCNA Networking"],
    studentsTrained: 1100, certificationsEarned: 280, labsSetup: 3, facultyTrained: 15,
    description: "A premier computer engineering college in Pune, PICT integrated GuardianX courses into its IT and Computer Engineering curriculum as industry electives. The college has 3 dedicated lab environments set up by GuardianX, including a network simulation lab and a web application security testing lab. Instructors visit campus twice weekly for hands-on sessions.",
    achievements: ["280+ students certified in CEH, WAPT, CCNA", "Inter-college CTF champions 2023 & 2024", "Cyber Security Innovation Lab inaugurated 2024", "Industry mentorship: 50+ students mentored", "Average salary hike: 35% for certified students"],
    contactPerson: "Prof. Suresh Kulkarni", contactRole: "Dean — Industry Relations",
    email: "dean.ir@pict.edu", phone: "+91 20 2437 2247", website: "pict.edu", color: "cyan",
  },
  {
    name: "Chennai College of Engineering", shortName: "CCE", type: "college", location: "Guindy",
    city: "Chennai", country: "India", established: 1995, studentsCount: "3,800+", mouSigned: "Nov 2023",
    mouDuration: "3 years", partnershipLevel: "Silver",
    coursesOffered: ["CCNA Network Fundamentals", "RHCSA Linux Admin", "Intro to Ethical Hacking"],
    studentsTrained: 650, certificationsEarned: 145, labsSetup: 2, facultyTrained: 10,
    description: "An Anna University-affiliated college in Chennai, CCE offers GuardianX certification tracks as part of its skill-development program. The college has set up two GuardianX labs with 40 terminals each, and students take proctored certification exams on campus at the end of each semester.",
    achievements: ["145 certifications earned in first year", "Cyber security club: 200+ members", "Tamil Nadu inter-college CTF runners-up 2024", "Faculty certification: 10 professors RHCSA-certified"],
    contactPerson: "Dr. Lakshmi Narayanan", contactRole: "Professor, Department of IT",
    email: "hod.it@ccechennai.edu.in", phone: "+91 44 2235 1700", website: "ccechennai.edu.in", color: "cyan",
  },
  {
    name: "Mumbai Polytechnic Institute", shortName: "MPI", type: "college", location: "Andheri West",
    city: "Mumbai", country: "India", established: 1988, studentsCount: "2,500+", mouSigned: "Feb 2024",
    mouDuration: "3 years", partnershipLevel: "Bronze",
    coursesOffered: ["CCNA Network Basics", "Linux Administration Fundamentals"],
    studentsTrained: 380, certificationsEarned: 72, labsSetup: 1, facultyTrained: 5,
    description: "A leading polytechnic in Mumbai, MPI introduced GuardianX networking and system administration courses as part of its diploma program. The college has one GuardianX lab with 25 terminals, and instructors visit bi-weekly for hands-on workshops.",
    achievements: ["72 students CCNA-certified in 6 months", "Diploma curriculum updated with security modules", "Industry visit to cyber security firm organized"],
    contactPerson: "Mr. Prakash Shinde", contactRole: "Training & Placement Officer",
    email: "tpo@mpimumbai.edu.in", phone: "+91 22 2624 3001", website: "mpimumbai.edu.in", color: "cyan",
  },
  // ===== UNIVERSITIES =====
  {
    name: "Indian Institute of Technology, Delhi", shortName: "IIT-D", type: "university", location: "Hauz Khas",
    city: "New Delhi", country: "India", established: 1961, studentsCount: "12,000+", mouSigned: "Jan 2023",
    mouDuration: "5 years", partnershipLevel: "Platinum",
    coursesOffered: ["CISSP Security Management", "CyberArk PAM Architecture", "Advanced WAPT & API Security", "Cloud Security (AWS/Azure)", "OSCP Prep"],
    studentsTrained: 2400, certificationsEarned: 680, labsSetup: 6, facultyTrained: 35,
    description: "India's premier engineering institution, IIT Delhi partnered with GuardianX to establish a Cyber Security Center of Excellence. The partnership includes advanced research labs for penetration testing, cloud security, and identity management. GuardianX conducts in-premises proctored examinations, and the university offers GuardianX certifications as part of its MTech in Cyber Security program. Joint research publications, PhD-level content collaboration, and industry-academia innovation grants are key features of this partnership.",
    achievements: ["680+ advanced certifications (CISSP, CyberArk, OSCP)", "Cyber Security Center of Excellence — 6 research labs", "12 joint research publications in 2024", "Innovation grant: ₹50L for security research", "Industry placements: 240+ students in top security firms", "Hosted International Cyber Security Conference 2024", "Faculty exchange program with global universities"],
    contactPerson: "Prof. Dr. Subbarao Nuvvula", contactRole: "Head, Center for Cyber Security",
    email: "ccs@iitd.ac.in", phone: "+91 11 2659 1111", website: "iitd.ac.in", color: "violet",
  },
  {
    name: "National University of Singapore", shortName: "NUS", type: "university", location: "Kent Ridge",
    city: "Singapore", country: "Singapore", established: 1905, studentsCount: "43,000+", mouSigned: "Mar 2023",
    mouDuration: "5 years", partnershipLevel: "Platinum",
    coursesOffered: ["CISSP Certification Track", "CyberArk IAM & PAM", "Advanced Cloud Security", "OSCP Penetration Testing", "GCFA Digital Forensics"],
    studentsTrained: 1950, certificationsEarned: 540, labsSetup: 5, facultyTrained: 28,
    description: "Asia's #1 university, NUS partnered with GuardianX to enhance its School of Computing's cyber security curriculum. The partnership includes a dedicated Cyber Range facility with simulated enterprise environments for red team / blue team exercises. GuardianX instructors conduct in-premises classes for postgraduate students, and the university hosts GuardianX proctored certification exams quarterly. The collaboration also includes joint research on AI-driven threat detection and zero-trust architectures.",
    achievements: ["540+ advanced certifications earned", "Cyber Range facility: 5 simulated enterprise environments", "Joint AI threat detection research: 8 papers published", "NUS-GuardianX Cyber Security Hackathon: 500+ participants", "Industry partnership network: 30+ hiring partners", "Best University Cyber Security Program — Asia 2024"],
    contactPerson: "Prof. Dr. Winston Tan", contactRole: "Director, NUS Cyber Security Program",
    email: "cybersec@nus.edu.sg", phone: "+65 6516 6666", website: "nus.edu.sg", color: "violet",
  },
  {
    name: "Vellore Institute of Technology", shortName: "VIT", type: "university", location: "Vellore Campus",
    city: "Vellore", country: "India", established: 1984, studentsCount: "35,000+", mouSigned: "Jul 2023",
    mouDuration: "5 years", partnershipLevel: "Gold",
    coursesOffered: ["CEH Ethical Hacking", "CCNA Networking", "RHCSA Linux Admin", "WAPT Web Security", "CISSP Security Management"],
    studentsTrained: 3200, certificationsEarned: 890, labsSetup: 4, facultyTrained: 30,
    description: "One of India's largest private universities, VIT integrated GuardianX certification tracks across its CSE, IT, and Cyber Security degree programs. The university has 4 dedicated GuardianX labs across its Vellore and Chennai campuses. In-premises classes are conducted by GuardianX-certified instructors, and students take proctored exams on-site. VIT also runs a GuardianX Virtual Batch for distance-learning students.",
    achievements: ["890+ certifications across 5 tracks", "4 GuardianX labs (Vellore + Chennai campuses)", "Cyber Security specialization: 600+ enrolled students", "Placement rate: 96% for certified students", "Inter-university CTF: champions 2023, 2024", "Faculty development: 30 professors trained & certified"],
    contactPerson: "Dr. Chandrasekaran V", contactRole: "Dean — School of Computer Science",
    email: "dean.scs@vit.ac.in", phone: "+91 416 220 2020", website: "vit.ac.in", color: "violet",
  },
  {
    name: "BITS Pilani, Hyderabad Campus", shortName: "BITS-H", type: "university", location: "Jawahar Nagar",
    city: "Hyderabad", country: "India", established: 2008, studentsCount: "8,500+", mouSigned: "Oct 2023",
    mouDuration: "3 years", partnershipLevel: "Gold",
    coursesOffered: ["CEH Certification", "WAPT Web Pentesting", "Cloud Security (AWS)", "CCNP Enterprise"],
    studentsTrained: 1450, certificationsEarned: 312, labsSetup: 3, facultyTrained: 18,
    description: "BITS Pilani's Hyderabad campus, located in India's cyber security hub, partnered with GuardianX for its MSc in Information Systems and BE Computer Science programs. The campus has 3 GuardianX labs and benefits from proximity to the city's security industry. GuardianX conducts in-premises workshops, hackathons, and proctored certification exams each semester.",
    achievements: ["312 certifications in first year", "Hyderabad Cyber Security Hackathon: co-hosted with GuardianX", "Industry mentorship: 80 students paired with security pros", "Research collaboration: 4 papers on cloud security", "Startup incubation: 3 student security startups launched"],
    contactPerson: "Prof. Dr. Ramesh Hariharan", contactRole: "Professor, Department of CSIS",
    email: "csis.hyd@bits-pilani.ac.in", phone: "+91 40 6630 3500", website: "bits-pilani.ac.in/hyderabad", color: "violet",
  },
  {
    name: "SRM Institute of Science and Technology", shortName: "SRM", type: "university", location: "Kattankulathur",
    city: "Chennai", country: "India", established: 1985, studentsCount: "52,000+", mouSigned: "May 2023",
    mouDuration: "5 years", partnershipLevel: "Platinum",
    coursesOffered: ["CEH Ethical Hacking", "CCNA Networking", "CCNP Enterprise", "RHCSA Linux", "WAPT Web Security", "CyberArk PAM", "CISSP Management"],
    studentsTrained: 4100, certificationsEarned: 1120, labsSetup: 6, facultyTrained: 42,
    description: "One of India's largest universities, SRM has the most comprehensive GuardianX partnership. With 7 certification tracks integrated across CSE, IT, and MCA programs, SRM has 6 dedicated GuardianX labs across its Kattankulathur and Ramapuram campuses. The university runs both in-premises classes and virtual batches, making it the largest GuardianX training partner by student volume. Proctored exams are conducted monthly on campus.",
    achievements: ["1120+ certifications — highest among all partners", "6 labs across 2 campuses", "42 faculty members trained & certified", "Annual GuardianX-SRM Cyber Fest: 2000+ participants", "Placement: 450+ students in security roles (2024)", "Best GuardianX Partner University 2024", "Cyber Security incubation center established"],
    contactPerson: "Dr. T. R. Srinivasan", contactRole: "Director — School of Computing",
    email: "director.soc@srmist.edu.in", phone: "+91 44 2745 2270", website: "srmist.edu.in", color: "violet",
  },
]

async function main() {
  console.log("🌱 Seeding content management models...")

  // --- Certifications ---
  const existingCerts = await db.certification.count()
  if (existingCerts > 0) {
    console.log(`⏭  Certifications already seeded (${existingCerts} found) — skipping.`)
  } else {
    for (let i = 0; i < CERTS.length; i++) {
      const c = CERTS[i]
      await db.certification.create({ data: { ...c, order: i } })
    }
    console.log(`✅ Seeded ${CERTS.length} certifications`)
  }

  // --- SiteContent ---
  const existingContent = await db.siteContent.count()
  if (existingContent > 0) {
    console.log(`⏭  SiteContent already seeded (${existingContent} found) — skipping.`)
  } else {
    for (const [key, value] of Object.entries(SITE_CONTENT)) {
      await db.siteContent.create({ data: { key, value, type: "text" } })
    }
    console.log(`✅ Seeded ${Object.keys(SITE_CONTENT).length} site content items`)
  }

  // --- PartnerInstitution ---
  const existingPartners = await db.partnerInstitution.count()
  if (existingPartners > 0) {
    console.log(`⏭  Partners already seeded (${existingPartners} found) — skipping.`)
  } else {
    for (let i = 0; i < PARTNERS.length; i++) {
      const p = PARTNERS[i]
      await db.partnerInstitution.create({
        data: {
          name: p.name,
          shortName: p.shortName,
          type: p.type,
          location: p.location,
          city: p.city,
          country: p.country,
          established: p.established,
          studentsCount: p.studentsCount,
          mouSigned: p.mouSigned,
          mouDuration: p.mouDuration,
          partnershipLevel: p.partnershipLevel,
          coursesOffered: p.coursesOffered.join("|"),
          studentsTrained: p.studentsTrained,
          certificationsEarned: p.certificationsEarned,
          labsSetup: p.labsSetup,
          facultyTrained: p.facultyTrained,
          description: p.description,
          achievements: p.achievements.join("|"),
          contactPerson: p.contactPerson,
          contactRole: p.contactRole,
          email: p.email,
          phone: p.phone,
          website: p.website,
          color: p.color,
          order: i,
        },
      })
    }
    console.log(`✅ Seeded ${PARTNERS.length} partner institutions`)
  }

  console.log("🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
