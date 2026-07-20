import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./client";

describe("apiFetch", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_JURISSYNC_API_URL = "http://localhost:8000";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna JSON em resposta ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ status: "healthy" }),
      }),
    );

    const data = await apiFetch<{ status: string }>("/health");
    expect(data.status).toBe("healthy");
  });

  it("mapeia erro de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(apiFetch("/health")).rejects.toMatchObject({
      status: 0,
      message:
        "Não foi possível conectar à API. Verifique se ela está em execução.",
    } satisfies Partial<ApiError>);
  });

  it("mapeia 404 com detail da API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          detail: "Processo judicial não encontrado na base de dados.",
        }),
      }),
    );

    await expect(apiFetch("/api/v1/processos/abc")).rejects.toMatchObject({
      status: 404,
      message: "Processo judicial não encontrado na base de dados.",
    });
  });

  it("mapeia 422 com mensagem padrão", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: [] }),
      }),
    );

    await expect(apiFetch("/api/v1/processos/sync", { method: "POST" })).rejects.toMatchObject({
      status: 422,
      message: "Dados inválidos. Verifique o número CNJ e o grau.",
    });
  });

  it("mapeia 500 com mensagem genérica", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "internal" }),
      }),
    );

    await expect(apiFetch("/health")).rejects.toMatchObject({
      status: 500,
      message: "Erro interno na API. Tente novamente mais tarde.",
    });
  });

  it("falha quando env da API não está configurada", async () => {
    delete process.env.NEXT_PUBLIC_JURISSYNC_API_URL;

    await expect(apiFetch("/health")).rejects.toMatchObject({
      status: 0,
      message: "NEXT_PUBLIC_JURISSYNC_API_URL não está configurada.",
    });
  });
});
