import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import SessionProvider from '@/components/SessionProvider'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Soulmates - Self-Discovery & Compatibility',
  description: 'Discover yourself and explore compatibility with soulmates.syncscript.app',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200">
        <SessionProvider>
          <AnalyticsProvider>
            <NavBar />
            {children}
          </AnalyticsProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

