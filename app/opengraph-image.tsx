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
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {['#4ade80', '#facc15', '#fb923c', '#f87171', '#c084fc'].map((color, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: color,
                opacity: 0.85,
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

      </div>
    ),
    size
  )
}
