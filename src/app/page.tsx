import { Suspense } from "react"
import ClientDashboard from "@/components/dashboard-client"
import DashboardFooter from "@/components/dashboard-footer"
import IframeWrapper from "@/components/iframe-wrapper"
import {
  fetchKpiData,
  fetchFaacVsIgrTrend,
  fetchStateComposition,
  fetchMapData,
  fetchLatestDataDate,
} from "@/lib/queries"

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6 h-28" />
        ))}
      </div>
      <div className="glass-card p-6 h-[350px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-80" />
        <div className="glass-card p-6 h-80" />
      </div>
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ year?: string; region?: string; month?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const year = params.year ? Number(params.year) : null
  const region = params.region || null
  const clientSearchParams = {
    year: year ?? undefined,
    region: region,
    month: params.month,
  }

  const [kpiData, faacVsIgrData, stackedBarData, mapData, dateLabel] = await Promise.all([
    fetchKpiData(year, region),
    fetchFaacVsIgrTrend(year, region),
    fetchStateComposition(year, region),
    fetchMapData(year, region),
    fetchLatestDataDate(),
  ])

  return (
    <IframeWrapper>
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <ClientDashboard
            kpiData={kpiData}
            mapData={mapData}
            faacVsIgrData={faacVsIgrData}
            stackedBarData={stackedBarData}
            searchParams={clientSearchParams}
          />
        </Suspense>

        <DashboardFooter dateLabel={dateLabel} />
      </main>
    </IframeWrapper>
  )
}
