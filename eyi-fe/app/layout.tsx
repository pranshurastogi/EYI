import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "EYI",
  description: "EYI: Empower your Identity"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans">
        <Suspense>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
