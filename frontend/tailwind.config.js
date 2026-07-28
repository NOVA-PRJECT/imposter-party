/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#141414',
        surface2: '#1E1E1E',
        accent: '#FF4D1C',
        'accent-dim': '#C43C15',
        primary: '#F0F0F0',
        muted: '#9A9A9A',
        border: '#2A2A2A',
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
