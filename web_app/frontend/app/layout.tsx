import type { Metadata } from 'next'
import './globals.css'
import ThemeScript from '@/components/ThemeScript'

export const metadata: Metadata = {
  title: 'Soulmate Compatibility Calculator',
  description: 'Calculate romantic compatibility using 32-dimensional trait analysis',
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

