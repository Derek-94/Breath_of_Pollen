"use client"

import { useState } from "react"
import { MapPin, ChevronRight, ChevronLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

const regions: Record<string, string[]> = {
  "北海道・東北": ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  "関東": ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"],
  "中部": ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  "近畿": ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  "中国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  "四国": ["徳島県", "香川県", "愛媛県", "高知県"],
  "九州": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県"],
  "沖縄": ["沖縄県"],
}

const regionIcons: Record<string, string> = {
  "北海道・東北": "❄️",
  "関東": "🗼",
  "中部": "🏔️",
  "近畿": "⛩️",
  "中国": "🌊",
  "四国": "🍊",
  "九州": "🌋",
  "沖縄": "🌺",
}

interface LocationPickerProps {
  currentLocation?: string
  onSelectLocation: (prefecture: string) => void
}

export function LocationPicker({ currentLocation, onSelectLocation }: LocationPickerProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)

  const handlePrefectureSelect = (prefecture: string) => {
    setSelectedPrefecture(prefecture)
    setTimeout(() => {
      onSelectLocation(prefecture)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden">
      {/* Current Location Pill */}
      {currentLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full shadow-sm">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground">現在: {currentLocation}</span>
          </div>
        </div>
      )}

      {/* Region List (Screen 1) */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-out ${
          selectedRegion ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="px-4 pt-16 pb-24">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">場所を選択</h1>
          </div>

          {/* Region Cards */}
          <div className="space-y-2">
            {Object.entries(regions).map(([region, prefectures]) => (
              <Card
                key={region}
                className="p-4 border-0 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setSelectedRegion(region)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl" role="img" aria-label={region}>
                      {regionIcons[region]}
                    </span>
                    <span className="font-medium text-foreground">{region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {prefectures.length}県
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Geolocation Note */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            位置情報を許可すると自動で取得できます
          </p>
        </div>
      </div>

      {/* Prefecture List (Screen 2) */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-out ${
          selectedRegion ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 pt-16 pb-24">
          {/* Back Button */}
          <button
            onClick={() => setSelectedRegion(null)}
            className="flex items-center gap-1 text-primary mb-6 active:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">地域に戻る</span>
          </button>

          {/* Region Header */}
          {selectedRegion && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl" role="img" aria-label={selectedRegion}>
                  {regionIcons[selectedRegion]}
                </span>
                <h2 className="text-lg font-semibold text-foreground">{selectedRegion}</h2>
              </div>

              {/* Prefecture List */}
              <Card className="border-0 shadow-sm overflow-hidden">
                {regions[selectedRegion].map((prefecture, index) => (
                  <button
                    key={prefecture}
                    onClick={() => handlePrefectureSelect(prefecture)}
                    className={`w-full px-4 py-3.5 text-left transition-colors active:bg-muted ${
                      selectedPrefecture === prefecture
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/50"
                    } ${
                      index !== regions[selectedRegion].length - 1 
                        ? "border-b border-border" 
                        : ""
                    }`}
                  >
                    <span className="font-medium">{prefecture}</span>
                  </button>
                ))}
              </Card>
            </>
          )}

          {/* Geolocation Note */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            位置情報を許可すると自動で取得できます
          </p>
        </div>
      </div>
    </div>
  )
}
