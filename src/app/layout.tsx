import type { Metadata } from "next";
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
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23052e1a'/><path d='M50 12 L80 24 V52 C80 70 66 84 50 90 C34 84 20 70 20 52 V24 Z' fill='none' stroke='%2310b981' stroke-width='5'/><path d='M38 50 L46 58 L64 40' fill='none' stroke='%2310b981' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
  openGraph: {
    title: "GuardianX — Cyber Security LMS",
    description: "Certification courses, live sessions, and hands-on cyber security labs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
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
