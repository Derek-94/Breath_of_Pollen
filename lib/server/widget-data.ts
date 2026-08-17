import { ApiRouteError, fetchJson } from './api'
import { getKmaPollenForecast, type KmaPollenResponse } from './kma-pollen'
import { getWeatherInfo, type PollenLevel } from '../weather-utils'

export type WidgetCountry = 'JP' | 'KR'
export type WidgetPlantType = 'cedar' | 'cypress' | 'pine' | 'oak' | 'weeds'

type WeatherResponse = {
  current?: {
    temperature_2m?: number
    weathercode?: number
    relative_humidity_2m?: number
    uv_index?: number
  }
  daily?: {
    time?: string[]
    weathercode?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
  }
}

type CompleteWeatherResponse = {
  current: {
    temperature_2m: number
    weathercode: number
    relative_humidity_2m: number
    uv_index?: number
  }
  daily: {
    time: string[]
    weathercode: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

type AirQualityResponse = {
  hourly?: {
    time?: string[]
    pm2_5?: Array<number | null>
  }
}

type GooglePollenPlant = {
  code?: string
  indexInfo?: { value?: number }
}

type GooglePollenResponse = {
  regionCode?: string
  dailyInfo?: Array<{ plantInfo?: GooglePollenPlant[] }>
}

type WidgetPlant = {
  type: WidgetPlantType
  level: PollenLevel | null
  days: Array<PollenLevel | null>
}

export type WidgetApiResponse = {
  schemaVersion: 1
  updatedAt: string
  country: WidgetCountry
  degraded: {
    pollen: boolean
    airQuality: boolean
  }
  weather: {
    temperature: number
    high: number
    low: number
    code: number
    type: ReturnType<typeof getWeatherInfo>['type']
    icon: string
    needsUmbrella: boolean
    humidity: number
    uvIndex: number
  }
  airQuality: {
    pm2_5: number | null
  }
  pollen: {
    available: boolean
    offSeason: boolean
    overall: PollenLevel | null
    forecastStartOffset: number
    plants: WidgetPlant[]
  }
  forecast: Array<{
    date: string
    high: number
    low: number
    weatherCode: number
    weatherType: ReturnType<typeof getWeatherInfo>['type']
    weatherIcon: string
    pollenLevel: PollenLevel | null
  }>
}

const WEATHER_REVALIDATE_SECONDS = 30 * 60
const POLLEN_REVALIDATE_SECONDS = 6 * 60 * 60
const WIDGET_FORECAST_DAYS = 3

export function detectWidgetCountry(lat: number, lon: number): WidgetCountry {
  if (lat >= 33 && lat <= 39 && lon >= 124 && lon <= 132) return 'KR'
  if (lat >= 24 && lat <= 46 && lon >= 122 && lon <= 154) return 'JP'

  throw new ApiRouteError(
    400,
    'UNSUPPORTED_REGION',
    'Widgets currently support locations in Japan and South Korea',
  )
}

function createWeatherUrl(lat: number, lon: number): URL {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m,weathercode,relative_humidity_2m,uv_index')
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'Asia/Tokyo')
  url.searchParams.set('forecast_days', String(WIDGET_FORECAST_DAYS))
  return url
}

function createAirQualityUrl(lat: number, lon: number): URL {
  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('hourly', 'pm2_5')
  url.searchParams.set('timezone', 'Asia/Tokyo')
  url.searchParams.set('forecast_days', '1')
  return url
}

function getGooglePollenKey(): string {
  const key = process.env.GOOGLE_POLLEN_API_KEY?.trim()

  if (!key) {
    throw new ApiRouteError(
      503,
      'GOOGLE_POLLEN_NOT_CONFIGURED',
      'Google Pollen service is not configured',
    )
  }

  return key
}

function createGooglePollenUrl(lat: number, lon: number): URL {
  const url = new URL('https://pollen.googleapis.com/v1/forecast:lookup')
  url.searchParams.set('key', getGooglePollenKey())
  url.searchParams.set('location.latitude', String(lat))
  url.searchParams.set('location.longitude', String(lon))
  url.searchParams.set('days', '5')
  url.searchParams.set('languageCode', 'ja')
  return url
}

function mapGooglePollenLevel(value: number | undefined): PollenLevel | null {
  if (value === undefined || !Number.isFinite(value)) return null
  if (value <= 1) return 1
  if (value === 2) return 2
  if (value === 3) return 3
  if (value === 4) return 4
  return 5
}

function findGooglePlantLevel(
  plants: GooglePollenPlant[],
  code: string,
): PollenLevel | null {
  return mapGooglePollenLevel(
    plants.find((plant) => plant.code === code)?.indexInfo?.value,
  )
}

function overall(levels: Array<PollenLevel | null>): PollenLevel | null {
  const known = levels.filter((level): level is PollenLevel => level !== null)
  return known.length > 0 ? (Math.max(...known) as PollenLevel) : null
}

export function normalizeGooglePollen(data: GooglePollenResponse): {
  available: boolean
  offSeason: false
  overall: PollenLevel | null
  forecastStartOffset: 0
  plants: WidgetPlant[]
  dailyOverall: Array<PollenLevel | null>
} {
  if (data.regionCode !== 'JP' || !data.dailyInfo?.length) {
    return {
      available: false,
      offSeason: false,
      overall: null,
      forecastStartOffset: 0,
      plants: [],
      dailyOverall: [],
    }
  }

  const cedarDays = data.dailyInfo.map((day) => (
    findGooglePlantLevel(day.plantInfo ?? [], 'JAPANESE_CEDAR')
  ))
  const cypressDays = data.dailyInfo.map((day) => (
    findGooglePlantLevel(day.plantInfo ?? [], 'JAPANESE_CYPRESS')
  ))
  const dailyOverall = data.dailyInfo.map((_, index) => (
    overall([cedarDays[index], cypressDays[index]])
  ))

  return {
    available: dailyOverall.some((level) => level !== null),
    offSeason: false,
    overall: dailyOverall[0] ?? null,
    forecastStartOffset: 0,
    plants: [
      { type: 'cedar', level: cedarDays[0] ?? null, days: cedarDays },
      { type: 'cypress', level: cypressDays[0] ?? null, days: cypressDays },
    ],
    dailyOverall,
  }
}

export function normalizeKmaPollen(data: KmaPollenResponse): {
  available: boolean
  offSeason: boolean
  overall: PollenLevel | null
  forecastStartOffset: number
  plants: WidgetPlant[]
  dailyOverall: Array<PollenLevel | null>
} {
  if (data.offSeason) {
    return {
      available: true,
      offSeason: true,
      overall: null,
      forecastStartOffset: 0,
      plants: [],
      dailyOverall: [],
    }
  }

  const plants = data.plants.map((plant) => ({
    type: plant.type,
    level: data.forecastStartOffset === 0 ? (plant.days[0] ?? null) : null,
    days: plant.days,
  }))

  return {
    available: data.dailyOverall.length > 0,
    offSeason: false,
    overall: data.forecastStartOffset === 0 ? (data.dailyOverall[0] ?? null) : null,
    forecastStartOffset: data.forecastStartOffset,
    plants,
    dailyOverall: data.dailyOverall,
  }
}

function getCurrentPm25(data: AirQualityResponse, now: Date): number | null {
  const times = data.hourly?.time ?? []
  const values = data.hourly?.pm2_5 ?? []
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const date = [
    kst.getUTCFullYear(),
    String(kst.getUTCMonth() + 1).padStart(2, '0'),
    String(kst.getUTCDate()).padStart(2, '0'),
  ].join('-')
  const hour = String(kst.getUTCHours()).padStart(2, '0')
  const index = times.indexOf(`${date}T${hour}:00`)
  const value = index >= 0 ? values[index] : values[0]
  return value === null || value === undefined ? null : Math.round(value)
}

function assertWeather(data: WeatherResponse): asserts data is CompleteWeatherResponse {
  const dailyLengths = [
    data.daily?.time?.length ?? 0,
    data.daily?.weathercode?.length ?? 0,
    data.daily?.temperature_2m_max?.length ?? 0,
    data.daily?.temperature_2m_min?.length ?? 0,
  ]

  if (
    data.current?.temperature_2m === undefined
    || data.current.weathercode === undefined
    || data.current.relative_humidity_2m === undefined
    || !data.daily?.time?.length
    || !data.daily.weathercode?.length
    || !data.daily.temperature_2m_max?.length
    || !data.daily.temperature_2m_min?.length
    || new Set(dailyLengths).size !== 1
  ) {
    throw new ApiRouteError(
      502,
      'WEATHER_DATA_INVALID',
      'Weather provider returned incomplete data',
    )
  }
}

async function optional<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch {
    return null
  }
}

export async function getWidgetData(
  lat: number,
  lon: number,
  country: WidgetCountry,
  areaNo?: string,
  now = new Date(),
): Promise<WidgetApiResponse> {
  if (country === 'KR' && !areaNo) {
    throw new ApiRouteError(
      400,
      'AREA_NO_REQUIRED',
      'areaNo is required for locations in South Korea',
    )
  }

  const pollenPromise = country === 'JP'
    ? fetchJson<GooglePollenResponse>(
        createGooglePollenUrl(lat, lon),
        { next: { revalidate: POLLEN_REVALIDATE_SECONDS } },
      ).then(normalizeGooglePollen)
    : getKmaPollenForecast(areaNo!, now).then(normalizeKmaPollen)

  const [weather, pollen, airQuality] = await Promise.all([
    fetchJson<WeatherResponse>(
      createWeatherUrl(lat, lon),
      { next: { revalidate: WEATHER_REVALIDATE_SECONDS } },
    ),
    optional(pollenPromise),
    optional(fetchJson<AirQualityResponse>(
      createAirQualityUrl(lat, lon),
      { next: { revalidate: WEATHER_REVALIDATE_SECONDS } },
    )),
  ])

  assertWeather(weather)

  const currentCode = weather.current.weathercode
  const currentWeather = getWeatherInfo(currentCode)
  const todayWeather = getWeatherInfo(weather.daily.weathercode[0]!)
  const pollenData = pollen ?? {
    available: false,
    offSeason: false,
    overall: null,
    forecastStartOffset: 0,
    plants: [],
    dailyOverall: [],
  }
  const forecast = weather.daily.time.slice(0, WIDGET_FORECAST_DAYS).map((date, index) => {
    const code = weather.daily.weathercode[index]!
    const info = getWeatherInfo(code)
    const pollenIndex = index - pollenData.forecastStartOffset

    return {
      date,
      high: Math.round(weather.daily.temperature_2m_max[index]!),
      low: Math.round(weather.daily.temperature_2m_min[index]!),
      weatherCode: code,
      weatherType: info.type,
      weatherIcon: info.emoji,
      pollenLevel: pollenIndex >= 0
        ? (pollenData.dailyOverall[pollenIndex] ?? null)
        : null,
    }
  })

  return {
    schemaVersion: 1,
    updatedAt: now.toISOString(),
    country,
    degraded: {
      pollen: pollen === null,
      airQuality: airQuality === null,
    },
    weather: {
      temperature: Math.round(weather.current.temperature_2m),
      high: Math.round(weather.daily.temperature_2m_max[0]!),
      low: Math.round(weather.daily.temperature_2m_min[0]!),
      code: currentCode,
      type: currentWeather.type,
      icon: currentWeather.emoji,
      needsUmbrella: todayWeather.type === 'rainy' || todayWeather.type === 'snowy',
      humidity: Math.round(weather.current.relative_humidity_2m),
      uvIndex: Math.round(weather.current.uv_index ?? 0),
    },
    airQuality: {
      pm2_5: airQuality ? getCurrentPm25(airQuality, now) : null,
    },
    pollen: pollenData,
    forecast,
  }
}
