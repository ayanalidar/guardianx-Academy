import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

// ============================================================
// Collaborative Cyber Range — list & create session
// GET:  list ranges (auto-seeds 3 if empty)
// POST: { rangeId } → create a session (caller = leader)
// ============================================================

async function seedRanges() {
  const ranges = [
    {
      name: "Corporate Network Siege",
      description:
        "A segmented enterprise network with DMZ, internal servers, and an Active Directory forest. Defenders protect while attackers breach.",
      topology: JSON.stringify({
        nodes: [
          { id: "fw", label: "Firewall", type: "firewall" },
          { id: "dmz", label: "DMZ Web", type: "server" },
          { id: "ad", label: "AD DC", type: "directory" },
          { id: "client", label: "Workstation", type: "client" },
        ],
        links: [["fw", "dmz"], ["dmz", "ad"], ["ad", "client"]],
      }),
      machines: JSON.stringify([
        { hostname: "edge-fw-01", os: "pfSense", role: "Firewall", ip: "10.0.0.1" },
        { hostname: "web-dmz-01", os: "Ubuntu 22.04", role: "Web Server", ip: "10.0.1.10" },
        { hostname: "dc01", os: "Windows Server 2019", role: "Domain Controller", ip: "10.0.2.5" },
        { hostname: "ws-042", os: "Windows 11", role: "Workstation", ip: "10.0.2.42" },
      ]),
      maxUsers: 8,
      difficulty: "advanced",
      duration: 180,
      status: "available",
    },
    {
      name: "ICS/OT Plant Floor",
      description:
        "An industrial control system simulating a water-treatment plant. Attackers attempt to manipulate HMIs; defenders detect and isolate.",
      topology: JSON.stringify({
        nodes: [
          { id: "scada", label: "SCADA", type: "server" },
          { id: "plc1", label: "PLC-1", type: "plc" },
          { id: "plc2", label: "PLC-2", type: "plc" },
          { id: "hmi", label: "HMI", type: "client" },
        ],
        links: [["scada", "plc1"], ["scada", "plc2"], ["scada", "hmi"]],
      }),
      machines: JSON.stringify([
        { hostname: "scada-master", os: "RHEL 8", role: "SCADA Server", ip: "192.168.10.5" },
        { hostname: "plc-inlet", os: "Vendor RTOS", role: "PLC", ip: "192.168.10.20" },
        { hostname: "plc-filter", os: "Vendor RTOS", role: "PLC", ip: "192.168.10.21" },
        { hostname: "hmi-01", os: "Windows 10 LTSC", role: "HMI", ip: "192.168.10.50" },
      ]),
      maxUsers: 6,
      difficulty: "advanced",
      duration: 150,
      status: "available",
    },
    {
      name: "Cloud Kubernetes Cluster",
      description:
        "A managed Kubernetes cluster with multiple namespaces. Attackers exploit misconfigurations to escape pods and seize cluster-admin.",
      topology: JSON.stringify({
        nodes: [
          { id: "api", label: "K8s API", type: "api" },
          { id: "ingress", label: "Ingress", type: "ingress" },
          { id: "web-pod", label: "Web Pod", type: "pod" },
          { id: "db-pod", label: "DB Pod", type: "pod" },
        ],
        links: [["api", "ingress"], ["ingress", "web-pod"], ["web-pod", "db-pod"]],
      }),
      machines: JSON.stringify([
        { hostname: "k8s-api", os: "k8s 1.28", role: "Control Plane", ip: "10.96.0.1" },
        { hostname: "ingress-nginx", os: "Container", role: "Ingress", ip: "10.244.0.5" },
        { hostname: "web-app-pod", os: "Container", role: "Pod", ip: "10.244.1.10" },
        { hostname: "postgres-pod", os: "Container", role: "Pod", ip: "10.244.2.5" },
      ]),
      maxUsers: 10,
      difficulty: "advanced",
      duration: 120,
      status: "available",
    },
  ]

  for (const r of ranges) {
    await db.cyberRange.create({ data: r })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const count = await db.cyberRange.count()
  if (count === 0) await seedRanges()

  const ranges = await db.cyberRange.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      sessions: {
        where: { status: { in: ["waiting", "active"] } },
        include: {
          members: {
            select: { userId: true, role: true, user: { select: { id: true, name: true, avatar: true } } },
          },
        },
      },
    },
  })

  return NextResponse.json({
    ranges: ranges.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      topology: JSON.parse(r.topology || "{}"),
      machines: JSON.parse(r.machines || "[]"),
      maxUsers: r.maxUsers,
      difficulty: r.difficulty,
      duration: r.duration,
      status: r.status,
      activeSessions: r.sessions.map((s) => ({
        id: s.id,
        status: s.status,
        memberCount: s.members.length,
        isMember: s.members.some((m) => m.userId === user.id),
      })),
    })),
  })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { rangeId } = body
  if (!rangeId) return NextResponse.json({ error: "rangeId required" }, { status: 400 })

  const range = await db.cyberRange.findUnique({ where: { id: rangeId } })
  if (!range) return NextResponse.json({ error: "Range not found" }, { status: 404 })

  const existing = await db.cyberRangeMember.findFirst({
    where: { userId: user.id, session: { rangeId, status: { in: ["waiting", "active"] } } },
  })
  if (existing) {
    return NextResponse.json({ error: "You already have an active session in this range", sessionId: existing.sessionId }, { status: 400 })
  }

  const session = await db.cyberRangeSession.create({
    data: {
      rangeId,
      leaderId: user.id,
      status: "waiting",
      members: {
        create: { userId: user.id, role: "leader" },
      },
    },
    include: {
      range: true,
      members: { include: { user: { select: { id: true, name: true, avatar: true, title: true } } } },
    },
  })

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      createdAt: session.createdAt,
      range: {
        id: session.range.id,
        name: session.range.name,
        description: session.range.description,
        topology: JSON.parse(session.range.topology || "{}"),
        machines: JSON.parse(session.range.machines || "[]"),
        maxUsers: session.range.maxUsers,
        difficulty: session.range.difficulty,
        duration: session.range.duration,
      },
      members: session.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        avatar: m.user.avatar,
        title: m.user.title,
        role: m.role,
        isMe: m.userId === user.id,
      })),
      isMember: true,
      isLeader: session.leaderId === user.id,
    },
  }, { status: 201 })
}
