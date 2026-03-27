"use client"

import { Card } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface OutfitItem {
  icon: string
  name: string
  recommended: boolean
}

interface OutfitCardProps {
  items: OutfitItem[]
  summary: string
  onClick?: () => void
}

export function OutfitCard({ items, summary, onClick }: OutfitCardProps) {
  return (
    <Card 
      className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">今日のコーデ</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center min-w-[60px] p-2 rounded-xl transition-all ${
              item.recommended 
                ? "bg-primary/10 ring-1 ring-primary/20" 
                : "bg-muted/50"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs text-muted-foreground text-center break-all">
              {item.name}
            </span>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed break-words">{summary}</p>
    </Card>
  )
}
