# JurisSync Web - Regras de code review

Dashboard Next.js que consome a API JurisSync. Dados sempre vindos da API - sem mocks estáticos no frontend.

## Prioridades de revisão

1. **Fonte de dados** - componentes de visualização devem consumir hooks/API (`lib/api/`, TanStack Query). Não hardcodar dados de gráficos ou KPIs.
2. **Contrato da API** - tipos em `src/types/` devem refletir o schema da API irmã (`juris-sync`). Alterações de endpoint exigem atualização de tipos e testes.
3. **Filtros cruzados** - estado de filtro (UF, assunto) deve propagar corretamente entre mapa, gráficos e ranking (`DashboardView`).
4. **Validação CNJ** - formulário de sync deve validar CNJ no cliente (`lib/validators/cnj.ts`) antes de chamar `POST /processos/sync`.
5. **TypeScript strict** - sem `any` não justificado; `npm run typecheck` deve passar.
6. **Testes** - validadores, cliente HTTP e formulários críticos precisam de teste Vitest.

## Bloquear (bug de severidade alta)

- Dados de processo ou jurimetria hardcoded em componentes de produção.
- Chamada HTTP fora de `lib/api/client.ts` (bypass do tratamento de erro centralizado).
- `fetch` direto sem usar o cliente tipado.
- Exposição de segredos em `NEXT_PUBLIC_*` ou `.env.local` versionado.

## Avisar (melhoria ou risco médio)

- Novo componente interativo sem `aria-label` ou `aria-pressed` quando aplicável (RNF06).
- Mudança de layout do dashboard sem atualizar `docs/requisitos.md` ou guia do testador.
- Hook React com dependências incorretas (stale closure em filtros cruzados).
- Formulário sem feedback de erro ao usuário em falha de API.

## Fora de escopo (não exigir)

- Autenticação, BFF/proxy Next.js, testes e2e Playwright (fora de escopo v1).
- Deploy público com hardening de produção.
