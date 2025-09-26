"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedIconProps {
  children: ReactNode
  isCompleted: boolean
  isHighlighted: boolean
  color: string
}

export function AnimatedIcon({ children, isCompleted, isHighlighted, color }: AnimatedIconProps) {
  return (
    <motion.div
      className="relative"
      animate={isCompleted ? {
        rotate: [0, 360],
        scale: [1, 1.1, 1]
      } : isHighlighted ? {
        scale: [1, 1.05, 1],
        rotate: [0, 5, -5, 0]
      } : {}}
      transition={{
        duration: isCompleted ? 0.8 : 2,
        ease: "easeInOut",
        repeat: isHighlighted ? Infinity : 0
      }}
    >
      {children}
      
      {/* Icon Glow Effect */}
      {isHighlighted && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-0"
          animate={{
            opacity: [0, 0.4, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle, ${color}, transparent)`,
            filter: 'blur(8px)'
          }}
        />
      )}
    </motion.div>
  )
}
