export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

/** Semantic color tokens. Components use ONLY these names (e.g. `bg-surface`, `text-text-muted`). */
export type SemanticColors = {
  bg: string
  surface: string
  surfaceMuted: string
  border: string
  text: string
  textMuted: string
  primary: string
  onPrimary: string
  primarySoft: string
  success: string
  warning: string
  danger: string
}

export const colors: Record<Theme, SemanticColors> = {
  light: {
    bg: '#faf7f2',
    surface: '#ffffff',
    surfaceMuted: '#f2eee7',
    border: '#e7e1d8',
    text: '#1c1a17',
    textMuted: '#66615a',
    primary: '#6d4aff',
    onPrimary: '#ffffff',
    primarySoft: '#ece7ff',
    success: '#1f8a5b',
    warning: '#b7791f',
    danger: '#d93b3b',
  },
  dark: {
    bg: '#141311',
    surface: '#1d1b18',
    surfaceMuted: '#26231f',
    border: '#2f2c28',
    text: '#f4f1ec',
    textMuted: '#a8a29a',
    primary: '#9d85ff',
    onPrimary: '#141311',
    primarySoft: '#2a2440',
    success: '#4ade80',
    warning: '#f5b841',
    danger: '#ff6b6b',
  },
}

/** One playful accent per module, keyed by module id. */
export const moduleColors: Record<string, Record<Theme, string>> = {
  pets: { light: '#e8833a', dark: '#f5a05a' },
}
