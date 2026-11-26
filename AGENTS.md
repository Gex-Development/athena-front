# athena-front

Painel da Athena V2: React 19, TypeScript estrito e Vite.

## Árvore oficial

- `src/app`: shell e rotas.
- `src/features`: `chat`, `conversa`, `command-center` e `configuracoes`.
- `src/componentes`: componentes compartilhados.
- `src/tema`: tema do design system.
- `src/api`: reservado ao cliente gerado do contrato OpenAPI do `athena-backend`. Não escreva cliente à mão aqui.
- `src/auth`: autenticação.
- `public/`: arquivos estáticos.

Não crie pastas fora dessa árvore.

## Design system

O design system GEX (Astryx) entra em PR própria, na tarefa F1. Até lá, não instale pacotes do Astryx nem aplique cor ou fonte, e mantenha `src/tema` sem implementação.

## Verificações

Rode `npm run lint`, `npm test` e `npm run build` antes de abrir PR. O fluxo git está na skill `gex-fluxo-git`.
