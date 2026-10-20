/** Font family names must match the keys loaded with expo-font in the app. */
export const fontFamily = {
  sans: 'IBMPlexSansThai_400Regular',
  sansMedium: 'IBMPlexSansThai_500Medium',
  sansBold: 'IBMPlexSansThai_700Bold',
} as const

/** [fontSize, lineHeight] in px. Thai needs generous line height. */
export const fontSize = {
  xs: [12, 18],
  sm: [14, 21],
  base: [16, 24],
  lg: [18, 27],
  xl: [22, 31],
  '2xl': [28, 38],
  '3xl': [36, 46],
} as const satisfies Record<string, readonly [number, number]>
