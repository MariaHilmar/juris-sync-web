"use client";

import { useQuery } from "@tanstack/react-query";
import { listProcessos } from "@/lib/api/endpoints";
import type { ListProcessosParams } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export function useProcessos(params: ListProcessosParams = {}) {
  return useQuery({
    queryKey: queryKeys.processos(params),
    queryFn: () => listProcessos(params),
  });
}
