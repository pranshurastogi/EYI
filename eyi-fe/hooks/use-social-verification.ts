import { useState, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useENSTextRecords, ENS_TEXT_RECORD_KEYS } from './use-ens-text-records'
import { ensLogger } from '@/lib/logger'

export interface SocialVerificationState {
  isVerifying: boolean
  isUpdatingENS: boolean
  error: Error | null
  success: boolean
}

export interface SocialVerificationResult {
  platform: 'github' | 'twitter' | 'farcaster'
  handle: string
  verified: boolean
  ensUpdated: boolean
}

/**
 * Hook to manage social platform authentication and ENS text record updates
 * @param ensName - The ENS name to update records for
 * @returns Social verification state and functions
 */
export function useSocialVerification(ensName?: string) {
  const { user, authenticated, linkGithub, linkTwitter, linkFarcaster } = usePrivy()
  const { updateTextRecord, refreshRecords } = useENSTextRecords(ensName)
  
  const [state, setState] = useState<SocialVerificationState>({
    isVerifying: false,
    isUpdatingENS: false,
    error: null,
    success: false
  })

  const resetState = useCallback(() => {
    setState({
      isVerifying: false,
      isUpdatingENS: false,
      error: null,
      success: false
    })
  }, [])

  const verifyAndUpdatePlatform = useCallback(async (
    platform: 'github' | 'twitter' | 'farcaster'
  ): Promise<SocialVerificationResult> => {
    if (!ensName) {
      throw new Error('ENS name required for verification')
    }

    setState(prev => ({ ...prev, isVerifying: true, error: null }))

    try {
      // Step 1: Authenticate with the platform
      let handle: string | null = null
      
      switch (platform) {
        case 'github':
          if (!user?.github?.username) {
            await linkGithub()
            // Wait for the user object to update
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (!user?.github?.username) {
              throw new Error('GitHub authentication failed')
            }
          }
          handle = user.github.username
          break
          
        case 'twitter':
          if (!user?.twitter?.username) {
            await linkTwitter()
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (!user?.twitter?.username) {
              throw new Error('Twitter authentication failed')
            }
          }
          handle = user.twitter.username
          break
          
        case 'farcaster':
          if (!user?.farcaster?.username) {
            await linkFarcaster()
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (!user?.farcaster?.username) {
              throw new Error('Farcaster authentication failed')
            }
          }
          handle = user.farcaster.username
          break
      }

      if (!handle) {
        throw new Error(`${platform} handle not found`)
      }

      setState(prev => ({ ...prev, isVerifying: false, isUpdatingENS: true }))

      // Step 2: Update ENS text record
      const ensKey = platform === 'github' ? ENS_TEXT_RECORD_KEYS.GITHUB :
                    platform === 'twitter' ? ENS_TEXT_RECORD_KEYS.TWITTER :
                    ENS_TEXT_RECORD_KEYS.FARCASTER

      const ensUpdated = await updateTextRecord(ensKey, handle)
      
      if (!ensUpdated) {
        throw new Error('Failed to update ENS text record')
      }

      // Step 3: Refresh records to confirm update
      await refreshRecords()

      setState(prev => ({ 
        ...prev, 
        isUpdatingENS: false, 
        success: true,
        error: null 
      }))

      ensLogger.connectionSuccess(ensName, `${platform} verified and ENS updated`)

      return {
        platform,
        handle,
        verified: true,
        ensUpdated: true
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Verification failed')
      setState(prev => ({ 
        ...prev, 
        isVerifying: false, 
        isUpdatingENS: false, 
        error: err 
      }))
      
      ensLogger.connectionFailed(ensName || '', err)
      
      return {
        platform,
        handle: '',
        verified: false,
        ensUpdated: false
      }
    }
  }, [ensName, user, linkGithub, linkTwitter, linkFarcaster, updateTextRecord, refreshRecords])

  const getPlatformStatus = useCallback((platform: 'github' | 'twitter' | 'farcaster') => {
    switch (platform) {
      case 'github':
        return {
          connected: !!user?.github?.username,
          handle: user?.github?.username || null
        }
      case 'twitter':
        return {
          connected: !!user?.twitter?.username,
          handle: user?.twitter?.username || null
        }
      case 'farcaster':
        return {
          connected: !!user?.farcaster?.username,
          handle: user?.farcaster?.username || null
        }
    }
  }, [user])

  return {
    state,
    verifyAndUpdatePlatform,
    getPlatformStatus,
    resetState
  }
}
