"use client"

import type React from "react"
import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Megaphone, Network, Sparkles, Wrench, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { ENSTextRecordsCompact } from "@/components/ens/ens-text-records-display"
import { usePlatformTextRecord } from "@/hooks/use-ens-text-records"

type Type = "spark" | "build" | "voice" | "web"
type State = "idle" | "verifying" | "verified" | "expired"

const copy: Record<Type, { title: string; blurb: string; cta: string; icon: React.ReactNode; tooltip: string }> = {
  spark: {
    title: "Spark (Self)",
    blurb: "Prove personhood privately. Stores no PII; issues blockchain proof.",
    cta: "Verify with Self",
    icon: <Sparkles className="size-5 text-(--eyi-mint)" aria-hidden />,
    tooltip: "Personhood check (private) → blockchain attestation",
  },
  build: {
    title: "Build (GitHub)",
    blurb: "Prove your builder presence.",
    cta: "Connect GitHub",
    icon: <Wrench className="size-5 text-(--eyi-primary)" aria-hidden />,
    tooltip: "Prove your GitHub handle & activity",
  },
  voice: {
    title: "Voice (X)",
    blurb: "Prove you control this handle.",
    cta: "Connect X",
    icon: <Megaphone className="size-5 text-(--eyi-primary)" aria-hidden />,
    tooltip: "Prove control of your X handle",
  },
  web: {
    title: "Web (Farcaster)",
    blurb: "Link your Farcaster fid to this address.",
    cta: "Connect Farcaster",
    icon: <Network className="size-5 text-(--eyi-primary)" aria-hidden />,
    tooltip: "Link your Farcaster fid to this address",
  },
}

export function PowerCard({
  type,
  state = "idle",
  onAction,
  className,
  uid,
  updatedAt,
  ctaText,
  ensName,
}: {
  type: Type
  state?: State
  onAction?: () => void
  className?: string
  uid?: string
  updatedAt?: string
  ctaText?: string
  ensName?: string
}) {
  const c = copy[type]
  const isVerified = state === "verified"
  const isVerifying = state === "verifying"
  
  // Get ENS text record for this platform
  const platform = type === 'build' ? 'github' : type === 'voice' ? 'twitter' : type === 'web' ? 'farcaster' : undefined
  const { hasRecord: hasENSRecord } = usePlatformTextRecord(ensName, platform)
  
  
  // Add some visual feedback based on state
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "bg-card/70 border-border/60 group relative overflow-hidden transition-all duration-300",
        isVerified && "border-var(--eyi-mint)/40 shadow-lg shadow-var(--eyi-mint)/10",
        isVerifying && "border-var(--eyi-primary)/40",
        className
      )}>
        {/* Animated background gradient for verified cards */}
        {isVerified && (
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              background: "linear-gradient(45deg, var(--eyi-mint), var(--eyi-primary))",
            }}
            animate={{
              background: [
                "linear-gradient(45deg, var(--eyi-mint), var(--eyi-primary))",
                "linear-gradient(225deg, var(--eyi-primary), var(--eyi-mint))",
                "linear-gradient(45deg, var(--eyi-mint), var(--eyi-primary))",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        {/* Subtle glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          isVerified && "bg-gradient-to-br from-var(--eyi-mint)/5 to-var(--eyi-primary)/5"
        )} />

        <CardHeader className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isVerified ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{
                duration: 2,
                repeat: isVerified ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {c.icon}
            </motion.div>
            <CardTitle className="text-base flex items-center gap-1">
              {c.title}
              {isVerified && (
                <CheckCircle2 className="size-4 text-(--eyi-mint)" aria-label="Verified" />
              )}
              {hasENSRecord && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="flex items-center gap-1"
                >
                  <Star className="size-3 text-var(--eyi-mint)" />
                  <span className="text-xs text-var(--eyi-mint) font-medium">ENS</span>
                </motion.div>
              )}
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{c.blurb}</p>
        </CardHeader>
        
        <CardContent className="flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground">
              {state === "verified" && uid ? (
                <motion.span 
                  className="text-var(--eyi-mint) font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ✓ Verified • {uid}
                  {updatedAt ? ` • ${updatedAt}` : ""}
                </motion.span>
              ) : state === "expired" ? (
                <span className="text-var(--destructive)">⚠ Expired — renew to keep your power active</span>
              ) : state === "verifying" ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Verifying…
                </motion.span>
              ) : (
                <span>Not started</span>
              )}
            </div>
            
            {/* Show ENS text records if available */}
            {ensName && platform && (
              <ENSTextRecordsCompact 
                ensName={ensName} 
                platform={platform}
                className="text-xs" 
              />
            )}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="sm" 
              onClick={onAction} 
              disabled={state === "verifying"} 
              className={cn(
                "gap-2 transition-all duration-200",
                isVerified && "bg-var(--eyi-mint) hover:bg-var(--eyi-mint)/90 text-white",
                isVerifying && "bg-var(--eyi-primary) hover:bg-var(--eyi-primary)/90"
              )}
              aria-label={ctaText ?? c.cta}
            >
              {state === "verifying" && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {ctaText ?? c.cta}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
