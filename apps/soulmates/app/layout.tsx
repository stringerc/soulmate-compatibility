import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import SessionProvider from '@/components/SessionProvider'
import '@/lib/suppressConsoleWarnings'
import NavBar from '@/components/NavBar'
import MobileOptimizer from '@/components/MobileOptimizer'
import ConsoleSuppressor from '@/components/ConsoleSuppressor'

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
        {/* Load suppression script FIRST, before any other scripts - BLOCKING (no async/defer) */}
        {/* Use dangerouslySetInnerHTML to ensure it's truly blocking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Inline suppression - runs IMMEDIATELY before any external scripts
              (function() {
                'use strict';
                const _warn = console.warn.bind(console);
                const _error = console.error.bind(console);
                const _log = console.log.bind(console);
                
                console.warn = function() {
                  const msg = arguments[0]?.toString() || '';
                  if (msg.includes('DEPRECATED') || msg.includes('zustand') || msg.includes('Default export')) {
                    return;
                  }
                  return _warn.apply(console, arguments);
                };
                
                console.error = function() {
                  const msg = arguments[0]?.toString() || '';
                  const hasUrl = Array.from(arguments).some(a => typeof a === 'string' && a.includes('/compatibility/explore'));
                  if ((msg.includes('503') || msg.includes('Service Unavailable')) && hasUrl) {
                    return;
                  }
                  return _error.apply(console, arguments);
                };
                
                console.log = function() {
                  const msg = arguments[0]?.toString() || '';
                  if (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503')) {
                    return;
                  }
                  return _log.apply(console, arguments);
                };
              })();
            `,
          }}
        />
        <script src="/suppress-console.js" async={false} defer={false} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Backup inline suppression (in case external script fails to load)
              (function() {
                'use strict';
                try {
                  const _warn = console.warn || function(){};
                  const _error = console.error || function(){};
                  const _log = console.log || function(){};
                  
                  console.warn = function() {
                    const msg = arguments[0]?.toString() || '';
                    if (msg.includes('DEPRECATED') || msg.includes('zustand') || msg.includes('Default export')) {
                      return;
                    }
                    return _warn.apply(console, arguments);
                  };
                  
                  console.error = function() {
                    const msg = arguments[0]?.toString() || '';
                    const hasUrl = Array.from(arguments).some(a => typeof a === 'string' && a.includes('/compatibility/explore'));
                    if ((msg.includes('503') || msg.includes('Service Unavailable')) && hasUrl) {
                      return;
                    }
                    return _error.apply(console, arguments);
                  };
                  
                  console.log = function() {
                    const msg = arguments[0]?.toString() || '';
                    if (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503')) {
                      return;
                    }
                    return _log.apply(console, arguments);
                  };
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200">
        <ConsoleSuppressor />
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

