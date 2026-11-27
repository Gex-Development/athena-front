import { Route, Routes } from 'react-router'
import { Login } from '../auth/Login.tsx'
import { Inicio } from './Inicio.tsx'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}
