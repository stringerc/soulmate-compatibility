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
  // Store originals immediately
  const _warn = console.warn;
  const _error = console.error;
  const _log = console.log;
  
  // Suppress Zustand deprecation warnings (from Vercel analytics)
  console.warn = function(...args: any[]) {
    const msg = args[0]?.toString() || '';
    if (msg.includes('DEPRECATED') || msg.includes('zustand') || msg.includes('Default export')) {
      return;
    }
    return _warn.apply(console, args);
  };
  
  // Suppress 503 errors for compatibility API
  console.error = function(...args: any[]) {
    const msg = args[0]?.toString() || '';
    const hasCompatibilityUrl = args.some(a => typeof a === 'string' && a.includes('/compatibility/explore'));
    
    // Suppress if message contains 503/Service Unavailable AND has compatibility URL
    if ((msg.includes('503') || msg.includes('Service Unavailable')) && hasCompatibilityUrl) {
      return;
    }
    
    // Also suppress POST errors with 503
    if (msg.includes('POST') && msg.includes('503') && hasCompatibilityUrl) {
      return;
    }
    
    return _error.apply(console, args);
  };
  
  // Suppress network logs for 503 errors
  console.log = function(...args: any[]) {
    const msg = args[0]?.toString() || '';
    if (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503')) {
      return;
    }
    return _log.apply(console, args);
  };
}

export default function ConsoleSuppressor() {
  // Component doesn't need to do anything - suppression already active
  // Suppression runs immediately when module loads (above)
  return null;
}
