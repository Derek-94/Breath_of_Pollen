import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-jp"
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f8f8f6',
}

const APP_URL = 'https://breath-of-pollen.vercel.app'

export const metadata: Metadata = {
  title: '花粉の呼吸 | 今日の天気・花粉・コーデ',
  description: '今日の花粉レベルと気温から、最適なコーデを提案。スギ・ヒノキ花粉情報とマスク・服装アドバイスがひと目でわかる。 / Check today\'s pollen levels and get outfit recommendations based on weather and cedar pollen forecast across Japan.',
  generator: 'v0.app',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: '花粉の呼吸',
    description: '今日の花粉レベルと気温から、最適なコーデを提案。スギ・ヒノキ花粉・天気・服装がひと目でわかる。 / Outfit suggestions based on pollen & weather.',
    url: APP_URL,
    siteName: '花粉の呼吸',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '花粉の呼吸 - 天気・花粉・コーデアプリ',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '花粉の呼吸',
    description: '今日の花粉レベルと気温から、最適なコーデを提案。 / Outfit tips based on pollen & weather.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
