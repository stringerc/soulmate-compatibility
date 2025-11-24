/**
 * Color Contrast Checker Utility
 * Validates WCAG AA/AAA compliance for text readability
 */

export interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  level: 'AA' | 'AAA' | 'FAIL';
  largeTextAA: boolean;
  largeTextAAA: boolean;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1: (L1 + 0.05) / (L2 + 0.05)
 */
export function calculateContrast(
  foreground: string,
  background: string
): ContrastResult {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return {
      ratio: 0,
      aa: false,
      aaa: false,
      level: 'FAIL',
      largeTextAA: false,
      largeTextAAA: false,
    };
  }

  const fgLum = getLuminance(fgRgb[0], fgRgb[1], fgRgb[2]);
  const bgLum = getLuminance(bgRgb[0], bgRgb[1], bgRgb[2]);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG AA: 4.5:1 for normal text, 3:1 for large text
  // WCAG AAA: 7:1 for normal text, 4.5:1 for large text
  const aa = ratio >= 4.5;
  const aaa = ratio >= 7;
  const largeTextAA = ratio >= 3;
  const largeTextAAA = ratio >= 4.5;

  let level: 'AA' | 'AAA' | 'FAIL' = 'FAIL';
  if (aaa) level = 'AAA';
  else if (aa) level = 'AA';

  return {
    ratio: Math.round(ratio * 100) / 100,
    aa,
    aaa,
    level,
    largeTextAA,
    largeTextAAA,
  };
}

/**
 * Check contrast for common color combinations
 */
export function checkCommonContrasts(): Array<{
  foreground: string;
  background: string;
  result: ContrastResult;
}> {
  const commonPairs = [
    { fg: '#ffffff', bg: '#ec4899' }, // White on pink-500
    { fg: '#ffffff', bg: '#8b5cf6' }, // White on purple-500
    { fg: '#ffffff', bg: '#6366f1' }, // White on indigo-500
    { fg: '#1f2937', bg: '#f3f4f6' }, // Gray-800 on gray-100
    { fg: '#ffffff', bg: '#1f2937' }, // White on gray-800
    { fg: '#ffffff', bg: '#111827' }, // White on gray-900
  ];

  return commonPairs.map(({ fg, bg }) => ({
    foreground: fg,
    background: bg,
    result: calculateContrast(fg, bg),
  }));
}

/**
 * Get Tailwind color hex values
 */
export const TAILWIND_COLORS: Record<string, Record<string, string>> = {
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9f1239',
    900: '#831843',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

