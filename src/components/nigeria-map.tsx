"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { geoCentroid } from "d3-geo"
import { getDependencyColor } from "@/types"

const NAME_MAP: Record<string, string> = {
  "Nassarawa": "Nasarawa",
  "Federal Capital Territory": "FCT",
}

interface MapData {
  state: string
  totalNet: number
  dependencyRatio: number
}

interface NigeriaMapProps {
  data: MapData[]
  selectedState: string | null
  onStateClick: (state: string) => void
}

export default function NigeriaMap({ data, selectedState, onStateClick }: NigeriaMapProps) {
  const [tooltip, setTooltip] = useState<{
    state: string
    totalNet: number
    dependencyRatio: number
    x: number
    y: number
  } | null>(null)

  const dataMap = new Map(data.map((d) => [d.state.toLowerCase(), d]))

  return (
    <div className="w-full h-full min-h-[250px] sm:min-h-[500px] flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 2500,
          center: [8.5, 9.5]
        }}
        width={800}
        height={600}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography="/nigeria-states.json">
          {({ geographies, projection }) =>
            geographies.map((geo) => {
              const rawName: string = geo.properties?.NAME_1 || ""
              const name = NAME_MAP[rawName] || rawName
              const stateData = dataMap.get(name.toLowerCase())
              const depRatio = stateData?.dependencyRatio ?? 0
              const fill = stateData ? getDependencyColor(depRatio) : "#e5e7eb"
              const isSelected = selectedState?.toLowerCase() === name.toLowerCase()
              const centroid = geoCentroid(geo.geometry)
              const [cx, cy] = projection(centroid) || [0, 0]

              return (
                <g key={geo.rsmKey}>
                  <Geography
                    geography={geo}
                    style={{
                      default: {
                        fill,
                        stroke: isSelected ? "#008751" : "#ffffff",
                        strokeWidth: isSelected ? 1.2 : 0.4,
                        outline: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease-in-out",
                      },
                      hover: {
                        fill: "#008751",
                        opacity: 0.8,
                        stroke: "#ffffff",
                        strokeWidth: 0.8,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#004d2b",
                        outline: "none",
                      },
                    }}
                    onMouseEnter={(e) => {
                      if (stateData) {
                        setTooltip({
                          state: name,
                          totalNet: stateData.totalNet,
                          dependencyRatio: stateData.dependencyRatio,
                          x: (e as any).clientX,
                          y: (e as any).clientY,
                        })
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (name) onStateClick(name)
                    }}
                  />
                  {isSelected && cx > 0 && cy > 0 && (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={11}
                      fontWeight={700}
                      textRendering="geometricPrecision"
                      paintOrder="stroke"
                      stroke="rgba(0,0,0,0.4)"
                      strokeWidth={1}
                      style={{ pointerEvents: "none" }}
                    >
                      {name}
                    </text>
                  )}
                </g>
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="glass-card pointer-events-none fixed z-50 px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-semibold">{tooltip.state}</p>
          <p>FAAC: ₦{(tooltip.totalNet / 1e9).toFixed(2)}B</p>
          <p>
            Dependency:{" "}
            <span style={{ color: getDependencyColor(tooltip.dependencyRatio) }}>
              {(tooltip.dependencyRatio * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
