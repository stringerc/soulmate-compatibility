/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        soulmates: {
          pink: '#ec4899',
          purple: '#a855f7',
          indigo: '#6366f1',
          blue: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}

