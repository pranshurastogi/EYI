"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"
import { ParticleSystem } from "./particle-system"
import { AnimatedIcon } from "./animated-icon"
import { CompletionBadge } from "./completion-badge"
import { EYIIdentifiedBadge } from "./eyi-identified-badge"

interface AnimatedCardProps {
  icon: ReactNode
  title: string
  description: string
  isCompleted: boolean
  isHighlighted: boolean
  color: string
  progress?: number
  maxProgress?: number
  index: number
}

export function AnimatedCard({
  icon,
  title,
  description,
  isCompleted,
  isHighlighted,
  color,
  progress,
  maxProgress = 3,
  index
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Animated Border */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0"
        animate={isHighlighted ? {
          opacity: [0, 0.3, 0],
          scale: [1, 1.02, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: isHighlighted ? Infinity : 0,
          ease: "easeInOut"
        }}
        style={{
          background: `linear-gradient(45deg, ${color}, transparent, ${color})`,
          padding: '2px',
          borderRadius: '8px'
        }}
      >
        <div className="w-full h-full bg-background rounded-lg" />
      </motion.div>

      {/* Floating Particles */}
      <ParticleSystem 
        isActive={isHighlighted} 
        color={color} 
        particleCount={6} 
      />

      <Card className={`eyi-glass group hover:border-var(--eyi-primary)/40 transition-all duration-500 relative overflow-hidden ${
        isCompleted 
          ? 'border-var(--eyi-mint)/60 bg-gradient-to-br from-var(--eyi-mint)/5 to-var(--eyi-primary)/5' 
          : isHighlighted 
          ? 'border-var(--eyi-primary)/40 bg-gradient-to-br from-var(--eyi-primary)/5 to-var(--eyi-mint)/5' 
          : ''
      }`}>
        {/* Animated Background Gradient */}
        {isHighlighted && (
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                `radial-gradient(circle at 20% 20%, ${color}20, transparent)`,
                `radial-gradient(circle at 80% 80%, ${color}20, transparent)`,
                `radial-gradient(circle at 20% 20%, ${color}20, transparent)`
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <AnimatedIcon
              isCompleted={isCompleted}
              isHighlighted={isHighlighted}
              color={color}
            >
              {icon}
            </AnimatedIcon>
            
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{title}</h3>
              <CompletionBadge
                isCompleted={isCompleted}
                progress={progress}
                maxProgress={maxProgress}
              />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          
          <EYIIdentifiedBadge isVisible={isCompleted} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
