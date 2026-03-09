/**
 * ThemeToggle - Component to switch between light and dark modes
 * Accessible toggle button using semantic HTML
 */

'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useUiStore } from '@/store';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useUiStore();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="p-2 rounded-lg border border-current/20 hover:border-current/40 transition-all duration-200 text-primary"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
};
