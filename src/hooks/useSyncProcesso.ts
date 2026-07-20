"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncProcesso } from "@/lib/api/endpoints";
import type { ProcessoSyncRequest } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export function useSyncProcesso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProcessoSyncRequest) => syncProcesso(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.statsTribunal });
      queryClient.invalidateQueries({ queryKey: queryKeys.statsAssunto });
      queryClient.invalidateQueries({ queryKey: queryKeys.health });
    },
  });
}
