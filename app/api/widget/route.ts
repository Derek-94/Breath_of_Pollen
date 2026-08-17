import { NextRequest, NextResponse } from 'next/server'
import {
  apiErrorResponse,
  requireAreaNo,
  requireCoordinates,
} from '@/lib/server/api'
import { detectWidgetCountry, getWidgetData } from '@/lib/server/widget-data'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { lat, lon } = requireCoordinates(request.nextUrl.searchParams)
    const country = detectWidgetCountry(lat, lon)
    const areaNo = country === 'KR'
      ? requireAreaNo(request.nextUrl.searchParams)
      : undefined
    // A roughly 1 km grid improves upstream cache reuse without changing the
    // user-visible regional forecast in a meaningful way.
    const roundedLat = Number(lat.toFixed(2))
    const roundedLon = Number(lon.toFixed(2))
    const data = await getWidgetData(roundedLat, roundedLon, country, areaNo)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=21600',
      },
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
