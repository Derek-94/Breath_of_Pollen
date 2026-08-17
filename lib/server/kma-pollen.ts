import { ApiRouteError, fetchJson } from './api'

export type PollenLevel = 1 | 2 | 3 | 4 | 5
export type KmaPollenPlantType = 'pine' | 'oak' | 'weeds'
export type KmaPollenSeason = 'spring' | 'autumn' | 'off'

type KmaPollenItem = {
  today?: string | number | null
  tomorrow?: string | number | null
  dayaftertomorrow?: string | number | null
  twodaysaftertomorrow?: string | number | null
}

type KmaPollenApiResponse = {
  response?: {
    header?: {
      resultCode?: string
      resultMsg?: string
    }
    body?: {
      items?: {
        item?: KmaPollenItem | KmaPollenItem[]
      }
    }
  }
}

export type KmaPlantForecast = {
  type: KmaPollenPlantType
  days: PollenLevel[]
}

export type KmaPollenResponse = {
  schemaVersion: 1
  source: 'KMA'
  areaNo: string
  issuedAt: string | null
  season: KmaPollenSeason
  offSeason: boolean
  forecastStartOffset: number
  plants: KmaPlantForecast[]
  dailyOverall: PollenLevel[]
}

type KmaContext = {
  season: KmaPollenSeason
  issueTime: string | null
}

const KMA_API_BASE = 'https://apis.data.go.kr/1360000/HealthWthrIdxServiceV3'
const KMA_REVALIDATE_SECONDS = 6 * 60 * 60

export function mapKmaGrade(value: string | number): PollenLevel {
  const grade = typeof value === 'number' ? value : Number.parseInt(value, 10)

  if (!Number.isFinite(grade) || grade <= 0) return 1
  if (grade === 1) return 2
  if (grade === 2) return 3
  return 4
}

export function getKmaContext(now = new Date()): KmaContext {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const month = kst.getUTCMonth() + 1
  const hour = kst.getUTCHours()

  const season: KmaPollenSeason =
    month >= 3 && month <= 6
      ? 'spring'
      : month >= 8 && month <= 10
        ? 'autumn'
        : 'off'

  if (season === 'off') return { season, issueTime: null }

  let issueDate = kst
  let issueHour = 18

  if (hour >= 18) {
    issueHour = 18
  } else if (hour >= 6) {
    issueHour = 6
  } else {
    issueDate = new Date(kst.getTime() - 24 * 60 * 60 * 1000)
  }

  const year = issueDate.getUTCFullYear()
  const issueMonth = String(issueDate.getUTCMonth() + 1).padStart(2, '0')
  const date = String(issueDate.getUTCDate()).padStart(2, '0')

  return {
    season,
    issueTime: `${year}${issueMonth}${date}${String(issueHour).padStart(2, '0')}`,
  }
}

export function extractKmaDays(data: KmaPollenApiResponse): {
  days: PollenLevel[]
  forecastStartOffset: number
} {
  const resultCode = data.response?.header?.resultCode

  if (resultCode && resultCode !== '00') {
    throw new ApiRouteError(
      502,
      'KMA_API_ERROR',
      'KMA returned an error response',
    )
  }

  const rawItem = data.response?.body?.items?.item
  const item = Array.isArray(rawItem) ? rawItem[0] : rawItem

  if (!item) {
    throw new ApiRouteError(
      502,
      'KMA_DATA_UNAVAILABLE',
      'KMA pollen forecast is unavailable',
    )
  }

  const rawDays = [
    item.today,
    item.tomorrow,
    item.dayaftertomorrow,
    item.twodaysaftertomorrow,
  ]
  const forecastStartOffset = rawDays.findIndex(
    (value) => value !== '' && value !== null && value !== undefined,
  )

  if (forecastStartOffset < 0) {
    throw new ApiRouteError(
      502,
      'KMA_DATA_UNAVAILABLE',
      'KMA pollen forecast contains no daily values',
    )
  }

  const days = rawDays
    .slice(forecastStartOffset)
    .filter((value): value is string | number => (
      value !== '' && value !== null && value !== undefined
    ))
    .map(mapKmaGrade)

  return { days, forecastStartOffset }
}

export function getDailyOverall(plants: KmaPlantForecast[]): PollenLevel[] {
  const numberOfDays = Math.max(0, ...plants.map((plant) => plant.days.length))

  return Array.from({ length: numberOfDays }, (_, index) => {
    const levels = plants
      .map((plant) => plant.days[index])
      .filter((level): level is PollenLevel => level !== undefined)

    return (Math.max(1, ...levels) as PollenLevel)
  })
}

function getServiceKey(): string {
  const key = process.env.KMA_API_KEY?.trim()

  if (!key) {
    throw new ApiRouteError(
      503,
      'KMA_API_NOT_CONFIGURED',
      'KMA pollen service is not configured',
    )
  }

  try {
    return decodeURIComponent(key)
  } catch {
    return key
  }
}

function createKmaUrl(endpoint: string, areaNo: string, issueTime: string): URL {
  const url = new URL(`${KMA_API_BASE}/${endpoint}`)
  url.searchParams.set('serviceKey', getServiceKey())
  url.searchParams.set('areaNo', areaNo)
  url.searchParams.set('time', issueTime)
  url.searchParams.set('numOfRows', '10')
  url.searchParams.set('pageNo', '1')
  url.searchParams.set('dataType', 'JSON')
  return url
}

async function fetchPlant(
  type: KmaPollenPlantType,
  endpoint: string,
  areaNo: string,
  issueTime: string,
): Promise<{ plant: KmaPlantForecast; forecastStartOffset: number }> {
  const data = await fetchJson<KmaPollenApiResponse>(
    createKmaUrl(endpoint, areaNo, issueTime),
    { next: { revalidate: KMA_REVALIDATE_SECONDS } },
  )
  const { days, forecastStartOffset } = extractKmaDays(data)
  return { plant: { type, days }, forecastStartOffset }
}

export async function getKmaPollenForecast(
  areaNo: string,
  now = new Date(),
): Promise<KmaPollenResponse> {
  const { season, issueTime } = getKmaContext(now)

  if (season === 'off' || !issueTime) {
    return {
      schemaVersion: 1,
      source: 'KMA',
      areaNo,
      issuedAt: null,
      season: 'off',
      offSeason: true,
      forecastStartOffset: 0,
      plants: [],
      dailyOverall: [],
    }
  }

  const requests = season === 'spring'
    ? [
        fetchPlant('pine', 'getPinePollenRiskIdxV3', areaNo, issueTime),
        fetchPlant('oak', 'getOakPollenRiskIdxV3', areaNo, issueTime),
      ]
    : [
        fetchPlant('weeds', 'getWeedsPollenRiskndxV3', areaNo, issueTime),
      ]

  const results = await Promise.all(requests)
  const offsets = new Set(results.map((result) => result.forecastStartOffset))

  if (offsets.size !== 1) {
    throw new ApiRouteError(
      502,
      'KMA_DATA_INCONSISTENT',
      'KMA plant forecasts use different start dates',
    )
  }

  const plants = results.map((result) => result.plant)

  return {
    schemaVersion: 1,
    source: 'KMA',
    areaNo,
    issuedAt: issueTime,
    season,
    offSeason: false,
    forecastStartOffset: results[0].forecastStartOffset,
    plants,
    dailyOverall: getDailyOverall(plants),
  }
}
