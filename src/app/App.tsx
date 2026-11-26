import { Route, Routes } from 'react-router'
import { Inicio } from './Inicio.tsx'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
    </Routes>
  )
}
