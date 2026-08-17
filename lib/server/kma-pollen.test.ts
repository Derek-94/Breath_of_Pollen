import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  extractKmaDays,
  getDailyOverall,
  getKmaContext,
  getKmaPollenForecast,
  mapKmaGrade,
  type KmaPlantForecast,
} from './kma-pollen'

const originalKmaApiKey = process.env.KMA_API_KEY

afterEach(() => {
  vi.unstubAllGlobals()
  if (originalKmaApiKey === undefined) {
    delete process.env.KMA_API_KEY
  } else {
    process.env.KMA_API_KEY = originalKmaApiKey
  }
})

describe('mapKmaGrade', () => {
  it.each([
    [0, 1],
    ['0', 1],
    [1, 2],
    ['2', 3],
    [3, 4],
  ])('maps KMA grade %s to app level %s', (grade, level) => {
    expect(mapKmaGrade(grade)).toBe(level)
  })
})

describe('getKmaContext', () => {
  it('uses the same-day 06:00 issue during spring', () => {
    expect(getKmaContext(new Date('2026-04-09T01:00:00.000Z'))).toEqual({
      season: 'spring',
      issueTime: '2026040906',
    })
  })

  it('uses the previous-day 18:00 issue before 06:00 KST', () => {
    expect(getKmaContext(new Date('2026-04-08T19:00:00.000Z'))).toEqual({
      season: 'spring',
      issueTime: '2026040818',
    })
  })

  it('marks winter as off-season without an issue time', () => {
    expect(getKmaContext(new Date('2026-01-15T03:00:00.000Z'))).toEqual({
      season: 'off',
      issueTime: null,
    })
  })
})

describe('extractKmaDays', () => {
  it('preserves the date offset when the 18:00 issue omits today', () => {
    expect(extractKmaDays({
      response: {
        header: { resultCode: '00' },
        body: {
          items: {
            item: [{
              today: '',
              tomorrow: '1',
              dayaftertomorrow: '2',
              twodaysaftertomorrow: '3',
            }],
          },
        },
      },
    })).toEqual({
      days: [2, 3, 4],
      forecastStartOffset: 1,
    })
  })
})

describe('getDailyOverall', () => {
  it('uses the highest plant level for each day', () => {
    const plants: KmaPlantForecast[] = [
      { type: 'pine', days: [1, 3, 2] },
      { type: 'oak', days: [2, 2, 4] },
    ]

    expect(getDailyOverall(plants)).toEqual([2, 3, 4])
  })
})

describe('getKmaPollenForecast', () => {
  it('returns an off-season response without calling KMA', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getKmaPollenForecast('1100000000', new Date('2026-01-15T03:00:00.000Z')),
    ).resolves.toMatchObject({
      season: 'off',
      offSeason: true,
      plants: [],
      dailyOverall: [],
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('combines pine and oak forecasts during spring', async () => {
    process.env.KMA_API_KEY = 'test-key'
    const responses = [
      ['0', '1', '2'],
      ['1', '2', '3'],
    ]
    const fetchMock = vi.fn().mockImplementation(async () => {
      const values = responses.shift() ?? []
      return new Response(JSON.stringify({
        response: {
          header: { resultCode: '00' },
          body: {
            items: {
              item: [{
                today: values[0],
                tomorrow: values[1],
                dayaftertomorrow: values[2],
              }],
            },
          },
        },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getKmaPollenForecast('1100000000', new Date('2026-04-09T01:00:00.000Z')),
    ).resolves.toMatchObject({
      season: 'spring',
      offSeason: false,
      forecastStartOffset: 0,
      plants: [
        { type: 'pine', days: [1, 2, 3] },
        { type: 'oak', days: [2, 3, 4] },
      ],
      dailyOverall: [2, 3, 4],
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
