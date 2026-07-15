import { Landmark, TrendingUp, Percent, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KpiData } from "@/types"

function formatNaira(amount: number): string {
  if (amount >= 1e12) return `₦${(amount / 1e12).toFixed(2)}T`
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(2)}M`
  return `₦${amount.toLocaleString()}`
}

function formatPercent(val: number): string {
  return `${(val * 100).toFixed(1)}%`
}

function getRatioColor(val: number): string {
  if (val >= 0.9) return "text-red-600"
  if (val >= 0.75) return "text-amber-600"
  if (val >= 0.6) return "text-yellow-600"
  return "text-green-600"
}

interface KpiCardProps {
  title: string
  value: string
  subtitle: string
  insight: string
  icon: React.ReactNode
  valueClassName?: string
}

function KpiCard({ title, value, subtitle, insight, icon, valueClassName }: KpiCardProps) {
  return (
    <div className="glass-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className="mt-0.5 flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className={cn("mt-0.5 sm:mt-1 truncate text-base sm:text-xl font-bold", valueClassName)}>
          {value}
        </p>
        <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] leading-snug sm:leading-relaxed text-muted-foreground/80 italic">
          {insight}
        </p>
      </div>
    </div>
  )
}

export default function KpiCards({ data }: { data: KpiData }) {
  const yoyDisplay = data.yoyChange !== null
    ? `${data.yoyChange >= 0 ? "+" : ""}${data.yoyChange.toFixed(1)}%`
    : "N/A"
  const yoyColor = data.yoyChange !== null
    ? data.yoyChange >= 0 ? "text-green-600" : "text-red-600"
    : ""

  const stateDisplay = data.hasFct
    ? `${data.stateCount - 1} states + FCT`
    : `${data.stateCount} state${data.stateCount > 1 ? "s" : ""}`
  const totalNetInsight = `Distributed across ${stateDisplay}`
  const totalIgrInsight = data.igrRatioFormatted
    ? `Equivalent to ${data.igrRatioFormatted}% of total FAAC allocation`
    : "IGR data not yet available for this period"
  const avgDepInsight = !data.hasIgrData
    ? "IGR data not yet available to compute dependency"
    : data.avgDependencyRatio >= 0.9
      ? "Critically high — states rely heavily on federal allocation"
      : data.avgDependencyRatio >= 0.75
        ? "High dependency — limited internal revenue generation"
        : data.avgDependencyRatio >= 0.6
          ? "Moderate dependency — partial fiscal autonomy"
          : "Low dependency — strong internal revenue base"
  const yoyInsight = data.yoyChange !== null
    ? `Allocation ${data.yoyChange >= 0 ? "grew" : "declined"} by ${Math.abs(data.yoyChange).toFixed(1)}% vs previous year`
    : "Select a year to compare against previous period"

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        title="Total Net Allocation"
        value={formatNaira(data.totalNetAllocation)}
        subtitle="Aggregated FAAC disbursements"
        insight={totalNetInsight}
        icon={<Landmark className="h-5 w-5" />}
      />
      <KpiCard
        title="Total IGR"
        value={formatNaira(data.totalIgr)}
        subtitle="Internally generated revenue"
        insight={totalIgrInsight}
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <KpiCard
        title="Avg Dependency Ratio"
        value={formatPercent(data.avgDependencyRatio)}
        subtitle="Average state reliance on FAAC"
        insight={avgDepInsight}
        icon={<Percent className="h-5 w-5" />}
        valueClassName={getRatioColor(data.avgDependencyRatio)}
      />
      <KpiCard
        title="YoY Change"
        value={yoyDisplay}
        subtitle="Year-over-year allocation change"
        insight={yoyInsight}
        icon={<ArrowUpDown className="h-5 w-5" />}
        valueClassName={yoyColor}
      />
    </div>
  )
}
