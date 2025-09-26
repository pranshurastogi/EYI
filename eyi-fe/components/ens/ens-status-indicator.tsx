"use client"

import { Badge } from "@/components/ui/badge"
import { useENS } from "@/hooks/use-ens"
import { ensLogger } from "@/lib/logger"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react"
import { useEffect } from "react"

interface ENSStatusIndicatorProps {
  address: string
  className?: string
  showIcon?: boolean
}

export function ENSStatusIndicator({ 
  address, 
  className = "",
  showIcon = true 
}: ENSStatusIndicatorProps) {
  const { name, isLoading, error, hasENS } = useENS(address)

  useEffect(() => {
    if (address && !isLoading) {
      ensLogger.ringUpdate(address, hasENS)
    }
  }, [address, hasENS, isLoading])

  if (isLoading) {
    return (
      <motion.div 
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {showIcon && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Checking ENS...
        </Badge>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {showIcon && <XCircle className="h-4 w-4 text-destructive" />}
        <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
          ENS Error
        </Badge>
      </motion.div>
    )
  }

  if (hasENS && name) {
    return (
      <motion.div 
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {showIcon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-4 w-4 text-var(--eyi-mint)" />
          </motion.div>
        )}
        <Badge 
          variant="secondary" 
          className="bg-var(--eyi-mint)/20 text-var(--eyi-mint) border-var(--eyi-mint)/30"
        >
          ENS Verified
        </Badge>
        <span className="text-sm font-medium text-var(--eyi-mint)">
          {name}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {showIcon && <AlertCircle className="h-4 w-4 text-amber-500" />}
      <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
        No ENS Name
      </Badge>
    </motion.div>
  )
}
