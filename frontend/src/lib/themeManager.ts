export interface ThemeOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  previewColors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
}

export const THEMES: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Cyber Neon',
    emoji: '🌌',
    description: 'Electric Orange + Obsidian Dark (Default Dark)',
    previewColors: {
      bg: '#0A0A0A',
      surface: '#141414',
      accent: '#FF4D1C',
      text: '#F0F0F0',
    },
  },
  {
    id: 'matcha',
    name: 'Matcha Nature',
    emoji: '🍵',
    description: 'Fresh Mint + Deep Forest Moss (Matcha)',
    previewColors: {
      bg: '#111F17',
      surface: '#1C2E23',
      accent: '#55EFC4',
      text: '#E8F5E9',
    },
  },
  {
    id: 'light',
    name: 'Daylight Arcade',
    emoji: '☀️',
    description: 'Arcade Crimson + Crisp Light Gray (Light)',
    previewColors: {
      bg: '#F4F5F7',
      surface: '#FFFFFF',
      accent: '#D90429',
      text: '#111827',
    },
  },
  {
    id: 'space-red',
    name: 'Space Red',
    emoji: '🛸',
    description: 'Emergency Red + Dark Space (Among Us)',
    previewColors: {
      bg: '#120306',
      surface: '#24060C',
      accent: '#FF1E43',
      text: '#FFF0F2',
    },
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    emoji: '💜',
    description: 'Hot Neon Pink + Cyber Violet',
    previewColors: {
      bg: '#0F051D',
      surface: '#1D0B38',
      accent: '#FF007F',
      text: '#FBF0FF',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    emoji: '🌲',
    description: 'Cyber Mint + Dark Emerald Void',
    previewColors: {
      bg: '#02140B',
      surface: '#062615',
      accent: '#00FF66',
      text: '#E8FFF2',
    },
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    emoji: '🌊',
    description: 'Electric Cyan + Midnight Navy',
    previewColors: {
      bg: '#020B18',
      surface: '#061833',
      accent: '#00F0FF',
      text: '#E6FAFF',
    },
  },
];

const LOCAL_STORAGE_KEY = 'selectedTheme';

export function getSavedTheme(): string {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) return saved;

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(themeId: string) {
  if (typeof window === 'undefined') return;

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  document.documentElement.setAttribute('data-theme', theme.id);
  localStorage.setItem(LOCAL_STORAGE_KEY, theme.id);
}
