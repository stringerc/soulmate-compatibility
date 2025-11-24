import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}

