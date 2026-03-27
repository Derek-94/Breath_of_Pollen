import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('current', 'temperature_2m,weathercode,relative_humidity_2m,uv_index')
  url.searchParams.set('hourly', 'temperature_2m,weathercode')
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'Asia/Tokyo')
  url.searchParams.set('forecast_days', '7')

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } })
  const data = await res.json()

  return NextResponse.json(data)
}
