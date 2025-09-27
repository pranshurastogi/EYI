"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, Github, Twitter, Globe, User, Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useENSTextRecords, ENS_TEXT_RECORD_KEYS } from '@/hooks/use-ens-text-records'

interface ENSTextRecordsDisplayProps {
  ensName: string
  className?: string
}

const PLATFORM_CONFIG = {
  [ENS_TEXT_RECORD_KEYS.GITHUB]: {
    icon: Github,
    label: 'GitHub',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  [ENS_TEXT_RECORD_KEYS.TWITTER]: {
    icon: Twitter,
    label: 'X (Twitter)',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  [ENS_TEXT_RECORD_KEYS.FARCASTER]: {
    icon: MessageCircle,
    label: 'Farcaster',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  [ENS_TEXT_RECORD_KEYS.URL]: {
    icon: ExternalLink,
    label: 'Website',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  [ENS_TEXT_RECORD_KEYS.DESCRIPTION]: {
    icon: User,
    label: 'Bio',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
} as const

export function ENSTextRecordsDisplay({ ensName, className }: ENSTextRecordsDisplayProps) {
  const { records, isLoading, error, hasRecords } = useENSTextRecords(ensName)

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading ENS records...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <p className="text-sm text-destructive">Failed to load ENS records</p>
      </div>
    )
  }

  if (!hasRecords) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <p className="text-sm text-muted-foreground">No ENS text records found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Connect your social accounts to populate your ENS profile
        </p>
      </div>
    )
  }

  const verifiedRecords = Object.entries(records).filter(([_, record]) => record.verified)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="size-2 rounded-full bg-var(--eyi-mint)" />
        <span className="text-sm font-medium text-muted-foreground">ENS Records</span>
      </div>
      
      <div className="space-y-2">
        {verifiedRecords.map(([key, record]) => {
          const config = PLATFORM_CONFIG[key as keyof typeof PLATFORM_CONFIG]
          if (!config) return null

          const Icon = config.icon

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                config.bgColor,
                config.borderColor,
                "hover:shadow-sm"
              )}
            >
              <div className={cn("p-2 rounded-md", config.bgColor)}>
                <Icon className={cn("size-4", config.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {config.label}
                  </span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="size-3 text-var(--eyi-mint)" />
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {record.value}
                </p>
              </div>
              
                    {(key === ENS_TEXT_RECORD_KEYS.URL || key === ENS_TEXT_RECORD_KEYS.GITHUB || key === ENS_TEXT_RECORD_KEYS.TWITTER || key === ENS_TEXT_RECORD_KEYS.FARCASTER) && record.value && (
                      <motion.a
                        href={
                          key === ENS_TEXT_RECORD_KEYS.GITHUB ? `https://github.com/${record.value}` :
                          key === ENS_TEXT_RECORD_KEYS.TWITTER ? `https://twitter.com/${record.value}` :
                          key === ENS_TEXT_RECORD_KEYS.FARCASTER ? `https://farcaster.xyz/${record.value}` :
                          record.value.startsWith('http') ? record.value : `https://${record.value}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-white/50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </motion.a>
                    )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Compact version for power cards
 */
export function ENSTextRecordsCompact({ ensName, className }: ENSTextRecordsDisplayProps) {
  const { records, isLoading, hasRecords } = useENSTextRecords(ensName)

  // For testing: show mock data when no ENS records
  if (!ensName || isLoading || !hasRecords) {
    // Show mock icons for testing
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn("flex items-center gap-1", className)}
      >
        <div className="flex -space-x-1">
          <div className="size-6 rounded-full border-2 border-background flex items-center justify-center bg-gray-50">
            <Github className="size-3 text-gray-600" />
          </div>
          <div className="size-6 rounded-full border-2 border-background flex items-center justify-center bg-blue-50">
            <Twitter className="size-3 text-blue-600" />
          </div>
          <div className="size-6 rounded-full border-2 border-background flex items-center justify-center bg-purple-50">
            <MessageCircle className="size-3 text-purple-600" />
          </div>
        </div>
      </motion.div>
    )
  }

  const verifiedCount = Object.values(records).filter(record => record.verified).length

  if (verifiedCount === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center gap-1", className)}
    >
      <div className="flex -space-x-1">
        {Object.entries(records)
          .filter(([_, record]) => record.verified)
          .slice(0, 3)
          .map(([key, record], index) => {
            const config = PLATFORM_CONFIG[key as keyof typeof PLATFORM_CONFIG]
            if (!config) return null

            const Icon = config.icon

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "size-6 rounded-full border-2 border-background flex items-center justify-center",
                  config.bgColor
                )}
                title={`${config.label}: ${record.value}`}
              >
                <Icon className={cn("size-3", config.color)} />
              </motion.div>
            )
          })}
      </div>
      
      {verifiedCount > 3 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{verifiedCount - 3}
        </span>
      )}
    </motion.div>
  )
}
