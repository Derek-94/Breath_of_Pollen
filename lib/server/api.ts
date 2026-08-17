import { NextResponse } from 'next/server'

const DEFAULT_TIMEOUT_MS = 10_000

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

export class ApiRouteError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiRouteError'
  }
}

export function requireAreaNo(searchParams: URLSearchParams): string {
  const areaNo = searchParams.get('areaNo')?.trim()

  if (!areaNo || !/^\d{10}$/.test(areaNo)) {
    throw new ApiRouteError(
      400,
      'INVALID_AREA_NO',
      'areaNo must be a 10-digit KMA area code',
    )
  }

  return areaNo
}

export function requireCoordinates(searchParams: URLSearchParams): {
  lat: number
  lon: number
} {
  const latParam = searchParams.get('lat')?.trim()
  const lonParam = searchParams.get('lon')?.trim()
  const lat = Number(latParam)
  const lon = Number(lonParam)

  if (
    !latParam
    || !lonParam
    || !Number.isFinite(lat)
    || !Number.isFinite(lon)
    || lat < -90
    || lat > 90
    || lon < -180
    || lon > 180
  ) {
    throw new ApiRouteError(
      400,
      'INVALID_COORDINATES',
      'lat and lon must be valid geographic coordinates',
    )
  }

  return { lat, lon }
}

export async function fetchJson<T>(
  url: string | URL,
  init: NextFetchInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })

    if (!response.ok) {
      throw new ApiRouteError(
        502,
        'UPSTREAM_REQUEST_FAILED',
        `Upstream responded with HTTP ${response.status}`,
      )
    }

    try {
      return (await response.json()) as T
    } catch {
      throw new ApiRouteError(
        502,
        'UPSTREAM_INVALID_RESPONSE',
        'Upstream returned invalid JSON',
      )
    }
  } catch (error) {
    if (error instanceof ApiRouteError) throw error

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRouteError(
        504,
        'UPSTREAM_TIMEOUT',
        'Upstream request timed out',
      )
    }

    throw new ApiRouteError(
      502,
      'UPSTREAM_UNAVAILABLE',
      'Could not reach upstream service',
    )
  } finally {
    clearTimeout(timer)
  }
}

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiRouteError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }

  console.error('Unexpected API route error', error)
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 },
  )
}
