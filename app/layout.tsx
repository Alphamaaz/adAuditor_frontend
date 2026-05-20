import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ImpersonationBanner } from "@/components/impersonation-banner";
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
  title: "Ad Adviser",
  description: "AI-powered ad account audits for Meta, Google Ads, and TikTok Ads.",
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
        <Providers>
          <ImpersonationBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
