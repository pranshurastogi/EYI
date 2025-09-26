"use client"

import { motion } from "framer-motion"

interface ConnectionFlowProps {
  isConnected: boolean
  isVerified: boolean
}

export function ConnectionFlow({ isConnected, isVerified }: ConnectionFlowProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Connect to Verify line */}
      <motion.div
        className="absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-var(--eyi-primary) to-var(--eyi-mint) opacity-0"
        animate={{
          opacity: isConnected ? [0, 0.6, 0] : 0,
          scaleX: isConnected ? [0, 1, 0] : 0,
        }}
        transition={{
          duration: 2,
          repeat: isConnected ? Infinity : 0,
          ease: "easeInOut",
          delay: 0.5
        }}
        style={{
          transform: 'translateY(-50%)',
          background: 'linear-gradient(90deg, transparent, var(--eyi-primary), var(--eyi-mint), transparent)'
        }}
      />
      
      {/* Verify to Use line */}
      <motion.div
        className="absolute top-1/2 left-2/3 w-1/3 h-0.5 bg-gradient-to-r from-var(--eyi-mint) to-var(--eyi-primary) opacity-0"
        animate={{
          opacity: isVerified ? [0, 0.8, 0] : 0,
          scaleX: isVerified ? [0, 1, 0] : 0,
        }}
        transition={{
          duration: 2,
          repeat: isVerified ? Infinity : 0,
          ease: "easeInOut",
          delay: 0.8
        }}
        style={{
          transform: 'translateY(-50%)',
          background: 'linear-gradient(90deg, transparent, var(--eyi-mint), var(--eyi-primary), transparent)'
        }}
      />

      {/* Flowing Particles */}
      {isConnected && (
        <motion.div
          className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-var(--eyi-primary)"
          animate={{
            x: [0, 200, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{ transform: 'translateY(-50%)' }}
        />
      )}

      {isVerified && (
        <motion.div
          className="absolute top-1/2 left-2/3 w-2 h-2 rounded-full bg-var(--eyi-mint)"
          animate={{
            x: [0, 200, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
          style={{ transform: 'translateY(-50%)' }}
        />
      )}
    </div>
  )
}
