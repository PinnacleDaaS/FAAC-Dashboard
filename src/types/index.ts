export interface FaacAllocation {
  id: number
  year: number
  state: string
  month: number
  gross: number
  net: number
}

export interface IgrData {
  id: number
  year: number
  state: string
  total_igr: number
}

export interface DashboardSummary {
  year: number
  state: string
  total_net: number
  total_gross: number
  total_igr: number
  dependency_ratio: number
}

export interface MonthlyData {
  year: number
  month: number
  gross: number
  net: number
}

export interface KpiData {
  totalNetAllocation: number
  totalIgr: number
  avgDependencyRatio: number
  yoyChange: number | null
  stateCount: number
  hasIgrData: boolean
  hasFct: boolean
  igrRatioFormatted: string | null
}

export type ChartMode = "bar" | "area"

export interface FaacVsIgrDataPoint {
  year: number
  faac: number
  igr: number | null
}

export interface StateComposition {
  state: string
  faac: number
  igr: number
  dependencyRatio: number
}

export interface StateDeepDiveData {
  state: string
  totalNet: number
  totalGross: number
  totalIgr: number
  dependencyRatio: number
  monthlyData: MonthlyData[]
}

export interface MapStateData {
  state: string
  totalNet: number
  dependencyRatio: number
}

export const GEOPOLITICAL_ZONES: Record<string, string[]> = {
  "North Central": ["Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau", "FCT"],
  "North East": ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
  "North West": ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
  "South East": ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  "South South": ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  "South West": ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"],
}

export const YEARS = Array.from({ length: 11 }, (_, i) => 2016 + i)

export function getZoneForState(state: string): string {
  const normalized = state.trim().toLowerCase()
  for (const [zone, states] of Object.entries(GEOPOLITICAL_ZONES)) {
    if (states.some((s) => s.toLowerCase() === normalized)) return zone
  }
  return "Unknown"
}

export function getDependencyColor(ratio: number): string {
  if (ratio >= 0.9) return "#b91c1c"
  if (ratio >= 0.75) return "#d97706"
  if (ratio >= 0.6) return "#ca8a04"
  return "#16a34a"
}

export function getDependencyLabel(ratio: number): string {
  if (ratio >= 0.9) return "Critical"
  if (ratio >= 0.75) return "High"
  if (ratio >= 0.6) return "Moderate"
  return "Low"
}

export function dependencyToGradient(ratio: number): string {
  const r = Math.round(16 + (185 - 16) * ratio)
  const g = Math.round(185 - (185 - 28) * ratio)
  const b = Math.round(129 - (129 - 28) * ratio)
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}
