import { describe, expect, it } from "vitest";
import { aggregateStatsByUf } from "./tribunal-uf";

describe("aggregateStatsByUf", () => {
  it("agrega tribunais estaduais por UF", () => {
    const result = aggregateStatsByUf([
      { tribunal: "TJSP", total_processos: 3 },
      { tribunal: "TJRJ", total_processos: 2 },
      { tribunal: "TJSP", total_processos: 1 },
    ]);

    expect(result).toEqual([
      { uf: "SP", total_processos: 4 },
      { uf: "RJ", total_processos: 2 },
    ]);
  });

  it("ignora tribunais sem UF (federal/trabalhista)", () => {
    const result = aggregateStatsByUf([
      { tribunal: "TRF1", total_processos: 5 },
      { tribunal: "TJMG", total_processos: 1 },
    ]);

    expect(result).toEqual([{ uf: "MG", total_processos: 1 }]);
  });
});
