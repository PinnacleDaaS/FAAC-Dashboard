"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { YEARS, GEOPOLITICAL_ZONES } from "@/types"

export default function GlobalFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentYear = searchParams.get("year") || ""
  const currentRegion = searchParams.get("region") || ""

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label
          htmlFor="year-filter"
          className="text-sm font-medium text-muted"
        >
          Year
        </label>
        <select
          id="year-filter"
          value={currentYear}
          onChange={(e) => updateParam("year", e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">All Years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="region-filter"
          className="text-sm font-medium text-muted"
        >
          Region
        </label>
        <select
          id="region-filter"
          value={currentRegion}
          onChange={(e) => updateParam("region", e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">All Regions</option>
          {Object.keys(GEOPOLITICAL_ZONES).map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
