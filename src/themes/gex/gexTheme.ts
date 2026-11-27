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
    '--color-accent': [GEX_AZUL, GEX_AZUL],
    '--color-text-accent': [GEX_AZUL_PROFUNDO, GEX_CIANO],
    '--color-icon-accent': [GEX_AZUL_PROFUNDO, GEX_CIANO],
    '--color-background-body': ['#e6eaf1', '#000000'],
    '--color-background-surface': ['#e6eaf1', '#000000'],
    '--color-background-card': ['#ffffff', '#131417'],
    '--color-background-popover': ['#ffffff', '#131417'],
    '--color-background-muted': ['#f0f3f7', '#18191d'],
    '--color-border': ['#d0d7e1', '#26272d'],
    '--color-text-primary': ['#0b1526', '#f4f4f5'],
    '--color-text-secondary': ['#4b5669', '#a1a1aa'],
  },
  localTokens: {
    '--gex-hero-1': ['#071a3a', '#030a1a'],
    '--gex-hero-2': ['#0b2654', '#07204a'],
    '--gex-hero-3': ['#0f3067', '#0a2352'],
    '--gex-hero-4': ['#12387a', '#040c1c'],
    '--gex-hero-5': ['#12387a', '#000000'],
    '--gex-hero-brilho': ['rgba(120, 190, 255, 0.22)', 'rgba(56, 196, 242, 0.16)'],
    '--gex-hero-text': ['#ffffff', '#ffffff'],
    '--gex-hero-text-muted': ['rgba(255, 255, 255, 0.78)', 'rgba(255, 255, 255, 0.78)'],
    '--gex-glass': ['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.07)'],
    '--gex-glass-border': ['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.16)'],
    '--gex-divisor-hero': ['rgba(255, 255, 255, 0.28)', 'rgba(255, 255, 255, 0.28)'],
  },
})
