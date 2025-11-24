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
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1, // 10% of transactions
        beforeSend(event, hint) {
          // Filter out sensitive data
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers?.['authorization'];
          }
          return event;
        },
        ignoreErrors: [
          // Ignore common browser extensions
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
        ],
      });
      sentryInitialized = true;
      console.log('[Sentry] Initialized successfully');
    }).catch((err) => {
      console.warn('[Sentry] Failed to initialize:', err);
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

  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(error, {
      extra: context,
    });
  });
};

/**
 * Capture message
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (!sentryInitialized) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureMessage(message, level);
  });
};

