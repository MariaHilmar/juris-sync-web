"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssuntoChart } from "@/components/charts/AssuntoChart";
import { BrazilMapChart } from "@/components/charts/BrazilMapChart";
import { TribunalChart } from "@/components/charts/TribunalChart";
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useAllProcessos } from "@/hooks/useAllProcessos";
import { useHealth } from "@/hooks/useHealth";
import { getErrorMessage } from "@/lib/errors";
import {
  aggregateByAssunto,
  aggregateByTribunal,
  aggregateByUf,
  countUfs,
  filterProcessos,
  processosForAssuntoChart,
  processosForUfChart,
  type DashboardFilters,
} from "@/lib/jurimetria";

const EMPTY_FILTERS: DashboardFilters = { uf: null, assunto: null };

export function DashboardView() {
  const healthQuery = useHealth();
  const processosQuery = useAllProcessos();
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  const chartsRef = useRef<HTMLDivElement>(null);

  const processos = useMemo(
    () => processosQuery.data ?? [],
    [processosQuery.data],
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const toggleUf = useCallback((uf: string) => {
    setFilters((current) => ({
      ...current,
      uf: current.uf === uf ? null : uf,
    }));
  }, []);

  const toggleAssunto = useCallback((assunto: string) => {
    setFilters((current) => ({
      ...current,
      assunto: current.assunto === assunto ? null : assunto,
    }));
  }, []);

  useEffect(() => {
    const onDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (chartsRef.current?.contains(target)) {
        return;
      }
      setFilters(EMPTY_FILTERS);
    };

    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
    };
  }, []);

  const filteredProcessos = useMemo(
    () => filterProcessos(processos, filters),
    [processos, filters],
  );

  const ufStats = useMemo(
    () => aggregateByUf(processosForUfChart(processos, filters)),
    [processos, filters],
  );

  const assuntoStats = useMemo(
    () => aggregateByAssunto(processosForAssuntoChart(processos, filters)),
    [processos, filters],
  );

  const tribunalStats = useMemo(
    () => aggregateByTribunal(filteredProcessos),
    [filteredProcessos],
  );

  const hasActiveFilter = Boolean(filters.uf || filters.assunto);

  const isLoading = healthQuery.isLoading || processosQuery.isLoading;

  if (isLoading) {
    return (
      <PageContainer
        title="Jurimetria"
        description="Visão geral dos processos sincronizados."
      >
        <Spinner label="Carregando dashboard..." />
      </PageContainer>
    );
  }

  const healthError = healthQuery.error ?? processosQuery.error;

  return (
    <PageContainer
      title="Jurimetria"
      description="Distribuição dos processos armazenados localmente pela API JurisSync."
    >
      {healthError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(healthError)}
        </Alert>
      )}

      <section className="panel mb-6 border-l-4 border-l-[var(--accent)]">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Como usar os filtros
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          <li>
            <span className="font-medium text-[var(--foreground)]">UF:</span>{" "}
            clique em um estado no mapa ou na lista ao lado. Os gráficos de
            tribunal e assunto passam a mostrar só processos daquela UF.
          </li>
          <li>
            <span className="font-medium text-[var(--foreground)]">
              Assunto:
            </span>{" "}
            clique em uma barra do gráfico por assunto. O mapa e o gráfico de
            tribunal são filtrados por aquele assunto.
          </li>
          <li>
            <span className="font-medium text-[var(--foreground)]">
              Limpar:
            </span>{" "}
            clique fora da área dos gráficos, no fundo vazio do mapa, ou no
            botão <strong>Limpar filtros</strong>. Clicar de novo na mesma UF ou
            assunto também remove aquele filtro.
          </li>
        </ul>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Os filtros de UF e assunto podem ser combinados (ex.: SP + um
          assunto). Zoom e arraste no mapa não alteram a seleção.
        </p>
      </section>

      {healthQuery.data && (
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              {hasActiveFilter ? "Processos filtrados" : "Processos na base"}
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              {filteredProcessos.length}
              {hasActiveFilter && (
                <span className="ml-2 text-base font-normal text-[var(--muted)]">
                  / {processos.length}
                </span>
              )}
            </p>
          </div>

          <div className="panel">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              UFs no recorte
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              {countUfs(filteredProcessos)}
            </p>
          </div>

          <div className="panel">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Status da API
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                tone={
                  healthQuery.data.status === "healthy" ? "success" : "warning"
                }
              >
                {healthQuery.data.status}
              </Badge>
              <span className="text-sm text-[var(--muted)]">
                v{healthQuery.data.version}
              </span>
            </div>
          </div>

          <div className="panel">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Fonte DataJud
            </p>
            <p className="mt-2 text-lg font-medium">
              {healthQuery.data.services.datajud_api === "mock_mode"
                ? "Mock (demo)"
                : "Configurada"}
            </p>
          </div>
        </section>
      )}

      <div ref={chartsRef} className="space-y-6" data-dashboard-charts>
        <section className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--muted)]">Filtros ativos:</span>
          {!hasActiveFilter && (
            <Badge tone="default">Nenhum - visão completa</Badge>
          )}
          {filters.uf && (
            <button
              type="button"
              onClick={() => toggleUf(filters.uf!)}
              className="inline-flex items-center gap-1 rounded-full border border-[#1f6b4a]/30 bg-[#e8f5ef] px-3 py-1 text-xs font-medium text-[#1f6b4a]"
            >
              UF: {filters.uf}
              <span aria-hidden="true">×</span>
            </button>
          )}
          {filters.assunto && (
            <button
              type="button"
              onClick={() => toggleAssunto(filters.assunto!)}
              title={filters.assunto}
              className="inline-flex max-w-xs items-center gap-1 truncate rounded-full border border-[#0f2744]/20 bg-[#eef2f7] px-3 py-1 text-xs font-medium text-[#0f2744]"
            >
              Assunto: {filters.assunto}
              <span aria-hidden="true">×</span>
            </button>
          )}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[#f8fafc]"
            >
              Limpar filtros
            </button>
          )}
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-xl font-semibold">Distribuição por estado</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Clique em uma UF para filtrar os demais gráficos. Clique no fundo
              do mapa para limpar todos os filtros.
            </p>
          </div>
          <BrazilMapChart
            data={ufStats}
            isLoading={processosQuery.isLoading}
            selectedUf={filters.uf}
            onSelectUf={toggleUf}
            onClearSelection={clearFilters}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="panel">
            <h2 className="mb-1 text-xl font-semibold">Por tribunal</h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Atualiza automaticamente conforme UF e/ou assunto selecionados.
            </p>
            <TribunalChart
              data={tribunalStats}
              isLoading={processosQuery.isLoading}
              emptyMessage={
                hasActiveFilter
                  ? "Nenhum processo neste recorte. Limpe os filtros ou escolha outra combinação."
                  : undefined
              }
            />
          </div>

          <div className="panel">
            <h2 className="mb-1 text-xl font-semibold">Por assunto</h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Clique em um assunto para filtrar o mapa e o gráfico de tribunal.
              Clique fora das barras (área vazia do gráfico) para limpar.
            </p>
            <AssuntoChart
              data={assuntoStats}
              isLoading={processosQuery.isLoading}
              selectedAssunto={filters.assunto}
              onSelectAssunto={toggleAssunto}
              onClearSelection={clearFilters}
            />
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
