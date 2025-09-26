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
  Network, 
  Shield, 
  Clock,
  Hash,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { PortfolioData } from "@/hooks/use-portfolio-data"

interface PortfolioOverviewProps {
  data: PortfolioData | null
  isLoading: boolean
  showPrivateData: boolean
}

export function PortfolioOverview({ data, isLoading, showPrivateData }: PortfolioOverviewProps) {
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
          <p className="text-muted-foreground">No portfolio data available</p>
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

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatValue(data.totalTransactions, 0)}</div>
              <p className="text-xs text-muted-foreground">
                Across {data.networks.length} network{data.networks.length !== 1 ? 's' : ''}
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
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showPrivateData ? `${(data.successRate * 100).toFixed(1)}%` : "***"}
              </div>
              <Progress value={data.successRate * 100} className="mt-2" />
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
              <CardTitle className="text-sm font-medium">Gas Used</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatGas(data.totalGasUsed)} ETH</div>
              <p className="text-xs text-muted-foreground">
                Avg: {showPrivateData ? `${(data.averageGasPrice / 1e9).toFixed(2)} Gwei` : "***"}
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
              <CardTitle className="text-sm font-medium">Networks</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.networks.length}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {data.networks.map((network) => (
                  <Badge key={network} variant="secondary" className="text-xs">
                    {network.split('-')[0]}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Contracts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Contract Interactions
            </CardTitle>
            <CardDescription>
              Most frequently interacted with contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topContracts.slice(0, 5).map((contract, index) => (
                <div key={contract.address} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {showPrivateData ? contract.address : "***"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{contract.count} txns</Badge>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(contract.count / data.topContracts[0]?.count) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Monthly Activity
            </CardTitle>
            <CardDescription>
              Transaction activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.monthlyStats.slice(-6).map((stat, index) => (
                <div key={stat.month} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{stat.month}</p>
                    <p className="text-sm text-muted-foreground">
                      {showPrivateData ? `${stat.transactions} transactions` : "*** transactions"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {showPrivateData ? `${(stat.gasUsed / 1e18).toFixed(4)} ETH` : "*** ETH"}
                      </p>
                      <p className="text-xs text-muted-foreground">Gas used</p>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(stat.transactions / Math.max(...data.monthlyStats.map(s => s.transactions))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Network Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Distribution
            </CardTitle>
            <CardDescription>
              Activity across different networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.networks.map((network, index) => (
                <div key={network} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {network.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium">{network.split('-')[0]}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {network.split('-')[1]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
