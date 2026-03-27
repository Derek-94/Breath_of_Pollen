"use client"

import { Sun, Calendar, Settings } from "lucide-react"

type Tab = "today" | "weekly" | "settings"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs = [
  { id: "today" as const, label: "今日", icon: Sun },
  { id: "weekly" as const, label: "週間", icon: Calendar },
  { id: "settings" as const, label: "設定", icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
