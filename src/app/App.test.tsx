import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, test, vi } from 'vitest'
import { App } from './App.tsx'

function abrir(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  )
}

function responderMe(status: number, corpo?: object) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(corpo ? JSON.stringify(corpo) : null, { status })),
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test('login leva ao Google', () => {
  abrir('/login')

  const botao = screen.getByRole('link', { name: 'Entrar com Google' })
  expect(botao.getAttribute('href')).toBe('/v1/auth/google/start')
  expect(screen.queryByText('Use Sua Conta da GEX')).toBeNull()
  expect(screen.getByRole('img', { name: 'GEX' })).toBeTruthy()
})

test('login avisa quando a conta não é da GEX', () => {
  abrir('/login?erro=dominio')

  expect(screen.getByText('Use Sua Conta da GEX')).toBeTruthy()
})

test('magic link recusa e-mail inválido sem chamar o backend', async () => {
  const chamada = vi.fn()
  vi.stubGlobal('fetch', chamada)
  abrir('/login')

  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'nao-e-email' } })
  fireEvent.click(screen.getByRole('button', { name: 'Receber Link de Acesso' }))

  expect(await screen.findByText('Digite um e-mail válido.')).toBeTruthy()
  expect(chamada).not.toHaveBeenCalled()
})

test('magic link enviado mostra a confirmação', async () => {
  const chamada = vi.fn(async () => new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', chamada)
  abrir('/login')

  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'Maria@GexCorp.com.br' } })
  fireEvent.click(screen.getByRole('button', { name: 'Receber Link de Acesso' }))

  expect(await screen.findByText('Link Enviado')).toBeTruthy()
  expect(chamada).toHaveBeenCalledWith(
    '/v1/auth/magic-link',
    expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'maria@gexcorp.com.br' }) }),
  )
})

test('inicio sem sessão vai para o login', async () => {
  responderMe(401)

  abrir('/')

  expect(await screen.findByRole('link', { name: 'Entrar com Google' })).toBeTruthy()
})

test('inicio com sessão mostra o usuário e o papel', async () => {
  responderMe(200, {
    id: 'maria@gexcorp.com.br',
    nome: 'Maria Souza',
    email: 'maria@gexcorp.com.br',
    papel: 'admin',
    nomeAssinatura: 'Maria',
  })

  abrir('/')

  expect(await screen.findByRole('heading', { name: 'Olá, Maria' })).toBeTruthy()
  expect(screen.getByText('maria@gexcorp.com.br')).toBeTruthy()
  expect(screen.getByText('Admin')).toBeTruthy()
})
