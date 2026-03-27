import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_POLLEN_API_KEY
  const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&days=5&languageCode=ja`

  const res = await fetch(url, { next: { revalidate: 21600 } })
  const data = await res.json()

  return NextResponse.json(data)
}
