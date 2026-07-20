"use client";

import { useQuery } from "@tanstack/react-query";
import { listProcessos } from "@/lib/api/endpoints";
import type { Processo } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

const PAGE_SIZE = 100;

async function fetchAllProcessos(): Promise<Processo[]> {
  const first = await listProcessos({ limit: PAGE_SIZE, offset: 0 });
  const items = [...first.items];
  let offset = PAGE_SIZE;

  while (items.length < first.total) {
    const page = await listProcessos({ limit: PAGE_SIZE, offset });
    if (page.items.length === 0) {
      break;
    }
    items.push(...page.items);
    offset += PAGE_SIZE;
  }

  return items;
}

/** Carrega todos os processos (paginado) para jurimetria com cross-filter no cliente. */
export function useAllProcessos() {
  return useQuery({
    queryKey: queryKeys.allProcessos,
    queryFn: fetchAllProcessos,
  });
}
