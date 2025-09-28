"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  ExternalLink, 
  Github, 
  Twitter, 
  Globe, 
  User, 
  Loader2,
  Star,
  Plus,
  RefreshCw,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ENSTextRecordsDisplay } from './ens-text-records-display'
import { useENSTextRecords, ENS_TEXT_RECORD_KEYS } from '@/hooks/use-ens-text-records'
import { useSocialVerification } from '@/hooks/use-social-verification'

interface ENSTextRecordsSectionProps {
  ensName: string
  className?: string
}

const PLATFORM_CONFIG = {
  [ENS_TEXT_RECORD_KEYS.GITHUB]: {
    icon: Github,
    label: 'GitHub',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    platform: 'github' as const
  },
  [ENS_TEXT_RECORD_KEYS.TWITTER]: {
    icon: Twitter,
    label: 'X (Twitter)',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    platform: 'twitter' as const
  },
  [ENS_TEXT_RECORD_KEYS.FARCASTER]: {
    icon: MessageCircle,
    label: 'Farcaster',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    platform: 'farcaster' as const
  }
} as const

export function ENSTextRecordsSection({ ensName, className }: ENSTextRecordsSectionProps) {
  const { records, isLoading, error, hasRecords, refreshRecords } = useENSTextRecords(ensName)
  const { verifyAndUpdatePlatform, state, getPlatformStatus } = useSocialVerification(ensName)

  const handleVerifyPlatform = async (platform: 'github' | 'twitter' | 'farcaster') => {
    try {
      await verifyAndUpdatePlatform(platform)
      await refreshRecords()
    } catch (error) {
      console.error('Failed to verify platform:', error)
    }
  }

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-var(--eyi-mint)" />
            ENS Text Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading ENS records...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-var(--eyi-mint)" />
            ENS Text Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-destructive mb-4">Failed to load ENS records</p>
            <Button 
              variant="outline" 
              onClick={refreshRecords}
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const verifiedRecords = Object.entries(records).filter(([_, record]) => record.verified)
  const unverifiedPlatforms = Object.entries(PLATFORM_CONFIG).filter(
    ([key, _]) => !records[key]?.verified
  )

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-var(--eyi-mint)" />
            ENS Text Records
            {hasRecords && (
              <Badge variant="secondary" className="bg-var(--eyi-mint)/10 text-var(--eyi-mint)">
                {verifiedRecords.length} verified
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshRecords}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Verified Records */}
        {verifiedRecords.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Verified Records</h4>
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
        )}

        {/* Unverified Platforms */}
        {unverifiedPlatforms.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Add More Records</h4>
            <div className="grid gap-2">
              {unverifiedPlatforms.map(([key, config]) => {
                const status = getPlatformStatus(config.platform)
                const isLinked = !!status.connected
                return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border border-dashed transition-all duration-200",
                    config.borderColor,
                    "hover:border-solid hover:shadow-sm"
                  )}
                >
                  <div className={cn("p-2 rounded-md opacity-50", config.bgColor)}>
                    <config.icon className={cn("size-4", config.color)} />
                  </div>
                  
                  <div className="flex-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {config.label}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {isLinked
                        ? `Linked as @${status.handle || ''}. Add to ENS.`
                        : `Connect your ${config.label} account to add it to your ENS profile`}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerifyPlatform(config.platform)}
                    disabled={state.isVerifying || state.isUpdatingENS}
                    className="gap-2"
                  >
                    {(state.isVerifying || state.isUpdatingENS) ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Plus className="size-3" />
                    )}
                    {isLinked ? 'Add to ENS' : 'Connect'}
                  </Button>
                </motion.div>
              )})}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasRecords && (
          <div className="text-center py-8">
            <Star className="size-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No ENS Records Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your social accounts to populate your ENS profile with verified information.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                <Button
                  key={key}
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerifyPlatform(config.platform)}
                  disabled={state.isVerifying || state.isUpdatingENS}
                  className="gap-2"
                >
                  <config.icon className="size-3" />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
