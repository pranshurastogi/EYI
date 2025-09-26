"use client"

import type { ReactNode } from "react"
import { PrivyProvider } from "@privy-io/react-auth"

export default function Providers({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string | undefined

  return (
    <PrivyProvider
      appId={appId || ""}
      config={{
        loginMethods: ["wallet", "farcaster", "twitter", "github"],
        // Keep UI consistent; we rely on our own buttons
        appearance: { theme: "light" },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
