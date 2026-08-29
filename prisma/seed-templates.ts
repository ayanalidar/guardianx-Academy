// Seed certificate templates — run with: bun run prisma/seed-templates.ts
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  console.log("Seeding certificate templates...")

  const templates = [
    {
      name: "Guardian Classic",
      description: "Traditional certificate with emerald accents — the default GuardianX style.",
      primaryColor: "#10b981",
      accentColor: "#06b6d4",
      fontFamily: "serif",
      borderStyle: "classic",
      signatureText: "Director, GuardianX Academy",
      sealStyle: "emerald",
      backgroundPattern: "grid",
      isDefault: true,
    },
    {
      name: "Cyber Neon",
      description: "Holographic dark-mode certificate with neon cyan glow.",
      primaryColor: "#06b6d4",
      accentColor: "#a855f7",
      fontFamily: "sans",
      borderStyle: "holographic",
      signatureText: "Chief Academic Officer",
      sealStyle: "holographic",
      backgroundPattern: "circuit",
      isDefault: false,
    },
    {
      name: "Gold Excellence",
      description: "Premium gold-sealed certificate for advanced certifications.",
      primaryColor: "#f59e0b",
      accentColor: "#f97316",
      fontFamily: "serif",
      borderStyle: "modern",
      signatureText: "Registrar, GuardianX Academy",
      sealStyle: "gold",
      backgroundPattern: "particles",
      isDefault: false,
    },
    {
      name: "Minimal Pro",
      description: "Clean, minimal certificate for professional programs.",
      primaryColor: "#0ea5e9",
      accentColor: "#64748b",
      fontFamily: "sans",
      borderStyle: "minimal",
      signatureText: "Program Director",
      sealStyle: "cyan",
      backgroundPattern: "none",
      isDefault: false,
    },
  ]

  for (const t of templates) {
    const existing = await db.certificateTemplate.findFirst({ where: { name: t.name } })
    if (existing) {
      await db.certificateTemplate.update({ where: { id: existing.id }, data: t })
      console.log(`  Updated: ${t.name}`)
    } else {
      await db.certificateTemplate.create({ data: t })
      console.log(`  Created: ${t.name}`)
    }
  }

  // Also backfill verificationHash on existing certificates that don't have one
  const { generateVerificationHash } = await import("../src/lib/email")
  const certsWithoutHash = await db.certificate.findMany({ where: { verificationHash: null } })
  console.log(`Backfilling ${certsWithoutHash.length} certificates with verification hashes...`)
  for (const cert of certsWithoutHash) {
    const hash = generateVerificationHash(cert.certificateId, cert.userId, cert.courseId, cert.issuedAt)
    const defaultTemplate = await db.certificateTemplate.findFirst({ where: { isDefault: true } })
    await db.certificate.update({
      where: { id: cert.id },
      data: { verificationHash: hash, templateId: cert.templateId ?? defaultTemplate?.id ?? null },
    })
  }

  console.log("Done.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
