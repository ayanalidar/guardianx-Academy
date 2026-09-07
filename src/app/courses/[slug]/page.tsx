import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { CourseDetailView } from "@/views/course-detail"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const course = await db.course.findUnique({ where: { slug } })
  if (!course) return { title: "Course Not Found" }
  return {
    title: `${course.title} (${course.shortName}) | GuardianX Academy`,
    description: course.description,
    keywords: course.tags?.split(",").map(t => t.trim()).filter(Boolean) || [],
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const course = await db.course.findUnique({ where: { slug, published: true } })
  if (!course) notFound()
  return <CourseDetailView />
}
