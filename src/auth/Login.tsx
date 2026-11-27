import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Center } from '@astryxdesign/core/Center'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { VStack } from '@astryxdesign/core/VStack'
import { useSearchParams } from 'react-router'
import { URL_LOGIN_GOOGLE } from './sessao.ts'

export function Login() {
  const [parametros] = useSearchParams()
  const foraDaGex = parametros.get('erro') === 'dominio'

  return (
    <Center height="100dvh" padding={4}>
      <Card width="100%" maxWidth={400}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={1}>Athena</Heading>
            <Text type="supporting">Assistente de atendimento da GEX</Text>
          </VStack>
          {foraDaGex && (
            <Banner
              status="error"
              title="Use sua conta da GEX"
              description="Só entram e-mails @gexcorp.com.br e @institutoexperience.com.br."
            />
          )}
          <Button
            label="Entrar com Google"
            variant="primary"
            size="lg"
            width="100%"
            href={URL_LOGIN_GOOGLE}
          />
        </VStack>
      </Card>
    </Center>
  )
}
