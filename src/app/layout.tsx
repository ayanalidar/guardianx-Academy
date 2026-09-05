import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers/providers";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-register";

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
  metadataBase: new URL("https://academy.guardianx.cloud"),
  title: {
    default: "GuardianX Academy — Cyber Security Training Operating System",
    template: "%s · GuardianX Academy",
  },
  description:
    "Master cybersecurity by actually breaking things. Real cyber range, hands-on labs, certification tracks (CEH, CCNA, CCNP, RHCSA, WAPT, CISSP, CYBERARK-IAM & PAM), CTF arena, and career paths. Learn. Break. Defend. Prove.",
  keywords: [
    "cybersecurity",
    "ethical hacking",
    "cyber range",
    "CTF",
    "CEH",
    "CISSP",
    "CCNA",
    "CCNP",
    "RHCSA",
    "WAPT",
    "CYBERARK",
    "IAM",
    "PAM",
    "OSCP",
    "penetration testing",
    "SOC analyst",
    "security training",
    "hands-on labs",
    "GuardianX Academy",
  ],
  authors: [{ name: "GuardianX" }],
  creator: "GuardianX",
  publisher: "GuardianX Academy",
  applicationName: "GuardianX Academy",
  category: "Education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GuardianX Academy — Cyber Security Training Operating System",
    description:
      "Master cybersecurity by actually breaking things. Real cyber range, hands-on labs, certification tracks, CTF arena, and career paths. Learn. Break. Defend. Prove.",
    url: "https://academy.guardianx.cloud",
    siteName: "GuardianX Academy",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "GuardianX Academy — Learn. Break. Defend. Prove.",
        type: "image/png",
      },
      {
        url: "/guardianx-logo-v2.png",
        width: 512,
        height: 512,
        alt: "GuardianX Academy logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@guardianx",
    creator: "@guardianx",
    title: "GuardianX Academy — Cyber Security Training Operating System",
    description:
      "Master cybersecurity by actually breaking things. Real cyber range, hands-on labs, certification tracks, CTF arena, and career paths. Learn. Break. Defend. Prove.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: "GuardianX",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "guardianx-academy-google-site-verification",
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
