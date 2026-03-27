"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { WeatherIcon } from "@/components/weather/weather-icon"
import { PollenCard } from "@/components/weather/pollen-card"
import { OutfitCard } from "@/components/weather/outfit-card"
import { InfoCard } from "@/components/weather/info-card"
import { HourlyChart } from "@/components/weather/hourly-chart"
import { BottomNav } from "@/components/weather/bottom-nav"
import { OutfitDetail } from "@/components/weather/outfit-detail"
import { WeeklyView } from "@/components/weather/weekly-view"
import { SettingsView } from "@/components/weather/settings-view"
import { LocationPicker } from "@/components/weather/location-picker"
import { PREFECTURE_COORDS } from "@/lib/prefecture-coords"
import {
  getWeatherInfo,
  mapPollenIndex,
  getOutfitRecommendation,
  isLaundryOk,
  getUVLabel,
  getJapaneseDayOfWeek,
  formatDate,
  type WeatherType,
  type PollenLevel,
  type OutfitItem,
} from "@/lib/weather-utils"

interface AppState {
  location: string
  temperature: number
  high: number
  low: number
  weatherType: WeatherType
  description: string
  weatherCode: number
  humidity: number
  uvIndex: number
  pollenCedar: { type: string; level: PollenLevel; label: string }
  pollenCypress: { type: string; level: PollenLevel; label: string }
  pollenOverall: PollenLevel
  outfitItems: OutfitItem[]
  outfitSummary: string
  hourlyData: { hour: string; temp: number; icon: string }[]
  weeklyForecast: {
    day: string
    date: string
    icon: string
    high: number
    low: number
    pollenLevel: PollenLevel
  }[]
}

const POLLEN_LABELS: Record<PollenLevel, string> = {
  1: "少ない",
  2: "やや多い",
  3: "多い",
  4: "非常に多い",
  5: "極めて多い",
}

type PlantInfo = { code: string; indexInfo?: { value?: number } }

function findPlantLevel(plantInfo: PlantInfo[], code: string): PollenLevel {
  const plant = plantInfo.find((p) => p.code === code)
  return mapPollenIndex(plant?.indexInfo?.value)
}

function findOverallPollenLevel(plantInfo: PlantInfo[]): PollenLevel {
  const cedar = findPlantLevel(plantInfo, "JAPANESE_CEDAR")
  const cypress = findPlantLevel(plantInfo, "JAPANESE_CYPRESS")
  return (Math.max(cedar, cypress) as PollenLevel) || 1
}

export default function WeatherApp() {
  const [activeTab, setActiveTab] = useState<"today" | "weekly" | "settings">("today")
  const [showOutfitDetail, setShowOutfitDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)
  const [appData, setAppData] = useState<AppState | null>(null)

  const fetchWeatherData = useCallback(async (lat: number, lon: number, locationName?: string) => {
    setLoading(true)
    setShowPicker(false)
    try {
      const [weatherRes, pollenRes, locationRes] = await Promise.all([
        fetch(`/api/weather?lat=${lat}&lon=${lon}`),
        fetch(`/api/pollen?lat=${lat}&lon=${lon}`),
        locationName
          ? Promise.resolve(null)
          : fetch(`/api/location?lat=${lat}&lon=${lon}`),
      ])

      const [weather, pollen, locationData] = await Promise.all([
        weatherRes.json(),
        pollenRes.json(),
        locationName
          ? Promise.resolve({ location: locationName })
          : locationRes!.json(),
      ])

      // Current conditions
      const currentTemp = Math.round(weather.current.temperature_2m)
      const currentCode: number = weather.current.weathercode
      const currentHumidity = Math.round(weather.current.relative_humidity_2m)
      const currentUV = Math.round(weather.current.uv_index ?? 0)
      const todayHigh = Math.round(weather.daily.temperature_2m_max[0])
      const todayLow = Math.round(weather.daily.temperature_2m_min[0])
      const weatherInfo = getWeatherInfo(currentCode)

      // Pollen
      const todayPlants: PlantInfo[] = pollen.dailyInfo?.[0]?.plantInfo ?? []
      const cedarLevel = findPlantLevel(todayPlants, "JAPANESE_CEDAR")
      const cypressLevel = findPlantLevel(todayPlants, "JAPANESE_CYPRESS")
      const overallLevel: PollenLevel = (Math.max(cedarLevel, cypressLevel) as PollenLevel) || 1

      // Outfit
      const { items: outfitItems, summary: outfitSummary } = getOutfitRecommendation(currentTemp, overallLevel)

      // Hourly chart (current hour + next 7 hours)
      const now = new Date()
      const currentHour = now.getHours()
      const todayStr = now.toISOString().slice(0, 10)
      const hourlyTimes: string[] = weather.hourly.time
      const startIdx = hourlyTimes.findIndex(
        (t: string) => t === `${todayStr}T${String(currentHour).padStart(2, "0")}:00`
      )
      const hourlyData = Array.from({ length: 8 }, (_, i) => {
        const idx = startIdx + i
        const timeStr: string = hourlyTimes[idx] ?? ""
        const h = parseInt(timeStr.slice(11, 13))
        return {
          hour: `${h}時`,
          temp: Math.round(weather.hourly.temperature_2m[idx] ?? currentTemp),
          icon: getWeatherInfo(weather.hourly.weathercode[idx] ?? 0).emoji,
        }
      })

      // Weekly forecast
      const weeklyForecast = (weather.daily.time as string[]).map((dateStr: string, i: number) => {
        const weeklyPlants: PlantInfo[] = pollen.dailyInfo?.[i]?.plantInfo ?? []
        return {
          day: getJapaneseDayOfWeek(dateStr),
          date: formatDate(dateStr),
          icon: getWeatherInfo(weather.daily.weathercode[i]).emoji,
          high: Math.round(weather.daily.temperature_2m_max[i]),
          low: Math.round(weather.daily.temperature_2m_min[i]),
          pollenLevel: findOverallPollenLevel(weeklyPlants),
        }
      })

      setAppData({
        location: locationData.location,
        temperature: currentTemp,
        high: todayHigh,
        low: todayLow,
        weatherType: weatherInfo.type,
        description: weatherInfo.description,
        weatherCode: currentCode,
        humidity: currentHumidity,
        uvIndex: currentUV,
        pollenCedar: { type: "スギ", level: cedarLevel, label: POLLEN_LABELS[cedarLevel] },
        pollenCypress: { type: "ヒノキ", level: cypressLevel, label: POLLEN_LABELS[cypressLevel] },
        pollenOverall: overallLevel,
        outfitItems,
        outfitSummary,
        hourlyData,
        weeklyForecast,
      })
    } catch {
      setShowPicker(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePrefectureSelect = useCallback((prefecture: string) => {
    const coords = PREFECTURE_COORDS[prefecture]
    if (coords) {
      fetchWeatherData(coords.lat, coords.lon, prefecture)
    }
  }, [fetchWeatherData])

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false)
      setShowPicker(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchWeatherData(coords.latitude, coords.longitude)
      },
      () => {
        setLoading(false)
        setShowPicker(true)
      }
    )
  }, [fetchWeatherData])

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">天気情報を取得中...</p>
        </div>
      </div>
    )
  }

  if (showPicker) {
    return (
      <LocationPicker
        currentLocation={appData?.location}
        onSelectLocation={handlePrefectureSelect}
      />
    )
  }

  if (!appData) return null

  const uvLabel = getUVLabel(appData.uvIndex)

  const Logo = () => (
    <div className="flex flex-col items-center pt-10 pb-4">
      <div className="flex gap-2 mb-2">
        {["#4ade80", "#facc15", "#fb923c", "#f87171", "#c084fc"].map((color) => (
          <span
            key={color}
            style={{ background: color }}
            className="w-2.5 h-2.5 rounded-full opacity-80 inline-block"
          />
        ))}
      </div>
      <p className="text-base font-semibold tracking-widest text-foreground/80">
        花粉の呼吸
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {activeTab === "today" && (
        <main className="pb-24">
          <header className="px-4 pb-6">
            <Logo />

            <div
              className="flex items-center gap-1.5 text-muted-foreground mb-4 cursor-pointer"
              onClick={() => setShowPicker(true)}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{appData.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-7xl font-light text-foreground tracking-tight">
                    {appData.temperature}
                  </span>
                  <span className="text-3xl text-muted-foreground">°C</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {appData.description} · {appData.high}° / {appData.low}°
                </p>
              </div>
              <WeatherIcon type={appData.weatherType} size={80} />
            </div>
          </header>

          <div className="px-4 space-y-4">
            <PollenCard
              cedar={appData.pollenCedar}
              cypress={appData.pollenCypress}
              overallLevel={appData.pollenOverall}
            />
            <OutfitCard
              items={appData.outfitItems}
              summary={appData.outfitSummary}
              onClick={() => setShowOutfitDetail(true)}
            />
            <div className="flex gap-3">
              <InfoCard type="uv" value={uvLabel.value} label="UV指数" level={uvLabel.level} />
              <InfoCard type="pm25" value="良好" label="PM2.5" level="low" />
              <InfoCard
                type="humidity"
                value={`${appData.humidity}%`}
                label="湿度"
                level={appData.humidity > 70 ? "high" : appData.humidity > 40 ? "medium" : "low"}
              />
            </div>
            <HourlyChart data={appData.hourlyData} />
          </div>
        </main>
      )}

      {activeTab === "weekly" && (
        <main>
          <Logo />
          <WeeklyView forecast={appData.weeklyForecast} />
        </main>
      )}

      {activeTab === "settings" && (
        <main>
          <Logo />
          <SettingsView location={appData.location} />
        </main>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showOutfitDetail && (
        <OutfitDetail
          items={appData.outfitItems}
          temperature={{ high: appData.high, low: appData.low }}
          pollenLevel={appData.pollenOverall}
          laundryOk={isLaundryOk(appData.pollenOverall, appData.weatherCode)}
          onClose={() => setShowOutfitDetail(false)}
        />
      )}
    </div>
  )
}
