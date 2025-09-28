import { useState, useEffect, useCallback } from 'react'
import { getENSTextRecords, setENSTextRecord, setENSTextRecordWithSigner, buildSetTextTransaction } from '@/lib/ens'
import { ensLogger } from '@/lib/logger'
import { usePrivy } from '@privy-io/react-auth'
import { ethers } from 'ethers'

// Standard ENS text record keys for social platforms
export const ENS_TEXT_RECORD_KEYS = {
  GITHUB: 'com.github',
  TWITTER: 'com.twitter', 
  FARCASTER: 'com.farcaster',
  URL: 'url',
  DESCRIPTION: 'description',
  AVATAR: 'avatar'
} as const

export interface ENSTextRecord {
  key: string
  value: string | null
  verified: boolean
}

export interface ENSTextRecordsData {
  records: Record<string, ENSTextRecord>
  isLoading: boolean
  error: Error | null
  hasRecords: boolean
}

/**
 * Custom hook to manage ENS text records for a given ENS name
 * @param ensName - The ENS name to fetch text records for
 * @param wallet - Optional wallet connection for setting records
 * @returns ENS text records data and management functions
 */
export function useENSTextRecords(ensName?: string, wallet?: any): ENSTextRecordsData & {
  updateTextRecord: (key: string, value: string) => Promise<boolean>
  refreshRecords: () => Promise<void>
} {
  const [records, setRecords] = useState<Record<string, ENSTextRecord>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTextRecords = useCallback(async () => {
    if (!ensName) {
      setRecords({})
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      ensLogger.connectionAttempt(ensName)
      
      // Fetch all standard text records
      const keys = Object.values(ENS_TEXT_RECORD_KEYS)
      const textRecords = await getENSTextRecords(ensName, keys)
      
      // Transform to our format
      const transformedRecords: Record<string, ENSTextRecord> = {}
      keys.forEach(key => {
        const value = textRecords[key]
        transformedRecords[key] = {
          key,
          value,
          verified: !!value // Consider verified if has a value
        }
      })
      
      setRecords(transformedRecords)
      ensLogger.connectionSuccess(ensName, 'text records fetched')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch ENS text records')
      setError(error)
      ensLogger.connectionFailed(ensName, error)
    } finally {
      setIsLoading(false)
    }
  }, [ensName])

  const { sendTransaction, authenticated, ready, user } = usePrivy()

  const updateTextRecord = useCallback(async (key: string, value: string): Promise<boolean> => {
    if (!ensName) {
      console.error('ENS name required to update text records')
      return false
    }

    try {
      let success = false

      if (wallet) {
        // Path 1: explicit wallet provided (ethers.js Wallet)
        success = await setENSTextRecord(ensName, key, value, wallet)
      } else {
        // Path 2: try Privy embedded wallet first
        try {
          const { to, data } = await buildSetTextTransaction(ensName, key, value)
          // chainId 1 (Ethereum mainnet) for ENS
          await sendTransaction({ to, data, chainId: 1 })
          success = true
        } catch (e) {
          // Path 3: fallback to injected browser wallet (e.g., MetaMask)
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
              const provider = new ethers.BrowserProvider((window as any).ethereum)
              const signer = await provider.getSigner()
              success = await setENSTextRecordWithSigner(ensName, key, value, signer)
            } catch (ie) {
              console.error('Injected wallet update failed:', ie)
              success = false
            }
          } else {
            success = false
          }
        }
      }

      if (success) {
        // Update local state immediately
        setRecords(prev => ({
          ...prev,
          [key]: {
            key,
            value,
            verified: true
          }
        }))
        ensLogger.connectionSuccess(ensName, `text record ${key} updated`)
      }

      return success
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update ENS text record')
      setError(error)
      ensLogger.connectionFailed(ensName, error)
      return false
    }
  }, [ensName, wallet, sendTransaction])

  const refreshRecords = useCallback(async () => {
    await fetchTextRecords()
  }, [fetchTextRecords])

  useEffect(() => {
    fetchTextRecords()
  }, [fetchTextRecords])

  const hasRecords = Object.values(records).some(record => record.verified)

  return {
    records,
    isLoading,
    error,
    hasRecords,
    updateTextRecord,
    refreshRecords
  }
}

/**
 * Hook to get specific text record for a platform
 * @param ensName - The ENS name
 * @param platform - The platform key (github, twitter, farcaster)
 * @returns The text record for the platform
 */
export function usePlatformTextRecord(ensName?: string, platform: 'github' | 'twitter' | 'farcaster' = 'github') {
  const { records, isLoading, error } = useENSTextRecords(ensName)
  
  const platformKey = platform === 'github' ? ENS_TEXT_RECORD_KEYS.GITHUB :
                     platform === 'twitter' ? ENS_TEXT_RECORD_KEYS.TWITTER :
                     ENS_TEXT_RECORD_KEYS.FARCASTER
  
  return {
    record: records[platformKey],
    isLoading,
    error,
    hasRecord: !!records[platformKey]?.verified
  }
}
