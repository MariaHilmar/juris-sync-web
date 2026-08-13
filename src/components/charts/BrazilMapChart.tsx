"use client";

import { geoMercator, geoPath } from "d3-geo";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import type { UfStat } from "@/lib/tribunal-uf";
import { ChartEmpty } from "./ChartEmpty";

type BrazilFeature = {
  type: "Feature";
  properties: {
    name: string;
    sigla: string;
  };
  // GeoJSON de terceiros: tipagem frouxa para compatibilidade com d3-geo
  geometry: object;
};

type BrazilGeoJson = {
  type: "FeatureCollection";
  features: BrazilFeature[];
};

type BrazilMapChartProps = {
  data?: UfStat[];
  isLoading?: boolean;
  selectedUf?: string | null;
  onSelectUf?: (uf: string) => void;
  onClearSelection?: () => void;
};

const WIDTH = 640;
const HEIGHT = 560;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3.5;
const ZOOM_STEP = 0.25;

const MAP_BG = "#ffffff";
const EMPTY_FILL = "#e8eef4";
const ACCENT_LOW = "#9cc4b0";
const ACCENT_HIGH = "#1f6b4a";
const STROKE = "#ffffff";
const STROKE_ACTIVE = "#0f2744";
const LABEL = "#0f2744";
const LABEL_ON_DARK = "#ffffff";
const LABEL_MUTED = "#5c6b7a";
const BAR = "#d4a72c";
const BAR_ACTIVE = "#b8860b";

function colorForValue(value: number, max: number): string {
  if (value <= 0 || max <= 0) {
    return EMPTY_FILL;
  }

  const t = Math.min(1, value / max);
  return interpolateColor(ACCENT_LOW, ACCENT_HIGH, 0.2 + t * 0.8);
}

function interpolateColor(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${mix(a.r, b.r)}, ${mix(a.g, b.g)}, ${mix(a.b, b.b)})`;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function labelColorForValue(value: number, max: number): string {
  if (value <= 0 || max <= 0) {
    return LABEL_MUTED;
  }
  const t = Math.min(1, value / max);
  return t >= 0.45 ? LABEL_ON_DARK : LABEL;
}

function formatTotal(value: number): string {
  if (value >= 1000) {
    const compact = value / 1000;
    const digits = compact >= 10 ? 0 : 1;
    return `${compact.toFixed(digits)}k`;
  }
  return String(value);
}

export function BrazilMapChart({
  data,
  isLoading,
  selectedUf = null,
  onSelectUf,
  onClearSelection,
}: BrazilMapChartProps) {
  const [geo, setGeo] = useState<BrazilGeoJson | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const didDragRef = useRef(false);
  const mapAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/geo/brazil-states.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha ao carregar o mapa do Brasil.");
        }
        return response.json() as Promise<BrazilGeoJson>;
      })
      .then((json) => {
        if (!cancelled) {
          setGeo(json);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setGeoError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o mapa.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const byUf = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data ?? []) {
      map.set(item.uf, item.total_processos);
    }
    return map;
  }, [data]);

  const ranked = useMemo(() => {
    if (!data) {
      return [];
    }
    return [...data].sort((a, b) => b.total_processos - a.total_processos);
  }, [data]);

  const maxValue = useMemo(() => {
    if (!data || data.length === 0) {
      return 0;
    }
    return Math.max(...data.map((item) => item.total_processos));
  }, [data]);

  const pathGenerator = useMemo(() => {
    if (!geo) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geo as any);
    return geoPath(projection);
  }, [geo]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const clampZoom = useCallback((next: number) => {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2))));
  }, []);

  const zoomBy = useCallback(
    (delta: number) => {
      setZoom((current) => {
        const next = clampZoom(current + delta);
        if (next <= MIN_ZOOM) {
          setPan({ x: 0, y: 0 });
        }
        return next;
      });
    },
    [clampZoom],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    didDragRef.current = false;
    setIsDragging(true);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDragRef.current = true;
    }
    if (zoom <= MIN_ZOOM) {
      return;
    }
    setPan({
      x: drag.originX + dx,
      y: drag.originY + dy,
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleUfClick = (uf: string) => {
    if (didDragRef.current) {
      return;
    }
    onSelectUf?.(uf);
  };

  const handleBackgroundClick = () => {
    if (didDragRef.current) {
      return;
    }
    onClearSelection?.();
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomBy(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
  };

  if (isLoading) {
    return (
      <ChartEmpty
        message="Carregando distribuição por estado..."
        showProcessosLink={false}
      />
    );
  }

  if (geoError) {
    return <ChartEmpty message={geoError} showProcessosLink={false} />;
  }

  if (!data || data.length === 0) {
    return (
      <ChartEmpty message="Nenhum processo de tribunal estadual na base. Sincronize processos TJ* para ver o mapa por UF." />
    );
  }

  if (!geo || !pathGenerator) {
    return (
      <ChartEmpty
        message="Preparando mapa do Brasil..."
        showProcessosLink={false}
      />
    );
  }

  const hoveredValue = hovered ? (byUf.get(hovered) ?? 0) : null;
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="panel overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.85fr)]">
        {/* Mapa */}
        <div className="relative min-h-[420px] border-b border-[var(--border)] lg:border-b-0 lg:border-r">
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
            <MapControlButton
              label="Ampliar"
              onClick={() => zoomBy(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
            >
              +
            </MapControlButton>
            <MapControlButton
              label="Reduzir"
              onClick={() => zoomBy(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
            >
              −
            </MapControlButton>
            <MapControlButton label="Resetar visualização" onClick={resetView}>
              ⤢
            </MapControlButton>
          </div>

          <div
            ref={mapAreaRef}
            className={`relative h-full min-h-[420px] overflow-hidden ${
              zoom > MIN_ZOOM
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-default"
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onWheel={onWheel}
          >
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label="Mapa do Brasil com processos por UF"
              className="h-full w-full select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 120ms ease-out",
                background: MAP_BG,
              }}
              onClick={handleBackgroundClick}
            >
              {geo.features.map((feature) => {
                const uf = feature.properties.sigla;
                const value = byUf.get(uf) ?? 0;
                const isHovered = hovered === uf;
                const isSelected = selectedUf === uf;
                const isDimmed = Boolean(selectedUf) && !isSelected;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const d = pathGenerator(feature as any) ?? undefined;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const centroid = pathGenerator.centroid(feature as any);
                const [cx, cy] = centroid;
                const showLabel = Number.isFinite(cx) && Number.isFinite(cy);
                const labelColor = labelColorForValue(value, maxValue);

                return (
                  <g
                    key={uf}
                    onMouseEnter={() => setHovered(uf)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUfClick(uf);
                    }}
                    className="cursor-pointer"
                    opacity={isDimmed ? 0.35 : 1}
                  >
                    <path
                      d={d}
                      fill={colorForValue(value, maxValue)}
                      stroke={isSelected || isHovered ? STROKE_ACTIVE : STROKE}
                      strokeWidth={isSelected ? 2.2 : isHovered ? 1.6 : 0.7}
                    >
                      <title>
                        {feature.properties.name} ({uf}): {value} processo
                        {value === 1 ? "" : "s"}
                      </title>
                    </path>
                    {showLabel && (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="pointer-events-none"
                        style={{
                          fill: labelColor,
                          fontSize:
                            uf === "DF" || uf === "SE" || uf === "AL" ? 9 : 11,
                          fontWeight: 600,
                        }}
                      >
                        <tspan x={cx} dy="-0.55em">
                          {uf}
                        </tspan>
                        <tspan
                          x={cx}
                          dy="1.25em"
                          style={{
                            fill: value > 0 ? labelColor : LABEL_MUTED,
                            fontSize:
                              uf === "DF" || uf === "SE" || uf === "AL"
                                ? 8
                                : 10,
                            fontWeight: 500,
                          }}
                        >
                          {formatTotal(value)}
                        </tspan>
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-1 text-[11px] text-[var(--muted)] shadow-sm backdrop-blur-sm">
              {zoomPercent}%
              {zoom > MIN_ZOOM
                ? " - arraste para mover"
                : " - use + / − ou a roda do mouse"}
            </span>
          </div>
        </div>

        {/* Ranking lateral */}
        <aside className="flex max-h-[560px] flex-col bg-[var(--surface)] p-4 sm:p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Total por UF
            </p>
            <p className="text-[11px] text-[var(--muted)]">
              {hovered
                ? `${hovered}: ${hoveredValue}`
                : `${ranked.length} estados`}
            </p>
          </div>

          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {ranked.map((item) => {
              const widthPct =
                maxValue > 0
                  ? Math.max(6, (item.total_processos / maxValue) * 100)
                  : 0;
              const isHovered = hovered === item.uf;
              const isSelected = selectedUf === item.uf;

              return (
                <li key={item.uf}>
                  <button
                    type="button"
                    className={`grid w-full grid-cols-[2rem_1fr_2.5rem] items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors ${
                      isSelected
                        ? "bg-[#e8f5ef] ring-1 ring-[#1f6b4a]/35"
                        : isHovered
                          ? "bg-[#f1f5f9]"
                          : ""
                    }`}
                    onMouseEnter={() => setHovered(item.uf)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelectUf?.(item.uf)}
                    aria-pressed={isSelected}
                  >
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      {item.uf}
                    </span>
                    <div className="h-2.5 overflow-hidden rounded-sm bg-[#e8eef4]">
                      <div
                        className="h-full rounded-sm transition-[width] duration-300"
                        style={{
                          width: `${widthPct}%`,
                          background:
                            isSelected || isHovered ? BAR_ACTIVE : BAR,
                        }}
                      />
                    </div>
                    <span className="text-right text-xs tabular-nums text-[var(--muted)]">
                      {item.total_processos}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--muted)]">
            <span>Menos</span>
            <div
              className="h-1.5 flex-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${EMPTY_FILL}, ${ACCENT_LOW}, ${ACCENT_HIGH})`,
              }}
            />
            <span>Mais</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MapControlButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-base leading-none text-[var(--foreground)] shadow-sm transition hover:border-[#cbd5e1] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
