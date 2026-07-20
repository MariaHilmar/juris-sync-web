"use client";

import { useQuery } from "@tanstack/react-query";
import { getProcesso } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query-keys";

export function useProcesso(id: string) {
  return useQuery({
    queryKey: queryKeys.processo(id),
    queryFn: () => getProcesso(id),
    enabled: Boolean(id),
  });
}
