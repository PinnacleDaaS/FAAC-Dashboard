"use client"

import { X, Filter, RotateCcw } from "lucide-react"
import { YEARS, GEOPOLITICAL_ZONES } from "@/types"
import { cn } from "@/lib/utils"

interface SideDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: string
  region: string
  month: string
  onYearChange: (value: string) => void
  onRegionChange: (value: string) => void
  onMonthChange: (value: string) => void
  onClear: () => void
}

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

export default function SideDrawer({
  open,
  onOpenChange,
  year,
  region,
  month,
  onYearChange,
  onRegionChange,
  onMonthChange,
  onClear,
}: SideDrawerProps) {
  const hasFilters = year || region || month

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-72",
          "glass border-l border-border shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
          </div>
          <div className="flex items-center gap-1">
            {hasFilters && (
              <button
                onClick={onClear}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-all"
                title="Clear all filters"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/10 hover:text-foreground md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Year</label>
            <select
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Years</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Month</label>
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Region</label>
            <select
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Regions</option>
              {Object.keys(GEOPOLITICAL_ZONES).map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  )
}
