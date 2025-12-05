/**
 * Suppress expected console warnings in production
 * These warnings are from dependencies and don't affect functionality
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Suppress Zustand deprecation warnings (from Vercel analytics)
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress Zustand deprecation warnings
    if (message.includes('DEPRECATED') && message.includes('zustand')) {
      return;
    }
    // Suppress other expected warnings
    if (message.includes('Default export is deprecated')) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Suppress expected 503 errors in console (we have client-side fallback)
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress 503 errors for compatibility API (expected when backend is down)
    if (message.includes('503') && message.includes('compatibility')) {
      return;
    }
    if (message.includes('Service Unavailable') && message.includes('compatibility')) {
      return;
    }
    originalError.apply(console, args);
  };
}

