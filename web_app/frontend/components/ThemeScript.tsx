import { initializeTheme } from '@/lib/theme';

export default function ThemeScript() {
  const code = `
    (function() {
      try {
        const theme = localStorage.getItem('soulmate-theme') || 'auto';
        const root = document.documentElement;
        
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          }
        }
      } catch (e) {
        // Ignore errors
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

