"use client"

import { useState, useCallback } from "react"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { FaacVsIgrDataPoint, ChartMode } from "@/types"

const FAAC_COLOR = "#3B82F6"
const IGR_COLOR = "#006633"

function formatBillions(value: number): string {
  return `₦${(value / 1e9).toFixed(1)}B`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value == null ? "N/A" : `₦${(entry.value / 1e9).toFixed(2)}B`}
        </p>
      ))}
      {payload.some((e: any) => e.dataKey === "IGR" && e.value == null) && (
        <p className="mt-1.5 text-[11px] italic text-muted-foreground">
          Audited IGR report pending (Release: Oct 2026)
        </p>
      )}
    </div>
  )
}

export default function FaacVsIgrChart({ data }: { data: FaacVsIgrDataPoint[] }) {
  const [mode, setMode] = useState<ChartMode>("bar")

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "bar" ? "area" : "bar"))
  }, [])

  const hasIgrData = data.some((d) => d.igr != null)
  const latestYear = data.length > 0 ? data[data.length - 1].year : null

  const chartData = data.map((d) => ({
    year: d.year,
    FAAC: d.faac,
    IGR: d.igr,
    _igrMissing: d.igr == null,
  }))

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            FAAC vs IGR Allocation
          </h3>
          <p className="text-xs text-muted-foreground">
            Annual trend across selected states
          </p>
        </div>
        <button
          onClick={toggleMode}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {mode === "bar" ? "Area View" : "Bar View"}
        </button>
      </div>

      <div className="flex-1 min-h-[240px] sm:min-h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "bar" ? (
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis
                tickFormatter={formatBillions}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="FAAC" fill={FAAC_COLOR} radius={[4, 4, 0, 0]} />
              <Bar dataKey="IGR" fill={IGR_COLOR} radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="faacGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FAAC_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={FAAC_COLOR} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="igrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={IGR_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={IGR_COLOR} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis
                tickFormatter={formatBillions}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="FAAC"
                stroke={FAAC_COLOR}
                fill="url(#faacGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="IGR"
                stroke={hasIgrData ? IGR_COLOR : "var(--muted)"}
                fill="url(#igrGrad)"
                strokeWidth={2}
                strokeDasharray={hasIgrData ? "0" : "4 3"}
                opacity={hasIgrData ? 1 : 0.35}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: FAAC_COLOR }} />
          FAAC (Federal)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: IGR_COLOR }} />
          IGR (State)
        </span>
      </div>

      {!hasIgrData && latestYear && (
        <div className="mt-3 rounded-lg border border-border bg-card/50 px-3 py-2 text-center text-xs text-muted-foreground">
          IGR data is not available for {latestYear}. Audited IGR report pending (Release: Oct 2026)
        </div>
      )}
    </div>
  )
}
