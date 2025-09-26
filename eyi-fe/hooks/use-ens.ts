import { useState, useEffect, useCallback } from 'react'
import { resolveENSName, getENSAvatar } from '@/lib/ens'
import { ensLogger } from '@/lib/logger'

export interface ENSData {
  name: string | null
  avatar: string | null
  isLoading: boolean
  error: Error | null
  hasENS: boolean
}

/**
 * Custom hook to get ENS data for a given address using Privy
 * @param address - The Ethereum address to resolve ENS for
 * @returns ENS data including name, avatar, and loading states
 */
export function useENS(address?: string): ENSData {
  const [name, setName] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resolveENS = useCallback(async () => {
    if (!address) {
      setName(null)
      setAvatar(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      ensLogger.connectionAttempt(address)
      
      // Resolve ENS name using public RPC (no wallet needed)
      const ensName = await resolveENSName(address)
      setName(ensName)

      if (ensName) {
        ensLogger.connectionSuccess(address, ensName)
        
        // Get avatar if name exists
        const ensAvatar = await getENSAvatar(ensName)
        setAvatar(ensAvatar)
      } else {
        ensLogger.noENSFound(address)
        setAvatar(null)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resolve ENS')
      setError(error)
      ensLogger.connectionFailed(address, error)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    resolveENS()
  }, [resolveENS])

  const hasENS = !!name && name.length > 0

  return {
    name,
    avatar,
    isLoading,
    error,
    hasENS,
  }
}

/**
 * Hook to check if an address has an ENS name
 * @param address - The Ethereum address to check
 * @returns boolean indicating if the address has an ENS name
 */
export function useHasENS(address?: string): boolean {
  const { hasENS } = useENS(address)
  return hasENS
}

/**
 * Hook to get ENS name for an address (lightweight version)
 * @param address - The Ethereum address to resolve
 * @returns ENS name or null
 */
export function useENSName(address?: string): string | null {
  const { name } = useENS(address)
  return name
}
