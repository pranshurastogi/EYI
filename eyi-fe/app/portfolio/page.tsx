"use client"

import { useState, useEffect } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  Search,
  Filter,
  Download,
  ExternalLink,
  Clock,
  Hash,
  DollarSign,
  Fuel,
  Network,
  Shield,
  Eye,
  EyeOff
} from "lucide-react"
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview"
import { TransactionHistory } from "@/components/portfolio/transaction-history"
import { PortfolioCharts } from "@/components/portfolio/portfolio-charts"
import { PortfolioAnalytics } from "@/components/portfolio/portfolio-analytics"
import { ENSProfile } from "@/components/ens/ens-profile"
import { ENSTextRecordsSection } from "@/components/ens/ens-text-records-section"
import { usePortfolioData } from "@/hooks/use-portfolio-data"
import { useENSIntegration } from "@/hooks/use-ens-integration"

// Helper function for demo data
const generateMockTransactions = (address: string) => {
  const mockTxs = []
  const now = Date.now()
  
  for (let i = 0; i < 20; i++) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000) // One day apart
    mockTxs.push({
      network: 'eth-mainnet',
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timeStamp: Math.floor(timestamp / 1000).toString(),
      blockNumber: 18000000 + i,
      blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      nonce: i,
      transactionIndex: i,
      fromAddress: address,
      toAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      contractAddress: Math.random() > 0.5 ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
      value: (Math.random() * 0.1 * 1e18).toString(),
      cumulativeGasUsed: '21000',
      effectiveGasPrice: (20 + Math.random() * 10).toString() + '000000000', // 20-30 Gwei
      gasUsed: '21000',
      logs: [],
      internalTxns: []
    })
  }
  
  return mockTxs
}

const processPortfolioData = (transactions: any[]) => {
  const totalTransactions = transactions.length
  const totalGasUsed = transactions.reduce((sum, tx) => sum + parseInt(tx.gasUsed), 0)
  const totalGasSpent = transactions.reduce((sum, tx) => {
    const gasPrice = parseInt(tx.effectiveGasPrice)
    const gasUsed = parseInt(tx.gasUsed)
    return sum + (gasPrice * gasUsed)
  }, 0)
  
  const networks = [...new Set(transactions.map(tx => tx.network))]
  const successfulTxs = transactions.filter(tx => !tx.internalTxns.some((internal: any) => internal.error))
  const successRate = totalTransactions > 0 ? successfulTxs.length / totalTransactions : 0
  
  const averageGasPrice = totalTransactions > 0 ? 
    transactions.reduce((sum, tx) => sum + parseInt(tx.effectiveGasPrice), 0) / totalTransactions : 0

  // Count contract interactions
  const contractCounts = new Map()
  transactions.forEach(tx => {
    if (tx.contractAddress) {
      const count = contractCounts.get(tx.contractAddress) || 0
      contractCounts.set(tx.contractAddress, count + 1)
    }
  })

  const topContracts = Array.from(contractCounts.entries())
    .map(([address, count]) => ({
      address,
      name: getContractName(address),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Monthly stats
  const monthlyStats = getMonthlyStats(transactions)

  return {
    totalTransactions,
    totalGasUsed,
    totalGasSpent,
    networks,
    successRate,
    averageGasPrice,
    topContracts,
    monthlyStats
  }
}

const getContractName = (address: string): string => {
  const contractNames: Record<string, string> = {
    '0xA0b86a33E6441b8C4C8C0C4C0C4C0C4C0C4C0C4C': 'Uniswap V3',
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': 'Uniswap V2',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'UNI Token',
    '0xdAC17F958D2ee523a2206206994597C13D831ec': 'USDT',
    '0xA0b86a33E6441b8C4C8C0C4C0C4C0C4C0C4C0C4D': 'USDC',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
  }
  return contractNames[address] || `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getMonthlyStats = (transactions: any[]) => {
  const monthlyData = new Map()
  
  transactions.forEach(tx => {
    const date = new Date(parseInt(tx.timeStamp) * 1000)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    const existing = monthlyData.get(monthKey) || { transactions: 0, gasUsed: 0, volume: 0 }
    existing.transactions += 1
    existing.gasUsed += parseInt(tx.gasUsed)
    existing.volume += parseInt(tx.value)
    monthlyData.set(monthKey, existing)
  })

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export default function PortfolioPage() {
  const { user, authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  
  const connectedAddress = 
    // Prefer actively connected wallet from connectors (e.g., MetaMask)
    wallets?.[0]?.address ||
    // Fallback to the first verified/linked wallet on the user
    user?.wallet?.address ||
    (user?.linkedAccounts?.find((a: any) => a?.type === 'wallet') as any)?.address ||
    // Additional fallback for embedded wallets
    (user?.linkedAccounts?.find((a: any) => a?.address) as any)?.address ||
    undefined
  
  const {
    portfolioData,
    transactions,
    isLoading,
    error,
    refreshData,
    selectedNetwork,
    setSelectedNetwork,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery
  } = usePortfolioData(connectedAddress)

  // ENS Integration
  const {
    hasENS,
    ensName,
    isLoading: ensLoading,
    error: ensError,
  } = useENSIntegration(connectedAddress)

  const [activeTab, setActiveTab] = useState("overview")
  const [showPrivateData, setShowPrivateData] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Debug logging
  useEffect(() => {
    console.log('Portfolio Debug:', {
      authenticated,
      connectedAddress,
      user: user ? 'User exists' : 'No user',
      wallets: wallets?.length || 0,
      linkedAccounts: user?.linkedAccounts?.length || 0,
      retryCount
    })
  }, [authenticated, connectedAddress, user, wallets, retryCount])

  // Retry mechanism for wallet detection
  useEffect(() => {
    if (authenticated && !connectedAddress && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [authenticated, connectedAddress, retryCount])

  // Show loading state while checking authentication
  if (authenticated && !connectedAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading Portfolio
            </CardTitle>
            <CardDescription>
              Detecting your wallet address...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Attempt {retryCount + 1} of 3
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!authenticated || !connectedAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Portfolio Access
            </CardTitle>
            <CardDescription>
              {!authenticated 
                ? 'Please connect your wallet to view your portfolio data' 
                : retryCount >= 3 
                  ? 'Unable to detect wallet address. Please try refreshing the page or reconnecting your wallet.'
                  : 'No wallet address found. Please connect a wallet.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!authenticated ? (
              <Button className="w-full" onClick={() => login()}>
                Connect Wallet
              </Button>
            ) : (
              <>
                <Button className="w-full" onClick={() => window.location.href = '/'}>
                  Go to Home
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </>
            )}
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/" className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400" />
                  <span className="font-semibold">EYI</span>
                </a>
              </Button>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>/</span>
                <span>Portfolio</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrivateData(!showPrivateData)}
                className="gap-2"
              >
                {showPrivateData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPrivateData ? "Hide" : "Show"} Private Data
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Environment Variables Test:', {
                    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 'Set' : 'Not set',
                    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'Set' : 'Not set',
                    API_KEY: process.env.API_KEY ? 'Set' : 'Not set',
                    allEnvVars: Object.keys(process.env).filter(key => key.includes('API') || key.includes('ALCHEMY'))
                  })
                }}
                className="gap-2"
              >
                Test API Key
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Force refresh data
                  refreshData()
                }}
                className="gap-2"
              >
                Refresh Data
              </Button>
              
              <ENSProfile address={connectedAddress} size="sm" showAddress={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive view of your digital asset portfolio and transaction history
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth-mainnet">Ethereum</SelectItem>
                  <SelectItem value="base-mainnet">Base</SelectItem>
                  <SelectItem value="polygon-mainnet">Polygon</SelectItem>
                  <SelectItem value="arbitrum-mainnet">Arbitrum</SelectItem>
                  <SelectItem value="optimism-mainnet">Optimism</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">
                      {portfolioData?.totalTransactions?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gas Spent</p>
                    <p className="text-2xl font-bold">
                      {portfolioData?.totalGasUsed ? `${(portfolioData.totalGasUsed / 1e18).toFixed(4)} ETH` : "0 ETH"}
                    </p>
                  </div>
                  <Fuel className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Networks</p>
                    <p className="text-2xl font-bold">
                      {portfolioData?.networks?.length || 0}
                    </p>
                  </div>
                  <Network className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {portfolioData?.successRate ? `${(portfolioData.successRate * 100).toFixed(1)}%` : "0%"}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">Error loading portfolio data</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading portfolio data...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PortfolioOverview 
              data={portfolioData} 
              isLoading={isLoading}
              showPrivateData={showPrivateData}
            />
            
            {/* ENS Text Records Section */}
            {ensName && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ENSTextRecordsSection ensName={ensName} />
              </motion.div>
            )}
            
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionHistory 
              transactions={transactions}
              isLoading={isLoading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showPrivateData={showPrivateData}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PortfolioAnalytics 
              data={portfolioData}
              transactions={transactions}
              isLoading={isLoading}
              showPrivateData={showPrivateData}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <PortfolioCharts 
              data={portfolioData}
              transactions={transactions}
              isLoading={isLoading}
              showPrivateData={showPrivateData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
