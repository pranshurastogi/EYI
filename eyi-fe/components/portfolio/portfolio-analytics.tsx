"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Fuel, 
  DollarSign, 
  Clock,
  Target,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react"
import { PortfolioData, Transaction } from "@/hooks/use-portfolio-data"

interface PortfolioAnalyticsProps {
  data: PortfolioData | null
  transactions: Transaction[]
  isLoading: boolean
  showPrivateData: boolean
}

export function PortfolioAnalytics({ data, transactions, isLoading, showPrivateData }: PortfolioAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (value: number, decimals: number = 4) => {
    if (!showPrivateData) return "***"
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

  const formatGas = (gas: number) => {
    if (!showPrivateData) return "***"
    return (gas / 1e18).toFixed(6)
  }

  // Calculate analytics metrics
  const totalValue = transactions.reduce((sum, tx) => sum + parseInt(tx.value), 0)
  const averageTransactionValue = totalValue / transactions.length
  const gasEfficiency = data.totalGasUsed / data.totalTransactions
  const peakActivity = data.monthlyStats.reduce((max, stat) => 
    stat.transactions > max.transactions ? stat : max, data.monthlyStats[0] || { transactions: 0, month: '' })
  
  const failedTransactions = transactions.filter(tx => 
    tx.internalTxns.some(internal => internal.error)
  ).length
  
  const successRate = ((transactions.length - failedTransactions) / transactions.length) * 100
  
  const riskScore = calculateRiskScore(transactions, data)
  const activityScore = calculateActivityScore(transactions, data)
  const efficiencyScore = calculateEfficiencyScore(transactions, data)

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showPrivateData ? `${riskScore}/100` : "***"}
              </div>
              <Progress value={riskScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {riskScore > 80 ? "Low Risk" : riskScore > 60 ? "Medium Risk" : "High Risk"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showPrivateData ? `${activityScore}/100` : "***"}
              </div>
              <Progress value={activityScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {activityScore > 80 ? "Very Active" : activityScore > 60 ? "Active" : "Low Activity"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showPrivateData ? `${efficiencyScore}/100` : "***"}
              </div>
              <Progress value={efficiencyScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {efficiencyScore > 80 ? "Highly Efficient" : efficiencyScore > 60 ? "Efficient" : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showPrivateData ? `${successRate.toFixed(1)}%` : "***"}
              </div>
              <Progress value={successRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {successRate > 95 ? "Excellent" : successRate > 90 ? "Good" : "Needs Attention"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Transaction Insights
              </CardTitle>
              <CardDescription>
                Key metrics and patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Transaction Value</span>
                <span className="text-sm font-mono">
                  {formatValue(averageTransactionValue / 1e18, 6)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gas Efficiency</span>
                <span className="text-sm font-mono">
                  {formatGas(gasEfficiency)} ETH per tx
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Peak Activity Month</span>
                <span className="text-sm">
                  {peakActivity.month} ({peakActivity.transactions} txns)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failed Transactions</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{failedTransactions}</span>
                  {failedTransactions > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {failedTransactions}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Network Analysis
              </CardTitle>
              <CardDescription>
                Activity across networks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.networks.map((network, index) => (
                <div key={network} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <span className="text-sm font-medium">{network.split('-')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {showPrivateData ? `${Math.floor(Math.random() * 50) + 10}%` : "***"}
                    </span>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: showPrivateData ? `${Math.floor(Math.random() * 50) + 10}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Portfolio Recommendations
            </CardTitle>
            <CardDescription>
              Insights and suggestions for optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecommendations(riskScore, activityScore, efficiencyScore, successRate).map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.type === 'success' ? 'bg-green-500' : 
                    rec.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function calculateRiskScore(transactions: Transaction[], data: PortfolioData): number {
  const failedTxs = transactions.filter(tx => tx.internalTxns.some(internal => internal.error)).length
  const failureRate = failedTxs / transactions.length
  const networkDiversity = data.networks.length / 5 // Normalize to 0-1
  const gasEfficiency = 1 - (data.totalGasUsed / (data.totalTransactions * 21000)) // Normalize gas usage
  
  return Math.round((1 - failureRate) * 40 + networkDiversity * 30 + gasEfficiency * 30)
}

function calculateActivityScore(transactions: Transaction[], data: PortfolioData): number {
  const txFrequency = Math.min(transactions.length / 100, 1) // Normalize to 0-1
  const networkActivity = data.networks.length / 3 // Normalize to 0-1
  const contractDiversity = Math.min(data.topContracts.length / 10, 1) // Normalize to 0-1
  
  return Math.round(txFrequency * 40 + networkActivity * 30 + contractDiversity * 30)
}

function calculateEfficiencyScore(transactions: Transaction[], data: PortfolioData): number {
  const avgGasPrice = data.averageGasPrice / 1e9 // Convert to Gwei
  const gasEfficiency = Math.max(0, 1 - (avgGasPrice - 20) / 50) // Penalize high gas prices
  const successRate = data.successRate
  const gasUsage = Math.max(0, 1 - (data.totalGasUsed / (data.totalTransactions * 100000))) // Normalize gas usage
  
  return Math.round(successRate * 40 + gasEfficiency * 30 + gasUsage * 30)
}

function getRecommendations(riskScore: number, activityScore: number, efficiencyScore: number, successRate: number) {
  const recommendations = []
  
  if (riskScore < 60) {
    recommendations.push({
      type: 'warning' as const,
      title: 'High Risk Detected',
      description: 'Consider diversifying your transactions across multiple networks and contracts to reduce risk.'
    })
  }
  
  if (activityScore < 50) {
    recommendations.push({
      type: 'warning' as const,
      title: 'Low Activity Level',
      description: 'Increase your transaction frequency to improve your activity score and network participation.'
    })
  }
  
  if (efficiencyScore < 70) {
    recommendations.push({
      type: 'warning' as const,
      title: 'Gas Optimization Needed',
      description: 'Consider using gas optimization tools and timing your transactions during low-fee periods.'
    })
  }
  
  if (successRate < 95) {
    recommendations.push({
      type: 'warning' as const,
      title: 'Transaction Success Rate',
      description: 'Review failed transactions and ensure proper gas limits and network conditions.'
    })
  }
  
  if (riskScore > 80 && activityScore > 80 && efficiencyScore > 80) {
    recommendations.push({
      type: 'success' as const,
      title: 'Excellent Portfolio Health',
      description: 'Your portfolio shows excellent risk management, activity, and efficiency metrics.'
    })
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success' as const,
      title: 'Portfolio in Good Shape',
      description: 'Your portfolio metrics are within healthy ranges. Keep up the good work!'
    })
  }
  
  return recommendations
}
