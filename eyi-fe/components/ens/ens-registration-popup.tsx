"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ensLogger } from "@/lib/logger"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Clock, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

interface ENSRegistrationPopupProps {
  isOpen: boolean
  onClose: () => void
  onRedirect: () => void
  address: string
  countdownSeconds?: number
}

export function ENSRegistrationPopup({
  isOpen,
  onClose,
  onRedirect,
  address,
  countdownSeconds = 3
}: ENSRegistrationPopupProps) {
  const [countdown, setCountdown] = useState(countdownSeconds)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    ensLogger.popupShown(address)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, address])

  const handleRedirect = () => {
    setIsRedirecting(true)
    ensLogger.popupRedirected(address)
    onRedirect()
  }

  const handleClose = () => {
    ensLogger.popupDismissed(address, "user_dismissed")
    onClose()
  }

  const handleSkip = () => {
    ensLogger.popupDismissed(address, "user_skipped")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-var(--eyi-primary) to-var(--eyi-mint)">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-xl font-semibold">
                  Get Your ENS Name
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Your wallet address doesn't have an ENS name yet. Get one to unlock your EYI identity!
                </DialogDescription>
              </DialogHeader>

              <Card className="mt-6 border-var(--eyi-primary)/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-var(--eyi-primary)" />
                    Auto-redirect in {countdown}s
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-var(--eyi-mint)" />
                      <span className="text-sm text-muted-foreground">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Get a memorable name like <span className="font-mono text-var(--eyi-primary)">yourname.eth</span></p>
                      <p>• Build your web3 identity</p>
                      <p>• Unlock EYI verification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex flex-col gap-3">
                <Button 
                  onClick={handleRedirect}
                  disabled={isRedirecting}
                  className="w-full bg-gradient-to-r from-var(--eyi-primary) to-var(--eyi-mint) hover:from-var(--eyi-mint) hover:to-var(--eyi-purple) border-0"
                >
                  {isRedirecting ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Redirecting...
                    </motion.div>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to ENS Website
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </Button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={handleClose}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
