/**
 * Advanced Analytics System
 * Enhanced tracking for A/B tests, conversion funnels, retention, and performance
 */

import { logSoulmatesEvent } from "./analytics";

export interface ConversionFunnelStep {
  step: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ABTestResult {
  testName: string;
  variant: string;
  conversionEvent: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface RetentionMetric {
  userId: string;
  firstSeen: number;
  lastSeen: number;
  daysActive: number;
  streak: number;
  totalSessions: number;
}

/**
 * Track conversion funnel step
 */
export function trackFunnelStep(
  step: string,
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  try {
    const funnelData: ConversionFunnelStep = {
      step,
      timestamp: Date.now(),
      metadata: metadata || {},
    };

    // Store in localStorage for persistence
    const existing = JSON.parse(
      localStorage.getItem('soulmates_funnel') || '[]'
    );
    existing.push(funnelData);
    localStorage.setItem('soulmates_funnel', JSON.stringify(existing.slice(-20))); // Keep last 20 steps

    // Log to analytics
    logSoulmatesEvent({
      name: 'funnel_step' as any,
      payload: funnelData,
    });
  } catch (e) {
    console.error('Failed to track funnel step:', e);
  }
}

/**
 * Track A/B test conversion
 */
export function trackABTestConversion(
  testName: string,
  variant: string,
  conversionEvent: string,
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  try {
    const result: ABTestResult = {
      testName,
      variant,
      conversionEvent,
      timestamp: Date.now(),
      userId: localStorage.getItem('user_id') || undefined,
      sessionId: getSessionId(),
    };

    // Store in localStorage
    const existing = JSON.parse(
      localStorage.getItem('soulmates_ab_tests') || '[]'
    );
    existing.push(result);
    localStorage.setItem('soulmates_ab_tests', JSON.stringify(existing.slice(-100))); // Keep last 100

    // Log to analytics
    logSoulmatesEvent({
      name: 'ab_test_conversion' as any,
      payload: { ...result, ...metadata },
    });
  } catch (e) {
    console.error('Failed to track A/B test conversion:', e);
  }
}

/**
 * Track retention metric
 */
export function trackRetentionMetric(metric: Partial<RetentionMetric>): void {
  if (typeof window === 'undefined') return;

  try {
    const userId = localStorage.getItem('user_id') || 'anonymous';
    const existing = JSON.parse(
      localStorage.getItem(`soulmates_retention_${userId}`) || '{}'
    );

    const updated: RetentionMetric = {
      userId,
      firstSeen: existing.firstSeen || Date.now(),
      lastSeen: Date.now(),
      daysActive: metric.daysActive || existing.daysActive || 1,
      streak: metric.streak || existing.streak || 0,
      totalSessions: (existing.totalSessions || 0) + 1,
      ...metric,
    };

    localStorage.setItem(`soulmates_retention_${userId}`, JSON.stringify(updated));

    // Log to analytics
    logSoulmatesEvent({
      name: 'retention_metric' as any,
      payload: updated,
    });
  } catch (e) {
    console.error('Failed to track retention metric:', e);
  }
}

/**
 * Track performance metric
 */
export function trackPerformanceMetric(
  metricName: string,
  value: number,
  unit: string = 'ms'
): void {
  if (typeof window === 'undefined') return;

  try {
    logSoulmatesEvent({
      name: 'performance_metric' as any,
      payload: {
        metric_name: metricName,
        value,
        unit,
        timestamp: Date.now(),
      },
    });
  } catch (e) {
    console.error('Failed to track performance metric:', e);
  }
}

/**
 * Track page load performance
 */
export function trackPageLoadPerformance(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  try {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      trackPerformanceMetric('page_load_dns', perfData.domainLookupEnd - perfData.domainLookupStart);
      trackPerformanceMetric('page_load_tcp', perfData.connectEnd - perfData.connectStart);
      trackPerformanceMetric('page_load_request', perfData.responseStart - perfData.requestStart);
      trackPerformanceMetric('page_load_response', perfData.responseEnd - perfData.responseStart);
      trackPerformanceMetric('page_load_dom', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
      trackPerformanceMetric('page_load_total', perfData.loadEventEnd - perfData.fetchStart);
    }

    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry?.renderTime) {
            trackPerformanceMetric('lcp', lastEntry.renderTime - lastEntry.startTime);
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }
    }

    // Track First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              trackPerformanceMetric('fid', entry.processingStart - entry.startTime);
            }
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }
    }
  } catch (e) {
    console.error('Failed to track page load performance:', e);
  }
}

/**
 * Track Interaction to Next Paint (INP)
 */
export function trackINP(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    let maxINP = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const delay = entry.processingStart - entry.startTime;
        if (delay > maxINP) {
          maxINP = delay;
        }
      });
    });

    observer.observe({ entryTypes: ['event'] });

    // Report max INP on page unload
    window.addEventListener('beforeunload', () => {
      if (maxINP > 0) {
        trackPerformanceMetric('inp', maxINP);
      }
    });
  } catch (e) {
    console.error('Failed to track INP:', e);
  }
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  try {
    let sessionId = sessionStorage.getItem('soulmates_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('soulmates_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    return '';
  }
}

/**
 * Get analytics summary for dashboard
 */
export function getAnalyticsSummary(): {
  funnelSteps: ConversionFunnelStep[];
  abTestResults: ABTestResult[];
  retentionMetrics: RetentionMetric | null;
} {
  if (typeof window === 'undefined') {
    return {
      funnelSteps: [],
      abTestResults: [],
      retentionMetrics: null,
    };
  }

  try {
    const userId = localStorage.getItem('user_id') || 'anonymous';
    
    return {
      funnelSteps: JSON.parse(localStorage.getItem('soulmates_funnel') || '[]'),
      abTestResults: JSON.parse(localStorage.getItem('soulmates_ab_tests') || '[]'),
      retentionMetrics: JSON.parse(
        localStorage.getItem(`soulmates_retention_${userId}`) || 'null'
      ),
    };
  } catch (e) {
    console.error('Failed to get analytics summary:', e);
    return {
      funnelSteps: [],
      abTestResults: [],
      retentionMetrics: null,
    };
  }
}

/**
 * Initialize advanced analytics tracking
 */
export function initializeAdvancedAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Track page load performance
  if (document.readyState === 'complete') {
    trackPageLoadPerformance();
  } else {
    window.addEventListener('load', trackPageLoadPerformance);
  }

  // Track INP
  trackINP();

  // Track session start
  trackFunnelStep('session_start', {
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  });
}

