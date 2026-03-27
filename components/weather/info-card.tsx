"use client"

import { Card } from "@/components/ui/card"
import { Sun, Droplets, Wind } from "lucide-react"

type InfoType = "uv" | "humidity" | "pm25"

interface InfoCardProps {
  type: InfoType
  value: string | number
  label: string
  level?: "low" | "medium" | "high"
}

const iconMap = {
  uv: Sun,
  humidity: Droplets,
  pm25: Wind,
}

const levelColors = {
  low: "text-pollen-1",
  medium: "text-pollen-3",
  high: "text-pollen-4",
}

export function InfoCard({ type, value, label, level = "low" }: InfoCardProps) {
  const Icon = iconMap[type]
  
  return (
    <Card className="p-3 border-0 shadow-sm flex-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${levelColors[level]}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-semibold ${levelColors[level]}`}>{value}</span>
    </Card>
  )
}
