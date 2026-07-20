"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSyncProcesso } from "@/hooks/useSyncProcesso";
import { getErrorMessage } from "@/lib/errors";
import { CNJ_REGEX } from "@/lib/validators/cnj";

const syncSchema = z.object({
  numero_cnj: z
    .string()
    .min(1, "Informe o número CNJ.")
    .regex(CNJ_REGEX, "Formato inválido. Use NNNNNNN-DD.AAAA.J.TR.OOOO"),
  grau: z.number().int().min(1).max(3),
});

type SyncFormValues = z.infer<typeof syncSchema>;

export function SyncForm() {
  const router = useRouter();
  const syncMutation = useSyncProcesso();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SyncFormValues>({
    resolver: zodResolver(syncSchema),
    defaultValues: {
      numero_cnj: "",
      grau: 1,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await syncMutation.mutateAsync(values);

    if (result.processo?.id) {
      router.push(`/processos/${result.processo.id}`);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <Input
          label="Número CNJ"
          placeholder="0001234-56.2023.8.15.0001"
          error={errors.numero_cnj?.message}
          {...register("numero_cnj")}
        />
        <Select
          label="Grau"
          error={errors.grau?.message}
          {...register("grau", { valueAsNumber: true })}
        >
          <option value={1}>1º grau</option>
          <option value={2}>2º grau</option>
          <option value={3}>3º grau</option>
        </Select>
        <Button
          type="submit"
          disabled={syncMutation.isPending}
          className="md:mb-0"
        >
          {syncMutation.isPending ? "Sincronizando..." : "Sincronizar"}
        </Button>
      </div>

      {syncMutation.isError && (
        <Alert variant="error">{getErrorMessage(syncMutation.error)}</Alert>
      )}

      {syncMutation.isSuccess && syncMutation.data && (
        <Alert variant="success">{syncMutation.data.mensagem}</Alert>
      )}

      <p className="text-xs text-[var(--muted)]">
        Exemplos para demo (modo mock): 0001234-56.2023.8.15.0001,
        0009876-12.2022.8.26.0100, 1000001-00.2024.5.02.0001
      </p>
    </form>
  );
}
