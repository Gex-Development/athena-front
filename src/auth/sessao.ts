export type Usuario = {
  id: string
  nome: string
  email: string
  papel: 'admin' | 'analista'
  nomeAssinatura: string
}

export const URL_LOGIN_GOOGLE = '/v1/auth/google/start'

export async function buscarUsuario(): Promise<Usuario | null> {
  const resposta = await fetch('/v1/me', { credentials: 'include' })
  if (resposta.status === 401) return null
  if (!resposta.ok) throw new Error(`Falha ao consultar a sessão (${resposta.status})`)
  return (await resposta.json()) as Usuario
}

export type ResultadoLinkMagico = 'enviado' | 'muitas-tentativas' | 'erro'

export async function enviarLinkMagico(email: string): Promise<ResultadoLinkMagico> {
  const resposta = await fetch('/v1/auth/magic-link', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (resposta.status === 204) return 'enviado'
  if (resposta.status === 429) return 'muitas-tentativas'
  return 'erro'
}

export async function sair(): Promise<void> {
  await fetch('/v1/auth/logout', { method: 'POST', credentials: 'include' })
}
