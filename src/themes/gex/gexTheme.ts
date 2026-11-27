import { themePalette } from '@astryxdesign/core/palette'
import { defineTheme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'

export const GEX_AZUL = '#1e6fd9'
export const GEX_AZUL_PROFUNDO = '#0b3d86'
export const GEX_CIANO = '#38bdf8'

export const gexTheme = defineTheme({
  name: 'gex',
  extends: neutralTheme,
  palette: themePalette({
    accent: GEX_AZUL,
    info: GEX_CIANO,
    recipe: 'astryx-oklch-v2',
  }),
  typography: {
    body: { family: 'Geist Variable', fallbacks: 'Geist, system-ui, sans-serif' },
    heading: { family: 'Geist Variable', fallbacks: 'Geist, system-ui, sans-serif' },
    code: { family: 'Geist Mono Variable', fallbacks: 'Geist Mono, ui-monospace, monospace' },
  },
  tokens: {
    '--color-text-accent': [GEX_AZUL_PROFUNDO, GEX_CIANO],
    '--color-icon-accent': [GEX_AZUL_PROFUNDO, GEX_CIANO],
  },
})
