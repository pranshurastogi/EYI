"use client"

import { Button } from "@/components/ui/button"
import { EYIRing } from "@/components/eyi/eyi-ring"
import { PowerCard } from "@/components/eyi/power-card"
import { StatusPill } from "@/components/eyi/status-pill"
import { MainTagline, TaglineCarousel, AnimatedTagline } from "@/components/eyi/tagline-carousel"
import { ENSProfile } from "@/components/ens/ens-profile"
import { ENSRegistrationPopup } from "@/components/ens/ens-registration-popup"
import { ENSStatusIndicator } from "@/components/ens/ens-status-indicator"
import { HowItWorksSection } from "@/components/how-it-works/how-it-works-section"
import { useENSIntegration } from "@/hooks/use-ens-integration"
import { useSocialVerification } from "@/hooks/use-social-verification"
import { useEYISegments } from "@/hooks/use-eyi-segments"
import { ArrowRight, Sparkles, LogOut } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { usePrivy, useWallets, useLogout } from "@privy-io/react-auth"

export default function HomePage() {
  const { user, authenticated, ready, login, connectWallet, linkWallet, linkGithub, linkTwitter, linkFarcaster, unlinkGithub, unlinkTwitter, unlinkFarcaster } = usePrivy()
  const { wallets } = useWallets()
  const { logout } = useLogout({
    onSuccess: () => {
      // No-op; UI will re-render based on auth state
    }
  })

  const buildLinked = !!user?.github?.username
  const buildHandle = user?.github?.username ? `@${user.github.username}` : undefined

  const voiceLinked = !!user?.twitter?.username
  const voiceHandle = user?.twitter?.username ? `@${user.twitter.username}` : undefined

  const webLinked = !!user?.farcaster?.username
  const webHandle = user?.farcaster?.username ? `@${user.farcaster.username}` : undefined

  const primaryAddress =
    wallets?.[0]?.address ||
    user?.wallet?.address ||
    (user?.linkedAccounts?.find((a: any) => a?.type === 'wallet') as any)?.address ||
    undefined

  // Consider connected only when Privy is ready AND user is authenticated
  const connectedAddress = (ready && authenticated) ? primaryAddress : undefined

  // ENS Integration
  const {
    hasENS,
    ensName,
    isLoading: ensLoading,
    error: ensError,
    showPopup,
    hideRegistrationPopup,
    redirectToENS,
  } = useENSIntegration(connectedAddress)

  // Social Verification
  const { verifyAndUpdatePlatform, getPlatformStatus } = useSocialVerification(ensName || undefined)
  
  // EYI Segments management
  const { segments, ringSegments, verifySegment, startVerification } = useEYISegments()

  // Update segments based on actual verification status
  useEffect(() => {
    // Update ENS segment
    verifySegment("ens", hasENS ? connectedAddress : undefined);
    
    // Update other segments based on Privy connections
    if (buildLinked) verifySegment("build", buildHandle);
    if (voiceLinked) verifySegment("voice", voiceHandle);
    if (webLinked) verifySegment("web", webHandle);
  }, [hasENS, buildLinked, voiceLinked, webLinked, connectedAddress, buildHandle, voiceHandle, webHandle, verifySegment]);

  function shortAddr(addr?: string) {
    if (!addr) return ""
    return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
  }

  function loginWith(method: 'github' | 'twitter' | 'farcaster') {
    // Open only the requested provider, skipping method selection UI
    login({ loginMethods: [method] })
  }

  function handleWalletAction() {
    if (!ready) return
    // Use Privy login with wallet method to ensure a session + wallet connect
    login({ loginMethods: ['wallet'] })
  }

  function handleDisconnect() {
    if (!ready || !authenticated) return
    logout()
  }

  return (
    <main>
      {/* Hero */}
      <section className="eyi-gradient-hero border-b border-border/40 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 eyi-particles">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, var(--eyi-primary), transparent)" }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, var(--eyi-mint), transparent)" }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.3, 0.1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--eyi-purple), transparent)" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.05, 0.2, 0.05],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/3 w-20 h-20 rounded-full opacity-12"
            style={{ background: "radial-gradient(circle, var(--eyi-pink), transparent)" }}
            animate={{
              scale: [1.1, 0.8, 1.1],
              opacity: [0.08, 0.25, 0.08],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 relative z-10">
          <motion.header 
            className="flex items-center justify-between mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-6">
              <motion.div 
                className="size-28 rounded-lg relative eyi-sparkle"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.4)",
                    "0 0 0 10px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                aria-hidden 
              >
                <img 
                  src="/EYI-logo.png" 
                  alt="EYI Logo" 
                  className="size-28 rounded-lg object-contain"
                />
              </motion.div>
              <span className="text-4xl font-bold tracking-wide eyi-gradient-text">EYI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-base font-medium">
              <Link href="/directory" className="hover:text-var(--eyi-primary) transition-colors">
                Directory
              </Link>
              <Link href="/portfolio" className="hover:text-var(--eyi-primary) transition-colors">
                Portfolio
              </Link>
              {connectedAddress ? (
                <div className="flex items-center gap-3">
                  <ENSProfile address={connectedAddress} size="sm" showAddress={false} />
                  <Button size="sm" variant="outline" onClick={handleWalletAction}>
                    Switch Wallet
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={!ready || (ready && !authenticated)} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button size="sm" className="ml-2" onClick={handleWalletAction} disabled={!ready}>
                  Connect Wallet
                </Button>
              )}
            </nav>
          </motion.header>

          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <MainTagline className="mb-6" />
              <h1 className="eyi-heading text-balance text-3xl md:text-4xl leading-tight mb-6">
                Own your identity.{" "}
                <motion.span 
                  className="eyi-gradient-text"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Unlock your powers.
                </motion.span>
              </h1>
              <p className="eyi-body text-pretty text-base mb-8">
                Connect your ENS to Self, GitHub, X, and Farcaster. Get an EYI badge for safer, smarter web3 interactions.
              </p>
              
              {/* Animated tagline carousel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-8 min-h-[2.5rem] flex items-center"
              >
                <TaglineCarousel 
                  className="text-sm md:text-base" 
                  interval={4000}
                  showMainTagline={false}
                />
              </motion.div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="eyi-button-glow"
                >
                  <Button onClick={handleWalletAction} className="gap-2 bg-gradient-to-r from-var(--eyi-primary) to-var(--eyi-mint) hover:from-var(--eyi-mint) hover:to-var(--eyi-purple) border-0 eyi-energetic-pulse">
                    <Sparkles className="size-4" aria-hidden />
                    {connectedAddress ? (hasENS ? `Connected • ${ensName}` : `Connected • ${shortAddr(connectedAddress)}`) : "Connect Wallet"}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="secondary" asChild className="eyi-glass hover:border-var(--eyi-primary)/40">
                    <Link href="/directory">See Directory</Link>
                  </Button>
                </motion.div>
              </div>

            </motion.div>

            <motion.div 
              className="flex flex-col items-center md:items-end gap-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <EYIRing
                segments={ringSegments}
                connectedAddress={connectedAddress}
                ensName={ensName || undefined}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status</span>
                {connectedAddress ? (
                  <ENSStatusIndicator address={connectedAddress} />
                ) : (
                  <StatusPill status="NONE" />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorksSection
        connectedAddress={connectedAddress}
        buildLinked={buildLinked}
        voiceLinked={voiceLinked}
        webLinked={webLinked}
      />

      {/* Powers preview */}
      <section id="modules" className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="eyi-subheading text-2xl mb-2">
            Unlock your powers
          </h2>
          <AnimatedTagline 
            tagline="Get EYI-d, get superpowers."
            className="text-sm"
            delay={0.2}
          />
        </motion.div>
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 * 0.1 }}
            viewport={{ once: true }}
          >
            <PowerCard 
              type="spark" 
              state={segments.find(s => s.type === "spark")?.status || "idle"}
              ensName={ensName || undefined}
              onVerificationSuccess={(type, userId) => {
                verifySegment(type, userId);
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 * 0.1 }}
            viewport={{ once: true }}
          >
            <PowerCard
              type="build"
              state={segments.find(s => s.type === "build")?.status || (buildLinked ? "verified" : "idle")}
              uid={buildHandle}
              ctaText={buildLinked ? "Disconnect" : "Connect GitHub"}
              ensName={ensName || undefined}
              onVerificationSuccess={(type, userId) => {
                verifySegment(type, userId);
              }}
              onAction={async () => {
                if (buildLinked && user?.github?.subject) {
                  unlinkGithub(user.github.subject)
                } else {
                  if (authenticated && ensName) {
                    // Use new verification system
                    await verifyAndUpdatePlatform('github')
                  } else {
                    loginWith('github')
                  }
                }
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2 * 0.1 }}
            viewport={{ once: true }}
          >
            <PowerCard
              type="voice"
              state={segments.find(s => s.type === "voice")?.status || (voiceLinked ? "verified" : "idle")}
              uid={voiceHandle}
              ctaText={voiceLinked ? "Disconnect" : "Connect X"}
              ensName={ensName || undefined}
              onVerificationSuccess={(type, userId) => {
                verifySegment(type, userId);
              }}
              onAction={async () => {
                if (voiceLinked && user?.twitter?.subject) {
                  unlinkTwitter(user.twitter.subject)
                } else {
                  if (authenticated && ensName) {
                    // Use new verification system
                    await verifyAndUpdatePlatform('twitter')
                  } else {
                    loginWith('twitter')
                  }
                }
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3 * 0.1 }}
            viewport={{ once: true }}
          >
            <PowerCard
              type="web"
              state={segments.find(s => s.type === "web")?.status || (webLinked ? "verified" : "idle")}
              uid={webHandle}
              ctaText={webLinked ? "Disconnect" : "Connect Farcaster"}
              ensName={ensName || undefined}
              onVerificationSuccess={(type, userId) => {
                verifySegment(type, userId);
              }}
              onAction={async () => {
                if (webLinked && typeof user?.farcaster?.fid === "number") {
                  unlinkFarcaster(user.farcaster.fid)
                } else {
                  if (authenticated && ensName) {
                    // Use new verification system
                    await verifyAndUpdatePlatform('farcaster')
                  } else {
                    // Skip method chooser; open Farcaster path in the modal directly
                    loginWith('farcaster')
                  }
                }
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EYI — Docs • Privacy • Terms
      </footer>

      {/* ENS Registration Popup */}
      {connectedAddress && (
        <ENSRegistrationPopup
          isOpen={showPopup}
          onClose={hideRegistrationPopup}
          onRedirect={redirectToENS}
          address={connectedAddress}
          countdownSeconds={3}
        />
      )}
    </main>
  )
}
