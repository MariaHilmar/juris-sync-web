"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatsTribunalItem } from "@/lib/api/types";
import { ChartEmpty } from "./ChartEmpty";

type TribunalChartProps = {
  data?: StatsTribunalItem[];
  isLoading?: boolean;
  emptyMessage?: string;
};

export function TribunalChart({
  data,
  isLoading,
  emptyMessage = "Nenhum processo na base ainda. Sincronize processos para ver a jurimetria por tribunal.",
}: TribunalChartProps) {
  if (isLoading) {
    return (
      <ChartEmpty
        message="Carregando distribuição por tribunal..."
        showProcessosLink={false}
      />
    );
  }

  if (!data || data.length === 0) {
    return <ChartEmpty message={emptyMessage} />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="tribunal" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [value, "Processos"]}
            labelFormatter={(label) => `Tribunal: ${label}`}
          />
          <Bar dataKey="total_processos" fill="#1f6b4a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
