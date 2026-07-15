import { cache } from "react"
import { supabase } from "./supabase"
import type { DashboardSummary, FaacVsIgrDataPoint, StateComposition, KpiData, StateDeepDiveData, MonthlyData, FaacAllocation } from "@/types"
import { getZoneForState, getDependencyColor, GEOPOLITICAL_ZONES } from "@/types"

function filterByRegion(results: DashboardSummary[], region?: string | null): DashboardSummary[] {
  if (!region || region === "All") return results
  const zoneStates = Object.entries(GEOPOLITICAL_ZONES).find(([key]) => key === region)?.[1] || []
  return results.filter((r) =>
    zoneStates.some((s) => s.toLowerCase() === r.state.toLowerCase())
  )
}

export const fetchDashboardSummary = cache(
  async (year?: number | null, region?: string | null): Promise<DashboardSummary[]> => {
    let query = supabase.from("dashboard_summary").select("*")

    if (year) {
      query = query.eq("year", year)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch dashboard summary: ${error.message}`)

    let results = (data as DashboardSummary[]).map((r) => ({
      ...r,
      state: r.state === "Nassarawa" ? "Nasarawa" : r.state,
    }))

    return filterByRegion(results, region)
  }
)

export const fetchMonthlySummary = cache(
  async (year?: number | null, month?: number | null, region?: string | null): Promise<DashboardSummary[]> => {
    let query = supabase.from("faac_allocations").select("*")

    if (year) {
      query = query.eq("year", year)
    }
    if (month) {
      query = query.eq("month", month)
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch monthly summary: ${error.message}`)

    const grouped = new Map<string, { year: number; state: string; total_net: number; total_gross: number }>()
    for (const row of (data as FaacAllocation[])) {
      const key = `${row.year}-${row.state}`
      const existing = grouped.get(key) || { year: row.year, state: row.state, total_net: 0, total_gross: 0 }
      existing.total_net += row.net
      existing.total_gross += row.gross
      grouped.set(key, existing)
    }

    let results = Array.from(grouped.values()).map((r) => ({
      year: r.year,
      state: r.state === "Nassarawa" ? "Nasarawa" : r.state,
      total_net: r.total_net,
      total_gross: r.total_gross,
      total_igr: 0,
      dependency_ratio: 0,
    }))

    return filterByRegion(results, region)
  }
)

function formatNaira(value: number): string {
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`
  return `₦${value.toLocaleString()}`
}

export async function fetchKpiData(year?: number | null, month?: number | null, region?: string | null): Promise<KpiData> {
  const isMonthly = !!month
  const data = isMonthly
    ? await fetchMonthlySummary(year, month, region)
    : await fetchDashboardSummary(year, region)

  if (data.length === 0) {
    return {
      totalNetAllocation: 0,
      totalIgr: 0,
      avgDependencyRatio: 0,
      yoyChange: null,
      stateCount: 0,
      hasIgrData: false,
    }
  }

  const totalNetAllocation = data.reduce((sum, row) => sum + row.total_net, 0)
  const hasIgrData = !isMonthly && data.some((row) => row.total_igr > 0)
  const totalIgr = isMonthly ? 0 : data.reduce((sum, row) => sum + row.total_igr, 0)
  const avgDependencyRatio = isMonthly ? 0 : (
    hasIgrData
      ? data.reduce((sum, row) => sum + row.dependency_ratio, 0) / data.length
      : 0
  )
  const stateCount = new Set(data.map((r) => r.state)).size

  let yoyChange: number | null = null
  if (year && month) {
    const prevData = await fetchMonthlySummary(year - 1, month, region)
    const prevTotal = prevData.reduce((sum, row) => sum + row.total_net, 0)
    if (prevTotal > 0) {
      yoyChange = ((totalNetAllocation - prevTotal) / prevTotal) * 100
    }
  } else if (year && !month) {
    const prevYear = year - 1
    const prevData = await fetchDashboardSummary(prevYear, region)
    const prevTotal = prevData.reduce((sum, row) => sum + row.total_net, 0)
    if (prevTotal > 0) {
      yoyChange = ((totalNetAllocation - prevTotal) / prevTotal) * 100
    }
  } else {
    const yearlyTotals = new Map<number, number>()
    for (const row of data) {
      yearlyTotals.set(row.year, (yearlyTotals.get(row.year) || 0) + row.total_net)
    }
    const sortedYears = Array.from(yearlyTotals.entries()).sort((a, b) => b[0] - a[0])
    const completeYears = sortedYears.filter(([y]) => {
      const yearStates = data.filter((r) => r.year === y)
      const statesWithFaac = new Set(yearStates.map((r) => r.state)).size
      return statesWithFaac >= 30
    })
    if (completeYears.length >= 2) {
      const [, latestTotal] = completeYears[0]
      const [, prevTotal] = completeYears[1]
      yoyChange = ((latestTotal - prevTotal) / prevTotal) * 100
    }
  }

  return {
    totalNetAllocation,
    totalIgr,
    avgDependencyRatio,
    yoyChange,
    stateCount,
    hasIgrData,
  }
}

export async function fetchFaacVsIgrTrend(
  year?: number | null,
  month?: number | null,
  region?: string | null
): Promise<FaacVsIgrDataPoint[]> {
  const data = month
    ? await fetchMonthlySummary(null, month, region)
    : await fetchDashboardSummary(year, region)

  const grouped = new Map<number, { faac: number; igr: number; hasIgr: boolean }>()

  for (const row of data) {
    const existing = grouped.get(row.year) || { faac: 0, igr: 0, hasIgr: false }
    existing.faac += row.total_net
    existing.igr += row.total_igr
    if (row.total_igr > 0) existing.hasIgr = true
    grouped.set(row.year, existing)
  }

  return Array.from(grouped.entries())
    .map(([year, vals]) => ({
      year,
      faac: vals.faac,
      igr: vals.hasIgr ? vals.igr : null,
    }))
    .sort((a, b) => a.year - b.year)
}

export async function fetchStateComposition(
  year?: number | null,
  month?: number | null,
  region?: string | null
): Promise<StateComposition[]> {
  const isMonthly = !!month
  let data = isMonthly
    ? await fetchMonthlySummary(year, month, region)
    : await fetchDashboardSummary(year, region)

  if (isMonthly) {
    if (!year) {
      data = data.filter((d) => d.year === Math.max(...data.map((r) => r.year)))
    }
  } else {
    if (year) {
      data = data.filter((d) => d.year === year)
    } else {
      const yearsWithIgr = data.filter((d) => d.total_igr > 0).map((d) => d.year)
      const latestYear = yearsWithIgr.length > 0
        ? Math.max(...yearsWithIgr)
        : Math.max(...data.map((d) => d.year))
      data = data.filter((d) => d.year === latestYear)
    }
  }

  return data.map((row) => ({
    state: row.state,
    faac: row.total_net,
    igr: row.total_igr,
    dependencyRatio: row.dependency_ratio,
  }))
}

export const fetchStateDeepDive = cache(
  async (state: string, year?: number | null, month?: number | null): Promise<StateDeepDiveData> => {
    const isMonthly = !!month
    const summary = isMonthly
      ? await fetchMonthlySummary(year, month)
      : await fetchDashboardSummary(year)

    const stateSummary = summary.find(
      (s) => s.state.toLowerCase() === state.toLowerCase()
    )

    if (!stateSummary) {
      return {
        state,
        totalNet: 0,
        totalGross: 0,
        totalIgr: 0,
        dependencyRatio: 0,
        monthlyData: [],
      }
    }

    let query = supabase
      .from("faac_allocations")
      .select("year, month, gross, net")
      .eq("state", state)
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    if (year) {
      query = query.eq("year", year)
    }
    if (month) {
      query = query.eq("month", month)
    }

    const { data: monthlyData, error } = await query

    if (error) throw new Error(`Failed to fetch state deep dive: ${error.message}`)

    return {
      state: stateSummary.state,
      totalNet: stateSummary.total_net,
      totalGross: stateSummary.total_gross,
      totalIgr: isMonthly ? 0 : stateSummary.total_igr,
      dependencyRatio: isMonthly ? 0 : stateSummary.dependency_ratio,
      monthlyData: (monthlyData || []) as MonthlyData[],
    }
  }
)

export async function fetchLatestDataDate(): Promise<string> {
  const { data, error } = await supabase
    .from("faac_allocations")
    .select("year, month")
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(1)

  if (error || !data?.length) return "N/A"

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  return `${months[data[0].month - 1]} ${data[0].year}`
}

export async function fetchMapData(
  year?: number | null,
  month?: number | null,
  region?: string | null
): Promise<{ state: string; totalNet: number; dependencyRatio: number }[]> {
  const isMonthly = !!month
  const data = isMonthly
    ? await fetchMonthlySummary(year, month, region)
    : await fetchDashboardSummary(year, region)

  if (year) {
    return data.map((d) => ({
      state: d.state,
      totalNet: d.total_net,
      dependencyRatio: isMonthly ? 0 : d.dependency_ratio,
    }))
  }

  const stateLatest = new Map<string, DashboardSummary>()
  for (const row of data) {
    const existing = stateLatest.get(row.state)
    if (!existing) {
      stateLatest.set(row.state, row)
      continue
    }
    if (row.total_igr > 0 && existing.total_igr === 0) {
      stateLatest.set(row.state, row)
    } else if (row.year > existing.year) {
      stateLatest.set(row.state, row)
    }
  }

  return Array.from(stateLatest.values()).map((d) => ({
    state: d.state,
    totalNet: d.total_net,
    dependencyRatio: isMonthly ? 0 : d.dependency_ratio,
  }))
}
