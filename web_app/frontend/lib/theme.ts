/**
 * Theme Management Utilities
 * Handles dark mode, theme preferences, and accessibility features
 */

export type Theme = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'soulmate-theme';
const THEME_CLASS = 'dark';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'auto';
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }
  
  return 'auto';
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // localStorage not available
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add(THEME_CLASS);
    } else {
      root.classList.remove(THEME_CLASS);
    }
  } else if (theme === 'dark') {
    root.classList.add(THEME_CLASS);
  } else {
    root.classList.remove(THEME_CLASS);
  }
}

export function initializeTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  
  // Listen for system theme changes
  if (typeof window !== 'undefined' && theme === 'auto') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      applyTheme('auto');
    });
  }
  
  return theme;
}

