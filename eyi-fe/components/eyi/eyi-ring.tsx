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
  size = 200,
  stroke = 8,
  connectedAddress,
  ensName,
}: {
  segments: EYISegment[]
  size?: number
  stroke?: number
  connectedAddress?: string
  ensName?: string
}) {
  // Ensure we always have 5 segments
  const defaultSegments: EYISegment[] = [
    { type: "ens", status: "idle" },
    { type: "spark", status: "idle" },
    { type: "build", status: "idle" },
    { type: "voice", status: "idle" },
    { type: "web", status: "idle" },
  ]
  
  const displaySegments = segments.length > 0 ? segments : defaultSegments
  
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const segmentAngle = (2 * Math.PI) / 5 // 72 degrees per segment
  const gapAngle = 0.1 // Small gap between segments
  const segmentArc = segmentAngle - gapAngle
  const prefersReduced = useReducedMotion()
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Enhanced mouse tracking for 3D perspective
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const ringElement = document.querySelector('[data-eyi-ring]')
      if (!ringElement) return
      
      const rect = ringElement.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Calculate relative position for 3D perspective
      const deltaX = (e.clientX - centerX) / (rect.width / 2)
      const deltaY = (e.clientY - centerY) / (rect.height / 2)
      
      setMousePosition({ x: deltaX, y: deltaY })
      setEyePosition({ 
        x: Math.max(-0.3, Math.min(0.3, deltaX * 0.1)), 
        y: Math.max(-0.3, Math.min(0.3, deltaY * 0.1)) 
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function colorFor(status: SegmentStatus, type: SegmentType) {
    // Enhanced colors with dynamic lighting based on connection status
    const typeColors = {
      ens: "rgba(59, 130, 246, 0.7)", // Blue with transparency
      spark: "rgba(16, 185, 129, 0.7)", // Emerald with transparency
      build: "rgba(139, 92, 246, 0.7)", // Purple with transparency
      voice: "rgba(236, 72, 153, 0.7)", // Pink with transparency
      web: "rgba(249, 115, 22, 0.7)" // Orange with transparency
    }

    // Special logic for ENS segment based on wallet connection and ENS status
    if (type === "ens") {
      if (connectedAddress && ensName) {
        // Wallet connected + ENS verified = bright blue
        return "rgba(59, 130, 246, 0.9)"
      } else if (connectedAddress) {
        // Wallet connected but no ENS = medium blue
        return "rgba(59, 130, 246, 0.6)"
      }
    }

    switch (status) {
      case "verified":
        return typeColors[type]
      case "verifying":
        return typeColors[type]
      case "expired":
        return "rgba(239, 68, 68, 0.6)"
      default:
        return "rgba(100, 116, 139, 0.2)" // More subtle for idle
    }
  }

  function getSegmentPath(index: number) {
    const startAngle = index * segmentAngle - Math.PI / 2 // Start from top
    const endAngle = startAngle + segmentArc
    const innerRadius = r - stroke / 2
    const outerRadius = r + stroke / 2
    
    const x1 = size / 2 + Math.cos(startAngle) * innerRadius
    const y1 = size / 2 + Math.sin(startAngle) * innerRadius
    const x2 = size / 2 + Math.cos(startAngle) * outerRadius
    const y2 = size / 2 + Math.sin(startAngle) * outerRadius
    const x3 = size / 2 + Math.cos(endAngle) * outerRadius
    const y3 = size / 2 + Math.sin(endAngle) * outerRadius
    const x4 = size / 2 + Math.cos(endAngle) * innerRadius
    const y4 = size / 2 + Math.sin(endAngle) * innerRadius
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`
  }

  const hasVerifiedSegments = displaySegments.some(seg => seg.status === "verified")

  return (
    <div 
      className="relative group perspective-1000" 
      style={{ 
        width: size, 
        height: size,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }} 
      aria-label="EYI progress ring" 
      data-eyi-ring
    >
      {/* 3D Container with dynamic perspective */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transform: `rotateX(${mousePosition.y * 15}deg) rotateY(${mousePosition.x * 15}deg)`,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        {/* Enhanced 3D Background with depth layers */}
        <div className="absolute inset-0 rounded-full overflow-hidden" style={{ transform: 'translateZ(-20px)' }}>
          {/* Deep space background with multiple layers */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, #1e293b 0%, #0f172a 50%, #000 100%),
                radial-gradient(circle at 70% 70%, #1a202c 0%, transparent 50%)
              `
            }}
          />
          
          {/* Nebula effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background: `
                radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 10%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
              `
            }}
          />
          
          {/* Enhanced floating stars with depth */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${0.5 + Math.random() * 1.5}px`,
                height: `${0.5 + Math.random() * 1.5}px`,
                boxShadow: "0 0 4px white, 0 0 8px rgba(255,255,255,0.5)",
                transform: `translateZ(${Math.random() * 20 - 10}px)`
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* 3D Ring segments with enhanced depth */}
        <div 
          className="relative z-10"
          style={{ transform: 'translateZ(10px)' }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
            {displaySegments.map((seg, i) => {
              const isVerified = seg.status === "verified"
              const isVerifying = seg.status === "verifying"
              const segmentColor = colorFor(seg.status, seg.type)
              
              return (
                <g key={seg.type}>
                  {/* Shadow layer for depth */}
                  <motion.path
                    d={getSegmentPath(i)}
                    fill="rgba(0,0,0,0.3)"
                    style={{
                      transform: 'translate(2px, 2px)',
                      filter: 'blur(1px)'
                    }}
                    initial={prefersReduced ? false : { opacity: 0 }}
                    animate={{
                      opacity: isVerified ? 0.4 : isVerifying ? 0.2 : 0.1,
                    }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                  
                  {/* Main segment with 3D gradient */}
                  <motion.path
                    d={getSegmentPath(i)}
                    fill={`url(#gradient-${seg.type})`}
                    initial={prefersReduced ? false : { opacity: 0 }}
                    animate={{
                      opacity: isVerified ? 1 : isVerifying ? 0.7 : 0.2,
                    }}
                    transition={{ 
                      duration: 0.8, 
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    style={{
                      filter: isVerified 
                        ? `drop-shadow(0 0 20px ${segmentColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.3))` 
                        : "none",
                    }}
                    aria-label={`${seg.type} • ${seg.status}${seg.expiry ? ` • expires ${seg.expiry}` : ""}`}
                  />
                  
                  {/* Highlight for 3D effect */}
                  {isVerified && (
                    <motion.path
                      d={getSegmentPath(i)}
                      fill="url(#highlight-${seg.type})"
                      style={{
                        opacity: 0.6,
                        mixBlendMode: 'screen'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </g>
              )
            })}
            
            {/* Enhanced gradient definitions for eye-like transparency */}
            <defs>
              {displaySegments.map((seg, i) => {
                const segmentColor = colorFor(seg.status, seg.type)
                const baseColor = segmentColor.replace('rgba(', '').replace(')', '').split(',')
                const r = baseColor[0]
                const g = baseColor[1] 
                const b = baseColor[2]
                
                return (
                  <g key={`gradients-${seg.type}`}>
                    <linearGradient id={`gradient-${seg.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={`rgba(${r}, ${g}, ${b}, 0.8)`} />
                      <stop offset="50%" stopColor={`rgba(${r}, ${g}, ${b}, 0.9)`} />
                      <stop offset="100%" stopColor={`rgba(${r}, ${g}, ${b}, 0.6)`} />
                    </linearGradient>
                    <linearGradient id={`highlight-${seg.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.2)" stopOpacity="0" />
                      <stop offset="30%" stopColor="rgba(255,255,255,0.4)" stopOpacity="1" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.1)" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id={`iris-${seg.type}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={`rgba(${r}, ${g}, ${b}, 0.9)`} />
                      <stop offset="70%" stopColor={`rgba(${r}, ${g}, ${b}, 0.7)`} />
                      <stop offset="100%" stopColor={`rgba(${r}, ${g}, ${b}, 0.3)`} />
                    </radialGradient>
                  </g>
                )
              })}
            </defs>
          </svg>
        </div>

        {/* Realistic 3D Eye Pupil */}
        <motion.div
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: '18px',
            height: '18px',
            transform: `translate(-50%, -50%) translate(${eyePosition.x * 10}px, ${eyePosition.y * 10}px) translateZ(20px)`,
            background: `
              radial-gradient(circle at 35% 35%, #1a1a1a 0%, #000000 40%, #1a1a1a 100%),
              radial-gradient(circle at 60% 40%, rgba(255,255,255,0.3) 0%, transparent 30%),
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `,
            boxShadow: hasVerifiedSegments 
              ? "0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)" 
              : "0 0 15px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)"
          }}
          animate={{
            scale: hasVerifiedSegments ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: hasVerifiedSegments ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* Eye highlight for realism */}
        <motion.div
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: '4px',
            height: '4px',
            transform: `translate(-50%, -50%) translate(${eyePosition.x * 12}px, ${eyePosition.y * 12}px) translateZ(25px)`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            filter: 'blur(0.5px)'
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Enhanced Aesthetic Effects */}
        {hasVerifiedSegments && (
          <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(30px)' }}>
            {/* Iris-like radial patterns */}
            {displaySegments.filter(seg => seg.status === "verified").map((seg, segIndex) => {
              const segmentColor = colorFor(seg.status, seg.type)
              return (
                <motion.div
                  key={`iris-${seg.type}`}
                  className="absolute rounded-full"
                  style={{
                    left: `${50 + Math.cos((segIndex * Math.PI * 2) / 5) * 25}%`,
                    top: `${50 + Math.sin((segIndex * Math.PI * 2) / 5) * 25}%`,
                    width: '10px',
                    height: '10px',
                    background: `url(#iris-${seg.type})`,
                    boxShadow: `0 0 15px ${segmentColor}, 0 0 30px ${segmentColor}`,
                    transform: 'translateZ(15px)',
                    filter: 'blur(0.5px)'
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: segIndex * 0.8,
                  }}
                />
              )
            })}

            {/* Subtle light rays emanating from center */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '2px',
                  height: '60px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
                  transformOrigin: 'bottom center',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateZ(10px)`
                }}
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scaleY: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Dynamic concentric energy rings based on verification status */}
            {[...Array(3)].map((_, i) => {
              // Calculate ring intensity based on verified segments
              const verifiedCount = displaySegments.filter(seg => seg.status === "verified").length
              const hasWalletConnection = !!connectedAddress
              const hasENS = !!ensName
              
              // Enhanced ring colors and intensity based on status
              const ringIntensity = Math.min(0.3 + (verifiedCount * 0.1) + (hasWalletConnection ? 0.1 : 0) + (hasENS ? 0.1 : 0), 0.8)
              const ringColor = hasENS ? 'rgba(59, 130, 246, 0.3)' : hasWalletConnection ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              
              return (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute rounded-full border"
                  style={{
                    left: `${50 - (20 + i * 8)}%`,
                    top: `${50 - (20 + i * 8)}%`,
                    width: `${(40 + i * 16)}%`,
                    height: `${(40 + i * 16)}%`,
                    borderColor: ringColor,
                    borderWidth: "1px",
                    transform: `translateZ(${i * 5}px)`,
                    boxShadow: `0 0 ${15 + i * 8}px ${ringColor}, 0 0 ${25 + i * 12}px ${ringColor}`
                  }}
                  animate={{
                    scale: [1, 1.1 + (verifiedCount * 0.05), 1],
                    opacity: [0.05, ringIntensity, 0.05],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 6 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 1,
                  }}
                />
              )
            })}

            {/* Dynamic lens flare effect based on verification status */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: '60%',
                top: '30%',
                width: '20px',
                height: '20px',
                background: hasVerifiedSegments 
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                transform: 'translateZ(25px)',
                filter: 'blur(1px)',
                boxShadow: hasVerifiedSegments 
                  ? '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)'
                  : 'none'
              }}
              animate={{
                opacity: hasVerifiedSegments ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2],
                scale: hasVerifiedSegments ? [0.8, 1.4, 0.8] : [0.8, 1.2, 0.8],
                x: [0, 5, 0],
                y: [0, -3, 0]
              }}
              transition={{
                duration: hasVerifiedSegments ? 3 : 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Enhanced glassmorphism overlay with iris-like texture */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
                  linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0%, transparent 50%, rgba(255, 255, 255, 0.02) 100%)
                `,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transform: 'translateZ(5px)'
              }}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
