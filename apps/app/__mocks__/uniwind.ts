// Uniwind ships untranspiled ESM and needs Metro; in Jest we only need its JS API.
export const Uniwind = { setTheme: jest.fn() }
export const useUniwind = jest.fn(() => ({ theme: 'light', hasAdaptiveThemes: true }))
