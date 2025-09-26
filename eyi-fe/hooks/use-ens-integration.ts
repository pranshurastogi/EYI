import { useState, useEffect, useCallback } from 'react'
import { useENS } from './use-ens'
import { ensLogger } from '@/lib/logger'

interface ENSIntegrationState {
  hasENS: boolean
  ensName: string | null
  isLoading: boolean
  error: Error | null
  showPopup: boolean
  hasShownPopup: boolean
}

interface ENSIntegrationActions {
  showRegistrationPopup: () => void
  hideRegistrationPopup: () => void
  redirectToENS: () => void
}

export function useENSIntegration(address?: string): ENSIntegrationState & ENSIntegrationActions {
  const { name, isLoading, error, hasENS } = useENS(address)
  const [showPopup, setShowPopup] = useState(false)
  const [hasShownPopup, setHasShownPopup] = useState(false)

  // Show popup when wallet connects and no ENS is found
  useEffect(() => {
    if (address && !isLoading && !hasENS && !hasShownPopup) {
      // Small delay to let the UI settle after wallet connection
      const timer = setTimeout(() => {
        setShowPopup(true)
        setHasShownPopup(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [address, isLoading, hasENS, hasShownPopup])

  const showRegistrationPopup = useCallback(() => {
    if (address) {
      setShowPopup(true)
      ensLogger.popupShown(address)
    }
  }, [address])

  const hideRegistrationPopup = useCallback(() => {
    setShowPopup(false)
    if (address) {
      ensLogger.popupDismissed(address, "user_dismissed")
    }
  }, [address])

  const redirectToENS = useCallback(() => {
    if (address) {
      ensLogger.popupRedirected(address)
      // Open ENS website in new tab
      window.open('https://app.ens.domains/', '_blank', 'noopener,noreferrer')
    }
  }, [address])

  return {
    hasENS,
    ensName: name,
    isLoading,
    error,
    showPopup,
    hasShownPopup,
    showRegistrationPopup,
    hideRegistrationPopup,
    redirectToENS,
  }
}
