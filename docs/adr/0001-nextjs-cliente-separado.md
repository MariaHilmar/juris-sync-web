# ADR 0001: Cliente Next.js em repositório separado

**Status:** Aceito  
**Data:** 2026-07-20  
**Contexto:** Portfólio técnico JurisSync (API Python + vitrine Astro)

---

## Contexto

O JurisSync nasceu como API FastAPI com documentação, testes e integração DataJud. Para sinalizar competência em **stack frontend de mercado**, foi necessário um dashboard consumindo a API existente.

Alternativas consideradas:

1. **Monorepo** (`juris-sync/web/` ao lado de `app/`)
2. **Dashboard dentro de `maria-portfolio`** (`web-next/`)
3. **Repositório separado** (`juris-sync-web`)

O portfólio já separa vitrine (`maria-portfolio` Astro) e produto backend (`juris-sync`). O perfil é PO técnico com base Python, não desenvolvedora frontend sênior em tempo integral.

---

## Decisão

Criar **juris-sync-web** como repositório independente com:

- **Next.js 15** (App Router)
- **React + TypeScript + Tailwind**
- Consumo direto da API via `fetch` (sem BFF na v1)
- Deploy previsto na Vercel (dashboard) e separado da API

---

## Consequências

### Positivas

- Narrativa clara no GitHub: um repo Python, um repo React
- CI independente (pytest vs npm/vitest)
- Vitrine Astro permanece leve; dashboard evolui sem misturar stacks
- Contrato HTTP força disciplina de API estável

### Negativas / trade-offs

- Dois repositórios para clonar e versionar
- CORS e URL da API precisam ser configurados em cada ambiente
- Sem auth compartilhada na v1 (API aberta para demo)

### Mitigações

- README com quickstart dos dois terminais
- `.env.example` em ambos os projetos
- Tipos TypeScript espelhando schemas Pydantic
- Documentação em `docs/arquitetura.md`, `docs/requisitos.md` e `docs/guia-do-testador.md`

---

## Referências

- API: https://github.com/MariaHilmar/juris-sync
- Web: https://github.com/MariaHilmar/juris-sync-web
