import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdAdvisor — Find Wasted Ad Spend in 3 Minutes",
  description:
    "AI audits your Google, Meta & TikTok accounts against 150+ rules and shows exactly where budget is wasted. Free audit, no credit card.",
  keywords: [
    "ad account audit tool",
    "Google Ads wasted spend",
    "PPC audit software",
  ],
  openGraph: {
    title: "Your ad account is wasting money. We'll show you exactly where.",
    description:
      "AdAdvisor runs 150+ audit rules across Google, Meta & TikTok in under 3 minutes, then hands you a prioritised fix list with every leak in dollars. Free to try.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicons/favicon.ico" },
    ],
    apple: { url: "/favicons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Set the saved theme before first paint to avoid a flash of the
            wrong palette. Runs synchronously, ahead of hydration. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>
          <ImpersonationBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
