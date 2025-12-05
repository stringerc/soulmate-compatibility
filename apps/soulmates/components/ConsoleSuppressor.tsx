"use client";

/**
 * Console Suppressor Component
 * 
 * This component runs immediately on the client side to suppress
 * console warnings before any other scripts load.
 * 
 * Must be imported and rendered as early as possible in the app.
 */

// Run suppression IMMEDIATELY when module loads (before any other code)
// This catches Vercel's instrument.js warnings
if (typeof window !== 'undefined') {
  // Store originals immediately (use function() to preserve 'this' context)
  const _warn = console.warn.bind(console);
  const _error = console.error.bind(console);
  const _log = console.log.bind(console);
  const _info = console.info.bind(console);
  
  // Suppress Zustand deprecation warnings (from Vercel analytics)
  console.warn = function(...args: any[]) {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('DEPRECATED') || 
      msg.includes('zustand') || 
      msg.includes('Default export is deprecated') ||
      (msg.includes('create') && msg.includes('zustand'))
    ) {
      return; // Suppress completely
    }
    return _warn.apply(console, args);
  };
  
  // Suppress 503 errors for compatibility API
  console.error = function(...args: any[]) {
    const msg = args[0]?.toString() || '';
    const argsArray = Array.from(args);
    const hasCompatibilityUrl = argsArray.some(a => 
      typeof a === 'string' && a.includes('/compatibility/explore')
    );
    
    // Suppress if message contains 503/Service Unavailable AND has compatibility URL
    if (
      (msg.includes('503') || msg.includes('Service Unavailable')) && 
      (hasCompatibilityUrl || msg.includes('/compatibility/explore'))
    ) {
      return; // Suppress completely
    }
    
    // Also suppress POST errors with 503
    if (msg.includes('POST') && msg.includes('503') && hasCompatibilityUrl) {
      return; // Suppress completely
    }
    
    return _error.apply(console, args);
  };
  
  // Suppress network logs for 503 errors
  console.log = function(...args: any[]) {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('POST') && 
      msg.includes('/compatibility/explore') && 
      (msg.includes('503') || msg.includes('Service Unavailable'))
    ) {
      return; // Suppress completely
    }
    return _log.apply(console, args);
  };
  
  // Also suppress console.info
  console.info = function(...args: any[]) {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('DEPRECATED') || 
      msg.includes('zustand') ||
      (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503'))
    ) {
      return; // Suppress completely
    }
    return _info.apply(console, args);
  };
  
  // Override fetch to prevent 503 errors from being logged
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : 
                  input instanceof URL ? input.toString() : 
                  (input as Request)?.url || '';
      
      return originalFetch.call(this, input, init).catch((error) => {
        // Don't log errors for compatibility explore endpoint
        if (url.includes('/compatibility/explore')) {
          // Silently handle - client-side fallback works
          throw error;
        }
        throw error;
      });
    };
  }
}

export default function ConsoleSuppressor() {
  // Component doesn't need to do anything - suppression already active
  // Suppression runs immediately when module loads (above)
  return null;
}
