"use client"

import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface SettingsViewProps {
  location: string
}

export function SettingsView({ location }: SettingsViewProps) {
  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-lg font-semibold text-foreground mb-4">設定</h2>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">現在地</p>
            <p className="text-xs text-muted-foreground">{location}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
