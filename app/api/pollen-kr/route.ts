import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, requireAreaNo } from '@/lib/server/api'
import { getKmaPollenForecast } from '@/lib/server/kma-pollen'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const areaNo = requireAreaNo(request.nextUrl.searchParams)
    const data = await getKmaPollenForecast(areaNo)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=21600',
      },
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
