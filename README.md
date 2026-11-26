# athena-front

Athena V2 · painel do agente de atendimento (React 19, TypeScript e Vite; o design system GEX via Astryx entra em tarefa própria).

## Rodar local

Pré-requisito: Node 24 ou superior.

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` e a rota inicial mostra "Athena".

## Verificações

```bash
npm run lint
npm test
npm run build
```

A CI roda lint, test, build e gitleaks em toda PR para `development` e `main`.

## Fluxo git

- `main` é produção e `development` é integração; as duas só recebem código por PR.
- Cada issue tem uma branch curta `feature/`, `fix/` ou `chore/`, criada de `development`.
- Commits seguem Conventional Commits e cada PR soma até 300 linhas, sem contar lockfiles.
- A PR entra em `development` por squash, com CI verde; a release vai de `development` para `main` com tag semver.
- As regras completas estão na skill `gex-fluxo-git`.
