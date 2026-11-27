import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Center } from '@astryxdesign/core/Center'
import { Heading } from '@astryxdesign/core/Heading'
import { HStack } from '@astryxdesign/core/HStack'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Text } from '@astryxdesign/core/Text'
import { VStack } from '@astryxdesign/core/VStack'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { buscarUsuario, sair, type Usuario } from '../auth/sessao.ts'

type Estado = { tipo: 'carregando' } | { tipo: 'anonimo' } | { tipo: 'logado'; usuario: Usuario }

export function Inicio() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' })
  const navegar = useNavigate()

  useEffect(() => {
    buscarUsuario()
      .then((usuario) => setEstado(usuario ? { tipo: 'logado', usuario } : { tipo: 'anonimo' }))
      .catch(() => setEstado({ tipo: 'anonimo' }))
  }, [])

  if (estado.tipo === 'anonimo') return <Navigate to="/login" replace />

  return (
    <Center height="100dvh" padding={4}>
      {estado.tipo === 'carregando' ? (
        <Spinner size="lg" label="Carregando" />
      ) : (
        <Card width="100%" maxWidth={480}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={1}>Olá, {estado.usuario.nomeAssinatura}</Heading>
              <Text type="supporting">{estado.usuario.email}</Text>
            </VStack>
            <HStack gap={2} vAlign="center">
              <Text type="label">Papel</Text>
              <Badge
                variant={estado.usuario.papel === 'admin' ? 'blue' : 'cyan'}
                label={estado.usuario.papel === 'admin' ? 'Admin' : 'Analista'}
              />
            </HStack>
            <Button
              label="Sair"
              clickAction={async () => {
                await sair()
                navegar('/login', { replace: true })
              }}
            />
          </VStack>
        </Card>
      )}
    </Center>
  )
}
