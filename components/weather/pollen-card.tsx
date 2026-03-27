"use client"

import { Card } from "@/components/ui/card"

interface PollenData {
  type: string
  level: 1 | 2 | 3 | 4 | 5
  label: string
}

interface PollenCardProps {
  cedar: PollenData
  cypress: PollenData
  overallLevel: 1 | 2 | 3 | 4 | 5
}

const levelColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-pollen-1", text: "text-pollen-1", label: "少ない" },
  2: { bg: "bg-pollen-2", text: "text-pollen-2", label: "やや多い" },
  3: { bg: "bg-pollen-3", text: "text-pollen-3", label: "多い" },
  4: { bg: "bg-pollen-4", text: "text-pollen-4", label: "非常に多い" },
  5: { bg: "bg-pollen-5", text: "text-pollen-5", label: "極めて多い" },
}

function PollenLevelBar({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-6 rounded-full transition-all ${
            i <= level 
              ? levelColors[i].bg 
              : "bg-muted"
          }`}
        />
      ))}
    </div>
  )
}

export function PollenCard({ cedar, cypress, overallLevel }: PollenCardProps) {
  const overall = levelColors[overallLevel]
  
  return (
    <Card className="p-4 border-0 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${overall.bg}`} />
          <span className="text-sm font-medium text-foreground">花粉情報</span>
        </div>
        <span className={`text-sm font-semibold ${overall.text}`}>
          {overall.label}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">スギ</span>
          <div className="flex items-center gap-3">
            <PollenLevelBar level={cedar.level} />
            <span className={`text-xs font-medium w-16 text-right ${levelColors[cedar.level].text}`}>
              {levelColors[cedar.level].label}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">ヒノキ</span>
          <div className="flex items-center gap-3">
            <PollenLevelBar level={cypress.level} />
            <span className={`text-xs font-medium w-16 text-right ${levelColors[cypress.level].text}`}>
              {levelColors[cypress.level].label}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
