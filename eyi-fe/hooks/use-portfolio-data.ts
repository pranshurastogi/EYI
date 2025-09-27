import { useState, useEffect, useCallback } from 'react'

export interface Transaction {
  network: string
  hash: string
  timeStamp: string
  blockNumber: number
  blockHash: string
  nonce: number
  transactionIndex: number
  fromAddress: string
  toAddress: string
  contractAddress?: string
  value: string
  cumulativeGasUsed: string
  effectiveGasPrice: string
  gasUsed: string
  logs: Array<{
    contractAddress: string
    logIndex: string
    data: string
    removed: boolean
    topics: string[]
  }>
  internalTxns: Array<{
    type: string
    fromAddress: string
    toAddress: string
    value: string
    gas: string
    gasUsed: string
    input: string
    output: string
    error?: string
    revertReason?: string
  }>
}

export interface PortfolioData {
  totalTransactions: number
  totalGasUsed: number
  totalGasSpent: number
  networks: string[]
  successRate: number
  averageGasPrice: number
  topContracts: Array<{
    address: string
    name: string
    count: number
  }>
  monthlyStats: Array<{
    month: string
    transactions: number
    gasUsed: number
    volume: number
  }>
}

export interface AlchemyResponse {
  transactions: Transaction[]
  before?: string
  after?: string
  totalCount: number
}

export function usePortfolioData(address?: string) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState('eth-mainnet')
  const [dateRange, setDateRange] = useState('30d')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTransactions = useCallback(async (address: string, network: string, limit: number = 25) => {
    // Try multiple possible environment variable names
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 
                   process.env.NEXT_PUBLIC_API_KEY || 
                   process.env.API_KEY ||
                   (typeof window !== 'undefined' ? (window as any).ALCHEMY_API_KEY : undefined)
    
    // Debug logging
    console.log('API Key Debug:', {
      NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 'Set' : 'Not set',
      NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'Set' : 'Not set',
      API_KEY: process.env.API_KEY ? 'Set' : 'Not set',
      windowKey: typeof window !== 'undefined' ? ((window as any).ALCHEMY_API_KEY ? 'Set' : 'Not set') : 'N/A',
      finalApiKey: apiKey ? 'Found' : 'Not found',
      allEnvVars: Object.keys(process.env).filter(key => key.includes('API') || key.includes('ALCHEMY'))
    })
    
    if (!apiKey) {
      throw new Error('Alchemy API key not configured. Please set NEXT_PUBLIC_ALCHEMY_API_KEY or API_KEY in your environment variables.')
    }

    // Validate API key format
    if (!apiKey.startsWith('alcht_') && !apiKey.startsWith('demo')) {
      console.warn('API key format may be incorrect. Alchemy API keys typically start with "alcht_"')
    }

    const requestBody = {
      addresses: [
        {
          address: address,
          networks: [network]
        }
      ],
      limit
    }

    console.log('API Request Debug:', {
      url: `https://api.g.alchemy.com/data/v1/${apiKey}/transactions/history/by-address`,
      method: 'POST',
      body: requestBody,
      address,
      network
    })

    const response = await fetch(`https://api.g.alchemy.com/data/v1/${apiKey}/transactions/history/by-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('API Response Debug:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json() as Promise<AlchemyResponse>
  }, [])

  const processPortfolioData = useCallback((transactions: Transaction[]): PortfolioData => {
    const totalTransactions = transactions.length
    const totalGasUsed = transactions.reduce((sum, tx) => sum + parseInt(tx.gasUsed), 0)
    const totalGasSpent = transactions.reduce((sum, tx) => {
      const gasPrice = parseInt(tx.effectiveGasPrice)
      const gasUsed = parseInt(tx.gasUsed)
      return sum + (gasPrice * gasUsed)
    }, 0)
    
    const networks = [...new Set(transactions.map(tx => tx.network))]
    const successfulTxs = transactions.filter(tx => !tx.internalTxns.some(internal => internal.error))
    const successRate = totalTransactions > 0 ? successfulTxs.length / totalTransactions : 0
    
    const averageGasPrice = totalTransactions > 0 ? 
      transactions.reduce((sum, tx) => sum + parseInt(tx.effectiveGasPrice), 0) / totalTransactions : 0

    // Count contract interactions
    const contractCounts = new Map<string, number>()
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
  }, [])

  const getContractName = (address: string): string => {
    // Common contract addresses mapping
    const contractNames: Record<string, string> = {
      '0xA0b86a33E6441b8C4C8C0C4C0C4C0C4C0C4C0C4C': 'Uniswap V3',
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': 'Uniswap V2',
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'UNI Token',
      '0xdAC17F958D2ee523a2206206994597C13D831ec': 'USDT',
      '0xA0b86a33E6441b8C4C8C0C4C0C4C0C4C0C4C0C4C': 'USDC',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
    }
    return contractNames[address] || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getMonthlyStats = (transactions: Transaction[]) => {
    const monthlyData = new Map<string, { transactions: number, gasUsed: number, volume: number }>()
    
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

  const refreshData = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchTransactions(address, selectedNetwork, 25)
      console.log('API Response:', response)
      console.log('Transaction count:', response.transactions?.length || 0)
      
      setTransactions(response.transactions)
      
      const processedData = processPortfolioData(response.transactions)
      console.log('Processed portfolio data:', processedData)
      setPortfolioData(processedData)
      
      // If no transactions found, show a message
      if (!response.transactions || response.transactions.length === 0) {
        console.log('No transactions found for this address')
        setError('No transactions found for this address. Try a different network or check if the address has transaction history.')
      }
    } catch (err) {
      console.error('Portfolio data fetch error:', err)
      
      // If API key is not configured, show mock data for demo purposes
      if (err instanceof Error && err.message.includes('API key not configured')) {
        const mockTransactions = generateMockTransactions(address)
        setTransactions(mockTransactions)
        const processedData = processPortfolioData(mockTransactions)
        setPortfolioData(processedData)
        setError('Demo mode: Using mock data. Please set API_KEY in your .env.local file and restart the dev server.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data')
      }
    } finally {
      setIsLoading(false)
    }
  }, [address, selectedNetwork, fetchTransactions, processPortfolioData])

  const generateMockTransactions = (address: string): Transaction[] => {
    const mockTxs: Transaction[] = []
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

  // Auto-fetch when address or network changes
  useEffect(() => {
    if (address) {
      refreshData()
    }
  }, [address, selectedNetwork, refreshData])

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      tx.hash.toLowerCase().includes(query) ||
      tx.fromAddress.toLowerCase().includes(query) ||
      tx.toAddress.toLowerCase().includes(query) ||
      (tx.contractAddress && tx.contractAddress.toLowerCase().includes(query))
    )
  })

  return {
    portfolioData,
    transactions: filteredTransactions,
    isLoading,
    error,
    refreshData,
    selectedNetwork,
    setSelectedNetwork,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery
  }
}
