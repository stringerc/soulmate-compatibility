import type { Metadata } from 'next'
import './globals.css'
import ThemeScript from '@/components/ThemeScript'

export const metadata: Metadata = {
  title: 'Soulmate Compatibility Calculator | 32D Personality Analysis',
  description: 'Discover your soulmate compatibility through scientifically-grounded 32-dimensional personality analysis. Test astrology and numerology features empirically. Free compatibility calculator.',
  keywords: ['soulmate', 'compatibility', 'relationship', 'personality test', 'compatibility calculator', 'astrology', 'numerology', '32 dimensions', 'relationship analysis'],
  authors: [{ name: 'Soulmate Compatibility' }],
  creator: 'Soulmate Compatibility',
  publisher: 'Soulmate Compatibility',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://soulmates.syncscript.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Soulmate Compatibility Calculator | 32D Personality Analysis',
    description: 'Discover your soulmate compatibility through scientifically-grounded 32-dimensional personality analysis.',
    url: 'https://soulmates.syncscript.app',
    siteName: 'Soulmate Compatibility',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Soulmate Compatibility Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soulmate Compatibility Calculator',
    description: 'Discover your soulmate compatibility through scientifically-grounded 32-dimensional personality analysis.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  )
}

