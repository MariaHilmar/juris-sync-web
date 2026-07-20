"use client";

import Link from "next/link";
import type { Processo } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

type ProcessTableProps = {
  items: Processo[];
};

export function ProcessTable({ items }: ProcessTableProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted)]">
        Nenhum processo encontrado com os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] text-[var(--muted)]">
          <tr>
            <th className="px-3 py-3 font-medium">CNJ</th>
            <th className="px-3 py-3 font-medium">Tribunal</th>
            <th className="px-3 py-3 font-medium">Classe</th>
            <th className="px-3 py-3 font-medium">Assunto</th>
            <th className="px-3 py-3 font-medium">Grau</th>
            <th className="px-3 py-3 font-medium">Atualizado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((processo) => (
            <tr
              key={processo.id}
              className="border-b border-[var(--border)] transition-colors hover:bg-slate-50"
            >
              <td className="px-3 py-3">
                <Link
                  href={`/processos/${processo.id}`}
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  {processo.numero_cnj}
                </Link>
              </td>
              <td className="px-3 py-3">{processo.tribunal}</td>
              <td className="px-3 py-3">{processo.classe ?? "-"}</td>
              <td className="px-3 py-3">{processo.assunto ?? "-"}</td>
              <td className="px-3 py-3">{processo.grau}º</td>
              <td className="px-3 py-3 text-[var(--muted)]">
                {formatDateTime(processo.data_ultima_atualizacao)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
