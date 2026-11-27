import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { Theme } from '@astryxdesign/core/theme'
import type { ReactNode } from 'react'
import { defaultThemeSlug, themes } from '../astryx-themes.ts'

export function TemaGex({ children }: { children: ReactNode }) {
  return (
    <Theme theme={themes[defaultThemeSlug]} mode="dark">
      {children}
    </Theme>
  )
}
