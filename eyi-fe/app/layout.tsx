import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
import { Suspense } from "react"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "EYI - No more look-alikes. Only you.",
  description: "EYI: Empower your Identity. Connect your ENS to Self, GitHub, X, and Farcaster. Get an EYI badge for safer, smarter web3 interactions."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans">
        <Providers>
          <Suspense>
            {children}
            <Analytics />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
