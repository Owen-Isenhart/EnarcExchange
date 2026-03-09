/**
 * Theme Types - Type definitions for light/dark mode theming
 */

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  warning: string;
  success: string;
  error: string;
  background: string;
  surface: string;
  surfaceLight: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  glow: string;
}

export const THEME_COLORS: Record<Theme, ThemeColors> = {
  light: {
    primary: '#154734',
    primaryLight: '#2d6b50',
    primaryDark: '#0d2818',
    secondary: '#e87500',
    secondaryLight: '#f5a143',
    secondaryDark: '#b35900',
    warning: '#f59e0b',
    success: '#154734',
    error: '#e87500',
    background: '#f9fafb',
    surface: '#ffffff',
    surfaceLight: '#f3f4f6',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    text: '#111827',
    textSecondary: '#6b7280',
    glow: 'rgba(21, 71, 52, 0.15)',
  },
  dark: {
    primary: '#00ff41',
    primaryLight: '#39ff8c',
    primaryDark: '#00cc33',
    secondary: '#ff8c00',
    secondaryLight: '#ffb143',
    secondaryDark: '#cc7000',
    warning: '#fbbf24',
    success: '#10b981',
    error: '#ff6b6b',
    background: '#050505',
    surface: '#0a0a0a',
    surfaceLight: '#1a1a1a',
    border: '#ffffff14',
    borderLight: '#ffffff0a',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    glow: 'rgba(0, 255, 65, 0.2)',
  },
};
