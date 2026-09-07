import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { EventDetailView } from "@/views/event-detail"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const event = await db.event.findUnique({ where: { slug } })
  if (!event) return { title: "Event Not Found" }
  return {
    title: `${event.title} | GuardianX Academy`,
    description: event.description?.slice(0, 160) || event.title,
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const event = await db.event.findUnique({ where: { slug, published: true } })
  if (!event) notFound()
  return <EventDetailView />
}
