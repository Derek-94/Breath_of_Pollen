"use client"

import { Card } from "@/components/ui/card"

interface DayForecast {
  day: string
  date: string
  icon: string
  high: number
  low: number
  pollenLevel: 1 | 2 | 3 | 4 | 5
}

interface WeeklyViewProps {
  forecast: DayForecast[]
}

const pollenLevels: { bg: string; label: string }[] = [
  { bg: "bg-pollen-1", label: "少ない" },
  { bg: "bg-pollen-2", label: "やや多い" },
  { bg: "bg-pollen-3", label: "多い" },
  { bg: "bg-pollen-4", label: "非常に多い" },
  { bg: "bg-pollen-5", label: "極めて多い" },
]

const pollenColors: Record<number, string> = {
  1: "bg-pollen-1",
  2: "bg-pollen-2",
  3: "bg-pollen-3",
  4: "bg-pollen-4",
  5: "bg-pollen-5",
}

export function WeeklyView({ forecast }: WeeklyViewProps) {
  return (
    <div className="p-4 space-y-3 pb-24">
      <h2 className="text-lg font-semibold text-foreground mb-4">週間天気予報</h2>

      <div className="rounded-xl bg-muted/50 px-4 py-3 mb-2">
        <p className="text-xs text-muted-foreground mb-2">花粉レベルの目安</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {pollenLevels.map((level) => (
            <div key={level.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${level.bg}`} />
              <span className="text-xs text-muted-foreground">{level.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {forecast.map((day, index) => (
        <Card key={index} className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[40px]">
                <p className="text-sm font-medium text-foreground">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>
              <span className="text-3xl">{day.icon}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm font-semibold text-foreground">{day.high}°</span>
                <span className="text-sm text-muted-foreground"> / {day.low}°</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${pollenColors[day.pollenLevel]}`} />
                <span className="text-xs text-muted-foreground">花粉</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
