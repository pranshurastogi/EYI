"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EYIRing } from "@/components/eyi/eyi-ring"
import { PowerCard } from "@/components/eyi/power-card"
import { StatusPill } from "@/components/eyi/status-pill"
import { ArrowRight, Eye, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="eyi-gradient-hero border-b border-border/40 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, var(--eyi-primary), transparent)" }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, var(--eyi-mint), transparent)" }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
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
            <div className="flex items-center gap-2">
              <motion.div 
                className="size-6 rounded-lg bg-var(--eyi-primary) relative"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(37, 99, 235, 0.4)",
                    "0 0 0 10px rgba(37, 99, 235, 0)",
                    "0 0 0 0 rgba(37, 99, 235, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                aria-hidden 
              />
              <span className="text-sm font-semibold tracking-wide">EYI</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/directory" className="hover:text-var(--eyi-primary) transition-colors">
                Directory
              </Link>
              <a href="#modules" className="hover:text-var(--eyi-primary) transition-colors">
                Modules
              </a>
              <a href="#docs" className="hover:text-var(--eyi-primary) transition-colors">
                Docs
              </a>
              <Button size="sm" className="ml-2">
                Connect Wallet
              </Button>
            </nav>
          </motion.header>

          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-balance text-4xl md:text-5xl font-bold leading-tight">
                Own your identity.{" "}
                <motion.span 
                  className="bg-gradient-to-r from-var(--eyi-primary) to-var(--eyi-mint) bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Unlock your powers.
                </motion.span>
              </h1>
              <p className="text-pretty text-base text-muted-foreground">
                Connect your ENS to Self, GitHub, X, and Farcaster. Get an EYI badge for safer, smarter web3 interactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="gap-2">
                    Connect Wallet
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="secondary" asChild>
                    <Link href="/directory">See Directory</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Trust strip */}
              <div className="eyi-glass rounded-xl p-3 mt-6">
                <div className="text-xs text-muted-foreground mb-2">
                  Built with ENS, blockchain attestations, and privacy-first verification.
                </div>
                <div className="grid grid-cols-3 gap-3 opacity-80">
                  <Card className="bg-transparent border-border/40">
                    <CardContent className="p-3 text-center text-xs">ENS</CardContent>
                  </Card>
                  <Card className="bg-transparent border-border/40">
                    <CardContent className="p-3 text-center text-xs">Attestations</CardContent>
                  </Card>
                  <Card className="bg-transparent border-border/40">
                    <CardContent className="p-3 text-center text-xs">Privacy</CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center md:items-end gap-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <EYIRing
                segments={[
                  { type: "spark", status: "idle" },
                  { type: "build", status: "idle" },
                  { type: "voice", status: "idle" },
                  { type: "web", status: "idle" },
                ]}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusPill status="NONE" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <motion.h2 
          className="text-2xl font-semibold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          How it works
        </motion.h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Eye className="size-6 text-var(--eyi-primary)" />,
              title: "Connect",
              description: "Check your ENS and get guidance to register if you don't have one."
            },
            {
              icon: <Shield className="size-6 text-var(--eyi-mint)" />,
              title: "Verify", 
              description: "Complete Spark, Build, Voice, and Web to increase trust."
            },
            {
              icon: <Zap className="size-6 text-var(--eyi-primary)" />,
              title: "Use",
              description: "Enjoy safer sends, event stamps, and analytics."
            }
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="eyi-glass group hover:border-var(--eyi-primary)/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {step.icon}
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Powers preview */}
      <section id="modules" className="mx-auto max-w-6xl px-6 pb-20">
        <motion.h2 
          className="text-2xl font-semibold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Unlock your powers
        </motion.h2>
        <div className="grid gap-4 md:grid-cols-2">
          {["spark", "build", "voice", "web"].map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <PowerCard type={type as any} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EYI — Docs • Privacy • Terms
      </footer>
    </main>
  )
}
