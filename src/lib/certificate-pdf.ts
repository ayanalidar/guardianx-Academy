"use client"

import { api } from "@/lib/api"

// Opens a print-optimized certificate in a new window and triggers the browser's
// "Save as PDF" print dialog. Produces a vector PDF with no server-side rendering.
export async function downloadCertificatePDF(certificateId: string) {
  try {
    const data = await api<{ certificate: any }>(`/api/certificates/${certificateId}/pdf`)
    const cert = data.certificate
    if (!cert) throw new Error("Certificate not found")

    const html = buildCertificateHTML(cert)
    const w = window.open("", "_blank", "width=1100,height=850")
    if (!w) {
      alert("Please allow pop-ups to download your certificate.")
      return
    }
    w.document.write(html)
    w.document.close()
    // wait for fonts/images to load, then trigger print
    w.onload = () => {
      setTimeout(() => {
        w.focus()
        w.print()
      }, 500)
    }
  } catch (e: any) {
    console.error("[cert-pdf]", e)
    alert("Failed to generate certificate PDF: " + e.message)
  }
}

function buildCertificateHTML(cert: any): string {
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })
  const colorMap: Record<string, { primary: string; light: string; dark: string }> = {
    emerald: { primary: "#10b981", light: "#064e3b", dark: "#022c22" },
    cyan: { primary: "#06b6d4", light: "#164e63", dark: "#083344" },
    teal: { primary: "#14b8a6", light: "#134e4a", dark: "#042f2e" },
    red: { primary: "#ef4444", light: "#7f1d1d", dark: "#450a0a" },
    violet: { primary: "#8b5cf6", light: "#4c1d95", dark: "#2e1065" },
    amber: { primary: "#f59e0b", light: "#78350f", dark: "#451a03" },
    orange: { primary: "#f97316", light: "#7c2d12", dark: "#431407" },
  }
  const c = colorMap[cert.course.color] ?? colorMap.emerald

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GuardianX Certificate — ${escapeHtml(cert.user.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: landscape; margin: 0; }
  html, body {
    width: 100%; height: 100%;
    font-family: 'Inter', -apple-system, sans-serif;
    background: #0a0a0a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cert {
    width: 1100px; height: 850px;
    margin: 0 auto;
    position: relative;
    background:
      radial-gradient(ellipse at top, ${c.light}33 0%, transparent 60%),
      radial-gradient(ellipse at bottom right, ${c.light}22 0%, transparent 50%),
      linear-gradient(135deg, #0a0f0d 0%, #0d1b16 50%, #0a0f0d 100%);
    color: #e8f5ee;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
  }
  /* Grid background */
  .cert::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, ${c.primary}11 1px, transparent 1px),
      linear-gradient(to bottom, ${c.primary}11 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.5;
    pointer-events: none;
  }
  /* Decorative border */
  .cert::after {
    content: '';
    position: absolute;
    top: 24px; left: 24px; right: 24px; bottom: 24px;
    border: 2px solid ${c.primary}44;
    border-radius: 12px;
    pointer-events: none;
  }
  .border-inner {
    position: absolute;
    top: 32px; left: 32px; right: 32px; bottom: 32px;
    border: 1px solid ${c.primary}22;
    border-radius: 8px;
    pointer-events: none;
  }
  /* Corner decorations */
  .corner {
    position: absolute;
    width: 60px; height: 60px;
    border-color: ${c.primary};
  }
  .corner.tl { top: 24px; left: 24px; border-top: 3px solid; border-left: 3px solid; border-radius: 12px 0 0 0; }
  .corner.tr { top: 24px; right: 24px; border-top: 3px solid; border-right: 3px solid; border-radius: 0 12px 0 0; }
  .corner.bl { bottom: 24px; left: 24px; border-bottom: 3px solid; border-left: 3px solid; border-radius: 0 0 0 12px; }
  .corner.br { bottom: 24px; right: 24px; border-bottom: 3px solid; border-right: 3px solid; border-radius: 0 0 12px 0; }

  .header {
    text-align: center;
    margin-bottom: 8px;
    position: relative;
    z-index: 2;
  }
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .logo-shield {
    width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-text {
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.02em;
    color: #e8f5ee;
  }
  .logo-text span { color: ${c.primary}; }
  .logo-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.3em;
    color: #6b7d75; margin-top: 2px;
  }
  .cert-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.4em;
    color: ${c.primary};
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .cert-title {
    font-size: 42px; font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #e8f5ee, ${c.primary});
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  .cert-subtitle {
    font-size: 14px; color: #8a9d94;
    margin-bottom: 32px;
  }

  .body {
    text-align: center;
    position: relative;
    z-index: 2;
    width: 100%;
  }
  .presented-to {
    font-size: 12px; color: #6b7d75;
    text-transform: uppercase; letter-spacing: 0.2em;
    margin-bottom: 8px;
  }
  .student-name {
    font-size: 36px; font-weight: 700;
    color: #e8f5ee;
    margin-bottom: 24px;
    letter-spacing: -0.01em;
  }
  .student-name::after {
    content: '';
    display: block;
    width: 200px; height: 2px;
    background: linear-gradient(90deg, transparent, ${c.primary}, transparent);
    margin: 12px auto 0;
  }
  .course-label {
    font-size: 12px; color: #6b7d75;
    text-transform: uppercase; letter-spacing: 0.2em;
    margin-bottom: 8px;
  }
  .course-name {
    font-size: 22px; font-weight: 600;
    color: ${c.primary};
    margin-bottom: 4px;
  }
  .course-meta {
    font-size: 13px; color: #8a9d94;
    margin-bottom: 32px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    max-width: 700px;
    margin-top: 20px;
    position: relative;
    z-index: 2;
  }
  .sig-block {
    text-align: center;
    min-width: 200px;
  }
  .sig-line {
    width: 100%; height: 1px;
    background: ${c.primary}66;
    margin-bottom: 8px;
  }
  .sig-label {
    font-size: 10px; color: #6b7d75;
    text-transform: uppercase; letter-spacing: 0.15em;
  }
  .sig-name {
    font-size: 14px; font-weight: 600;
    color: #e8f5ee; margin-bottom: 2px;
  }
  .sig-title {
    font-size: 10px; color: #8a9d94;
  }

  .cert-id-block {
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
  }
  .cert-id-label {
    font-size: 9px; color: #6b7d75;
    text-transform: uppercase; letter-spacing: 0.2em;
    margin-bottom: 4px;
  }
  .cert-id {
    font-size: 12px; color: ${c.primary};
    font-weight: 500;
  }
  .cert-date {
    font-size: 11px; color: #8a9d94;
    margin-top: 8px;
  }
  .cert-score {
    font-size: 11px; color: #8a9d94;
  }

  .badge {
    position: absolute;
    top: 80px; right: 80px;
    width: 90px; height: 90px;
    border-radius: 50%;
    border: 2px solid ${c.primary}44;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle, ${c.primary}22, transparent);
    z-index: 2;
  }
  .badge-inner {
    width: 70px; height: 70px;
    border-radius: 50%;
    border: 1px solid ${c.primary}33;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: ${c.primary};
  }
  .badge-check {
    font-size: 24px; line-height: 1;
  }
  .badge-text {
    font-size: 7px; font-weight: 700;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }
</style>
</head>
<body>
<div class="cert">
  <div class="border-inner"></div>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>

  <div class="badge">
    <div class="badge-inner">
      <div class="badge-check">✓</div>
      <div class="badge-text">VERIFIED</div>
    </div>
  </div>

  <div class="header">
    <div class="logo">
      <div class="logo-shield">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
          <path d="M50 8 L84 22 V52 C84 72 68 88 50 94 C32 88 16 72 16 52 V22 Z" stroke="${c.primary}" stroke-width="4" fill="none"/>
          <path d="M36 50 L45 59 L66 38" stroke="${c.primary}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <div>
        <div class="logo-text">Guardian<span>X</span></div>
        <div class="logo-sub">SECURE · LEARN · DEFEND</div>
      </div>
    </div>
    <div class="cert-label">Certificate of Completion</div>
    <div class="cert-title">This is to certify that</div>
  </div>

  <div class="body">
    <div class="student-name">${escapeHtml(cert.user.name)}</div>
    <div class="course-label">has successfully completed</div>
    <div class="course-name">${escapeHtml(cert.course.title)}</div>
    <div class="course-meta">${escapeHtml(cert.course.certBody || "GuardianX")} · ${escapeHtml(cert.course.category)} · ${escapeHtml(cert.course.level)} Level</div>
  </div>

  <div class="footer">
    <div class="sig-block">
      <div class="sig-name">${escapeHtml(cert.course.instructor.name)}</div>
      <div class="sig-title">${escapeHtml(cert.course.instructor.title || "Instructor")}</div>
      <div class="sig-line" style="margin-top:12px"></div>
      <div class="sig-label">Instructor</div>
    </div>
    <div class="cert-id-block">
      <div class="cert-id-label">Certificate ID</div>
      <div class="cert-id">${escapeHtml(cert.certificateId)}</div>
      <div class="cert-date">Issued ${issuedDate}</div>
      <div class="cert-score">Score: ${cert.score}%</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">GuardianX</div>
      <div class="sig-title">Cyber Security Academy</div>
      <div class="sig-line" style="margin-top:12px"></div>
      <div class="sig-label">Platform</div>
    </div>
  </div>
</div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
