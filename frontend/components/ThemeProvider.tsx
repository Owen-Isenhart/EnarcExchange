/**
 * ThemeProvider - Client-side theme initialization component
 * Ensures theme is applied on mount and system preference is respected
 */

'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { initializeTheme } = useUiStore();

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
};
