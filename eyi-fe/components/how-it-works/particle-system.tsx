"use client"

import { motion } from "framer-motion"

interface ParticleSystemProps {
  isActive: boolean
  color: string
  particleCount?: number
}

export function ParticleSystem({ isActive, color, particleCount = 6 }: ParticleSystemProps) {
  if (!isActive) return null

  return (
    <>
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-0"
          style={{
            background: color,
            left: `${20 + (i * 15)}%`,
            top: `${10 + (i % 3) * 30}%`
          }}
          animate={{
            y: [-10, -30, -10],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2 + (i * 0.2),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}
    </>
  )
}
