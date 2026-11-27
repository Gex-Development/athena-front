import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Divider } from '@astryxdesign/core/Divider'
import { Link } from '@astryxdesign/core/Link'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { VStack } from '@astryxdesign/core/VStack'
import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Aurora } from '../componentes/mascote/Aurora.tsx'
import { Mascote } from '../componentes/mascote/Mascote.tsx'
import estilos from './Login.module.css'
import { enviarLinkMagico, URL_LOGIN_GOOGLE } from './sessao.ts'

const LEMAS = [
  'Cada atendimento é uma chance de encantar.',
  'Você cuida do cliente. Eu cuido da informação.',
  'Resposta certa, na hora certa.',
  'Menos abas abertas, mais problemas resolvidos.',
  'Hoje vai ser um bom dia de atendimento.',
]

const AVISOS: Record<string, { titulo: string; texto: string }> = {
  dominio: {
    titulo: 'Use Sua Conta da GEX',
    texto: 'Essa conta não tem acesso. Entre com um e-mail @gexcorp.com.br ou @institutoexperience.com.br.',
  },
  link: {
    titulo: 'Link Expirado',
    texto: 'Esse link de acesso já foi usado ou passou do prazo. Peça um novo abaixo.',
  },
}

type Envio = 'parado' | 'enviando' | 'enviado' | 'muitas-tentativas' | 'erro'

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function GoogleIcone() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

function Lema() {
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    const intervalo = setInterval(() => setIndice((atual) => (atual + 1) % LEMAS.length), 4200)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <p className={estilos.lema} aria-live="polite">
      <span key={indice}>{LEMAS[indice]}</span>
    </p>
  )
}

export function Login() {
  const [parametros] = useSearchParams()
  const aviso = AVISOS[parametros.get('erro') ?? '']
  const [email, setEmail] = useState('')
  const [envio, setEnvio] = useState<Envio>('parado')
  const [tentouEnviar, setTentouEnviar] = useState(false)
  const invalido = tentouEnviar && !emailValido(email)

  async function pedirLink(evento?: FormEvent) {
    evento?.preventDefault()
    setTentouEnviar(true)
    if (!emailValido(email)) return
    setEnvio('enviando')
    try {
      setEnvio(await enviarLinkMagico(email.trim().toLowerCase()))
    } catch {
      setEnvio('erro')
    }
  }

  return (
    <div className={estilos.pagina}>
      <Aurora />
      <header className={estilos.barra}>
        <img className={estilos.logo} src="/gex-logo-branco.svg" alt="GEX" />
        <span className={estilos.divisor} aria-hidden="true" />
        <span className={estilos.nomePeca}>Athena</span>
      </header>
      <main className={estilos.centro}>
        <div className={estilos.cartao}>
          <Card padding={8} variant="transparent">
            <VStack gap={5}>
              <div className={estilos.cabecalho}>
                <Mascote tamanho={112} interativo />
                <Text type="display-3" as="h1" className={estilos.titulo}>
                  Athena
                </Text>
                <Text type="body" color="secondary">
                  Copiloto do suporte GEX
                </Text>
              </div>
              {aviso && <Banner status="error" title={aviso.titulo} description={aviso.texto} />}
              {envio === 'enviado' ? (
                <VStack gap={3}>
                  <Banner
                    status="success"
                    title="Link Enviado"
                    description={`Confira a caixa de entrada de ${email.trim().toLowerCase()} e clique no link para entrar.`}
                  />
                  <Link
                    onClick={() => {
                      setEnvio('parado')
                      setTentouEnviar(false)
                    }}
                    type="supporting"
                  >
                    Usar Outro E-mail
                  </Link>
                </VStack>
              ) : (
                <VStack gap={4}>
                  <div className={estilos.botaoGoogle}>
                    <Button
                      label="Entrar com Google"
                      variant="secondary"
                      size="lg"
                      width="100%"
                      icon={<GoogleIcone />}
                      href={URL_LOGIN_GOOGLE}
                    />
                  </div>
                  <Divider label="ou" />
                  <form onSubmit={pedirLink} noValidate>
                    <VStack gap={3}>
                      <TextInput
                        label="E-mail"
                        type="email"
                        size="lg"
                        placeholder="voce@gexcorp.com.br"
                        value={email}
                        onChange={setEmail}
                        status={invalido ? { type: 'error', message: 'Digite um e-mail válido.' } : undefined}
                      />
                      {envio === 'muitas-tentativas' && (
                        <Banner status="warning" title="Muitas Tentativas" description="Espere alguns minutos e peça o link de novo." />
                      )}
                      {envio === 'erro' && (
                        <Banner status="error" title="Não Deu para Enviar" description="Tente de novo em instantes." />
                      )}
                      <Button
                        label="Receber Link de Acesso"
                        variant="primary"
                        size="lg"
                        width="100%"
                        type="submit"
                        isLoading={envio === 'enviando'}
                      />
                    </VStack>
                  </form>
                </VStack>
              )}
            </VStack>
          </Card>
        </div>
        <Lema />
      </main>
    </div>
  )
}
