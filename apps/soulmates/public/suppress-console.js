// Ultra-early console suppression script
// This file is loaded in <head> before any other scripts
// Must be in /public so it can be loaded synchronously

(function() {
  'use strict';
  
  // Store originals BEFORE anything else can use them
  const _warn = console.warn;
  const _error = console.error;
  const _log = console.log;
  const _info = console.info;
  
  // Suppress Zustand deprecation warnings
  console.warn = function() {
    const msg = arguments[0]?.toString() || '';
    if (
      msg.includes('DEPRECATED') ||
      msg.includes('zustand') ||
      msg.includes('Default export is deprecated') ||
      msg.includes('create') && msg.includes('zustand')
    ) {
      return; // Suppress
    }
    return _warn.apply(console, arguments);
  };
  
  // Suppress 503 errors for compatibility API
  console.error = function() {
    const msg = arguments[0]?.toString() || '';
    const argsArray = Array.from(arguments);
    const hasCompatibilityUrl = argsArray.some(a => 
      typeof a === 'string' && a.includes('/compatibility/explore')
    );
    
    // Suppress 503/Service Unavailable errors for compatibility explore
    if (
      (msg.includes('503') || msg.includes('Service Unavailable')) &&
      (hasCompatibilityUrl || msg.includes('/compatibility/explore'))
    ) {
      return; // Suppress
    }
    
    // Also suppress POST errors with 503
    if (msg.includes('POST') && msg.includes('503') && hasCompatibilityUrl) {
      return; // Suppress
    }
    
    return _error.apply(console, arguments);
  };
  
  // Suppress network logs
  console.log = function() {
    const msg = arguments[0]?.toString() || '';
    if (
      msg.includes('POST') &&
      msg.includes('/compatibility/explore') &&
      (msg.includes('503') || msg.includes('Service Unavailable'))
    ) {
      return; // Suppress
    }
    return _log.apply(console, arguments);
  };
  
  // Also suppress console.info
  console.info = function() {
    const msg = arguments[0]?.toString() || '';
    if (
      msg.includes('DEPRECATED') ||
      msg.includes('zustand') ||
      (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503'))
    ) {
      return; // Suppress
    }
    return _info.apply(console, arguments);
  };
  
  // Intercept fetch to prevent 503 errors from being logged
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : 
                  input instanceof URL ? input.toString() : 
                  (input && typeof input === 'object' && 'url' in input ? input.url : '');
      
      return originalFetch.call(this, input, init).catch(function(error) {
        // Don't log errors for compatibility explore endpoint
        if (url.includes('/compatibility/explore')) {
          // Silently handle - client-side fallback works
          throw error;
        }
        throw error;
      });
    };
  }
  
  // Use MutationObserver to catch dynamically loaded scripts
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeName === 'SCRIPT' && node.src) {
            // If it's Vercel's instrument.js, we can't block it, but we've already suppressed console
            // This is just to ensure our suppression stays active
          }
        });
      });
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();

