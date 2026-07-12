"use client"

import { useMemo, useState, useCallback } from "react"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import type { StateComposition } from "@/types"
import { GEOPOLITICAL_ZONES, getDependencyLabel, getDependencyColor } from "@/types"

interface DataExplorerProps {
  data: StateComposition[]
  year: string
  region: string
  month: string
}

const PAGE_SIZE = 10

function formatNaira(value: number): string {
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`
  return `₦${value.toLocaleString()}`
}

export default function DataExplorer({ data, year, region, month }: DataExplorerProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string>("faac")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        return prev
      }
      setSortDir("desc")
      return key
    })
    setPage(0)
  }, [])

  const filtered = useMemo(() => {
    let items = [...data]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((d) => d.state.toLowerCase().includes(q))
    }
    items.sort((a, b) => {
      const aVal = a[sortKey as keyof StateComposition] ?? 0
      const bVal = b[sortKey as keyof StateComposition] ?? 0
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      return 0
    })
    return items
  }, [data, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const startRow = safePage * PAGE_SIZE + 1
  const endRow = Math.min((safePage + 1) * PAGE_SIZE, filtered.length)

  const getZone = useCallback((state: string) => {
    const norm = state.toLowerCase()
    for (const [zone, states] of Object.entries(GEOPOLITICAL_ZONES)) {
      if (states.some((s) => s.toLowerCase() === norm)) return zone
    }
    return "Unknown"
  }, [])

  const downloadCsv = useCallback(() => {
    const rows: string[] = ["State,Zone,FAAC_Allocation,IGR,Dependency_Ratio,Dependency_Label"]
    for (const d of filtered) {
      rows.push(`${d.state},${getZone(d.state)},${d.faac},${d.igr},${(d.dependencyRatio * 100).toFixed(1)}%,${getDependencyLabel(d.dependencyRatio)}`)
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const label = [year ? `Y${year}` : "", region ? `R${region}` : "", month ? `M${month}` : ""].filter(Boolean).join("_") || "all"
    a.download = `faac-data-${label}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered, year, region, month, getZone])

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null
    return <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
  }

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Data Explorer</h3>
          <p className="text-xs text-muted-foreground">
            {filtered.length} state{filtered.length !== 1 ? "s" : ""} · {year ? `Year: ${year}` : "All Years"} · {region || "All Regions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search state..."
            className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-32"
          />
          <button
            onClick={downloadCsv}
            className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-ring transition-all"
            title="Download CSV"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto min-h-[240px] sm:min-h-[300px]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th
                className="cursor-pointer px-3 py-2 text-left font-medium hover:text-foreground"
                onClick={() => handleSort("state")}
              >
                State <SortIcon col="state" />
              </th>
              <th className="px-3 py-2 text-left font-medium">Zone</th>
              <th
                className="cursor-pointer px-3 py-2 text-right font-medium hover:text-foreground"
                onClick={() => handleSort("faac")}
              >
                FAAC <SortIcon col="faac" />
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right font-medium hover:text-foreground"
                onClick={() => handleSort("igr")}
              >
                IGR <SortIcon col="igr" />
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right font-medium hover:text-foreground"
                onClick={() => handleSort("dependencyRatio")}
              >
                Dependency <SortIcon col="dependencyRatio" />
              </th>
              <th className="px-3 py-2 text-center font-medium">Label</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((d) => (
              <tr key={d.state} className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                <td className="px-3 py-2.5 font-medium text-foreground">{d.state}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{getZone(d.state)}</td>
                <td className="px-3 py-2.5 text-right text-foreground">{formatNaira(d.faac)}</td>
                <td className="px-3 py-2.5 text-right text-foreground">{formatNaira(d.igr)}</td>
                <td className="px-3 py-2.5 text-right" style={{ color: getDependencyColor(d.dependencyRatio) }}>
                  {(d.dependencyRatio * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      background: `${getDependencyColor(d.dependencyRatio)}20`,
                      color: getDependencyColor(d.dependencyRatio),
                    }}
                  >
                    {getDependencyLabel(d.dependencyRatio)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">No data matches the current filters.</p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          {startRow}–{endRow} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="flex h-7 w-7 items-center justify-center rounded border border-border hover:text-foreground hover:border-ring disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="tabular-nums">
            {safePage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-border hover:text-foreground hover:border-ring disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
