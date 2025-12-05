/**
 * Mobile Optimization Utilities
 * Handles mobile-specific optimizations and feature detection
 */

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);
}

/**
 * Get safe area insets for iOS devices (notch support)
 */
export function getSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  if (typeof window === 'undefined' || !isIOS()) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Use CSS env() variables if available
  const style = getComputedStyle(document.documentElement);
  const top = parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10);
  const bottom = parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10);
  const left = parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10);
  const right = parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10);

  return { top, bottom, left, right };
}

/**
 * Prevent zoom on double tap (iOS)
 */
export function preventDoubleTapZoom(): void {
  if (typeof window === 'undefined' || !isIOS()) return;

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

/**
 * Optimize touch targets (minimum 44x44px for accessibility)
 */
export function ensureTouchTargetSize(element: HTMLElement): void {
  if (typeof window === 'undefined' || !isTouchDevice()) return;

  const rect = element.getBoundingClientRect();
  const minSize = 44; // iOS HIG and Material Design minimum

  if (rect.width < minSize || rect.height < minSize) {
    const padding = Math.max(0, (minSize - Math.min(rect.width, rect.height)) / 2);
    element.style.padding = `${padding}px`;
  }
}

/**
 * Get viewport height accounting for mobile browser UI
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  
  // Use visual viewport if available (better for mobile)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  return window.innerHeight;
}

/**
 * Set CSS custom properties for viewport height
 */
export function setViewportHeight(): void {
  if (typeof window === 'undefined') return;

  const setHeight = () => {
    const vh = getViewportHeight() * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setHeight();
  window.addEventListener('resize', setHeight);
  window.addEventListener('orientationchange', setHeight);
  
  // Visual viewport changes (mobile browser UI)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setHeight);
  }
}

/**
 * Initialize mobile optimizations
 */
export function initializeMobileOptimizations(): void {
  if (typeof window === 'undefined') return;

  // Set viewport height
  setViewportHeight();

  // Prevent double tap zoom on iOS
  preventDoubleTapZoom();

  // Add mobile class to body
  if (isMobile()) {
    document.body.classList.add('mobile-device');
  }

  // Add touch class if touch device
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }

  // Add iOS class if iOS
  if (isIOS()) {
    document.body.classList.add('ios-device');
  }
}

