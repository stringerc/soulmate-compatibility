'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Theme, getStoredTheme, setStoredTheme, applyTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('auto');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse"></div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md transition-all ${
          theme === 'light'
            ? 'bg-pink-500 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-pink-500 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleThemeChange('auto')}
        className={`p-2 rounded-md transition-all ${
          theme === 'auto'
            ? 'bg-pink-500 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Auto mode (follow system)"
        title="Auto mode (follow system)"
      >
        <Monitor className="w-5 h-5" />
      </button>
    </div>
  );
}

