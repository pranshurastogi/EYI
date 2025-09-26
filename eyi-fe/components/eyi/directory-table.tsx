"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Megaphone, Network, Sparkles, Wrench, AlertTriangle } from "lucide-react"
import { StatusPill } from "@/components/eyi/status-pill"
import { cn } from "@/lib/utils"

type Status = "STAR" | "PARTIAL" | "NONE"

type Profile = {
  ens: string
  address: string
  status: Status
  powers: { spark: boolean; build: boolean; voice: boolean; web: boolean }
  updatedAt: string
  risk?: "homograph" | null
}

const MOCK: Profile[] = [
  {
    ens: "alice.eth",
    address: "0x1234…abcd",
    status: "STAR",
    powers: { spark: true, build: true, voice: true, web: true },
    updatedAt: "2025-09-01",
    risk: null,
  },
  {
    ens: "b0b.eth",
    address: "0x5678…ef01",
    status: "PARTIAL",
    powers: { spark: true, build: false, voice: true, web: false },
    updatedAt: "2025-08-22",
    risk: "homograph",
  },
  {
    ens: "carol.eth",
    address: "0x9abc…2345",
    status: "NONE",
    powers: { spark: false, build: false, voice: false, web: false },
    updatedAt: "2025-07-19",
    risk: null,
  },
]

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

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return MOCK
    return MOCK.filter((r) => r.ens.toLowerCase().includes(term))
  }, [q])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ENS (e.g., alice.eth)"
            aria-label="Search ENS"
            className="w-72"
          />
          <Button variant="outline" onClick={() => setQ("")} aria-label="Clear search">
            Clear
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {rows.length} of {MOCK.length}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ENS</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Powers</TableHead>
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
                      className="inline-flex items-center gap-1 text-(--destructive) text-xs"
                      title="Potential homograph risk"
                      aria-label="Potential homograph risk"
                    >
                      <AlertTriangle className="size-3.5" aria-hidden />
                      Risk
                    </span>
                  ) : (
                    <span className="sr-only">No risk detected</span>
                  )}
                  <span>{r.ens}</span>
                </div>
                <div className="text-xs text-muted-foreground md:hidden">{r.address}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{r.address}</TableCell>
              <TableCell>
                <StatusPill status={r.status} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  <PowerDot active={r.powers.spark} label="Spark" icon={<Sparkles className="size-3.5" />} />
                  <PowerDot active={r.powers.build} label="Build" icon={<Wrench className="size-3.5" />} />
                  <PowerDot active={r.powers.voice} label="Voice" icon={<Megaphone className="size-3.5" />} />
                  <PowerDot active={r.powers.web} label="Web" icon={<Network className="size-3.5" />} />
                </div>
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
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                No results. Try a different ENS.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
