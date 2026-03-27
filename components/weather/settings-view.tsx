"use client"

import { Card } from "@/components/ui/card"
import { MapPin, ChevronRight } from "lucide-react"

interface SettingsViewProps {
  location: string
  onLocationChange: () => void
}

export function SettingsView({ location, onLocationChange }: SettingsViewProps) {
  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-lg font-semibold text-foreground mb-4">設定</h2>

      <Card className="border-0 shadow-sm overflow-hidden cursor-pointer active:opacity-70 transition-opacity" onClick={onLocationChange}>
        <div className="p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">現在地</p>
            <p className="text-xs text-muted-foreground">{location}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Card>
    </div>
  )
}
