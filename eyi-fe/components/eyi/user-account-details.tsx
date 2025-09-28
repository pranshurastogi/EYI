"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Crown, Star, AlertTriangle, CheckCircle, XCircle, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useENSIntegration } from "@/hooks/use-ens-integration"
import { usePortfolioData } from "@/hooks/use-portfolio-data"
import { useEffect, useState } from "react"

type UserAccount = {
  ens: string | null
  address: string
  status: "STAR" | "PARTIAL" | "NONE"
  powers: { spark: boolean; build: boolean; voice: boolean; web: boolean }
  vipLevel?: "legendary" | "premium" | "standard"
  socialVerified: boolean
  domainVerified: boolean
  risk?: "homograph" | null
  description?: string
  joinedAt: string
  lastActive: string
  totalTransactions: number
  reputation: number
}

export function UserAccountDetails() {
  const { user, authenticated, ready } = usePrivy()
  const { wallets } = useWallets()
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null)

  // Get connected wallet address
  const connectedAddress = authenticated
    ? (wallets?.[0]?.address || user?.wallet?.address || 
       (user?.linkedAccounts?.find((a: any) => a?.type === 'wallet') as any)?.address)
    : undefined

  // ENS Integration
  const { hasENS, ensName, isLoading: ensLoading } = useENSIntegration(connectedAddress)
  
  // Portfolio Data
  const { portfolioData, isLoading: portfolioLoading } = usePortfolioData(connectedAddress)

  // Social verification status
  const buildLinked = !!user?.github?.username
  const voiceLinked = !!user?.twitter?.username
  const webLinked = !!user?.farcaster?.username

  // Build user account data from real wallet data
  useEffect(() => {
    if (!connectedAddress) {
      setUserAccount(null)
      return
    }

    const powers = {
      spark: hasENS,
      build: buildLinked,
      voice: voiceLinked,
      web: webLinked
    }

    const activePowers = Object.values(powers).filter(Boolean).length
    const status = activePowers === 4 ? "STAR" : activePowers > 0 ? "PARTIAL" : "NONE"
    
    // Calculate reputation based on activity
    const transactionCount = portfolioData?.totalTransactions || 0
    const reputation = Math.min(100, Math.floor(transactionCount / 10) + (activePowers * 20))

    // Determine VIP level based on activity and connections
    let vipLevel: "legendary" | "premium" | "standard" = "standard"
    if (transactionCount > 1000 && activePowers === 4) vipLevel = "legendary"
    else if (transactionCount > 100 || activePowers >= 3) vipLevel = "premium"

    // Generate description based on connections
    let description = "Web3 User"
    if (buildLinked && voiceLinked && webLinked) description = "Full-Stack Web3 Developer"
    else if (buildLinked && voiceLinked) description = "Developer & Content Creator"
    else if (buildLinked) description = "Blockchain Developer"
    else if (voiceLinked) description = "Web3 Content Creator"
    else if (webLinked) description = "Decentralized Social User"

    const account: UserAccount = {
      ens: ensName,
      address: connectedAddress,
      status,
      powers,
      vipLevel,
      socialVerified: voiceLinked,
      domainVerified: hasENS,
      risk: null, // Could implement homograph detection here
      description,
      joinedAt: new Date(Date.now() - (transactionCount * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      totalTransactions: transactionCount,
      reputation
    }

    setUserAccount(account)
  }, [connectedAddress, hasENS, ensName, buildLinked, voiceLinked, webLinked, portfolioData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "STAR": return "bg-green-100 text-green-800 border-green-200"
      case "PARTIAL": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "NONE": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getVipLevelIcon = (vipLevel?: string) => {
    switch (vipLevel) {
      case "legendary": return <Crown className="size-4 text-yellow-500" />
      case "premium": return <Star className="size-4 text-blue-500" />
      default: return null
    }
  }

  const getVipLevelColor = (vipLevel?: string) => {
    switch (vipLevel) {
      case "legendary": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "premium": return "bg-blue-50 text-blue-700 border-blue-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Show loading state
  if (!ready) {
    return (
      <Card className="eyi-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show connect wallet state
  if (!authenticated || !userAccount) {
    return (
      <Card className="eyi-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to view your account details and join the EYI directory.
          </p>
          <Button className="w-full">
            <Wallet className="size-4 mr-2" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="eyi-glass">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src="/placeholder-user.jpg" alt={userAccount.ens || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {userAccount.ens ? userAccount.ens.split('.')[0].slice(0, 2).toUpperCase() : 
                 userAccount.address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {userAccount.ens || `${userAccount.address.slice(0, 6)}...${userAccount.address.slice(-4)}`}
                {userAccount.risk === "homograph" && (
                  <AlertTriangle className="size-4 text-red-500" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{userAccount.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={cn("text-xs", getStatusColor(userAccount.status))}>
              {userAccount.status}
            </Badge>
            {userAccount.vipLevel && (
              <Badge className={cn("text-xs flex items-center gap-1", getVipLevelColor(userAccount.vipLevel))}>
                {getVipLevelIcon(userAccount.vipLevel)}
                {userAccount.vipLevel.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{userAccount.reputation}</div>
            <div className="text-xs text-muted-foreground">Reputation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{userAccount.totalTransactions.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {userAccount.powers.spark && userAccount.powers.build && userAccount.powers.voice && userAccount.powers.web ? "4" : 
               Object.values(userAccount.powers).filter(Boolean).length}
            </div>
            <div className="text-xs text-muted-foreground">Powers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {[userAccount.socialVerified, userAccount.domainVerified].filter(Boolean).length}
            </div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification Status</span>
            <div className="flex gap-2">
              {userAccount.socialVerified ? (
                <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200">
                  <CheckCircle className="size-3 mr-1" />
                  Social
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">
                  <XCircle className="size-3 mr-1" />
                  Social
                </Badge>
              )}
              {userAccount.domainVerified ? (
                <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200">
                  <CheckCircle className="size-3 mr-1" />
                  Domain
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">
                  <XCircle className="size-3 mr-1" />
                  Domain
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Powers</span>
            <div className="flex gap-1">
              {Object.entries(userAccount.powers).map(([power, active]) => (
                <Badge 
                  key={power}
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "text-xs",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {power.charAt(0).toUpperCase() + power.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Address:</span>
              <div className="font-mono text-xs">{userAccount.address}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Joined:</span>
              <div>{new Date(userAccount.joinedAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline">
              <Shield className="size-3 mr-1" />
              Verify Identity
            </Button>
            <Button size="sm" variant="outline">
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
