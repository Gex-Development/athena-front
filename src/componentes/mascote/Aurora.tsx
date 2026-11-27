import { useState, type CSSProperties } from 'react'
import './mascote.css'

const QUANTIDADE_ESTRELAS = 60

type Estrela = { id: number; estilo: CSSProperties }

function criarEstrelas(): Estrela[] {
  return Array.from({ length: QUANTIDADE_ESTRELAS }, (_, id) => ({
    id,
    estilo: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      '--dur': `${3 + Math.random() * 5}s`,
      '--delay': `${-Math.random() * 8}s`,
      '--peak': `${0.3 + Math.random() * 0.6}`,
    } as CSSProperties,
  }))
}

export function Aurora() {
  const [estrelas] = useState(criarEstrelas)

  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora__pulse" />
      <div className="aurora__blobs">
        <i className="aurora__blob aurora__blob--1" />
        <i className="aurora__blob aurora__blob--2" />
        <i className="aurora__blob aurora__blob--3" />
      </div>
      <div className="aurora__stars">
        {estrelas.map((estrela) => (
          <i key={estrela.id} className="aurora__star" style={estrela.estilo} />
        ))}
      </div>
    </div>
  )
}
