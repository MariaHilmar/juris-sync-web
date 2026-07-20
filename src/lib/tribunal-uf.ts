/** Tribunal estadual (TJ*) → UF. Tribunais federais/trabalhistas ficam de fora do mapa. */
export const TRIBUNAL_TO_UF: Record<string, string> = {
  TJAC: "AC",
  TJAL: "AL",
  TJAP: "AP",
  TJAM: "AM",
  TJBA: "BA",
  TJCE: "CE",
  TJDFT: "DF",
  TJES: "ES",
  TJGO: "GO",
  TJMA: "MA",
  TJMT: "MT",
  TJMS: "MS",
  TJMG: "MG",
  TJPA: "PA",
  TJPB: "PB",
  TJPR: "PR",
  TJPE: "PE",
  TJPI: "PI",
  TJRJ: "RJ",
  TJRN: "RN",
  TJRS: "RS",
  TJRO: "RO",
  TJRR: "RR",
  TJSC: "SC",
  TJSE: "SE",
  TJSP: "SP",
  TJTO: "TO",
};

export type UfStat = {
  uf: string;
  total_processos: number;
};

export function aggregateStatsByUf(
  tribunalStats: Array<{ tribunal: string; total_processos: number }> = [],
): UfStat[] {
  const totals = new Map<string, number>();

  for (const item of tribunalStats) {
    const uf = TRIBUNAL_TO_UF[item.tribunal.toUpperCase()];
    if (!uf) {
      continue;
    }
    totals.set(uf, (totals.get(uf) ?? 0) + item.total_processos);
  }

  return Array.from(totals.entries())
    .map(([uf, total_processos]) => ({ uf, total_processos }))
    .sort((a, b) => b.total_processos - a.total_processos);
}
