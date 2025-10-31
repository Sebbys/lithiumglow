import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import SessionServerWrapper from "@/components/SessionServerWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitBite - Healthy Meals with Tracked Macros",
  description: "Order healthy meals with detailed macro tracking",
  keywords: ["healthy meals", "macro tracking", "fitness food", "nutrition", "meal prep"],
  authors: [{ name: "FitBite" }],
  openGraph: {
    title: "FitBite - Healthy Meals with Tracked Macros",
    description: "Order healthy meals with detailed macro tracking",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* React 19: Native metadata support */}
      <head>
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <SessionServerWrapper>{children}</SessionServerWrapper>
        </Suspense>
      </body>
    </html>
  );
}
