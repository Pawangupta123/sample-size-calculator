// Multi-chart auto-detector.
// Given a single raw HTML/text table (which may preserve "X ± Y" / "X (Y%)" /
// "Median (IQR a–b)" formatting), return every chart configuration that fits.

import type { ChartType, TableData, ChartConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";

// ─── Internal: parse raw cell strings out of HTML or plain text ──────────────

function parseRawHtmlTable(html: string): string[][] | null {
  if (typeof document === "undefined") return null;
  const div = document.createElement("div");
  div.innerHTML = html;
  const table = div.querySelector("table");
  if (!table) return null;
  const cells = Array.from(table.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td, th")).map((td) =>
      (td.textContent ?? "").replace(/\s+/g, " ").trim(),
    ),
  );
  return cells.filter((r) => r.some((c) => c));
}

function splitTextLine(line: string): string[] {
  const t = line.trim();
  if (!t) return [];
  if (t.includes("\t")) return t.split("\t").map((s) => s.trim());
  if (t.includes("|")) return t.split("|").map((s) => s.trim()).filter(Boolean);
  if (t.includes(";")) return t.split(";").map((s) => s.trim());
  return t.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);
}

function parseRawTextTable(text: string): string[][] | null {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim());
  if (lines.length < 2) return null;
  const rows = lines.map(splitTextLine).filter((r) => r.length > 0);
  return rows.length >= 2 ? rows : null;
}

export function parseRawTable(input: string): string[][] | null {
  if (/<t[dh][\s>]/i.test(input)) {
    const html = parseRawHtmlTable(input);
    if (html && html.length >= 2) return html;
  }
  return parseRawTextTable(input);
}

// ─── Cell-pattern recognisers ────────────────────────────────────────────────

const RE_MEAN_SD = /(-?\d+\.?\d*)\s*[±+]\s*(\d+\.?\d*)/;
const RE_N_PCT = /(\d+\.?\d*)\s*\(\s*(\d+\.?\d*)\s*%\s*\)/;
const RE_MEDIAN_RANGE = /(-?\d+\.?\d*)\s*[\[(][^)\]]*?(-?\d+\.?\d*)\s*[-–to,]\s*(-?\d+\.?\d*)/i;
const RE_PLAIN_NUM = /^-?\d+\.?\d*\s*%?$/;

type CellFormat = "mean_sd" | "n_pct" | "median_range" | "plain" | "empty";

function classifyCell(s: string): CellFormat {
  const t = s.trim();
  if (!t || t === "-" || t === "—" || /^na$/i.test(t)) return "empty";
  if (RE_MEAN_SD.test(t)) return "mean_sd";
  if (RE_N_PCT.test(t)) return "n_pct";
  if (RE_MEDIAN_RANGE.test(t)) return "median_range";
  if (RE_PLAIN_NUM.test(t.replace(/[,]/g, ""))) return "plain";
  return "empty";
}

function parsePlain(s: string): number | null {
  const cleaned = s.replace(/[,\s%]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function parseMeanSD(s: string): { mean: number; sd: number } | null {
  const m = s.match(RE_MEAN_SD);
  return m ? { mean: parseFloat(m[1]), sd: parseFloat(m[2]) } : null;
}

function parseNPct(s: string): { n: number; pct: number } | null {
  const m = s.match(RE_N_PCT);
  return m ? { n: parseFloat(m[1]), pct: parseFloat(m[2]) } : null;
}

function parseMedianRange(s: string): { median: number; low: number; high: number } | null {
  const m = s.match(RE_MEDIAN_RANGE);
  return m
    ? { median: parseFloat(m[1]), low: parseFloat(m[2]), high: parseFloat(m[3]) }
    : null;
}

// ─── Header cleanup + excluded-column filter ─────────────────────────────────

function cleanHeader(s: string): string {
  return s.replace(/\s*\(\s*n\s*=\s*[\d,]+\s*\)/gi, "").replace(/\s+/g, " ").trim();
}

function isExcludedCol(h: string): boolean {
  return /^\s*(total|grand\s*total|p[\s\-.–]?val(ue)?|sig\.?|significance|df|chi)\s*$/i.test(h);
}

// ─── Result type ─────────────────────────────────────────────────────────────

export interface DetectedChart {
  chartType: ChartType;
  data: TableData;
  config: ChartConfig;
  source: string; // human-readable explanation of where the chart came from
}

function cfg(overrides: Partial<ChartConfig>): ChartConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

// ─── Main detector ───────────────────────────────────────────────────────────

export function detectMultiCharts(input: string): DetectedChart[] {
  const raw = parseRawTable(input);
  if (!raw) return [];

  // Determine header row (first row mostly non-numeric)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(2, raw.length); i++) {
    const numeric = raw[i].filter((c) => classifyCell(c) !== "empty" && classifyCell(c) !== "plain" ? false : RE_PLAIN_NUM.test(c.replace(/[,]/g, ""))).length;
    if (numeric < raw[i].length / 2) { headerIdx = i; break; }
  }
  const rawHeader = raw[headerIdx] ?? [];
  const bodyRows = raw.slice(headerIdx + 1);
  if (bodyRows.length === 0) return [];

  // Drop excluded columns (p-value, Total, etc.)
  const maxCols = Math.max(...bodyRows.map((r) => r.length), rawHeader.length);
  const keepCol = Array.from({ length: maxCols }, (_, i) =>
    i === 0 ? true : !isExcludedCol(cleanHeader(rawHeader[i] ?? "")),
  );
  const header = rawHeader.map(cleanHeader).filter((_, i) => keepCol[i]);
  while (header.length < 2) header.push(`Series ${header.length}`);
  const body = bodyRows
    .map((r) => r.filter((_, i) => keepCol[i]))
    .filter((r) => r.some((c, i) => i > 0 && classifyCell(c) !== "empty"));

  if (body.length === 0) return [];

  const groups = header.slice(1); // column labels = groups / series
  const labelCol = header[0] || "Category";

  // Classify each data row by its dominant cell format
  type RowInfo = { label: string; cells: string[]; dominant: CellFormat };
  const rowInfo: RowInfo[] = body.map((cells): RowInfo => {
    const formats = cells.slice(1).map(classifyCell);
    const counts: Record<CellFormat, number> = {
      mean_sd: 0, n_pct: 0, median_range: 0, plain: 0, empty: 0,
    };
    formats.forEach((f) => counts[f]++);
    // Dominant format = most common non-empty
    let dominant: CellFormat = "empty";
    let max = 0;
    (Object.keys(counts) as CellFormat[]).forEach((k) => {
      if (k !== "empty" && counts[k] > max) { max = counts[k]; dominant = k; }
    });
    return { label: cells[0] ?? "", cells, dominant };
  });

  const out: DetectedChart[] = [];

  // ── 1. Error bar: each Mean±SD row becomes ONE chart (groups across cols) ──
  const meanSdRows = rowInfo.filter((r) => r.dominant === "mean_sd");
  for (const r of meanSdRows) {
    const data: TableData = {
      headers: ["Group", "Mean", "SD"],
      rows: groups.map((g, gi) => {
        const parsed = parseMeanSD(r.cells[gi + 1] ?? "");
        return {
          label: g,
          values: [parsed?.mean ?? null, parsed?.sd ?? null],
        };
      }).filter((row) => row.values[0] !== null),
    };
    if (data.rows.length >= 2) {
      const cleanTitle = r.label.replace(/,?\s*mean\s*±\s*sd\s*$/i, "").trim();
      out.push({
        chartType: "error_bar",
        data,
        config: cfg({ title: cleanTitle, yLabel: cleanTitle, xLabel: labelCol }),
        source: `Mean ± SD row: "${r.label}"`,
      });

      // BoxPlot also accepts a 3-col Mean+SD table (Case D — normal approx).
      out.push({
        chartType: "box",
        data,
        config: cfg({ title: `${cleanTitle} — distribution (Mean ± SD)`, yLabel: cleanTitle, xLabel: labelCol }),
        source: `Mean ± SD row — normal approximation`,
      });
    }
  }

  // ── 2. n(%) rows → bar (counts per group, series = categories) + pie ──────
  const npctRows = rowInfo.filter((r) => r.dominant === "n_pct");
  if (npctRows.length >= 1) {
    // Bar chart: X = group, series = each n(%) row
    const barData: TableData = {
      headers: [labelCol, ...npctRows.map((r) => r.label)],
      rows: groups.map((g, gi) => ({
        label: g,
        values: npctRows.map((r) => parseNPct(r.cells[gi + 1] ?? "")?.n ?? null),
      })),
    };
    if (barData.rows.some((r) => r.values.some((v) => v !== null))) {
      out.push({
        chartType: "bar",
        data: barData,
        config: cfg({ title: `Counts by ${labelCol}`, xLabel: labelCol, yLabel: "n" }),
        source: `${npctRows.length} n(%) row(s)`,
      });

      // Stacked bar: percentages (composition)
      const stackData: TableData = {
        headers: [labelCol, ...npctRows.map((r) => r.label)],
        rows: groups.map((g, gi) => ({
          label: g,
          values: npctRows.map((r) => parseNPct(r.cells[gi + 1] ?? "")?.pct ?? null),
        })),
      };
      if (npctRows.length >= 2) {
        out.push({
          chartType: "stacked_bar",
          data: stackData,
          config: cfg({ title: `Composition by ${labelCol}`, xLabel: labelCol, yLabel: "%" }),
          source: `${npctRows.length} n(%) row(s) — % composition`,
        });
      }

      // Pie / donut: per-group composition (only if 2+ npct rows)
      if (npctRows.length >= 2) {
        groups.forEach((g, gi) => {
          const pieData: TableData = {
            headers: ["Category", "Count"],
            rows: npctRows
              .map((r) => ({
                label: r.label,
                values: [parseNPct(r.cells[gi + 1] ?? "")?.n ?? null],
              }))
              .filter((row) => row.values[0] !== null),
          };
          if (pieData.rows.length >= 2) {
            out.push({
              chartType: "pie",
              data: pieData,
              config: cfg({ title: `${g} — composition` }),
              source: `Pie composition of ${g}`,
            });
          }
        });
      }
    }
  }

  // ── 3. Median (range/IQR) rows → box plot ─────────────────────────────────
  const mrRows = rowInfo.filter((r) => r.dominant === "median_range");
  for (const r of mrRows) {
    const boxData: TableData = {
      headers: ["Group", "Min", "Q1", "Median", "Q3", "Max"],
      rows: groups.map((g, gi) => {
        const p = parseMedianRange(r.cells[gi + 1] ?? "");
        return {
          label: g,
          values: p ? [p.low, p.low, p.median, p.high, p.high] : [null, null, null, null, null],
        };
      }).filter((row) => row.values[2] !== null),
    };
    if (boxData.rows.length >= 2) {
      out.push({
        chartType: "box",
        data: boxData,
        config: cfg({ title: r.label, yLabel: r.label, xLabel: labelCol }),
        source: `Median (range) row: "${r.label}"`,
      });
    }
  }

  // ── 4. Plain numeric rows: if 2+ groups, build a comparison bar chart ─────
  const plainRows = rowInfo.filter((r) => r.dominant === "plain");
  if (plainRows.length >= 1 && groups.length >= 2) {
    const data: TableData = {
      headers: [labelCol, ...groups],
      rows: plainRows.map((r) => ({
        label: r.label,
        values: groups.map((_, gi) => parsePlain(r.cells[gi + 1] ?? "")),
      })),
    };
    if (data.rows.some((r) => r.values.some((v) => v !== null))) {
      out.push({
        chartType: "bar",
        data,
        config: cfg({ title: `${labelCol} — group comparison`, xLabel: labelCol }),
        source: `${plainRows.length} numeric row(s)`,
      });
    }
  }

  // ── 5. Scatter / Regression: if exactly 2 numeric cols, all rows plain ────
  if (groups.length === 2 && rowInfo.every((r) => r.dominant === "plain" || r.dominant === "empty")) {
    const scatterData: TableData = {
      headers: [labelCol, groups[0], groups[1]],
      rows: rowInfo
        .filter((r) => r.dominant === "plain")
        .map((r) => ({
          label: r.label,
          values: [parsePlain(r.cells[1] ?? ""), parsePlain(r.cells[2] ?? "")],
        }))
        .filter((row) => row.values[0] !== null && row.values[1] !== null),
    };
    if (scatterData.rows.length >= 3) {
      out.push({
        chartType: "scatter",
        data: scatterData,
        config: cfg({ title: `${groups[1]} vs ${groups[0]}`, xLabel: groups[0], yLabel: groups[1] }),
        source: "Two numeric columns — scatter",
      });
      out.push({
        chartType: "regression",
        data: scatterData,
        config: cfg({ title: `${groups[1]} vs ${groups[0]} — linear fit`, xLabel: groups[0], yLabel: groups[1] }),
        source: "Two numeric columns — linear regression",
      });

      // ROC if values look like 0..1
      const allIn01 = scatterData.rows.every((r) =>
        (r.values[0] ?? -1) >= 0 && (r.values[0] ?? -1) <= 1 &&
        (r.values[1] ?? -1) >= 0 && (r.values[1] ?? -1) <= 1,
      );
      if (allIn01) {
        out.push({
          chartType: "roc",
          data: scatterData,
          config: cfg({ title: "ROC curve" }),
          source: "Two columns in [0,1] — possible ROC",
        });
      }
    }
  }

  // ── 6. Line chart: 3+ plain rows with sequential / ordered labels ─────────
  if (plainRows.length >= 3 && groups.length >= 1) {
    const looksOrdered =
      plainRows.every((r) => /^\d+\.?\d*$/.test(r.label.trim())) ||
      /(week|month|year|day|time|visit|hour|min)/i.test(labelCol);
    if (looksOrdered) {
      const lineData: TableData = {
        headers: [labelCol, ...groups],
        rows: plainRows.map((r) => ({
          label: r.label,
          values: groups.map((_, gi) => parsePlain(r.cells[gi + 1] ?? "")),
        })),
      };
      out.push({
        chartType: "line",
        data: lineData,
        config: cfg({ title: `Trend over ${labelCol}`, xLabel: labelCol }),
        source: `${plainRows.length} sequential rows`,
      });
    }
  }

  return out;
}
