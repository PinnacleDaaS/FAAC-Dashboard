"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, Menu } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import KpiCards from "@/components/kpi-cards"
import NigeriaMap from "@/components/nigeria-map"
import FaacVsIgrChart from "@/components/faac-vs-igr-chart"
import RegionalBreakdown from "@/components/regional-breakdown"
import DataExplorer from "@/components/data-explorer"
import StateDeepDive from "@/components/state-deep-dive"
import SideDrawer from "@/components/side-drawer"
import { YEARS, GEOPOLITICAL_ZONES } from "@/types"
import type { KpiData, FaacVsIgrDataPoint, StateComposition, MapStateData } from "@/types"

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" }, { value: "2", label: "February" },
  { value: "3", label: "March" }, { value: "4", label: "April" },
  { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" },
  { value: "9", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" },
]

interface ClientDashboardProps {
  kpiData: KpiData
  mapData: MapStateData[]
  faacVsIgrData: FaacVsIgrDataPoint[]
  stackedBarData: StateComposition[]
  searchParams: { year?: number; region?: string | null; month?: string }
}

export default function ClientDashboard({
  kpiData,
  mapData,
  faacVsIgrData,
  stackedBarData,
  searchParams,
}: ClientDashboardProps) {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [year, setYear] = useState(searchParams.year?.toString() ?? "")
  const [region, setRegion] = useState(searchParams.region ?? "")
  const [month, setMonth] = useState(searchParams.month ?? "")

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function updateFilters(field: string, value: string) {
    const sp = new URLSearchParams()
    if (year && field !== "year") sp.set("year", year)
    if (region && field !== "region") sp.set("region", region)
    if (month && field !== "month") sp.set("month", month)
    if (value) sp.set(field, value)
    router.push(`?${sp.toString()}`)
    if (field === "year") setYear(value)
    else if (field === "region") setRegion(value)
    else if (field === "month") setMonth(value)
  }

  function clearFilters() {
    setYear(""); setRegion(""); setMonth("")
    router.push("/")
  }

  const hasFilters = year || region || month

  if (selectedState) {
    return (
      <div className="mx-auto max-w-4xl">
        <StateDeepDive
          state={selectedState}
          year={searchParams.year ?? null}
          onBack={() => setSelectedState(null)}
        />
      </div>
    )
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            FAAC Dashboard
          </h1>
          <p className="text-muted mt-0.5 text-xs">
            Federation Account Allocation Committee disbursements across 36 states + FCT
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => updateFilters("year", e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={month}
            onChange={(e) => updateFilters("month", e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select
            value={region}
            onChange={(e) => updateFilters("region", e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Regions</option>
            {Object.keys(GEOPOLITICAL_ZONES).map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-ring transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>
          )}
          <ThemeToggle />
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-ring transition-all"
            aria-label="Open filters"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SideDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        year={year}
        region={region}
        month={month}
        onYearChange={(v) => updateFilters("year", v)}
        onRegionChange={(v) => updateFilters("region", v)}
        onMonthChange={(v) => updateFilters("month", v)}
        onClear={clearFilters}
      />

      <div className="mb-5">
        <KpiCards data={kpiData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="glass-card p-4 sm:p-6 w-full min-h-[500px]">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">Nigeria State Dependency Map</h3>
            <p className="text-xs text-muted-foreground">Dependency ratio by state, colored by severity</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <NigeriaMap
              data={mapData}
              selectedState={selectedState}
              onStateClick={setSelectedState}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#16a34a" }} />
              Low (&lt;60%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#ca8a04" }} />
              Moderate (60-75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#d97706" }} />
              High (75-90%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#b91c1c" }} />
              Critical (&ge;90%)
            </span>
          </div>
        </div>
        <RegionalBreakdown treemapData={stackedBarData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <FaacVsIgrChart data={faacVsIgrData} />
        <DataExplorer
          data={stackedBarData}
          year={year}
          region={region}
          month={month}
        />
      </div>
    </>
  )
}
