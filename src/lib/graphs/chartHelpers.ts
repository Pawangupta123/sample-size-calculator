import type { CSSProperties } from "react";
import type { ChartConfig, TableData } from "./types";

export function toBarData(d: TableData): Record<string, string | number>[] {
  return d.rows.map((r) =>
    Object.fromEntries([
      ["name", r.label],
      ...d.headers.slice(1).map((h, i) => [h, r.values[i] ?? 0]),
    ]),
  );
}

export function toPieData(d: TableData) {
  return d.rows.map((r) => ({ name: r.label, value: r.values[0] ?? 0 }));
}

export function toScatterData(d: TableData) {
  return d.rows.map((r) => ({
    x: r.values[0] ?? 0,
    y: r.values[1] ?? 0,
    z: r.values[2] ?? 1,
  }));
}

export function toErrorBarData(d: TableData) {
  return d.rows.map((r) => ({
    name: r.label,
    value: r.values[0] ?? 0,
    error: r.values[1] ?? 0,
  }));
}

export function axisStyle(fontSize: number) {
  return { style: { fontSize: fontSize - 2, fontFamily: "inherit" } };
}

export function yDomain(
  config: ChartConfig,
): [number | "auto", number | "auto"] {
  return [
    config.yMin ? parseFloat(config.yMin) : "auto",
    config.yMax ? parseFloat(config.yMax) : "auto",
  ];
}

export const TOOLTIP_STYLE: CSSProperties = {
  fontSize: 11,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};
