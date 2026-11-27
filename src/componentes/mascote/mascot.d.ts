export type OpcoesMascote = {
  size?: number
  label?: string
  interactive?: boolean
  still?: boolean
}

export function createMascot(options?: OpcoesMascote): HTMLElement
