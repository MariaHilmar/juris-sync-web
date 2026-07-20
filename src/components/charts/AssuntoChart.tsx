"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatsAssuntoItem } from "@/lib/api/types";
import { ChartEmpty } from "./ChartEmpty";

type AssuntoChartProps = {
  data?: StatsAssuntoItem[];
  isLoading?: boolean;
  selectedAssunto?: string | null;
  onSelectAssunto?: (assunto: string) => void;
  onClearSelection?: () => void;
};

const FILL = "#0f2744";
const FILL_SELECTED = "#1f6b4a";
const FILL_DIMMED = "#94a3b8";

export function AssuntoChart({
  data,
  isLoading,
  selectedAssunto = null,
  onSelectAssunto,
  onClearSelection,
}: AssuntoChartProps) {
  if (isLoading) {
    return (
      <ChartEmpty
        message="Carregando distribuição por assunto..."
        showProcessosLink={false}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartEmpty message="Nenhum processo na base ainda. Sincronize processos para ver a jurimetria por assunto." />
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    assuntoLabel:
      item.assunto.length > 28
        ? `${item.assunto.slice(0, 28)}...`
        : item.assunto,
  }));

  return (
    <div
      className="h-72 w-full"
      onClick={() => onClearSelection?.()}
      role="presentation"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="assuntoLabel"
            width={120}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => [value, "Processos"]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as StatsAssuntoItem | undefined;
              return item ? `Assunto: ${item.assunto}` : "Assunto";
            }}
          />
          <Bar
            dataKey="total_processos"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(entry, _index, event) => {
              event.stopPropagation();
              const payload = entry as unknown as StatsAssuntoItem;
              if (payload?.assunto) {
                onSelectAssunto?.(payload.assunto);
              }
            }}
          >
            {chartData.map((item) => {
              const isSelected = selectedAssunto === item.assunto;
              const isDimmed = Boolean(selectedAssunto) && !isSelected;
              return (
                <Cell
                  key={item.assunto}
                  fill={
                    isSelected
                      ? FILL_SELECTED
                      : isDimmed
                        ? FILL_DIMMED
                        : FILL
                  }
                  stroke={isSelected ? "#0f2744" : undefined}
                  strokeWidth={isSelected ? 1 : 0}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
