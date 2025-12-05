import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import SessionProvider from '@/components/SessionProvider'
import '@/lib/suppressConsoleWarnings'
import NavBar from '@/components/NavBar'
import MobileOptimizer from '@/components/MobileOptimizer'

export const metadata: Metadata = {
  title: 'Soulmates - Self-Discovery & Compatibility',
  description: 'Discover yourself and explore compatibility with soulmates.syncscript.app',
  icons: {
    icon: '/favicon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover', // For iOS notch support
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ec4899' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Soulmates',
  },
  formatDetection: {
    telephone: false,
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Soulmates" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // EARLIEST POSSIBLE console warning suppression (before ANY other scripts)
              (function() {
                'use strict';
                // Suppress Zustand deprecation warnings
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const msg = args[0]?.toString() || '';
                  if (msg.includes('DEPRECATED') || msg.includes('Default export is deprecated') || msg.includes('zustand')) {
                    return; // Suppress
                  }
                  originalWarn.apply(console, args);
                };
                
                // Suppress 503 errors for compatibility API
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args[0]?.toString() || '';
                  const url = args.find(a => typeof a === 'string' && a.includes('/compatibility/explore'))?.toString() || '';
                  if (msg.includes('503') || msg.includes('Service Unavailable') || url.includes('/compatibility/explore')) {
                    return; // Suppress expected 503 errors
                  }
                  originalError.apply(console, args);
                };
                
                // Override fetch to suppress 503 network errors
                if (typeof window !== 'undefined' && window.fetch) {
                  const originalFetch = window.fetch;
                  window.fetch = function(input, init) {
                    return originalFetch.call(this, input, init).catch(function(error) {
                      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input && typeof input === 'object' && 'url' in input ? input.url : '');
                      if (url.includes('/compatibility/explore')) {
                        // Silently handle - client-side fallback works
                        throw error;
                      }
                      throw error;
                    });
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200">
        <MobileOptimizer />
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

