import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SyncForm } from "./SyncForm";

const mutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/hooks/useSyncProcesso", () => ({
  useSyncProcesso: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,
  }),
}));

describe("SyncForm", () => {
  afterEach(() => {
    cleanup();
    mutateAsync.mockReset();
  });
  it("não sincroniza quando CNJ é inválido", async () => {
    const user = userEvent.setup();

    render(<SyncForm />);

    await user.type(screen.getByLabelText("Número CNJ"), "123-invalido");
    await user.click(screen.getByRole("button", { name: "Sincronizar" }));

    expect(await screen.findByText(/Formato inválido/i)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("envia sync quando CNJ é válido", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      sucesso: true,
      mensagem: "ok",
      processo: { id: "proc-1" },
      movimentacoes_sincronizadas: 1,
    });

    render(<SyncForm />);

    await user.type(
      screen.getByLabelText("Número CNJ"),
      "0001234-56.2023.8.15.0001",
    );
    await user.click(screen.getByRole("button", { name: "Sincronizar" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        numero_cnj: "0001234-56.2023.8.15.0001",
        grau: 1,
      });
    });
  });
});
