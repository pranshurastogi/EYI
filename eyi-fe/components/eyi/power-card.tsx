"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Megaphone, Network, Sparkles, Wrench, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENSTextRecordsCompact } from "@/components/ens/ens-text-records-display";
import { usePlatformTextRecord } from "@/hooks/use-ens-text-records";
import { useEYISegments } from "@/hooks/use-eyi-segments";

import VerifyWithSelf from "@/components/self/verify-with-self";

type Type = "spark" | "build" | "voice" | "web";
type State = "idle" | "verifying" | "verified" | "expired";

const copy: Record<
  Type,
  { title: string; blurb: string; cta: string; icon: React.ReactNode; tooltip: string }
> = {
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
};

export function PowerCard({
  type,
  state = "idle",
  onAction,
  className,
  uid,
  updatedAt,
  ctaText,
  ensName,
  onVerificationSuccess,
}: {
  type: Type;
  state?: State;
  onAction?: () => void;
  className?: string;
  uid?: string;
  updatedAt?: string;
  ctaText?: string;
  ensName?: string;
  onVerificationSuccess?: (type: Type, userId: string) => void;
}) {
  const c = copy[type];
  const isVerified = state === "verified";
  const isVerifying = state === "verifying";
  const [showVerify, setShowVerify] = useState(false);

  const platform =
    type === "build" ? "github" : type === "voice" ? "twitter" : type === "web" ? "farcaster" : undefined;
  const { hasRecord: hasENSRecord } = usePlatformTextRecord(ensName, platform);
  
  // EYI segments management
  const { verifySegment, startVerification } = useEYISegments();

  // Prevent auto-closing by maintaining state properly
  const handleVerificationSuccess = (userId: string) => {
    // Update the power card state to verified
    setShowVerify(false);
    // Update EYI ring segment
    verifySegment("spark", userId);
    // Call parent callback
    onVerificationSuccess?.("spark", userId);
    console.log("Self verification successful for:", userId);
  };

  const handleStartVerification = () => {
    startVerification("spark");
    setShowVerify(true);
  };

  // Self config (seed only; SDK v1.0.15)
  const CONTRACT = "0xE85B8De9B56d8ce4fCdF0cd7D5B083F7d92b4459".toLowerCase();
  const SCOPE_SEED = "self-ens";

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className={cn("eyi-card group relative overflow-hidden", className)}>
        <CardHeader className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            {c.icon}
            <CardTitle className="text-base flex items-center gap-1">
              {c.title}
              {isVerified && <CheckCircle2 className="size-4 text-(--eyi-mint)" aria-label="Verified" />}
              {hasENSRecord && (
                <div className="flex items-center gap-1">
                  <Star className="size-3 text-var(--eyi-mint)" />
                  <span className="text-xs text-var(--eyi-mint) font-medium">ENS</span>
                </div>
              )}
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{c.blurb}</p>
        </CardHeader>
        
        <CardContent className="flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {state === "verified" && uid ? (
                <motion.span 
                  className="eyi-status-verified"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  ✓ Verified • {uid}
                  {updatedAt ? ` • ${updatedAt}` : ""}
                </motion.span>
              ) : state === "expired" ? (
                <span className="eyi-status-idle">⚠ Expired — renew to keep your power active</span>
              ) : state === "verifying" ? (
                <motion.span
                  className="eyi-status-verifying"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Verifying…
                </motion.span>
              ) : (
                <span className="eyi-status-idle">Not started</span>
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
            {type === "spark" ? (
              showVerify ? (
                <VerifyWithSelf
                  active={true}
                  contract={CONTRACT}
                  scopeSeed={SCOPE_SEED}
                  onVerificationSuccess={handleVerificationSuccess}
                  className="w-full"
                />
              ) : (
                <Button
                  size="sm"
                  onClick={handleStartVerification}
                  className="gap-2 transition-all duration-200 eyi-button-glow"
                >
                  {ctaText ?? c.cta}
                </Button>
              )
            ) : (
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
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
