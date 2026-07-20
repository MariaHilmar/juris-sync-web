import type { Processo, StatsAssuntoItem, StatsTribunalItem } from "@/lib/api/types";
import { TRIBUNAL_TO_UF, type UfStat } from "@/lib/tribunal-uf";

export type DashboardFilters = {
  uf: string | null;
  assunto: string | null;
};

export function ufFromTribunal(tribunal: string): string | null {
  return TRIBUNAL_TO_UF[tribunal.toUpperCase()] ?? null;
}

export function matchesUf(processo: Processo, uf: string | null): boolean {
  if (!uf) {
    return true;
  }
  return ufFromTribunal(processo.tribunal) === uf;
}

export function matchesAssunto(
  processo: Processo,
  assunto: string | null,
): boolean {
  if (!assunto) {
    return true;
  }
  return (processo.assunto ?? "Não informado") === assunto;
}

/** Processos que entram nos gráficos “dependentes” (tribunal + cards). */
export function filterProcessos(
  processos: Processo[],
  filters: DashboardFilters,
): Processo[] {
  return processos.filter(
    (processo) =>
      matchesUf(processo, filters.uf) &&
      matchesAssunto(processo, filters.assunto),
  );
}

/**
 * Cross-filter: cada dimensão ignora o próprio filtro para permitir
 * trocar a seleção sem “sumir” as outras opções.
 */
export function processosForUfChart(
  processos: Processo[],
  filters: DashboardFilters,
): Processo[] {
  return processos.filter((processo) =>
    matchesAssunto(processo, filters.assunto),
  );
}

export function processosForAssuntoChart(
  processos: Processo[],
  filters: DashboardFilters,
): Processo[] {
  return processos.filter((processo) => matchesUf(processo, filters.uf));
}

export function aggregateByTribunal(
  processos: Processo[],
): StatsTribunalItem[] {
  const totals = new Map<string, number>();

  for (const processo of processos) {
    const key = processo.tribunal.toUpperCase();
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  return Array.from(totals.entries())
    .map(([tribunal, total_processos]) => ({ tribunal, total_processos }))
    .sort((a, b) => b.total_processos - a.total_processos);
}

export function aggregateByAssunto(processos: Processo[]): StatsAssuntoItem[] {
  const totals = new Map<string, number>();

  for (const processo of processos) {
    const key = processo.assunto?.trim() || "Não informado";
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  return Array.from(totals.entries())
    .map(([assunto, total_processos]) => ({ assunto, total_processos }))
    .sort((a, b) => b.total_processos - a.total_processos);
}

export function aggregateByUf(processos: Processo[]): UfStat[] {
  const totals = new Map<string, number>();

  for (const processo of processos) {
    const uf = ufFromTribunal(processo.tribunal);
    if (!uf) {
      continue;
    }
    totals.set(uf, (totals.get(uf) ?? 0) + 1);
  }

  return Array.from(totals.entries())
    .map(([uf, total_processos]) => ({ uf, total_processos }))
    .sort((a, b) => b.total_processos - a.total_processos);
}

export function countUfs(processos: Processo[]): number {
  const ufs = new Set<string>();
  for (const processo of processos) {
    const uf = ufFromTribunal(processo.tribunal);
    if (uf) {
      ufs.add(uf);
    }
  }
  return ufs.size;
}
