import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Brand/Accent colors - changes based on theme */
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        
        /* Surface colors */
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        'surface-light': 'hsl(var(--color-surface-light) / <alpha-value>)',
        'surface-secondary': 'hsl(var(--color-surface-secondary) / <alpha-value>)',
        background: 'hsl(var(--color-background) / <alpha-value>)',
        
        /* Status colors - changes based on theme */
        success: 'hsl(var(--color-success) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
        warning: 'hsl(var(--color-warning) / <alpha-value>)',
      },
      textColor: {
        /* Text colors - explicitly mapped to use --text-primary and --text-secondary */
        primary: 'hsl(var(--text-primary))',
        secondary: 'hsl(var(--text-secondary))',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      transitionDuration: {
        0: '0ms',
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },
    },
  },
  plugins: [],
};

export default config;
