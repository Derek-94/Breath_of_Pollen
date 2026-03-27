"use client"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ChevronRight, MapPin, Bell, Palette, Info } from "lucide-react"

interface SettingsViewProps {
  notifications: boolean
  onNotificationsChange: (enabled: boolean) => void
}

export function SettingsView({ notifications, onNotificationsChange }: SettingsViewProps) {
  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-lg font-semibold text-foreground mb-4">設定</h2>
      
      {/* Location */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">現在地</p>
              <p className="text-xs text-muted-foreground">東京都渋谷区</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </Card>

      {/* Notifications */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">通知</p>
              <p className="text-xs text-muted-foreground">毎朝7時に天気をお知らせ</p>
            </div>
          </div>
          <Switch 
            checked={notifications} 
            onCheckedChange={onNotificationsChange}
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">表示設定</p>
              <p className="text-xs text-muted-foreground">テーマ、文字サイズ</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </Card>

      {/* About */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">このアプリについて</p>
              <p className="text-xs text-muted-foreground">バージョン 1.0.0</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </Card>
    </div>
  )
}
