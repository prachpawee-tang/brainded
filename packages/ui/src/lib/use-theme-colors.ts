import { useUniwind } from 'uniwind'
import { colors, type SemanticColors } from '../tokens/color'

/** Resolved semantic colors for the active theme — for places that can't take classes (SVG). */
export const useThemeColors = (): SemanticColors => {
  const { theme } = useUniwind()
  return theme === 'dark' ? colors.dark : colors.light
}
