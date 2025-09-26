"use client"

import { motion } from "framer-motion"

interface CompletionBadgeProps {
  isCompleted: boolean
  progress?: number
  maxProgress?: number
}

export function CompletionBadge({ isCompleted, progress, maxProgress = 3 }: CompletionBadgeProps) {
  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="size-4 rounded-full bg-var(--eyi-mint) flex items-center justify-center">
          <div className="size-2 rounded-full bg-white" />
        </div>
        
        {/* Completion Ripple */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-var(--eyi-mint)"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.div>
    )
  }

  if (progress !== undefined && progress > 0) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="flex items-center gap-1"
      >
        <span className="text-xs text-var(--eyi-mint) font-medium">
          {progress}/{maxProgress}
        </span>
        
        {/* Progress Indicator Animation */}
        <motion.div
          className="w-8 h-1 bg-muted rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-var(--eyi-primary) to-var(--eyi-mint) rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(progress / maxProgress) * 100}%` }}
            transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>
    )
  }

  return null
}
