/**
 * Suppress expected console warnings
 * These warnings are from dependencies and don't affect functionality
 * Must run early to catch Vercel's instrument.js warnings
 */

if (typeof window !== 'undefined') {
  // Suppress Zustand deprecation warnings (from Vercel analytics)
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress Zustand deprecation warnings
    if (message.includes('DEPRECATED') && (message.includes('zustand') || message.includes('Default export is deprecated'))) {
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
    if (message.includes('503') && (message.includes('compatibility') || message.includes('Service Unavailable'))) {
      return;
    }
    if (message.includes('Service Unavailable') && message.includes('compatibility')) {
      return;
    }
    // Suppress network errors for compatibility explore endpoint
    const url = args.find(arg => typeof arg === 'string' && arg.includes('/compatibility/explore'));
    if (url && message.includes('503')) {
      return;
    }
    originalError.apply(console, args);
  };

  // Also suppress fetch errors for 503 responses
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const response = await originalFetch(input, init);
      // Don't log 503 errors for compatibility API
      if (!response.ok && response.status === 503) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        if (url.includes('/compatibility/explore')) {
          // Silently handle - client-side fallback will work
          return response;
        }
      }
      return response;
    } catch (error) {
      // Don't log fetch errors for compatibility API
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request)?.url || '';
      if (url.includes('/compatibility/explore')) {
        // Silently handle - client-side fallback will work
        throw error;
      }
      throw error;
    }
  };
}

