export type ThemeId = 'editorial' | 'technical' | 'warm' | 'dark' | 'vibrant';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  isDark: boolean;
  colors: {
    bg: string;
    surface: string;
    surfaceSubtle: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentGlow: string;
    badgeBg: string;
    badgeText: string;
  };
  typography: {
    fontFamily: string;
    label: string;
    density: 'generous' | 'compact' | 'balanced';
  };
  radius: string;
  previewColors: string[];
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  editorial: {
    id: 'editorial',
    name: 'Editorial & Refined',
    tagline: 'Serif fonts, generous whitespace, clean light background',
    description: 'Literary elegance inspired by timeless print publications. Featuring refined Lora serif typography, warm paper tones, and spacious layouts.',
    isDark: false,
    colors: {
      bg: '#fbfbfa',
      surface: '#ffffff',
      surfaceSubtle: '#f5f4ef',
      border: '#e4e2d8',
      textPrimary: '#1c1917',
      textSecondary: '#57534e',
      accent: '#991b1b',
      accentGlow: 'rgba(153, 27, 27, 0.25)',
      badgeBg: '#fef2f2',
      badgeText: '#991b1b',
    },
    typography: {
      fontFamily: "'Lora', 'Playfair Display', Georgia, serif",
      label: 'Serif (Lora)',
      density: 'generous',
    },
    radius: '12px',
    previewColors: ['#fbfbfa', '#ffffff', '#991b1b', '#1c1917'],
  },
  technical: {
    id: 'technical',
    name: 'Technical & Systematic',
    tagline: 'Monospace fonts, high-density, visible grid borders',
    description: 'Precision engineered for systems developers. High-density monospace typography, sharp engineered edges, and electric cyber lime telemetry grid lines.',
    isDark: true,
    colors: {
      bg: '#09090b',
      surface: '#121215',
      surfaceSubtle: '#18181b',
      border: '#27272a',
      textPrimary: '#f4f4f5',
      textSecondary: '#a1a1aa',
      accent: '#a3e635',
      accentGlow: 'rgba(163, 230, 53, 0.35)',
      badgeBg: '#1a2e05',
      badgeText: '#a3e635',
    },
    typography: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      label: 'Monospace (JetBrains)',
      density: 'compact',
    },
    radius: '4px',
    previewColors: ['#09090b', '#18181b', '#a3e635', '#27272a'],
  },
  warm: {
    id: 'warm',
    name: 'Warm & Approachable',
    tagline: 'Pastel cards, rounded pill buttons, soft corners',
    description: 'Inviting, friendly aesthetics with soft cream backgrounds, gentle terracotta accents, and smooth rounded pill contours.',
    isDark: false,
    colors: {
      bg: '#faf7f2',
      surface: '#ffffff',
      surfaceSubtle: '#f5ede2',
      border: '#e8dfd5',
      textPrimary: '#334155',
      textSecondary: '#64748b',
      accent: '#ea580c',
      accentGlow: 'rgba(234, 88, 12, 0.25)',
      badgeBg: '#fff7ed',
      badgeText: '#ea580c',
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      label: 'Sans (Jakarta)',
      density: 'balanced',
    },
    radius: '20px',
    previewColors: ['#faf7f2', '#f5ede2', '#ea580c', '#334155'],
  },
  dark: {
    id: 'dark',
    name: 'Elegant Dark',
    tagline: 'Sleek dark mode with tailored high-contrast accents',
    description: 'The signature KBT studio dark aesthetic. Deep obsidian backdrops, subtle slate card borders, and high-contrast electric indigo & emerald accents.',
    isDark: true,
    colors: {
      bg: '#09090b',
      surface: '#18181b',
      surfaceSubtle: '#27272a',
      border: '#27272a',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
      accent: '#6366f1',
      accentGlow: 'rgba(99, 102, 241, 0.35)',
      badgeBg: '#1e1b4b',
      badgeText: '#818cf8',
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      label: 'Sans (Jakarta)',
      density: 'balanced',
    },
    radius: '14px',
    previewColors: ['#09090b', '#18181b', '#6366f1', '#10b981'],
  },
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant Palette',
    tagline: 'High-energy, bold color schemes',
    description: 'Dynamic cyberpunk energy featuring deep twilight backgrounds, electric magenta/fuchsia accents, and glowing neon telemetry highlights.',
    isDark: true,
    colors: {
      bg: '#0b0f19',
      surface: '#131b2e',
      surfaceSubtle: '#1e293b',
      border: '#312e81',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      accent: '#d946ef',
      accentGlow: 'rgba(217, 70, 239, 0.4)',
      badgeBg: '#4a044e',
      badgeText: '#f472b6',
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      label: 'Bold Sans',
      density: 'balanced',
    },
    radius: '16px',
    previewColors: ['#0b0f19', '#131b2e', '#d946ef', '#06b6d4'],
  },
};

export const THEME_LIST: ThemeDefinition[] = Object.values(THEMES);

const THEME_STORAGE_KEY = 'kbt_ui_theme_variation_v2';

export function getSavedTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && saved in THEMES) {
      return saved as ThemeId;
    }
    // Backward compatibility with previous theme flag
    const legacy = localStorage.getItem('kbt_theme_v1');
    if (legacy === 'light') return 'warm';
  } catch (e) {
    // ignore
  }
  return 'dark';
}

export function applyTheme(themeId: ThemeId): void {
  const theme = THEMES[themeId] || THEMES.dark;
  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute('data-theme', theme.id);

  // Toggle .dark class on html
  if (theme.isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  // Update dynamic CSS custom variables on :root
  root.style.setProperty('--app-bg', theme.colors.bg);
  root.style.setProperty('--app-surface', theme.colors.surface);
  root.style.setProperty('--app-surface-subtle', theme.colors.surfaceSubtle);
  root.style.setProperty('--app-border', theme.colors.border);
  root.style.setProperty('--app-text-primary', theme.colors.textPrimary);
  root.style.setProperty('--app-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--app-accent', theme.colors.accent);
  root.style.setProperty('--app-accent-glow', theme.colors.accentGlow);
  root.style.setProperty('--app-radius', theme.radius);
  root.style.setProperty('--app-font-family', theme.typography.fontFamily);

  // Save to localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    localStorage.setItem('kbt_theme_v1', theme.isDark ? 'dark' : 'light');
  } catch (e) {
    console.warn('Failed to save theme choice:', e);
  }

  // Dispatch custom event for reactive listeners
  window.dispatchEvent(new CustomEvent('kbt-theme-change', { detail: { theme } }));
}
