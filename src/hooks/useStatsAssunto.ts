"use client";

import { useQuery } from "@tanstack/react-query";
import { getStatsPorAssunto } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query-keys";

export function useStatsAssunto() {
  return useQuery({
    queryKey: queryKeys.statsAssunto,
    queryFn: getStatsPorAssunto,
  });
}
