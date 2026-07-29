/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        surface: 'var(--bg-secondary)',
        surface2: 'var(--bg-tertiary)',
        accent: 'var(--accent-color)',
        'accent-dim': 'var(--accent-dim)',
        primary: 'var(--text-main)',
        muted: 'var(--text-muted)',
        border: 'var(--border-color)',
        success: '#22C55E',
        warning: '#FBBF24',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
