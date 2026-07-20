import type { Movimentacao } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

type TimelineProps = {
  movimentacoes: Movimentacao[];
};

export function Timeline({ movimentacoes }: TimelineProps) {
  const ordered = [...movimentacoes].sort(
    (a, b) =>
      new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime(),
  );

  if (ordered.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Nenhuma movimentação registrada para este processo.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {ordered.map((movimentacao) => (
        <li
          key={movimentacao.id}
          className="relative border-l-2 border-[var(--border)] pl-5"
        >
          <span className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
          <time className="text-xs font-medium text-[var(--muted)]">
            {formatDateTime(movimentacao.data_hora)}
          </time>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            {movimentacao.descricao}
          </p>
          {movimentacao.complemento && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {movimentacao.complemento}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
