import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { TemaGex } from '../tema/index.ts'
import { App } from './App.tsx'

const raiz = document.getElementById('root')

if (!raiz) {
  throw new Error('Elemento #root ausente em index.html')
}

createRoot(raiz).render(
  <StrictMode>
    <TemaGex>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TemaGex>
  </StrictMode>,
)
