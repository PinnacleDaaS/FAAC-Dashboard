"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { getZoneForState } from "@/types"
import type { StateComposition } from "@/types"

const GREEN_TO_RED = ["#10B981", "#65B930", "#B8A430", "#D97A2E", "#EF4444", "#B91C1C"]

function formatNaira(value: number): string {
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`
  return `₦${value.toLocaleString()}`
}

interface RegionalBreakdownProps {
  treemapData: StateComposition[]
}

export default function RegionalBreakdown({ treemapData }: RegionalBreakdownProps) {
  const zoneTotals = new Map<string, number>()
  for (const d of treemapData) {
    const zone = getZoneForState(d.state)
    zoneTotals.set(zone, (zoneTotals.get(zone) || 0) + d.faac)
  }

  const data = Array.from(zoneTotals.entries())
    .map(([name, value], idx) => ({ name, value, fill: GREEN_TO_RED[idx] || "#6b7280" }))
    .sort((a, b) => b.value - a.value)
    .map((d, idx) => ({ ...d, fill: GREEN_TO_RED[idx] || "#6b7280" }))

  const total = data.reduce((s, d) => s + d.value, 0)

  const CustomTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    const pct = ((d.value / total) * 100).toFixed(1)
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg backdrop-blur-md">
        <p className="font-semibold text-foreground">{d.name}</p>
        <p className="text-muted-foreground">{formatNaira(d.value)}</p>
        <p className="text-xs text-muted-foreground">{pct}% of total allocation</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 flex flex-col h-full min-h-[350px] sm:min-h-[500px]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Regional Allocation
        </h3>
        <p className="text-xs text-muted-foreground">
          FAAC distribution by geopolitical zone
        </p>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row gap-4 lg:gap-6 items-center">
        <div className="w-full lg:w-[55%] h-[250px] sm:h-[350px] lg:h-[400px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:space-y-3">
          {data.map((d) => {
            const pct = ((d.value / total) * 100).toFixed(1)
            return (
              <div key={d.name} className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 lg:gap-2 truncate">
                  <span className="inline-block h-2.5 w-2.5 lg:h-3 lg:w-3 rounded-full shrink-0" style={{ background: d.fill }} />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="font-medium text-foreground shrink-0 ml-1">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
