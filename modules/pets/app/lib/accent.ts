import { moduleColors } from '@brain/ui/tokens'
import { useUniwind } from 'uniwind'

/** The pets accent (Apricot) for the active theme. */
export const usePetsAccent = () => {
  const { theme } = useUniwind()
  const accent = moduleColors.pets ?? { light: '#e8833a', dark: '#f5a05a' }
  return theme === 'dark' ? accent.dark : accent.light
}
