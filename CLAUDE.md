# 花粉の呼吸 — Project Overview

A Japanese pollen & weather app that recommends outfits based on today's pollen levels and temperature.

Live: https://breath-of-pollen.vercel.app

## Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Font**: Noto Sans JP (Google Fonts)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics + Google Analytics (G-LS74E55465)

## External APIs

| API | Purpose | Cache |
|-----|---------|-------|
| Google Pollen API (`pollen.googleapis.com/v1/forecast:lookup`) | Cedar/Cypress pollen forecast (5 days) | 6h (`revalidate: 21600`) |
| Open-Meteo (`api.open-meteo.com/v1/forecast`) | Current weather, hourly, 7-day forecast | 30min (`revalidate: 1800`) |
| Open-Meteo reverse geocoding | Location name from lat/lon | — |

API key stored in env: `GOOGLE_POLLEN_API_KEY`

## Features

- GPS auto-detect location (falls back to prefecture picker)
- Prefecture picker (`lib/prefecture-coords.ts`) — manual location selection
- Today view: temperature, weather, pollen card (Cedar/Cypress), outfit recommendation, UV/PM2.5/humidity info cards, hourly chart
- Weekly view: 7-day forecast with pollen level per day
- Settings view: location change
- Outfit detail sheet with laundry advice
- OG image (`app/opengraph-image.tsx`) — static, edge runtime, cached 24h
- Twitter/SNS card support (`robots.txt` allows Twitterbot)

## Pollen Levels

`1` 少ない → `2` やや多い → `3` 多い → `4` 非常に多い → `5` 極めて多い

Maps from Google Pollen API `indexInfo.value` via `lib/weather-utils.ts → mapPollenIndex()`.

## Key Files

```
app/
  page.tsx              # Main app shell, fetches all data
  layout.tsx            # Root layout, metadata, OG tags
  opengraph-image.tsx   # Static OG image (edge)
  api/
    weather/route.ts    # Open-Meteo proxy
    pollen/route.ts     # Google Pollen API proxy
    location/route.ts   # Reverse geocoding proxy
components/weather/
  pollen-card.tsx       # Cedar/Cypress pollen display
  outfit-card.tsx       # Outfit suggestion cards
  outfit-detail.tsx     # Outfit detail sheet
  hourly-chart.tsx      # Hourly temperature chart
  weekly-view.tsx       # 7-day forecast
  settings-view.tsx     # Settings tab
  location-picker.tsx   # Prefecture picker UI
  bottom-nav.tsx        # Tab navigation
  info-card.tsx         # UV/PM2.5/Humidity cards
  weather-icon.tsx      # Weather condition icons
lib/
  weather-utils.ts      # Weather code mapping, outfit logic, pollen label
  prefecture-coords.ts  # All 47 prefectures lat/lon
```

## Notes

- PM2.5 card currently shows static "良好" — not yet connected to real data
