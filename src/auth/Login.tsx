import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { VStack } from '@astryxdesign/core/VStack'
import { useSearchParams } from 'react-router'
import estilos from './Login.module.css'
import { URL_LOGIN_GOOGLE } from './sessao.ts'

export function Login() {
  const [parametros] = useSearchParams()
  const foraDaGex = parametros.get('erro') === 'dominio'

  return (
    <div className={estilos.pagina}>
      <header className={estilos.barra}>
        <img className={estilos.logo} src="/gex-logo-branco.svg" alt="GEX" />
        <span className={estilos.divisor} aria-hidden="true" />
        <span className={estilos.nomePeca}>Athena</span>
      </header>
      <main className={estilos.centro}>
        <div className={estilos.conteudo}>
          <VStack gap={2}>
            <span className={estilos.eyebrow}>• Assistente de Atendimento GEX</span>
            <Heading level={1} className={estilos.titulo}>
              Entrar na Athena
            </Heading>
            <Text className={estilos.descricao}>
              Use a sua conta Google da GEX para consultar pedidos e montar respostas.
            </Text>
          </VStack>
          <div className={estilos.vidro}>
            {foraDaGex && (
              <Banner
                status="error"
                title="Use Sua Conta da GEX"
                description="Essa conta não tem acesso. Entre com um e-mail @gexcorp.com.br ou @institutoexperience.com.br."
              />
            )}
            <Button
              label="Entrar com Google"
              variant="primary"
              size="lg"
              width="100%"
              href={URL_LOGIN_GOOGLE}
            />
            {!foraDaGex && (
              <span className={estilos.nota}>
                Acesso só para e-mails @gexcorp.com.br e @institutoexperience.com.br.
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
