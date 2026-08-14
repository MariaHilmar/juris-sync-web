# JurisSync Web

Dashboard web em **Next.js** para o [JurisSync API](https://github.com/MariaHilmar/juris-sync): jurimetria interativa (mapa por UF, filtros cruzados), listagem de processos, detalhe com timeline e sincronização por número CNJ.

## Escopo: portfólio (não é produção)

Este projeto e a API irmã existem **exclusivamente para apresentação no portfólio técnico**. Não são serviços SaaS em produção: sem autenticação, sem SLA e sem hardening de ambiente público.

- **Hub do portfólio:** [maria-portfolio](https://github.com/MariaHilmar/maria-portfolio) · [site live](https://mariahilmar-portfolio.vercel.app)
- **Como avaliar:** clone API + dashboard, rode local. Mock sem chave CNJ ou DataJud real com chave própria.
- **Guia:** **[docs/guia-do-testador.md](docs/guia-do-testador.md)**

A API FastAPI permanece em repositório separado; este projeto consome apenas HTTP/REST.

---

## Destaques da interface

- **Mapa do Brasil** (choropleth) com totais por UF, zoom/pan e ranking lateral
- **Filtros cruzados** - clique em UF ou assunto e os demais gráficos atualizam; clique fora para limpar
- **Header fixo** com navegação Visão Geral | Processos
- **Instruções na tela** explicando como usar os filtros
- Dados **sempre** vindos da API (sem gráficos estáticos no frontend)

---

## Fontes de dados (mock vs real)

O dashboard **sempre** exibe o que está no banco local da API.

| Modo               | Configuração                             | O que acontece                                                  |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------- |
| **Mock (demo)**    | `DATAJUD_API_KEY` vazio no `.env` da API | Dados plausíveis gerados a partir do CNJ; badge **Mock (demo)** |
| **Real (DataJud)** | `DATAJUD_API_KEY` preenchida             | Consulta a API Pública do CNJ; badge **Configurada**            |

Para popular jurimetria no modo mock:

```powershell
cd juris-sync
python scripts/seed_demo.py --fresh
```

Sincroniza **116 processos** em todos os tribunais estaduais, com totais diferentes por UF (SP 15, RJ 12, ... até 1 em estados menores). Use `--fresh` para limpar a base antes de popular.

---

## Stack

| Camada      | Tecnologia               |
| ----------- | ------------------------ |
| Framework   | Next.js 15 (App Router)  |
| UI          | React 19 + TypeScript    |
| Estilo      | Tailwind CSS             |
| Dados       | TanStack Query           |
| Formulários | React Hook Form + Zod    |
| Gráficos    | Recharts + d3-geo (mapa) |
| Ícones      | lucide-react             |

---

## Pré-requisitos

- **Node.js** 20+
- **npm**
- API [juris-sync](https://github.com/MariaHilmar/juris-sync) rodando em `http://localhost:8000`

---

## Execução local (clone do GitHub)

```powershell
git clone https://github.com/MariaHilmar/juris-sync.git
git clone https://github.com/MariaHilmar/juris-sync-web.git
```

### 1. Subir a API (terminal 1)

```powershell
cd juris-sync
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
copy .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

No **CMD**, use `activate.bat` em vez de `Activate.ps1`. Se o venv não ativar:

```cmd
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Confirme: http://localhost:8000/health

### 2. Subir o dashboard (terminal 2)

```powershell
cd juris-sync-web
copy .env.example .env.local
npm install
npm run dev
```

Abra http://localhost:3000

### 3. Demo rápida

```powershell
cd juris-sync
python scripts/seed_demo.py --fresh
```

Recarregue http://localhost:3000 e teste os filtros cruzados na Visão Geral.

**Modo real:** adicione `DATAJUD_API_KEY` no `juris-sync/.env`, reinicie a API e sincronize CNJs reais em **Processos**.

---

## Rotas da interface

| Rota              | Descrição                                                  |
| ----------------- | ---------------------------------------------------------- |
| `/`               | Visão Geral: KPIs, mapa por UF, gráficos, filtros cruzados |
| `/processos`      | Sync por CNJ, filtros, lista paginada                      |
| `/processos/[id]` | Detalhe do processo + timeline de movimentações            |

---

## Variáveis de ambiente

| Variável                        | Descrição                         | Padrão                  |
| ------------------------------- | --------------------------------- | ----------------------- |
| `NEXT_PUBLIC_JURISSYNC_API_URL` | URL base da API (sem barra final) | `http://localhost:8000` |

---

## Scripts npm

```bash
npm run dev           # desenvolvimento
npm run build         # build de produção
npm run start         # servidor de produção
npm run lint          # ESLint
npm run format:check  # verifica formatação (Prettier)
npm run typecheck     # TypeScript
npm run test          # Vitest
```

---

## Documentação técnica e funcional

| Documento                                                               | Conteúdo                                                 |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| **[Guia do testador](docs/guia-do-testador.md)**                        | Clone, mock vs real, checklist de validação              |
| **[Requisitos](docs/requisitos.md)**                                    | Histórias de usuário, regras de UI, BDD, rastreabilidade |
| [Arquitetura](docs/arquitetura.md)                                      | Camadas, cross-filter, mapa, hooks                       |
| [Requisitos (resumo)](docs/requisitos-frontend.md)                      | Índice para o doc completo                               |
| [ADR 0001 - Cliente separado](docs/adr/0001-nextjs-cliente-separado.md) | Decisão de repositório separado                          |

---

## CI

GitHub Actions em cada push/PR: `lint` → `format:check` → `typecheck` → `test` → `build`.

### Code review

- **Revisão humana** em pull requests (template em [`.github/pull_request_template.md`](.github/pull_request_template.md))
- **Cursor Bugbot** em PRs com regras de UI/API em [`.cursor/BUGBOT.md`](.cursor/BUGBOT.md) (filtros cruzados, contrato HTTP, validação CNJ)
- Ative o Bugbot no [dashboard do Cursor](https://cursor.com/dashboard) para o repositório `MariaHilmar/juris-sync-web`


## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
