import { moduleChartColors } from '@brain/ui/tokens'
import { useUniwind } from 'uniwind'

const FALLBACK = { light: '#c96a22', dark: '#cf7329' }

/** Validated chart line color for the pets module in the active theme. */
export const usePetsChartColor = () => {
  const { theme } = useUniwind()
  const colors = moduleChartColors.pets ?? FALLBACK
  return theme === 'dark' ? colors.dark : colors.light
}
