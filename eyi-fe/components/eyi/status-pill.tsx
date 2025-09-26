"use client"
import { cn } from "@/lib/utils"

type Status = "STAR" | "PARTIAL" | "NONE"

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const styles: Record<Status, string> = {
    STAR: "text-(--eyi-mint) border-(--eyi-mint)/40",
    PARTIAL: "text-(--eyi-primary) border-(--eyi-primary)/40",
    NONE: "text-(--eyi-slate) border-(--eyi-slate)/40",
  }
  const label: Record<Status, string> = {
    STAR: "EYI-STAR",
    PARTIAL: "PARTIAL",
    NONE: "NONE",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
        styles[status],
        className,
      )}
      aria-label={`Status ${label[status]}`}
    >
      {label[status]}
    </span>
  )
}
