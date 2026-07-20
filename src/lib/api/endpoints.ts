import { apiFetch } from "./client";
import type {
  HealthResponse,
  ListProcessosParams,
  ProcessoDetail,
  ProcessoListResponse,
  ProcessoSyncRequest,
  ProcessoSyncResponse,
  StatsAssuntoItem,
  StatsTribunalItem,
} from "./types";

function buildQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getHealth() {
  return apiFetch<HealthResponse>("/health");
}

export function listProcessos(params: ListProcessosParams = {}) {
  const query = buildQueryString({
    tribunal: params.tribunal,
    classe: params.classe,
    limit: params.limit,
    offset: params.offset,
  });

  return apiFetch<ProcessoListResponse>(`/api/v1/processos/${query}`);
}

export function getProcesso(id: string) {
  return apiFetch<ProcessoDetail>(`/api/v1/processos/${id}`);
}

export function syncProcesso(body: ProcessoSyncRequest) {
  return apiFetch<ProcessoSyncResponse>("/api/v1/processos/sync", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getStatsPorTribunal() {
  return apiFetch<StatsTribunalItem[]>("/api/v1/processos/stats/por-tribunal");
}

export function getStatsPorAssunto() {
  return apiFetch<StatsAssuntoItem[]>("/api/v1/processos/stats/por-assunto");
}
