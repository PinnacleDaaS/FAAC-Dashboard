"use client"

import { useState, useCallback } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"
import type { StateComposition } from "@/types"
import { getDependencyColor } from "@/types"

const FAAC_COLOR = "#3B82F6"
const IGR_COLOR = "#006633"

function formatNaira(value: number): string {
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`
  return `₦${value.toLocaleString()}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const total = d.faac + d.igr
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1 font-semibold text-foreground">{d.state}</p>
      <p className="text-muted-foreground">
        FAAC: <span className="text-foreground">{formatNaira(d.faac)}</span>
      </p>
      <p className="text-muted-foreground">
        IGR: <span className="text-foreground">{formatNaira(d.igr)}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        FAAC: <span className="font-medium">{d.faacPct}%</span> | IGR: <span className="font-medium">{d.igrPct}%</span>
      </p>
      <p className="mt-0.5 text-xs" style={{ color: getDependencyColor(d.dependencyRatio) }}>
        Dependency: {(d.dependencyRatio * 100).toFixed(1)}%
      </p>
    </div>
  )
}

interface StateStackedBarProps {
  data: StateComposition[]
}

export default function StateStackedBar({ data }: StateStackedBarProps) {
  const [mode, setMode] = useState<"percent" | "absolute">("percent")

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "percent" ? "absolute" : "percent"))
  }, [])

  const chartData = data
    .map((d) => {
      const total = d.faac + d.igr
      return {
        state: d.state,
        faac: d.faac,
        igr: d.igr,
        dependencyRatio: d.dependencyRatio,
        faacPct: total > 0 ? Math.round((d.faac / total) * 100) : 100,
        igrPct: total > 0 ? Math.round((d.igr / total) * 100) : 0,
        _sortKey: d.faac,
      }
    })
    .sort((a, b) => b._sortKey - a._sortKey)

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">State FAAC vs IGR Composition</h3>
          <p className="text-xs text-muted-foreground">
            {mode === "percent" ? "Percentage breakdown per state" : "Absolute values in Naira"}
          </p>
        </div>
        <button
          onClick={toggleMode}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {mode === "percent" ? "Show Absolute" : "Show Percentage"}
        </button>
      </div>

      <div className="flex-1 min-h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 60 }}
            layout="vertical"
            barSize={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type={mode === "percent" ? "number" : "number"}
              domain={mode === "percent" ? [0, 100] : ["auto", "auto"]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={mode === "percent" ? (v: number) => `${v}%` : (v: number) => formatNaira(v)}
            />
            <YAxis
              type="category"
              dataKey="state"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              width={90}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={mode === "percent" ? "faacPct" : "faac"}
              stackId="stack"
              fill={FAAC_COLOR}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey={mode === "percent" ? "igrPct" : "igr"}
              stackId="stack"
              fill={IGR_COLOR}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: FAAC_COLOR }} />
          FAAC (Federal)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: IGR_COLOR }} />
          IGR (State)
        </span>
      </div>
    </div>
  )
}
