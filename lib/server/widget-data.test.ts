import { describe, expect, it } from 'vitest'
import { ApiRouteError, requireCoordinates } from './api'
import {
  detectWidgetCountry,
  normalizeGooglePollen,
  normalizeKmaPollen,
} from './widget-data'

describe('requireCoordinates', () => {
  it('parses valid coordinates', () => {
    expect(requireCoordinates(new URLSearchParams({
      lat: '35.6762',
      lon: '139.6503',
    }))).toEqual({ lat: 35.6762, lon: 139.6503 })
  })

  it('rejects missing or out-of-range coordinates', () => {
    expect(() => requireCoordinates(new URLSearchParams())).toThrow(ApiRouteError)
    expect(() => requireCoordinates(new URLSearchParams({
      lat: '91',
      lon: '139',
    }))).toThrow(ApiRouteError)
  })
})

describe('detectWidgetCountry', () => {
  it('detects Japan and South Korea', () => {
    expect(detectWidgetCountry(35.6762, 139.6503)).toBe('JP')
    expect(detectWidgetCountry(37.5665, 126.978)).toBe('KR')
  })

  it('rejects unsupported regions', () => {
    expect(() => detectWidgetCountry(40.7128, -74.006)).toThrow(ApiRouteError)
  })
})

describe('normalizeGooglePollen', () => {
  it('normalizes cedar and cypress without treating missing data as low', () => {
    expect(normalizeGooglePollen({
      regionCode: 'JP',
      dailyInfo: [
        {
          plantInfo: [
            { code: 'JAPANESE_CEDAR', indexInfo: { value: 4 } },
            { code: 'JAPANESE_CYPRESS', indexInfo: { value: 2 } },
          ],
        },
        {
          plantInfo: [
            { code: 'JAPANESE_CEDAR' },
            { code: 'JAPANESE_CYPRESS', indexInfo: { value: 3 } },
          ],
        },
      ],
    })).toMatchObject({
      available: true,
      overall: 4,
      plants: [
        { type: 'cedar', level: 4, days: [4, null] },
        { type: 'cypress', level: 2, days: [2, 3] },
      ],
      dailyOverall: [4, 3],
    })
  })
})

describe('normalizeKmaPollen', () => {
  it('keeps today unknown when an evening forecast starts tomorrow', () => {
    expect(normalizeKmaPollen({
      schemaVersion: 1,
      source: 'KMA',
      areaNo: '1100000000',
      issuedAt: '2026081718',
      season: 'autumn',
      offSeason: false,
      forecastStartOffset: 1,
      plants: [{ type: 'weeds', days: [2, 3, 4] }],
      dailyOverall: [2, 3, 4],
    })).toMatchObject({
      available: true,
      overall: null,
      forecastStartOffset: 1,
      plants: [{ type: 'weeds', level: null, days: [2, 3, 4] }],
    })
  })
})
