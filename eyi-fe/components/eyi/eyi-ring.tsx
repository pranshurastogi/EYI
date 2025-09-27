"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

type SegmentType = "ens" | "spark" | "build" | "voice" | "web"
type SegmentStatus = "idle" | "verifying" | "verified" | "expired"

export interface EYISegment {
  type: SegmentType
  status: SegmentStatus
  expiry?: string
}

export function EYIRing({
  segments,
  size = 160,
  stroke = 10,
}: {
  segments: EYISegment[]
  size?: number
  stroke?: number
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const gap = 0.04 * circ // visual gap between segments
  const segLen = (circ - gap * segments.length) / segments.length
  const prefersReduced = useReducedMotion()
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 })

  // Subtle eye tracking - follows mouse movement for that "watching you" effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const ringElement = document.querySelector('[data-eyi-ring]')
      if (!ringElement) return
      
      const rect = ringElement.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Calculate relative position with some dampening for smooth movement
      const deltaX = (e.clientX - centerX) / (rect.width / 2)
      const deltaY = (e.clientY - centerY) / (rect.height / 2)
      
      setEyePosition({ 
        x: Math.max(-0.3, Math.min(0.3, deltaX * 0.1)), 
        y: Math.max(-0.3, Math.min(0.3, deltaY * 0.1)) 
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function colorFor(status: SegmentStatus, type: SegmentType) {
    switch (status) {
      case "verified":
        if (type === "ens") {
          return "var(--eyi-mint)"
        }
        return "var(--eyi-mint)"
      case "verifying":
        return "color-mix(in oklab, var(--eyi-primary) 80%, var(--eyi-purple) 20%)"
      case "expired":
        return "var(--eyi-rose)"
      default:
        return "color-mix(in oklab, var(--eyi-slate) 60%, transparent)"
    }
  }

  const hasVerifiedSegments = segments.some(seg => seg.status === "verified")

  return (
    <div 
      className="relative group" 
      style={{ width: size, height: size }} 
      aria-label="EYI progress ring" 
      data-eyi-ring
    >
      {/* Eye glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, color-mix(in oklab, var(--eyi-primary) 20%, transparent) 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
        animate={{
          scale: hasVerifiedSegments ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: hasVerifiedSegments ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      
      {/* Central eye pupil */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-white to-gray-200 shadow-lg"
        style={{
          transform: `translate(-50%, -50%) translate(${eyePosition.x * 8}px, ${eyePosition.y * 8}px)`,
          boxShadow: hasVerifiedSegments ? "0 0 20px var(--eyi-mint)" : "0 0 10px rgba(0,0,0,0.3)"
        }}
        animate={{
          scale: hasVerifiedSegments ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: hasVerifiedSegments ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block relative z-10">
        {/* Background ring with subtle glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="color-mix(in oklab, var(--eyi-slate) 20%, transparent)"
          strokeWidth={stroke}
          fill="none"
          filter="drop-shadow(0 0 8px color-mix(in oklab, var(--eyi-primary) 30%, transparent))"
        />
        
        {segments.map((seg, i) => {
          const offset = i * (segLen + gap)
          const dashArray = `${segLen} ${circ - segLen}`
          const dashOffset = -offset
          const isActive = seg.status === "verified" || seg.status === "verifying"
          
          return (
            <motion.circle
              key={seg.type}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={colorFor(seg.status, seg.type)}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={dashArray}
              initial={prefersReduced ? false : { strokeDashoffset: circ }}
              animate={prefersReduced ? {} : { strokeDashoffset: dashOffset }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                filter: isActive ? `drop-shadow(0 0 12px ${colorFor(seg.status, seg.type)})` : "none",
              }}
              aria-label={`${seg.type} • ${seg.status}${seg.expiry ? ` • expires ${seg.expiry}` : ""}`}
            />
          )
        })}
      </svg>

      {/* Floating particles for verified segments */}
      {hasVerifiedSegments && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${50 + Math.cos((i * Math.PI * 2) / 6) * 30}%`,
                top: `${50 + Math.sin((i * Math.PI * 2) / 6) * 30}%`,
                background: i % 3 === 0 
                  ? "linear-gradient(45deg, var(--eyi-mint), var(--eyi-primary))"
                  : i % 3 === 1
                  ? "linear-gradient(45deg, var(--eyi-primary), var(--eyi-purple))"
                  : "linear-gradient(45deg, var(--eyi-purple), var(--eyi-pink))"
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.6, 1.4, 0.6],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
