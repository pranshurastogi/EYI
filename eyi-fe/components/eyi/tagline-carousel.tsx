"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

const taglines = [
  "No more look-alikes. Only you.",
  "Unlock your EYI-d. Spark. Build. Voice. Web.",
  "Every level makes you stronger.",
  "Identity isn't given. It's empowered.",
  "ENS, empowered.",
  "The badge your ENS deserves.",
  "From name to power — the ENS way.",
  "Get EYI-d, get superpowers.",
  "Spark your identity. Build your future.",
  "Your name just leveled up."
]

interface TaglineCarouselProps {
  className?: string
  interval?: number
  showMainTagline?: boolean
}

export function TaglineCarousel({ 
  className = "", 
  interval = 3000,
  showMainTagline = true 
}: TaglineCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % taglines.length)
    }, interval)

    return () => clearInterval(timer)
  }, [interval])

  const currentTagline = showMainTagline ? taglines[0] : taglines[currentIndex]

  return (
    <div className={`eyi-tagline-carousel ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="eyi-gradient-text font-semibold text-lg md:text-xl"
        >
          {currentTagline}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Static tagline component for the main hero
export function MainTagline({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3 
      }}
      className={`eyi-bounce-text ${className}`}
    >
      <span className="eyi-gradient-text font-bold text-2xl md:text-3xl">
        No more look-alikes. Only you.
      </span>
    </motion.div>
  )
}

// Animated tagline for special sections
export function AnimatedTagline({ 
  tagline, 
  className = "",
  delay = 0 
}: { 
  tagline: string
  className?: string
  delay?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        delay 
      }}
      viewport={{ once: true }}
      className={`eyi-gradient-text font-semibold ${className}`}
    >
      {tagline}
    </motion.div>
  )
}
