export type HealthResponse = {
  status: "healthy" | "degraded" | string;
  env: string;
  version: string;
  services: {
    database: string;
    datajud_api: "configured" | "mock_mode" | string;
  };
};

export type Movimentacao = {
  id: string;
  processo_id: string;
  data_hora: string;
  descricao: string;
  complemento: string | null;
  codigo_movimento: number | null;
  created_at: string;
};

export type Processo = {
  id: string;
  numero_cnj: string;
  classe: string | null;
  assunto: string | null;
  tribunal: string;
  orgao_julgador: string | null;
  data_distribuicao: string | null;
  grau: number;
  data_ultima_atualizacao: string;
  created_at: string;
  updated_at: string;
};

export type ProcessoDetail = Processo & {
  movimentacoes: Movimentacao[];
};

export type ProcessoListResponse = {
  items: Processo[];
  total: number;
  limit: number;
  offset: number;
};

export type ProcessoSyncRequest = {
  numero_cnj: string;
  grau: number;
};

export type ProcessoSyncResponse = {
  sucesso: boolean;
  mensagem: string;
  processo: Processo | null;
  movimentacoes_sincronizadas: number;
};

/** Campo é total_processos, NÃO total */
export type StatsTribunalItem = {
  tribunal: string;
  total_processos: number;
};

export type StatsAssuntoItem = {
  assunto: string;
  total_processos: number;
};

export type ListProcessosParams = {
  tribunal?: string;
  classe?: string;
  limit?: number;
  offset?: number;
};
