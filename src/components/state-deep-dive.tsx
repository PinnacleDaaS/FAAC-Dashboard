"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { fetchStateDeepDive } from "@/lib/queries"
import { getDependencyColor, getDependencyLabel } from "@/types"
import type { StateDeepDiveData } from "@/types"

function formatNaira(value: number): string {
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`
  return `₦${value.toLocaleString()}`
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface StateDeepDiveProps {
  state: string
  year: number | null
  month?: number | null
  onBack: () => void
}

export default function StateDeepDive({ state, year, month, onBack }: StateDeepDiveProps) {
  const [data, setData] = useState<StateDeepDiveData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchStateDeepDive(state, year, month).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [state, year, month])

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-muted/20" />
          <div className="h-32 rounded bg-muted/20" />
          <div className="h-64 rounded bg-muted/20" />
        </div>
      </div>
    )
  }

  if (!data || data.monthlyData.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        No data available for {state}
      </div>
    )
  }

  const years = [...new Set(data.monthlyData.map((m) => m.year))].sort()
  const yearLabel = year ? `${year}` : years.length === 1 ? `${years[0]}` : `${years[0]} \u2013 ${years[years.length - 1]}`
  const chartData = data.monthlyData.map((m) => ({
    label: month ? `${MONTHS[m.month - 1]} ${m.year}` : MONTHS[m.month - 1] || `M${m.month}`,
    Gross: m.gross,
    Net: m.net,
  }))

  const barCount = chartData.length

  return (
    <div className="glass-card p-5">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to National View
      </button>

      <h2 className="mb-4 text-xl font-bold text-foreground">{data.state}</h2>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">Total Net</p>
          <p className="text-lg font-bold text-foreground">
            {data.totalNet > 0 ? formatNaira(data.totalNet) : "N/A"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">
            After statutory deductions
          </p>
        </div>
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">Total Gross</p>
          <p className="text-lg font-bold text-foreground">
            {data.totalGross > 0 ? formatNaira(data.totalGross) : "N/A"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">
            Before statutory deductions
          </p>
        </div>
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">Total IGR</p>
          <p className="text-lg font-bold text-foreground">
            {data.totalIgr > 0 ? formatNaira(data.totalIgr) : "N/A"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">
            {data.totalIgr > 0 ? "Internally generated revenue" : "Data available up to 2024"}
          </p>
        </div>
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">Dependency</p>
          <p
            className="text-lg font-bold"
            style={{ color: getDependencyColor(data.dependencyRatio) }}
          >
            {(data.dependencyRatio * 100).toFixed(1)}%
            <span className="ml-1 text-xs text-muted-foreground">
              {getDependencyLabel(data.dependencyRatio)}
            </span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">
            State reliance on federal allocation
          </p>
        </div>
      </div>

      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Monthly Allocation Breakdown
        <span className="ml-2 font-normal text-muted-foreground">{yearLabel}</span>
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis
              tickFormatter={(v) => `₦${(v / 1e9).toFixed(1)}B`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              content={({ active, payload, label }: any) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg backdrop-blur-md">
                    <p className="font-semibold">{label}</p>
                    {payload.map((entry: any) => (
                      <p key={entry.name} style={{ color: entry.color }}>
                        {entry.name}: {formatNaira(entry.value)}
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />
            <Bar dataKey="Gross" fill="var(--chart-1)" radius={[3, 3, 0, 0]} barSize={barCount <= 1 ? 48 : 16} />
            <Bar dataKey="Net" fill="var(--chart-2)" radius={[3, 3, 0, 0]} barSize={barCount <= 1 ? 48 : 16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
