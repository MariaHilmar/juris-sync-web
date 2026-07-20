type FastApiErrorBody = {
  detail?: string | Array<{ msg?: string; loc?: unknown[] }>;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_JURISSYNC_API_URL;

  if (!base) {
    throw new ApiError(
      0,
      "NEXT_PUBLIC_JURISSYNC_API_URL não está configurada.",
    );
  }

  return base.replace(/\/$/, "");
}

function parseErrorMessage(status: number, body: unknown): string {
  if (status === 0) {
    return "Não foi possível conectar à API. Verifique se ela está em execução.";
  }

  if (status === 422) {
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as FastApiErrorBody).detail;

      if (typeof detail === "string") {
        return detail;
      }

      if (Array.isArray(detail) && detail.length > 0) {
        const messages = detail
          .map((item) => item.msg)
          .filter((msg): msg is string => Boolean(msg));

        if (messages.length > 0) {
          return messages.join(" ");
        }
      }
    }

    return "Dados inválidos. Verifique o número CNJ e o grau.";
  }

  if (status === 500) {
    return "Erro interno na API. Tente novamente mais tarde.";
  }

  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as FastApiErrorBody).detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  if (status === 404) {
    return "Processo não encontrado.";
  }

  return `Erro na requisição (HTTP ${status}).`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      "Não foi possível conectar à API. Verifique se ela está em execução.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      parseErrorMessage(response.status, body),
      body,
    );
  }

  return body as T;
}
