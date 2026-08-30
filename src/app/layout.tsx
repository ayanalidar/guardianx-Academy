import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GuardianX — Cyber Security LMS & Labs",
  description:
    "Master cyber security certifications (CEH, CCNA, CCNP, RHCSA, WAPT, CISSP, CyberArk PAM) with GuardianX LMS. Study materials, live screen-sharing sessions, and hands-on practice labs.",
  keywords: [
    "cyber security",
    "CEH",
    "CCNA",
    "CISSP",
    "RHCSA",
    "WAPT",
    "CyberArk",
    "PAM",
    "LMS",
    "penetration testing",
    "ethical hacking",
  ],
  authors: [{ name: "GuardianX" }],
  manifest: "/manifest.json",
  applicationName: "GuardianX Academy",
  appleWebApp: {
    capable: true,
    title: "GuardianX",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23052e1a'/><path d='M50 12 L80 24 V52 C80 70 66 84 50 90 C34 84 20 70 20 52 V24 Z' fill='none' stroke='%2310b981' stroke-width='5'/><path d='M38 50 L46 58 L64 40' fill='none' stroke='%2310b981' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/></svg>",
      },
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/guardianx-logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/guardianx-logo.png", sizes: "180x180", type: "image/png" },
      { url: "/guardianx-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/guardianx-logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/guardianx-logo.png"],
  },
  openGraph: {
    title: "GuardianX — Cyber Security LMS",
    description: "Certification courses, live sessions, and hands-on cyber security labs.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { color: "#7c3aed" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="GuardianX Academy" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GuardianX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-icon" href="/guardianx-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/guardianx-logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/guardianx-logo.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/guardianx-logo.png" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="mask-icon" href="/logo.svg" color="#7c3aed" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
