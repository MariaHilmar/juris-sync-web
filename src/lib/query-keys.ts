import type { ListProcessosParams } from "@/lib/api/types";

export const queryKeys = {
  health: ["health"] as const,
  processos: (filters: ListProcessosParams = {}) =>
    ["processos", filters] as const,
  allProcessos: ["processos", "all"] as const,
  processo: (id: string) => ["processo", id] as const,
};
