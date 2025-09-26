"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useENS } from "@/hooks/use-ens"
import { ensLogger } from "@/lib/logger"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface ENSProfileProps {
  address: string
  className?: string
  showAddress?: boolean
  size?: "sm" | "md" | "lg"
}

export function ENSProfile({ 
  address, 
  className = "", 
  showAddress = true,
  size = "md" 
}: ENSProfileProps) {
  const { name, avatar, isLoading, error, hasENS } = useENS(address)

  useEffect(() => {
    if (address) {
      ensLogger.connectionAttempt(address)
      
      if (hasENS && name) {
        ensLogger.connectionSuccess(address, name)
      } else if (!isLoading && !hasENS) {
        ensLogger.noENSFound(address)
      }
    }
  }, [address, hasENS, name, isLoading])

  if (error) {
    ensLogger.connectionFailed(address, error)
  }

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm", 
    lg: "h-12 w-12 text-base"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-muted animate-pulse`} />
        <div className="space-y-1">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          {showAddress && <div className="h-2 w-16 bg-muted animate-pulse rounded" />}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-destructive/20 flex items-center justify-center`}>
          <span className="text-destructive text-xs">!</span>
        </div>
        <div className="space-y-1">
          <span className={`${textSizeClasses[size]} text-destructive`}>Error loading ENS</span>
          {showAddress && <span className={`${textSizeClasses[size]} text-muted-foreground`}>{address.slice(0, 6)}...{address.slice(-4)}</span>}
        </div>
      </div>
    )
  }

  if (!hasENS) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center`}>
          <span className="text-muted-foreground text-xs">?</span>
        </div>
        <div className="space-y-1">
          <span className={`${textSizeClasses[size]} text-muted-foreground`}>No ENS name</span>
          {showAddress && <span className={`${textSizeClasses[size]} text-muted-foreground`}>{address.slice(0, 6)}...{address.slice(-4)}</span>}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatar || undefined} alt={name || ""} />
        <AvatarFallback className="bg-gradient-to-br from-var(--eyi-primary) to-var(--eyi-mint) text-white">
          {name?.charAt(0).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`${textSizeClasses[size]} font-semibold`}>{name}</span>
          <Badge variant="secondary" className="text-xs bg-var(--eyi-mint)/20 text-var(--eyi-mint) border-var(--eyi-mint)/30">
            ENS
          </Badge>
        </div>
        {showAddress && (
          <span className={`${textSizeClasses[size]} text-muted-foreground`}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
      </div>
    </motion.div>
  )
}
