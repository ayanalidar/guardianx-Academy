// prisma/quiz-seed-script.ts
// Run with: npx tsx prisma/quiz-seed-script.ts
// (or: bunx tsx prisma/quiz-seed-script.ts)
//
// Seeds the QuizQuestion table from prisma/quiz-seed.ts.
// Idempotent — checks if questions already exist by category+question text
// before inserting, so it's safe to re-run.

import { PrismaClient } from "@prisma/client"
import { QUIZ_QUESTIONS } from "./quiz-seed"

const prisma = new PrismaClient()

async function main() {
  console.log(`Seeding ${QUIZ_QUESTIONS.length} quiz questions...`)

  let inserted = 0
  let skipped = 0

  for (const q of QUIZ_QUESTIONS) {
    // Check if this exact question already exists
    const existing = await prisma.quizQuestion.findFirst({
      where: { question: q.question },
      select: { id: true },
    })
    if (existing) {
      skipped++
      continue
    }

    await prisma.quizQuestion.create({
      data: {
        category: q.category,
        difficulty: q.difficulty,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        active: true,
      },
    })
    inserted++
  }

  console.log(`Done. Inserted: ${inserted}, Skipped (already existed): ${skipped}`)

  // Verify counts
  const total = await prisma.quizQuestion.count()
  const byCategory = await prisma.quizQuestion.groupBy({ by: ["category"], _count: true })
  const byDifficulty = await prisma.quizQuestion.groupBy({ by: ["difficulty"], _count: true })
  console.log("\nTotal questions in DB:", total)
  console.log("\nBy category:")
  byCategory.forEach((c) => console.log(`  ${c.category}: ${c._count}`))
  console.log("\nBy difficulty:")
  byDifficulty.forEach((d) => console.log(`  ${d.difficulty}: ${d._count}`))
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
