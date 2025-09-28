"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Megaphone, Network, Sparkles, Wrench, AlertTriangle, Crown, Shield, Star } from "lucide-react"
import { StatusPill } from "@/components/eyi/status-pill"
import { cn } from "@/lib/utils"
import vipUsers from "@/lib/vip-users.json"

type Status = "STAR" | "PARTIAL" | "NONE"

type Profile = {
  ens: string
  address: string
  status: Status
  powers: { spark: boolean; build: boolean; voice: boolean; web: boolean }
  updatedAt: string
  risk?: "homograph" | null
  vipLevel?: "legendary" | "premium" | "standard"
  description?: string
  socialVerified?: boolean
  domainVerified?: boolean
}

// Enhanced homograph detection function
function detectHomographRisk(ens: string): boolean {
  // Check for Cyrillic characters that look like Latin
  const cyrillicToLatin = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y',
    'і': 'i', 'і': 'i', 'і': 'i', 'і': 'i', 'і': 'i', 'і': 'i', 'і': 'i'
  }
  
  // Check for mixed scripts
  const hasCyrillic = /[\u0400-\u04FF]/.test(ens)
  const hasLatin = /[a-zA-Z]/.test(ens)
  
  if (hasCyrillic && hasLatin) return true
  
  // Check for zero-width characters
  if (/[\u200B-\u200D\uFEFF]/.test(ens)) return true
  
  // Check for lookalike characters
  const suspiciousChars = /[а-я]/i
  if (suspiciousChars.test(ens)) return true
  
  return false
}

// Enhanced VIP level indicator
function VipLevelIndicator({ vipLevel }: { vipLevel?: string }) {
  if (!vipLevel) return null
  
  const getIcon = () => {
    switch (vipLevel) {
      case "legendary": return <Crown className="size-3.5 text-yellow-500" />
      case "premium": return <Star className="size-3.5 text-blue-500" />
      default: return null
    }
  }
  
  const getColor = () => {
    switch (vipLevel) {
      case "legendary": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "premium": return "text-blue-600 bg-blue-50 border-blue-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border",
      getColor()
    )}>
      {getIcon()}
      {vipLevel.toUpperCase()}
    </span>
  )
}

function PowerDot({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border",
        active ? "text-(--eyi-mint) border-(--eyi-mint)/40" : "text-(--eyi-slate) border-(--eyi-slate)/30",
      )}
      aria-label={`${label} ${active ? "active" : "inactive"}`}
      title={label}
    >
      {icon}
      {label}
    </span>
  )
}

export function DirectoryTable() {
  const [q, setQ] = useState("")
  const [showOnlyVip, setShowOnlyVip] = useState(false)
  const [showOnlyRisky, setShowOnlyRisky] = useState(false)

  // Enhanced data with homograph detection
  const enhancedData = useMemo(() => {
    return vipUsers.map((user) => ({
      ...user,
      risk: user.risk || (detectHomographRisk(user.ens) ? "homograph" : null)
    }))
  }, [])

  const rows = useMemo(() => {
    let filtered = enhancedData
    
    const term = q.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter((r) => 
        r.ens.toLowerCase().includes(term) || 
        r.description?.toLowerCase().includes(term) ||
        r.address.toLowerCase().includes(term)
      )
    }
    
    if (showOnlyVip) {
      filtered = filtered.filter((r) => r.vipLevel === "legendary" || r.vipLevel === "premium")
    }
    
    if (showOnlyRisky) {
      filtered = filtered.filter((r) => r.risk === "homograph")
    }
    
    return filtered
  }, [q, showOnlyVip, showOnlyRisky, enhancedData])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ENS, description, or address"
            aria-label="Search"
            className="w-72"
          />
          <Button variant="outline" onClick={() => setQ("")} aria-label="Clear search">
            Clear
          </Button>
          <Button 
            variant={showOnlyVip ? "default" : "outline"} 
            onClick={() => setShowOnlyVip(!showOnlyVip)}
            size="sm"
          >
            <Crown className="size-3.5 mr-1" />
            VIP Only
          </Button>
          <Button 
            variant={showOnlyRisky ? "destructive" : "outline"} 
            onClick={() => setShowOnlyRisky(!showOnlyRisky)}
            size="sm"
          >
            <AlertTriangle className="size-3.5 mr-1" />
            Risky
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {rows.length} of {enhancedData.length}
          {showOnlyVip && " (VIP only)"}
          {showOnlyRisky && " (Risky only)"}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ENS</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>VIP Level</TableHead>
            <TableHead>Powers</TableHead>
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead className="hidden md:table-cell">Last updated</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.ens}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {r.risk === "homograph" ? (
                    <span
                      className="inline-flex items-center gap-1 text-red-600 text-xs"
                      title="Potential homograph risk - characters may look similar but are different"
                      aria-label="Potential homograph risk"
                    >
                      <AlertTriangle className="size-3.5" aria-hidden />
                      Risk
                    </span>
                  ) : (
                    <span className="sr-only">No risk detected</span>
                  )}
                  <span className={cn(r.risk === "homograph" && "text-red-600")}>{r.ens}</span>
                </div>
                <div className="text-xs text-muted-foreground md:hidden">{r.address}</div>
                <div className="text-xs text-muted-foreground lg:hidden">{r.description}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{r.address}</TableCell>
              <TableCell>
                <StatusPill status={r.status} />
              </TableCell>
              <TableCell>
                <VipLevelIndicator vipLevel={r.vipLevel} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  <PowerDot active={r.powers.spark} label="Spark" icon={<Sparkles className="size-3.5" />} />
                  <PowerDot active={r.powers.build} label="Build" icon={<Wrench className="size-3.5" />} />
                  <PowerDot active={r.powers.voice} label="Voice" icon={<Megaphone className="size-3.5" />} />
                  <PowerDot active={r.powers.web} label="Web" icon={<Network className="size-3.5" />} />
                </div>
                <div className="flex gap-2 mt-1">
                  {r.socialVerified && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Shield className="size-3" />
                      Social
                    </span>
                  )}
                  {r.domainVerified && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <Shield className="size-3" />
                      Domain
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                {r.description}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{r.updatedAt}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/profile/${r.ens}`} aria-label={`View profile ${r.ens}`}>
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                No results found. Try adjusting your search or filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
