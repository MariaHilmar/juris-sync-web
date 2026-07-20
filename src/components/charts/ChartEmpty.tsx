import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type ChartEmptyProps = {
  message: string;
  showProcessosLink?: boolean;
};

export function ChartEmpty({
  message,
  showProcessosLink = true,
}: ChartEmptyProps) {
  let action: ReactNode = null;

  if (showProcessosLink) {
    action = (
      <Link href="/processos" className="mt-4">
        <Button variant="secondary">Ir para Processos</Button>
      </Link>
    );
  }

  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-white/70 p-6 text-center">
      <p className="max-w-sm text-sm text-[var(--muted)]">{message}</p>
      {action}
    </div>
  );
}
