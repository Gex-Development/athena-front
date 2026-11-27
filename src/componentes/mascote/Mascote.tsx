import { useEffect, useRef } from 'react'
import './mascote.css'
import { createMascot } from './mascot.js'

type Props = {
  tamanho: number
  interativo?: boolean
  rotulo?: string
}

export function Mascote({ tamanho, interativo = false, rotulo = 'Athena' }: Props) {
  const vaga = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const destino = vaga.current
    if (!destino) return
    const mascote = createMascot({ size: tamanho, interactive: interativo, label: rotulo })
    destino.replaceChildren(mascote)
    return () => {
      destino.replaceChildren()
    }
  }, [tamanho, interativo, rotulo])

  return <div ref={vaga} style={{ width: tamanho, height: tamanho }} />
}
