"use client"

import { Sun, Cloud, CloudRain, CloudSnow, CloudSun, CloudFog } from "lucide-react"

type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy" | "foggy"

interface WeatherIconProps {
  type: WeatherType
  size?: number
  className?: string
}

export function WeatherIcon({ type, size = 64, className = "" }: WeatherIconProps) {
  const iconProps = { size, className }
  
  switch (type) {
    case "sunny":
      return <Sun {...iconProps} className={`text-amber-400 ${className}`} />
    case "cloudy":
      return <Cloud {...iconProps} className={`text-slate-400 ${className}`} />
    case "rainy":
      return <CloudRain {...iconProps} className={`text-blue-400 ${className}`} />
    case "snowy":
      return <CloudSnow {...iconProps} className={`text-sky-300 ${className}`} />
    case "partly-cloudy":
      return <CloudSun {...iconProps} className={`text-amber-300 ${className}`} />
    case "foggy":
      return <CloudFog {...iconProps} className={`text-slate-300 ${className}`} />
    default:
      return <Sun {...iconProps} className={`text-amber-400 ${className}`} />
  }
}
