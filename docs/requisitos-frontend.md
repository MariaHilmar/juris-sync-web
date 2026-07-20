# Requisitos do frontend - JurisSync Web

> **Documento canônico:** a especificação completa (histórias de usuário, regras de interface, BDD e rastreabilidade) está em **[requisitos.md](requisitos.md)**. Este arquivo resume o escopo e aponta para a documentação detalhada.

---

## Visão resumida

Interface web para:

- **Visão Geral** - KPIs, mapa por UF, gráficos por tribunal/assunto, **filtros cruzados**
- **Processos** - sync por CNJ, listagem com filtros, detalhe com timeline

**Público:** quem clona API + dashboard e avalia localmente (portfólio).

**Fontes de dados:** mock (sem chave CNJ) ou DataJud real - ver [guia-do-testador.md](guia-do-testador.md).

---

## Histórias de usuário (índice)

| ID   | Título                  | Doc completo                                                                                |
| ---- | ----------------------- | ------------------------------------------------------------------------------------------- |
| HU01 | Status e KPIs           | [requisitos.md § HU01](requisitos.md#hu01---ver-status-e-kpis)                              |
| HU02 | Mapa e gráficos         | [requisitos.md § HU02](requisitos.md#hu02---explorar-jurimetria-com-mapa-e-gráficos)        |
| HU03 | Cross-filter UF/assunto | [requisitos.md § HU03](requisitos.md#hu03---filtrar-gráficos-por-uf-e-assunto-cross-filter) |
| HU04 | Listar processos        | [requisitos.md § HU04](requisitos.md#hu04---listar-e-filtrar-processos)                     |
| HU05 | Detalhe e timeline      | [requisitos.md § HU05](requisitos.md#hu05---ver-detalhe-e-timeline)                         |
| HU06 | Sync por CNJ            | [requisitos.md § HU06](requisitos.md#hu06---sincronizar-processo-por-cnj)                   |

---

## Rastreabilidade rápida

| Área         | Componentes principais                                                      |
| ------------ | --------------------------------------------------------------------------- |
| Dashboard    | `DashboardView`, `BrazilMapChart`, `TribunalChart`, `AssuntoChart`          |
| Cross-filter | `lib/jurimetria.ts`, estado em `DashboardView`                              |
| Processos    | `ProcessosView`, `SyncForm`, `ProcessTable`                                 |
| API client   | `lib/api/client.ts`, `endpoints.ts`, `types.ts`                             |
| Testes       | `cnj.test.ts`, `client.test.ts`, `SyncForm.test.tsx`, `tribunal-uf.test.ts` |

---

## CNJs para demo (modo mock)

- `0001234-56.2023.8.15.0001`
- `0009876-12.2022.8.26.0100`
- `1000001-00.2024.5.02.0001`

Para jurimetria rica no mapa: `python scripts/seed_demo.py --fresh` na pasta da API.
