import type { BatchTableResult } from './parseTable'

// ─── Types matching the backend API response ───────────────────────────────────

interface ApiColumn {
  colIndex: number
  header: string
  'result-type': 'intermediate' | 'summary'
  count?: number
}

interface ApiComponents {
  count?: number | null
  percent?: number | null
  mean?: number | null
  sd?: number | null
  median?: number | null
  iqr_q1?: number | null
  iqr_q3?: number | null
}

interface ApiMeta {
  statistic_type: 'numerical' | 'categorical' | 'summary'
  distribution?: string
  formula?: string
}

interface ApiCell {
  colIndex: number
  'result-type': 'intermediate' | 'summary'
  result?: { components: ApiComponents; meta: ApiMeta }
}

interface ApiRow {
  label: string
  rowIndex: number
  cells: ApiCell[]
}

interface ApiTable {
  columns: ApiColumn[]
  rows: ApiRow[]
}

interface ApiResponse {
  success: boolean
  data: {
    id: string
    tableName?: string
    analysis: { table: ApiTable }
  }
}

// Short group header — strip "Sex: " prefix if present
function cleanGroupHeader(h: string): string {
  return h.replace(/^[^:]+:\s*/, '').trim() || h
}

// ─── Main parser ───────────────────────────────────────────────────────────────

export function parseApiJson(json: ApiResponse): BatchTableResult[] {
  if (!json?.success || !json.data?.analysis?.table) return []

  const { columns, rows } = json.data.analysis.table
  const groupCols = columns.filter((c) => c['result-type'] === 'intermediate')
  if (groupCols.length === 0) return []

  const groupHeaders = groupCols.map((c) => cleanGroupHeader(c.header))

  // Classify every row
  type RowKind = 'median_iqr' | 'mean_sd' | 'categorical' | 'unknown'

  interface ClassifiedRow {
    label: string
    kind: RowKind
    cells: ApiCell[]
  }

  const classified: ClassifiedRow[] = rows.map((row) => {
    const groupCells = groupCols
      .map((gc) => row.cells.find((c) => c.colIndex === gc.colIndex))
      .filter((c): c is ApiCell => !!c && c.result != null)

    if (groupCells.length === 0) return { label: row.label, kind: 'unknown' as RowKind, cells: [] }

    const meta = groupCells[0].result!.meta
    const formula = meta.formula ?? ''

    let kind: RowKind = 'unknown'
    if (meta.statistic_type === 'categorical') kind = 'categorical'
    else if (/median|iqr/i.test(formula)) kind = 'median_iqr'
    else if (/mean|sd/i.test(formula) || groupCells[0].result!.components.mean != null) kind = 'mean_sd'

    return { label: row.label, kind, cells: groupCells }
  }).filter((r) => r.kind !== 'unknown' && r.cells.length > 0)

  const results: BatchTableResult[] = []

  // ── Group consecutive rows of same kind into one chart ────────────────────────
  let i = 0
  while (i < classified.length) {
    const current = classified[i]

    // Collect consecutive rows with the same kind
    let j = i + 1
    while (j < classified.length && classified[j].kind === current.kind) j++
    const batch = classified.slice(i, j)
    i = j

    if (current.kind === 'median_iqr') {
      if (batch.length === 1) {
        // ── Single variable → Box Plot (groups on X axis) ──────────────────────
        const row = batch[0]
        const tableRows = row.cells.map((cell, gi) => {
          const c = cell.result!.components
          const q1 = c.iqr_q1 ?? 0, median = c.median ?? 0, q3 = c.iqr_q3 ?? 0
          const iqr = q3 - q1
          return { label: groupHeaders[gi], values: [Math.max(0, q1 - 1.5 * iqr), q1, median, q3, q3 + 1.5 * iqr] }
        })
        results.push({
          data: { headers: ['Group', 'Min', 'Q1', 'Median', 'Q3', 'Max'], rows: tableRows },
          suggestedChart: 'box',
        })
      } else {
        // ── Multiple variables → Grouped Bar using MEDIAN values ──────────────
        // Rows = variables, Columns = groups  e.g. Variable | M | F
        const tableRows = batch.map((row) => ({
          label: row.label,
          values: row.cells.map((cell) => cell.result!.components.median ?? 0),
        }))
        results.push({
          data: { headers: ['Variable', ...groupHeaders], rows: tableRows },
          suggestedChart: 'bar',
        })
      }

    } else if (current.kind === 'mean_sd') {
      if (batch.length === 1) {
        // ── Single variable → Error Bar ────────────────────────────────────────
        const row = batch[0]
        const tableRows = row.cells.map((cell, gi) => {
          const c = cell.result!.components
          return { label: groupHeaders[gi], values: [c.mean ?? 0, c.sd ?? 0] }
        })
        results.push({
          data: { headers: ['Group', 'Mean', 'SD'], rows: tableRows },
          suggestedChart: 'error_bar',
        })
      } else {
        // ── Multiple variables → Grouped Bar using MEAN values ─────────────────
        const tableRows = batch.map((row) => ({
          label: row.label,
          values: row.cells.map((cell) => cell.result!.components.mean ?? 0),
        }))
        results.push({
          data: { headers: ['Variable', ...groupHeaders], rows: tableRows },
          suggestedChart: 'bar',
        })
      }

    } else if (current.kind === 'categorical') {
      if (batch.length === 1) {
        // ── Single categorical → Bar (groups on X axis) ────────────────────────
        const row = batch[0]
        const tableRows = row.cells.map((cell, gi) => ({
          label: groupHeaders[gi],
          values: [cell.result!.components.count ?? 0],
        }))
        results.push({
          data: { headers: ['Group', row.label], rows: tableRows },
          suggestedChart: 'bar',
        })
      } else {
        // ── Multiple categoricals → Grouped Bar (count per group per variable) ─
        const tableRows = batch.map((row) => ({
          label: row.label,
          values: row.cells.map((cell) => cell.result!.components.count ?? 0),
        }))
        results.push({
          data: { headers: ['Variable', ...groupHeaders], rows: tableRows },
          suggestedChart: 'bar',
        })
      }
    }
  }

  return results
}

export function normaliseApiUrl(url: string): string {
  try { return new URL(url).origin } catch { return url }
}
