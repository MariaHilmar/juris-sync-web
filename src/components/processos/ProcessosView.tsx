"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  ProcessFilters,
  type ProcessFiltersState,
} from "@/components/processos/ProcessFilters";
import { ProcessTable } from "@/components/processos/ProcessTable";
import { SyncForm } from "@/components/processos/SyncForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useProcessos } from "@/hooks/useProcessos";
import { getErrorMessage } from "@/lib/errors";

const PAGE_SIZE = 20;

export function ProcessosView() {
  const [filters, setFilters] = useState<ProcessFiltersState>({
    tribunal: "",
    classe: "",
  });
  const [offset, setOffset] = useState(0);

  const processosQuery = useProcessos({
    tribunal: filters.tribunal || undefined,
    classe: filters.classe || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const total = processosQuery.data?.total ?? 0;
  const canGoBack = offset > 0;
  const canGoForward = offset + PAGE_SIZE < total;

  return (
    <PageContainer
      title="Processos"
      description="Sincronize processos pelo número CNJ e consulte a base local."
    >
      <section className="panel mb-6">
        <h2 className="mb-4 text-xl font-semibold">Sincronizar processo</h2>
        <SyncForm />
      </section>

      <section className="panel mb-6 space-y-4">
        <h2 className="text-xl font-semibold">Filtros</h2>
        <ProcessFilters
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setOffset(0);
          }}
        />
      </section>

      <section className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Base local</h2>
          <p className="text-sm text-[var(--muted)]">
            {total} processo{total === 1 ? "" : "s"} encontrado
            {total === 1 ? "" : "s"}
          </p>
        </div>

        {processosQuery.isLoading && (
          <Spinner label="Carregando processos..." />
        )}

        {processosQuery.isError && (
          <Alert variant="error">{getErrorMessage(processosQuery.error)}</Alert>
        )}

        {processosQuery.data && (
          <>
            <ProcessTable items={processosQuery.data.items} />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">
                Exibindo {processosQuery.data.items.length} de {total}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canGoBack}
                  onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canGoForward}
                  onClick={() => setOffset((current) => current + PAGE_SIZE)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </PageContainer>
  );
}
