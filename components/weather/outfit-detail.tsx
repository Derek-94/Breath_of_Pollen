"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Shirt, CloudSun, Wind } from "lucide-react"

interface OutfitItem {
  icon: string
  name: string
  recommended: boolean
  reason?: string
}

interface OutfitDetailProps {
  items: OutfitItem[]
  temperature: { high: number; low: number }
  pollenLevel: 1 | 2 | 3 | 4 | 5
  laundryOk: boolean
  onClose: () => void
}

export function OutfitDetail({ 
  items, 
  temperature, 
  pollenLevel, 
  laundryOk,
  onClose 
}: OutfitDetailProps) {
  const tempDiff = temperature.high - temperature.low
  const hasLargeTempSwing = tempDiff >= 10
  
  const getPollenLabel = (level: number) => {
    const labels = ["", "少ない", "やや多い", "多い", "非常に多い", "極めて多い"]
    return labels[level]
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-md mx-auto min-h-full">
        {/* Header */}
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm px-4 py-4 flex items-center justify-between border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">今日のコーデ詳細</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        <main className="p-4 space-y-4 pb-8">
          {/* Reasoning Card */}
          <Card className="p-4 border-0 shadow-sm bg-primary/5">
            <div className="flex items-start gap-3">
              <CloudSun className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  今日のおすすめ理由
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {temperature.high}°C + 花粉{getPollenLabel(pollenLevel)} → 
                  {pollenLevel >= 3 ? "マスク推奨、" : ""}
                  {temperature.high <= 15 ? "軽いアウター" : temperature.high <= 20 ? "カーディガン" : "半袖"}がおすすめです
                </p>
              </div>
            </div>
          </Card>

          {/* Outfit Items */}
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shirt className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">おすすめアイテム</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-xl ${
                    item.recommended 
                      ? "bg-primary/10 ring-1 ring-primary/20" 
                      : "bg-muted/50"
                  }`}
                >
                  <span className="text-3xl mb-2">{item.icon}</span>
                  <span className="text-xs text-foreground font-medium text-center">
                    {item.name}
                  </span>
                  {item.recommended && (
                    <span className="text-[10px] text-primary mt-1">推奨</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Temperature Swing Alert */}
          {hasLargeTempSwing && (
            <Card className="p-4 border-0 shadow-sm border-l-4 border-l-pollen-3">
              <div className="flex items-start gap-3">
                <Wind className="w-5 h-5 text-pollen-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    気温差{tempDiff}°C
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    今日は気温差が大きいです。脱ぎ着しやすい重ね着スタイルがおすすめ。
                    カーディガンや薄手のジャケットを持っていくと安心です。
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Laundry Card */}
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧺</span>
                <div>
                  <p className="text-sm font-medium text-foreground">外干し</p>
                  <p className="text-xs text-muted-foreground">洗濯物を外に干せるか</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                laundryOk 
                  ? "bg-pollen-1/20 text-pollen-1" 
                  : "bg-pollen-4/20 text-pollen-4"
              }`}>
                {laundryOk ? "おすすめ" : "控えて"}
              </div>
            </div>
            {!laundryOk && (
              <p className="text-xs text-muted-foreground mt-2 ml-11">
                花粉が多いため、室内干しをおすすめします
              </p>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}
