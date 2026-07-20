"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Timeline } from "@/components/processos/Timeline";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useProcesso } from "@/hooks/useProcesso";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";

type ProcessoDetailViewProps = {
  id: string;
};

export function ProcessoDetailView({ id }: ProcessoDetailViewProps) {
  const processoQuery = useProcesso(id);

  if (processoQuery.isLoading) {
    return (
      <PageContainer title="Processo">
        <Spinner label="Carregando detalhes..." />
      </PageContainer>
    );
  }

  if (processoQuery.isError) {
    const isNotFound =
      processoQuery.error instanceof ApiError &&
      processoQuery.error.status === 404;

    return (
      <PageContainer title="Processo">
        <Alert variant="error">{getErrorMessage(processoQuery.error)}</Alert>
        <Link
          href="/processos"
          className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
        >
          Voltar para a lista
        </Link>
        {isNotFound && (
          <p className="mt-2 text-sm text-[var(--muted)]">
            O processo pode ter sido removido ou o ID está incorreto.
          </p>
        )}
      </PageContainer>
    );
  }

  const processo = processoQuery.data;

  if (!processo) {
    return null;
  }

  return (
    <PageContainer
      title={processo.numero_cnj}
      description="Detalhes do processo e histórico de movimentações."
    >
      <section className="panel mb-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge>{processo.tribunal}</Badge>
          <Badge tone="default">{processo.grau}º grau</Badge>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Classe
            </dt>
            <dd className="mt-1 text-sm">{processo.classe ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Assunto
            </dt>
            <dd className="mt-1 text-sm">{processo.assunto ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Órgão julgador
            </dt>
            <dd className="mt-1 text-sm">{processo.orgao_julgador ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Última atualização
            </dt>
            <dd className="mt-1 text-sm">
              {formatDateTime(processo.data_ultima_atualizacao)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2 className="mb-4 text-xl font-semibold">Movimentações</h2>
        <Timeline movimentacoes={processo.movimentacoes} />
      </section>

      <Link
        href="/processos"
        className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline"
      >
        Voltar para a lista
      </Link>
    </PageContainer>
  );
}
