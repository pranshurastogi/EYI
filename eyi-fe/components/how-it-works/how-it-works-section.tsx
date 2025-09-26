"use client"

import { motion } from "framer-motion"
import { Eye, Shield, Zap } from "lucide-react"
import { ConnectionFlow } from "./connection-flow"
import { AnimatedCard } from "./animated-card"
import { AnimatedTagline } from "@/components/eyi/tagline-carousel"

interface HowItWorksSectionProps {
  connectedAddress?: string
  buildLinked: boolean
  voiceLinked: boolean
  webLinked: boolean
}

export function HowItWorksSection({ 
  connectedAddress, 
  buildLinked, 
  voiceLinked, 
  webLinked 
}: HowItWorksSectionProps) {
  const isConnected = !!connectedAddress
  const isVerified = buildLinked && voiceLinked && webLinked
  const progress = [buildLinked, voiceLinked, webLinked].filter(Boolean).length

  const steps = [
    {
      icon: <Eye className="size-6 text-var(--eyi-primary)" />,
      title: isConnected ? "Connected" : "Connect",
      description: "Check your ENS and get guidance to register if you don't have one.",
      isCompleted: isConnected,
      isHighlighted: isConnected,
      color: "var(--eyi-primary)"
    },
    {
      icon: <Shield className="size-6 text-var(--eyi-mint)" />,
      title: "Verify", 
      description: "Complete Spark, Build, Voice, and Web to increase trust.",
      isCompleted: isVerified,
      isHighlighted: isVerified,
      progress,
      color: "var(--eyi-mint)"
    },
    {
      icon: <Zap className="size-6 text-var(--eyi-primary)" />,
      title: "Use",
      description: "Enjoy safer sends, event stamps, and analytics.",
      isCompleted: isVerified,
      isHighlighted: isVerified,
      color: "var(--eyi-primary)"
    }
  ]

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <h2 className="text-2xl font-semibold mb-2">
          How it works
        </h2>
        <AnimatedTagline 
          tagline="Every level makes you stronger."
          className="text-sm"
          delay={0.2}
        />
      </motion.div>
      
      <div className="relative">
        <ConnectionFlow isConnected={isConnected} isVerified={isVerified} />
        
        <div className="grid gap-4 md:grid-cols-3 relative z-10">
          {steps.map((step, index) => (
            <AnimatedCard
              key={step.title}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isCompleted={step.isCompleted}
              isHighlighted={step.isHighlighted}
              color={step.color}
              progress={step.progress}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
