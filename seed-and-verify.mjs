import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Find an instructor user (or admin fallback)
const instructor = await prisma.user.findFirst({
  where: { role: { in: ['INSTRUCTOR', 'ADMIN'] } },
  select: { id: true, name: true, role: true },
})
if (!instructor) {
  console.log('NO_INSTRUCTOR')
  process.exit(0)
}
console.log('INSTRUCTOR:', JSON.stringify(instructor))

// Create an office-hour slot 1 day from now, 30 minutes long
const start = new Date(Date.now() + 24*60*60*1000)
const end = new Date(start.getTime() + 30*60*1000)
const slot = await prisma.officeHourSlot.create({
  data: {
    instructorId: instructor.id,
    startAt: start,
    endAt: end,
    mode: 'video',
    location: 'https://meet.guardianx.cloud/test-session',
    maxBookings: 1,
  },
  select: { id: true, startAt: true, endAt: true },
})
console.log('SLOT:', JSON.stringify(slot))

// Find the student + their first enrollment, set lastAccessed to today
const student = await prisma.user.findFirst({
  where: { email: 'student@academy.guardianx.cloud' },
  select: { id: true },
})
if (student) {
  const enr = await prisma.enrollment.findFirst({
    where: { userId: student.id },
    select: { id: true, courseId: true },
  })
  if (enr) {
    await prisma.enrollment.update({
      where: { id: enr.id },
      data: { lastAccessed: new Date() },
    })
    console.log('UPDATED_ENROLLMENT:', JSON.stringify({ id: enr.id, courseId: enr.courseId }))
  } else {
    console.log('NO_ENROLLMENT')
  }
} else {
  console.log('NO_STUDENT')
}

await prisma.$disconnect()
