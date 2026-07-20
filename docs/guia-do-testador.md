# Guia do testador - JurisSync (API + Dashboard)

Este guia é para quem clona os repositórios no GitHub, configura o ambiente local e valida o produto de ponta a ponta.

**Contexto:** JurisSync (API + dashboard) e o hub [maria-portfolio](https://github.com/MariaHilmar/maria-portfolio) são **artefatos exclusivos de portfólio**. Não são serviços em produção. A forma esperada de avaliação é **clone + run local**.

**Repositórios:**

- Hub / vitrine: https://github.com/MariaHilmar/maria-portfolio
- API: https://github.com/MariaHilmar/juris-sync
- Dashboard: https://github.com/MariaHilmar/juris-sync-web

Não é necessário deploy na nuvem. Tudo roda na sua máquina com API em `localhost:8000` e dashboard em `localhost:3000`.

---

## O que você está testando

| Camada | O que é real | O que pode ser mock |
|--------|----------------|-------------------|
| **Dashboard (Next.js)** | UI, chamadas HTTP, mapa, gráficos, filtros cruzados | Nada - sempre consome a API |
| **API (FastAPI)** | Endpoints, banco, sync, jurimetria | Fonte externa DataJud (se não houver chave) |
| **Banco local** | SQLite/Postgres com processos sincronizados | Conteúdo vem do mock ou do CNJ real |

Os gráficos e o mapa **não usam dados estáticos no frontend**. Refletem processos persistidos na API.

---

## Modo A - Mock (padrão, sem credencial CNJ)

**Quando usar:** avaliar arquitetura, fluxo de sync, jurimetria, mapa por UF, filtros cruzados e UI sem solicitar chave ao CNJ.

**Como funciona:**

- Deixe `DATAJUD_API_KEY` vazio no `.env` da API
- Ao sincronizar um CNJ válido, a API gera dados **determinísticos e plausíveis** a partir do próprio número
- O `/health` e o dashboard exibem **Fonte DataJud: Mock (demo)**

**Passos:**

```powershell
# 1. API
git clone https://github.com/MariaHilmar/juris-sync.git
cd juris-sync
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
copy .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Popular base de demo (recomendado)
python scripts/seed_demo.py --fresh

# 3. Dashboard (outro terminal)
git clone https://github.com/MariaHilmar/juris-sync-web.git
cd juris-sync-web
copy .env.example .env.local
npm install
npm run dev
```

Abra http://localhost:3000

**O que validar na Visão Geral:**

1. KPIs com ~116 processos (após seed)
2. Mapa do Brasil com totais diferentes por UF (ex.: SP 15, AC 1)
3. Zoom (+/−) e arraste no mapa
4. Clique em uma UF - gráficos de tribunal e assunto filtram
5. Clique em um assunto - mapa e tribunal filtram
6. Clique fora dos gráficos ou em **Limpar filtros** - volta à visão completa
7. Bloco **Como usar os filtros** visível no topo

**CNJs válidos para teste manual** (modo mock):

- `0001234-56.2023.8.15.0001`
- `0001111-11.2023.8.26.0001`
- `0002222-22.2023.8.19.0001`

---

## Modo B - Dados reais (API Pública DataJud)

**Quando usar:** validar integração real com o CNJ e processos existentes na base pública.

**Pré-requisito:** chave da API Pública DataJud - [solicitar no CNJ](https://datajud-wiki.cnj.jus.br/api-publica/acesso/).

**Como funciona:**

- Configure `DATAJUD_API_KEY` no `.env` da API
- A sincronização consulta o tribunal correto via HTTPS
- O `/health` e o dashboard exibem **Fonte DataJud: Configurada**
- Use **números CNJ reais** de processos públicos

**Passos adicionais** (após clonar e instalar como no Modo A):

```env
# juris-sync/.env
DATAJUD_API_KEY=sua-chave-aqui
```

Reinicie a API e sincronize CNJs reais em **Processos** no dashboard ou via Swagger (`POST /api/v1/processos/sync`).

> Se a consulta real falhar, a API pode degradar para mock conforme RN05 em `juris-sync/docs/requisitos.md`.

---

## Como saber qual modo está ativo

| Onde | Mock | Real |
|------|------|------|
| `GET /health` → `services.datajud_api` | `mock_mode` | `configured` |
| Dashboard → card **Fonte DataJud** | Mock (demo) | Configurada |
| Dados nos gráficos | Gerados localmente a partir do CNJ | Vindos do DataJud (quando a consulta retorna hits) |

---

## Checklist rápido de validação

### Infraestrutura

1. [ ] `http://localhost:8000/health` retorna `healthy`
2. [ ] `http://localhost:3000` carrega sem erro de CORS
3. [ ] Header fixo com **Visão Geral** e **Processos**

### Processos

4. [ ] Sync de um CNJ cria/atualiza processo em **Processos**
5. [ ] Detalhe exibe timeline de movimentações
6. [ ] Filtros por tribunal/classe e paginação funcionam

### Jurimetria e filtros

7. [ ] Mapa exibe UFs com totais (após seed ou vários syncs)
8. [ ] Clique em UF filtra tribunal e assunto
9. [ ] Clique em assunto filtra mapa e tribunal
10. [ ] Clique fora limpa filtros; chips refletem estado
11. [ ] Modo mock ou real explícito no card de status

### Qualidade (opcional, para contribuidores)

```powershell
cd juris-sync-web
npm run lint
npm run typecheck
npm run test
npm run build
```

---

## Autenticação

A v1 **não possui login**. Adequado para demo e avaliação técnica local. Não exponha a API publicamente sem camada de auth adicional.

---

## Documentação relacionada

- [README da API](https://github.com/MariaHilmar/juris-sync/blob/main/README.md)
- [README do dashboard](https://github.com/MariaHilmar/juris-sync-web/blob/main/README.md)
- [Requisitos do frontend](requisitos.md)
- [Arquitetura do frontend](arquitetura.md)
- [Requisitos da API](https://github.com/MariaHilmar/juris-sync/blob/main/docs/requisitos.md)
