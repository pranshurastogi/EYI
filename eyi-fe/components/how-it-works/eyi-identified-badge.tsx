"use client"

import { motion } from "framer-motion"
import { Shield, Sparkles } from "lucide-react"

interface EYIIdentifiedBadgeProps {
  isVisible: boolean
}

export function EYIIdentifiedBadge({ isVisible }: EYIIdentifiedBadgeProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-3 pt-3 border-t border-var(--eyi-mint)/20"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center gap-1"
        >
          <Shield className="size-3 text-var(--eyi-mint)" />
          <Sparkles className="size-3 text-var(--eyi-primary)" />
        </motion.div>
        <span className="bg-gradient-to-r from-var(--eyi-primary) to-var(--eyi-mint) bg-clip-text text-transparent font-semibold text-xs">
          EYIdentified
        </span>
      </div>
    </motion.div>
  )
}
