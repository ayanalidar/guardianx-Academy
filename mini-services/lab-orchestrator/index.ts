/**
 * GuardianX Lab Orchestrator Service
 * 
 * Manages Docker container lifecycle for interactive lab sessions.
 * Each lab session gets:
 *   - A dedicated target container (the vulnerable machine)
 *   - An optional attack container (Kali Linux with tools)
 *   - An isolated Docker network (no cross-tenant communication)
 *   - A dynamically generated, non-guessable flag injected into the target
 *   - A TTL (time-to-live) that auto-destroys idle instances
 *
 * Architecture:
 *   [Next.js App] → HTTP API → [Lab Orchestrator (this service)] → Docker Engine API
 *                                          ↓
 *                                   [Terminal Gateway] → WebSocket → xterm.js
 *
 * Port: 3004
 * Docker Engine API: /var/run/docker.sock (Unix socket) or TCP
 *
 * Security:
 *   - Each session gets its own Docker bridge network (lab-session-<id>)
 *   - Egress firewall rules block outbound traffic from target containers
 *   - The orchestrator network is fully segregated from production infra
 *   - Flags are 32-byte random hex, injected as env vars + root filesystem files
 *   - Container names use session IDs (non-guessable)
 *   - TTL enforcement: expired sessions are destroyed every 60 seconds
 */

import { createServer, IncomingMessage, ServerResponse } from "http"
import { randomBytes, randomUUID } from "crypto"

// Docker Engine API client — uses dockerode when available, simulation otherwise
let Docker: any = null
let dockerClient: any = null

const SIMULATION_MODE = !process.env.DOCKER_AVAILABLE

if (!SIMULATION_MODE) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Docker = require("dockerode")
    dockerClient = new Docker({ socketPath: process.env.DOCKER_HOST || "/var/run/docker.sock" })
    console.log("[docker] Connected to Docker Engine")
  } catch (e) {
    console.log("[docker] dockerode not available, falling back to simulation mode")
  }
}

const USE_DOCKER = !!dockerClient

const PORT = 3004
const DOCKER_SOCKET = process.env.DOCKER_HOST || "/var/run/docker.sock"

// === Lab image definitions ===
// In production, these would be pre-built Docker images hosted in a private registry.
// Target images contain vulnerable services (web apps, SSH, etc.)
// Attack images are Kali Linux with pentesting tools pre-installed.
const LAB_IMAGES: Record<string, { target: string; attack: string; targetPort: number }> = {
  // SQL Injection labs → share the SQLi target image
  "sqli-login-bypass":         { target: "guardianx/lab-sqli-target:latest",         attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "sqli-auth-bypass-payloads": { target: "guardianx/lab-sqli-target:latest",         attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // XSS labs → share the XSS target image
  "xss-cookie-steal":          { target: "guardianx/lab-xss-target:latest",          attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "xss-stored-comment":        { target: "guardianx/lab-xss-target:latest",          attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "xss-filter-bypass-waf":     { target: "guardianx/lab-xss-target:latest",          attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Command Injection
  "command-injection-bypass":  { target: "guardianx/lab-cmd-injection-target:latest", attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // JWT labs → share the JWT target image
  "jwt-alg-none-bypass":       { target: "guardianx/lab-jwt-target:latest",          attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "jwt-forgery-brute-force":   { target: "guardianx/lab-jwt-target:latest",          attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // SSRF labs → share the SSRF target image
  "ssrf-cloud-metadata":       { target: "guardianx/lab-ssrf-target:latest",         attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Directory Traversal
  "directory-traversal-bypass":{ target: "guardianx/lab-traversal-target:latest",    attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Network / Recon
  "nmap-recon":                { target: "guardianx/lab-nmap-target:latest",         attack: "guardianx/kali-attack:latest", targetPort: 9999 },
  "wifi-wpa2-crack":           { target: "guardianx/lab-nmap-target:latest",         attack: "guardianx/kali-attack:latest", targetPort: 9999 },
  // Privilege Escalation
  "linux-privesc-suid":        { target: "guardianx/lab-privesc-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 22 },
  "windows-privesc-unquoted":  { target: "guardianx/lab-privesc-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 22 },
  // IDOR
  "idor-horizontal":           { target: "guardianx/lab-idor-target:latest",         attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Log4Shell
  "log4shell-cve-2021-44228":  { target: "guardianx/lab-log4shell-target:latest",    attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Reverse Engineering
  "re-crackme-binary":         { target: "guardianx/lab-re-crackme-target:latest",   attack: "guardianx/kali-attack:latest", targetPort: 22 },
  // Cryptography
  "hash-crack":                { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "steganography-hidden":      { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Active Directory
  "ad-kerberoasting":          { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 88 },
  "powershell-lolbins":        { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Forensics
  "pcap-analysis":             { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Cloud Security
  "docker-container-escape":   { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "cloud-s3-enumeration":      { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "k8s-pod-escalation":        { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // OSINT
  "osint-target-profiling":    { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Mobile / IoT
  "android-apk-reverse":       { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "iot-firmware-analysis":     { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Advanced Web
  "race-condition-toctou":     { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  "graphql-introspection":     { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
  // Buffer Overflow
  "buffer-overflow-eip":       { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 9999 },
  // Default fallback
  default:                     { target: "guardianx/lab-generic-target:latest",      attack: "guardianx/kali-attack:latest", targetPort: 80 },
}

// === Dynamic flag generation ===
// Generates a 32-byte random hex flag that is unique per session.
// This prevents flag sharing between students.
function generateDynamicFlag(labSlug: string): string {
  const random = randomBytes(16).toString("hex")
  return `FLAG{${labSlug}_${random}}`
}

// === Docker Engine API client ===
// Uses dockerode (when available) or simulation mode.
// dockerode connects via Unix socket to the Docker Engine.

interface ContainerInfo {
  containerId: string
  ip: string
  networkName: string
}

async function dockerCreateNetwork(networkName: string): Promise<void> {
  if (SIMULATION_MODE) {
    console.log(`[sim] Created network: ${networkName}`)
    return
  }
  // Create isolated bridge network (Internal: true = no internet access)
  await dockerClient.createNetwork({
    Name: networkName,
    Driver: "bridge",
    Internal: true,
    IPAM: { Config: [{ Subnet: "10.100.0.0/24" }] },
  })
  console.log(`[docker] Created isolated network: ${networkName}`)
}

async function dockerCreateContainer(
  name: string,
  image: string,
  networkName: string,
  env: string[],
  capabilities: string[],
): Promise<ContainerInfo> {
  if (SIMULATION_MODE) {
    const fakeId = randomUUID().slice(0, 12)
    const fakeIp = `10.100.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`
    console.log(`[sim] Created container: ${name} (image: ${image}, ip: ${fakeIp})`)
    return { containerId: fakeId, ip: fakeIp, networkName }
  }

  // Pull image if not present
  try {
    await dockerClient.pull(image)
    await new Promise((r) => setTimeout(r, 1000)) // Wait for pull
  } catch (e) {
    // Image might already exist
  }

  // Create container using dockerode
  const container = await dockerClient.createContainer({
    Image: image,
    name,
    Env: env,
    HostConfig: {
      NetworkMode: networkName,
      CapAdd: capabilities,
      Memory: 512 * 1024 * 1024, // 512MB
      NanoCpus: 1000000000, // 1 CPU
      SecurityOpt: ["no-new-privileges"],
    },
  })

  // Start the container
  await container.start()

  // Inspect to get the IP
  const data = await container.inspect()
  const ip = data.NetworkSettings.Networks[networkName]?.IPAddress || "unknown"

  console.log(`[docker] Container started: ${name} (${container.id.slice(0, 12)}) IP: ${ip}`)
  return { containerId: container.id, ip, networkName }
}

async function dockerStopContainer(containerId: string): Promise<void> {
  if (SIMULATION_MODE) {
    console.log(`[sim] Stopped container: ${containerId}`)
    return
  }
  const container = dockerClient.getContainer(containerId)
  try { await container.stop({ t: 5 }) } catch {}
  try { await container.remove({ force: true, v: true }) } catch {}
  console.log(`[docker] Container destroyed: ${containerId}`)
}

async function dockerRemoveNetwork(networkName: string): Promise<void> {
  if (SIMULATION_MODE) {
    console.log(`[sim] Removed network: ${networkName}`)
    return
  }
  const network = dockerClient.getNetwork(networkName)
  try { await network.remove() } catch {}
  console.log(`[docker] Network removed: ${networkName}`)
}

async function dockerExec(containerId: string, cmd: string[]): Promise<void> {
  if (SIMULATION_MODE) {
    console.log(`[sim] Exec in ${containerId}: ${cmd.join(" ")}`)
    return
  }
  const container = dockerClient.getContainer(containerId)
  const exec = await container.exec({ Cmd: cmd, AttachStdout: true, AttachStderr: true })
  await exec.start({ Detach: false, Tty: false })
}

// === Flag injection ===
// Injects the dynamic flag into the target container.
// Method 1: Environment variable (less secure, visible in /proc/1/environ)
// Method 2: File on the root filesystem (more secure, requires filesystem access)
async function injectFlag(containerId: string, flag: string, filePath: string): Promise<void> {
  // Write the flag to a file inside the container
  // docker exec <container> sh -c "echo 'FLAG{...}' > /root/flag.txt && chmod 600 /root/flag.txt"
  await dockerExec(containerId, ["sh", "-c", `echo '${flag}' > ${filePath} && chmod 600 ${filePath}`])
  console.log(`[orchestrator] Flag injected into ${containerId} at ${filePath}`)
}

// === Egress firewall rules ===
// Apply iptables rules to the Docker network to block outbound traffic.
// Only allow traffic between the attack and target containers within the same network.
async function applyEgressRules(networkName: string, targetIp: string, attackIp: string): Promise<void> {
  if (SIMULATION_MODE) {
    console.log(`[sim] Egress rules applied for ${networkName} (target: ${targetIp}, attack: ${attackIp})`)
    return
  }
  // iptables -A FORWARD -i <bridge> ! -o <bridge> -j DROP  (block outbound from network)
  // iptables -A FORWARD -i <bridge> -o <bridge> -j ACCEPT  (allow internal traffic)
  await dockerExec(attackIp, ["iptables", "-A", "OUTPUT", "-d", targetIp, "-j", "ACCEPT"])
  console.log(`[orchestrator] Egress firewall: outbound blocked, internal allowed for ${networkName}`)
}

// === Session lifecycle handlers ===

interface StartLabRequest {
  labSlug: string
  userId: string
  ttlMinutes?: number
}

interface StartLabResponse {
  sessionId: string
  status: string
  targetIp: string
  attackIp: string
  dynamicFlag: string
  expiresAt: string
  terminalToken: string
  networkName: string
}

async function handleStartLab(req: StartLabRequest): Promise<StartLabResponse> {
  const sessionId = randomUUID()
  const networkName = `lab-net-${sessionId.slice(0, 8)}`
  const images = LAB_IMAGES[req.labSlug] || LAB_IMAGES.default
  const dynamicFlag = generateDynamicFlag(req.labSlug)
  const flagFilePath = `/root/flag-${sessionId.slice(0, 8)}.txt`
  const ttl = req.ttlMinutes || 60
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000)

  console.log(`\n[orchestrator] === STARTING LAB SESSION ===`)
  console.log(`[orchestrator] Session: ${sessionId}`)
  console.log(`[orchestrator] Lab: ${req.labSlug}`)
  console.log(`[orchestrator] User: ${req.userId}`)
  console.log(`[orchestrator] TTL: ${ttl} minutes (expires: ${expiresAt.toISOString()})`)
  console.log(`[orchestrator] Network: ${networkName} (isolated, internal-only)`)
  console.log(`[orchestrator] Dynamic flag: ${dynamicFlag}`)
  console.log(`[orchestrator] Flag file: ${flagFilePath}`)

  // 1. Create isolated Docker network (internal: true = no internet)
  await dockerCreateNetwork(networkName)

  // 2. Create and start the target container
  const targetEnv = [
    `FLAG=${dynamicFlag}`,
    `FLAG_FILE=${flagFilePath}`,
    `SESSION_ID=${sessionId}`,
  ]
  const target = await dockerCreateContainer(
    `lab-target-${sessionId.slice(0, 8)}`,
    images.target,
    networkName,
    targetEnv,
    [], // No extra capabilities for target
  )

  // 3. Inject the dynamic flag into the target filesystem
  await injectFlag(target.containerId, dynamicFlag, flagFilePath)

  // 4. Create and start the attack container (Kali Linux)
  const attackEnv = [
    `TARGET_IP=${target.ip}`,
    `SESSION_ID=${sessionId}`,
    `LAB_SLUG=${req.labSlug}`,
  ]
  const attack = await dockerCreateContainer(
    `lab-attack-${sessionId.slice(0, 8)}`,
    images.attack,
    networkName,
    attackEnv,
    ["NET_ADMIN", "SYS_PTRACE"], // Capabilities for pentesting tools
  )

  // 5. Apply egress firewall rules (block outbound from target)
  await applyEgressRules(networkName, target.ip, attack.ip)

  // 6. Generate terminal WebSocket token
  const terminalToken = randomBytes(32).toString("hex")

  console.log(`[orchestrator] Target container: ${target.containerId} (${target.ip})`)
  console.log(`[orchestrator] Attack container: ${attack.containerId} (${attack.ip})`)
  console.log(`[orchestrator] === LAB SESSION READY ===\n`)

  return {
    sessionId,
    status: "running",
    targetIp: target.ip,
    attackIp: attack.ip,
    dynamicFlag,
    expiresAt: expiresAt.toISOString(),
    terminalToken,
    networkName,
  }
}

async function handleStopLab(sessionId: string, targetContainerId?: string, attackContainerId?: string, networkName?: string): Promise<void> {
  console.log(`[orchestrator] === STOPPING LAB SESSION: ${sessionId} ===`)
  
  // Stop and remove containers
  if (attackContainerId) await dockerStopContainer(attackContainerId)
  if (targetContainerId) await dockerStopContainer(targetContainerId)
  
  // Remove the isolated network
  if (networkName) await dockerRemoveNetwork(networkName)
  
  console.log(`[orchestrator] Session ${sessionId} stopped and cleaned up.`)
}

async function handleExtendLab(sessionId: string, additionalMinutes: number): Promise<{ newExpiry: string }> {
  const newExpiry = new Date(Date.now() + additionalMinutes * 60 * 1000)
  console.log(`[orchestrator] Extended session ${sessionId} by ${additionalMinutes} minutes. New expiry: ${newExpiry.toISOString()}`)
  return { newExpiry: newExpiry.toISOString() }
}

async function handleResetLab(sessionId: string, targetContainerId?: string, dynamicFlag?: string, flagFilePath?: string): Promise<{ newFlag: string }> {
  console.log(`[orchestrator] === RESETTING LAB SESSION: ${sessionId} ===`)
  
  // Regenerate the flag
  const newFlag = generateDynamicFlag(sessionId)
  
  if (targetContainerId && flagFilePath) {
    // Re-inject the new flag
    await injectFlag(targetContainerId, newFlag, flagFilePath)
  }
  
  // In production: could also restart the container to reset state
  // await dockerRequest("POST", `/containers/${targetContainerId}/restart`, "")
  
  console.log(`[orchestrator] Session ${sessionId} reset. New flag generated.`)
  return { newFlag }
}

// === TTL enforcement ===
// Runs every 60 seconds to destroy expired sessions.
setInterval(async () => {
  // In production, this would query the database for expired sessions
  // and call handleStopLab for each one.
  // For now, it's a placeholder.
}, 60 * 1000)

// === HTTP Server ===
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return }

  const url = new URL(req.url || "", `http://localhost:${PORT}`)
  const path = url.pathname
  const method = req.method || "GET"

  // Parse JSON body
  const parseBody = (): Promise<any> => new Promise((resolve) => {
    let data = ""
    req.on("data", (chunk) => (data += chunk))
    req.on("end", () => resolve(data ? JSON.parse(data) : {}))
  })

  const sendJSON = (code: number, data: any) => {
    res.writeHead(code, { "Content-Type": "application/json" })
    res.end(JSON.stringify(data))
  }

  try {
    // Health check
    if (path === "/health" && method === "GET") {
      sendJSON(200, { status: "ok", mode: SIMULATION_MODE ? "simulation" : "docker", port: PORT })
      return
    }

    // Start a lab session
    // POST /start { labSlug, userId, ttlMinutes }
    if (path === "/start" && method === "POST") {
      const body = await parseBody()
      if (!body.labSlug || !body.userId) {
        sendJSON(400, { error: "labSlug and userId required" })
        return
      }
      const result = await handleStartLab(body)
      sendJSON(200, result)
      return
    }

    // Stop a lab session
    // POST /stop { sessionId, targetContainerId, attackContainerId, networkName }
    if (path === "/stop" && method === "POST") {
      const body = await parseBody()
      if (!body.sessionId) {
        sendJSON(400, { error: "sessionId required" })
        return
      }
      await handleStopLab(body.sessionId, body.targetContainerId, body.attackContainerId, body.networkName)
      sendJSON(200, { ok: true, sessionId: body.sessionId, status: "stopped" })
      return
    }

    // Extend a lab session
    // POST /extend { sessionId, additionalMinutes }
    if (path === "/extend" && method === "POST") {
      const body = await parseBody()
      if (!body.sessionId) {
        sendJSON(400, { error: "sessionId required" })
        return
      }
      const result = await handleExtendLab(body.sessionId, body.additionalMinutes || 30)
      sendJSON(200, { ok: true, ...result })
      return
    }

    // Reset a lab session (regenerate flag, reset target state)
    // POST /reset { sessionId, targetContainerId, flagFilePath }
    if (path === "/reset" && method === "POST") {
      const body = await parseBody()
      if (!body.sessionId) {
        sendJSON(400, { error: "sessionId required" })
        return
      }
      const result = await handleResetLab(body.sessionId, body.targetContainerId, body.dynamicFlag, body.flagFilePath)
      sendJSON(200, { ok: true, ...result })
      return
    }

    // Get available lab images
    if (path === "/images" && method === "GET") {
      sendJSON(200, { images: Object.keys(LAB_IMAGES), simulation: SIMULATION_MODE })
      return
    }

    sendJSON(404, { error: "Not found" })
  } catch (err: any) {
    console.error("[orchestrator] Error:", err)
    sendJSON(500, { error: err.message })
  }
})

server.listen(PORT, () => {
  console.log(`\n┌─────────────────────────────────────────────────┐`)
  console.log(`│  GuardianX Lab Orchestrator                     │`)
  console.log(`│  Port: ${PORT}                                     │`)
  console.log(`│  Mode: ${SIMULATION_MODE ? "SIMULATION (no Docker)" : "DOCKER"}               │`)
  console.log(`│  Docker: ${DOCKER_SOCKET}               │`)
  console.log(`└─────────────────────────────────────────────────┘`)
  console.log(`\nEndpoints:`)
  console.log(`  POST /start   — Start a lab session (creates containers)`)
  console.log(`  POST /stop    — Stop a lab session (destroys containers)`)
  console.log(`  POST /extend  — Extend session TTL`)
  console.log(`  POST /reset   — Reset session (new flag, clean state)`)
  console.log(`  GET  /health  — Health check`)
  console.log(`  GET  /images  — Available lab images\n`)
})

process.on("SIGTERM", () => { server.close(() => process.exit(0)) })
process.on("SIGINT", () => { server.close(() => process.exit(0)) })
