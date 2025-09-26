"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Fuel,
  DollarSign,
  Calendar,
  Target
} from "lucide-react"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts"
import { PortfolioData, Transaction } from "@/hooks/use-portfolio-data"

interface PortfolioChartsProps {
  data: PortfolioData | null
  transactions: Transaction[]
  isLoading: boolean
  showPrivateData: boolean
}

export function PortfolioCharts({ data, transactions, isLoading, showPrivateData }: PortfolioChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded" />
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
          <p className="text-muted-foreground">No chart data available</p>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (value: number) => {
    if (!showPrivateData) return "***"
    return value.toLocaleString()
  }

  // Prepare data for charts
  const monthlyData = data.monthlyStats.map(stat => ({
    month: stat.month,
    transactions: showPrivateData ? stat.transactions : 0,
    gasUsed: showPrivateData ? (stat.gasUsed / 1e18) : 0,
    volume: showPrivateData ? (stat.volume / 1e18) : 0
  }))

  const networkData = data.networks.map(network => ({
    name: network.split('-')[0],
    value: showPrivateData ? Math.floor(Math.random() * 100) + 10 : 0, // Mock data for demo
    color: getNetworkColor(network)
  }))

  const contractData = data.topContracts.slice(0, 8).map(contract => ({
    name: contract.name,
    interactions: showPrivateData ? contract.count : 0,
    address: contract.address
  }))

  // Transaction timeline data
  const timelineData = transactions.slice(0, 30).map((tx, index) => ({
    index: index + 1,
    timestamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString(),
    value: showPrivateData ? (parseInt(tx.value) / 1e18) : 0,
    gasUsed: showPrivateData ? parseInt(tx.gasUsed) : 0,
    success: !tx.internalTxns.some(internal => internal.error)
  }))

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#84cc16', '#f97316']

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="networks" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Networks
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Contracts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Monthly Transaction Volume
                  </CardTitle>
                  <CardDescription>
                    Transaction count over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [showPrivateData ? value : "***", "Transactions"]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="transactions" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Gas Usage Trend
                  </CardTitle>
                  <CardDescription>
                    Gas consumption over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [showPrivateData ? `${value.toFixed(4)} ETH` : "***", "Gas Used"]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="gasUsed" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Transaction Timeline
                </CardTitle>
                <CardDescription>
                  Recent transaction activity and value flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        showPrivateData ? (name === 'value' ? `${value.toFixed(6)} ETH` : value.toLocaleString()) : "***", 
                        name === 'value' ? 'Value (ETH)' : 'Gas Used'
                      ]}
                      labelFormatter={(label) => `Transaction #${label}`}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="gasUsed" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="networks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Network Distribution
                  </CardTitle>
                  <CardDescription>
                    Activity across different networks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip 
                        formatter={(value: any) => [showPrivateData ? value : "***", "Transactions"]}
                      />
                      <RechartsPieChart
                        data={networkData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string, percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {networkData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Network Activity
                  </CardTitle>
                  <CardDescription>
                    Transaction volume by network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={networkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [showPrivateData ? value : "***", "Transactions"]}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Contract Interactions
                </CardTitle>
                <CardDescription>
                  Most frequently interacted with contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={contractData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip 
                      formatter={(value: any) => [showPrivateData ? value : "***", "Interactions"]}
                      labelFormatter={(label) => `Contract: ${label}`}
                    />
                    <Bar dataKey="interactions" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getNetworkColor(network: string): string {
  const colors: Record<string, string> = {
    'eth-mainnet': '#627eea',
    'base-mainnet': '#0052ff',
    'polygon-mainnet': '#8247e5',
    'arbitrum-mainnet': '#28a0f0',
    'optimism-mainnet': '#ff0420'
  }
  return colors[network] || '#6b7280'
}
