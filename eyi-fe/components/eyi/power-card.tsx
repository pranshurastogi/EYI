"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Megaphone, Network, Sparkles, Wrench, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENSTextRecordsCompact } from "@/components/ens/ens-text-records-display";
import { usePlatformTextRecord } from "@/hooks/use-ens-text-records";

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
  className,
  uid,
  updatedAt,
  ctaText,
  ensName,
}: {
  type: Type;
  state?: State;
  className?: string;
  uid?: string;
  updatedAt?: string;
  ctaText?: string;
  ensName?: string;
}) {
  const c = copy[type];
  const isVerified = state === "verified";
  const [showVerify, setShowVerify] = useState(false);

  const platform =
    type === "build" ? "github" : type === "voice" ? "twitter" : type === "web" ? "farcaster" : undefined;
  const { hasRecord: hasENSRecord } = usePlatformTextRecord(ensName, platform);

  // Self config (seed only; SDK v1.0.15)
  const CONTRACT = "0xE85B8De9B56d8ce4fCdF0cd7D5B083F7d92b4459".toLowerCase();
  const SCOPE_SEED = "self-ens";

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className={cn("bg-card/70 border-border/60 group relative overflow-hidden transition-all duration-300", className)}>
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

        <CardContent className="flex flex-col gap-4 relative z-10">
          {type === "spark" ? (
            showVerify ? (
              <VerifyWithSelf
                active={true}              // build/show QR only after click
                contract={CONTRACT}
                scopeSeed={SCOPE_SEED}
              />
            ) : (
              <Button
                size="sm"
                onClick={() => setShowVerify(true)}   // clicking toggles QR
                className="gap-2 transition-all duration-200"
              >
                {ctaText ?? c.cta}
              </Button>
            )
          ) : (
            <Button size="sm" className="gap-2 transition-all duration-200">
              {ctaText ?? c.cta}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
