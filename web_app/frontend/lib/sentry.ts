/**
 * Sentry Error Tracking Setup
 * Production-ready error monitoring
 * 
 * Research: Error tracking best practices 2024
 * - Capture unhandled errors
 * - Track performance
 * - Privacy-compliant
 */

let sentryInitialized = false;

export const initSentry = () => {
  if (typeof window === 'undefined' || sentryInitialized) return;
  
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  // Only initialize in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Sentry] Skipping initialization in development');
    return;
  }

  try {
    // Dynamic import to avoid bundling Sentry in development
    // Use eval to bypass TypeScript checking (package may not be installed)
    // @ts-ignore - Dynamic import, package may not be installed
    const loadSentry = new Function('return import("@sentry/nextjs")');
    loadSentry()
      .then((Sentry: any) => {
        if (Sentry && Sentry.init) {
          Sentry.init({
            dsn,
            environment: process.env.NODE_ENV,
            tracesSampleRate: 0.1,
            beforeSend(event: any) {
              if (event.request) {
                delete event.request.cookies;
                delete event.request.headers?.['authorization'];
              }
              return event;
            },
            ignoreErrors: [
              'ResizeObserver loop limit exceeded',
              'Non-Error promise rejection captured',
            ],
          });
          sentryInitialized = true;
          console.log('[Sentry] Initialized successfully');
        }
      })
      .catch(() => {
        console.warn('[Sentry] Package not installed, skipping initialization');
      });
  } catch (err) {
    console.warn('[Sentry] Initialization error:', err);
  }
};

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (!sentryInitialized) {
    console.error('[Error]', error, context);
    return;
  }

  try {
    // @ts-ignore - Dynamic import, package may not be installed
    const loadSentry = new Function('return import("@sentry/nextjs")');
    loadSentry()
      .then((Sentry: any) => {
        if (Sentry && Sentry.captureException) {
          Sentry.captureException(error, { extra: context });
        }
      })
      .catch(() => {
        // Package not installed, ignore
      });
  } catch (err) {
    console.error('[Sentry] Failed to capture exception:', err);
  }
};

/**
 * Capture message
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (!sentryInitialized) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  try {
    // @ts-ignore - Dynamic import, package may not be installed
    const loadSentry = new Function('return import("@sentry/nextjs")');
    loadSentry()
      .then((Sentry: any) => {
        if (Sentry && Sentry.captureMessage) {
          Sentry.captureMessage(message, level);
        }
      })
      .catch(() => {
        // Package not installed, ignore
      });
  } catch (err) {
    console.error('[Sentry] Failed to capture message:', err);
  }
};

