"use client";

import { useQuery } from "@tanstack/react-query";
import { getStatsPorTribunal } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query-keys";

export function useStatsTribunal() {
  return useQuery({
    queryKey: queryKeys.statsTribunal,
    queryFn: getStatsPorTribunal,
  });
}
