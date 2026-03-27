import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'tenki-plus-app/1.0' },
    next: { revalidate: 86400 },
  })
  const data = await res.json()

  const address = data.address ?? {}
  const city = address.city ?? address.town ?? address.village ?? address.county ?? ''
  const prefecture = address.state ?? ''
  const location = prefecture && city ? `${prefecture}${city}` : city || prefecture || '現在地'

  return NextResponse.json({ location })
}
