"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  Hash, 
  ArrowUpRight, 
  ArrowDownRight,
  Fuel,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react"
import { Transaction } from "@/hooks/use-portfolio-data"

interface TransactionHistoryProps {
  transactions: Transaction[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  showPrivateData: boolean
}

export function TransactionHistory({ 
  transactions, 
  isLoading, 
  searchQuery, 
  setSearchQuery, 
  showPrivateData 
}: TransactionHistoryProps) {
  const [sortBy, setSortBy] = useState<'timestamp' | 'value' | 'gas'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const formatAddress = (address: string) => {
    if (!showPrivateData) return "***"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatValue = (value: string) => {
    if (!showPrivateData) return "***"
    const ethValue = parseInt(value) / 1e18
    return ethValue.toFixed(6)
  }

  const formatGas = (gas: string) => {
    if (!showPrivateData) return "***"
    return parseInt(gas).toLocaleString()
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleString()
  }

  const getTransactionStatus = (tx: Transaction) => {
    const hasErrors = tx.internalTxns.some(internal => internal.error)
    return hasErrors ? 'failed' : 'success'
  }

  const getTransactionType = (tx: Transaction) => {
    if (tx.contractAddress) return 'Contract'
    if (parseInt(tx.value) > 0) return 'Transfer'
    return 'Other'
  }

  const filteredTransactions = transactions
    .filter(tx => {
      if (filterStatus === 'success') return getTransactionStatus(tx) === 'success'
      if (filterStatus === 'failed') return getTransactionStatus(tx) === 'failed'
      return true
    })
    .sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortBy) {
        case 'timestamp':
          aValue = parseInt(a.timeStamp)
          bValue = parseInt(b.timeStamp)
          break
        case 'value':
          aValue = parseInt(a.value)
          bValue = parseInt(b.value)
          break
        case 'gas':
          aValue = parseInt(a.gasUsed)
          bValue = parseInt(b.gasUsed)
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (column: 'timestamp' | 'value' | 'gas') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by hash, address, or contract..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Transaction Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Type</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                      {sortBy === 'timestamp' && (
                        sortOrder === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Value
                      {sortBy === 'value' && (
                        sortOrder === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('gas')}
                  >
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      Gas
                      {sortBy === 'gas' && (
                        sortOrder === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((tx) => {
                  const status = getTransactionStatus(tx)
                  const type = getTransactionType(tx)
                  
                  return (
                    <motion.tr
                      key={tx.hash}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <Badge variant={type === 'Contract' ? 'default' : type === 'Transfer' ? 'secondary' : 'outline'}>
                          {type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatTimestamp(tx.timeStamp)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Block #{tx.blockNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <code className="text-xs font-mono">
                            {showPrivateData ? `${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}` : "***"}
                          </code>
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                          >
                            <a
                              href={`https://etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="View on Etherscan"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono">
                          {formatAddress(tx.fromAddress)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono">
                          {formatAddress(tx.toAddress)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatValue(tx.value)} ETH
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatGas(tx.gasUsed)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {showPrivateData ? `${(parseInt(tx.effectiveGasPrice) / 1e9).toFixed(2)} Gwei` : "***"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={status === 'success' ? 'default' : 'destructive'}
                          className="gap-1"
                        >
                          {status === 'success' ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {status}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
