/**
 * Google Analytics 4 Integration
 * Privacy-first, GDPR-compliant analytics implementation
 * 
 * Research: Google Analytics best practices 2024
 * - Privacy-first approach
 * - Consent management
 * - Event tracking
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Initialize Google Analytics
 * Only loads if measurement ID is provided and user hasn't opted out
 */
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  // Check opt-out preference
  const optOut = localStorage.getItem('analytics-opt-out') === 'true';
  if (optOut || !GA_MEASUREMENT_ID) return;

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    anonymize_ip: true, // GDPR compliance
    allow_google_signals: false, // Privacy-first
    allow_ad_personalization_signals: false,
  });
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Set user properties (anonymized)
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('set', 'user_properties', properties);
};

