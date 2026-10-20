export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
} as const

/** Reanimated `withSpring` configs. */
export const spring = {
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  bouncy: { damping: 10, stiffness: 220, mass: 0.9 },
} as const
