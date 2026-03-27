"use client"

import { Card } from "@/components/ui/card"

interface HourlyData {
  hour: string
  temp: number
  icon: string
}

interface HourlyChartProps {
  data: HourlyData[]
}

export function HourlyChart({ data }: HourlyChartProps) {
  const maxTemp = Math.max(...data.map(d => d.temp))
  const minTemp = Math.min(...data.map(d => d.temp))
  const range = maxTemp - minTemp || 1
  
  return (
    <Card className="p-4 border-0 shadow-sm">
      <span className="text-sm font-medium text-foreground mb-3 block">時間ごとの気温</span>
      
      <div className="flex justify-between overflow-x-auto pb-2 gap-2">
        {data.map((item, index) => {
          const height = ((item.temp - minTemp) / range) * 40 + 20
          return (
            <div key={index} className="flex flex-col items-center min-w-[40px]">
              <span className="text-xs text-muted-foreground mb-1">{item.hour}</span>
              <span className="text-lg mb-2">{item.icon}</span>
              <div className="relative h-16 w-full flex items-end justify-center">
                <div 
                  className="w-2 bg-primary/30 rounded-full transition-all"
                  style={{ height: `${height}px` }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-medium text-foreground">{item.temp}°</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
