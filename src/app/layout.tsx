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
      { url: "/guardianx-logo-v2.png", type: "image/png", sizes: "32x32" },
      { url: "/guardianx-logo-v2.png", type: "image/png", sizes: "192x192" },
      { url: "/guardianx-logo-v2.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/guardianx-logo-v2.png", sizes: "180x180", type: "image/png" },
      { url: "/guardianx-logo-v2.png", sizes: "192x192", type: "image/png" },
      { url: "/guardianx-logo-v2.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/guardianx-logo-v2.png"],
    other: [
      { rel: "mask-icon", url: "/guardianx-logo-v2.png", color: "#7c3aed" },
    ],
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
        <link rel="icon" type="image/png" sizes="32x32" href="/guardianx-logo-v2.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/guardianx-logo-v2.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/guardianx-logo-v2.png" />
        <link rel="apple-touch-icon" href="/guardianx-logo-v2.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/guardianx-logo-v2.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/guardianx-logo-v2.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/guardianx-logo-v2.png" />
        <link rel="shortcut icon" href="/guardianx-logo-v2.png" />
        <link rel="mask-icon" href="/guardianx-logo-v2.png" color="#7c3aed" />
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
