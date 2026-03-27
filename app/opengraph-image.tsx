import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '花粉の呼吸 - 天気・花粉・コーデアプリ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f8f7f4',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          gap: 24,
        }}
      >
        {/* Pollen dots decoration */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {['#4ade80', '#facc15', '#fb923c', '#f87171', '#c084fc'].map((color, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: color,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: '#1a1a2e',
            letterSpacing: '-2px',
          }}
        >
          花粉の呼吸
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#6b7280',
            fontWeight: 400,
          }}
        >
          天気・花粉・コーデがひと目でわかる
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {['😷 花粉情報', '🌡️ 気温', '🧥 コーデ提案', '📅 週間予報'].map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                background: '#fff',
                color: '#374151',
                fontSize: 22,
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
