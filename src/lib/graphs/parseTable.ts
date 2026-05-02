import type { TableData, TableRow } from './types'

// Strip "(n=102)" style annotations from header cell text
function cleanHeaderCell(s: string): string {
  return s.replace(/\s*\(\s*n\s*=\s*[\d,]+\s*\)/gi, '').replace(/\s+/g, ' ').trim() || s
}

// Detect columns that should be excluded from charts (Total, p-value, etc.)
function isExcludedCol(header: string): boolean {
  return /^\s*(total|grand\s*total|p[\s\-.–]?val(ue)?|sig\.?|significance|df|chi|f\s*stat)\s*$/i.test(header)
}

// Remove excluded columns from headers + rows
function dropExcludedCols(headers: string[], rows: TableRow[]): { headers: string[]; rows: TableRow[] } {
  const keep = headers.map((h, i) => i === 0 || !isExcludedCol(h))
  if (keep.every(Boolean)) return { headers, rows }
  return {
    headers: headers.filter((_, i) => keep[i]),
    rows: rows.map((r) => ({ label: r.label, values: r.values.filter((_, i) => keep[i + 1]) })),
  }
}

// Detect if HTML/text has dual-value cells like "91 (89.2%)"
export function detectsDualValues(input: string): boolean {
  // For HTML: use DOM to extract actual cell text, then check those
  if (typeof document !== 'undefined' && /<t[dh][\s>]/i.test(input)) {
    try {
      const div = document.createElement('div')
      div.innerHTML = input
      const cells = Array.from(div.querySelectorAll('td, th'))
      return cells.some((td) => /\d+\s*\(\s*\d+\.?\d*\s*%\s*\)/.test((td.textContent ?? '').replace(/\s+/g, ' ')))
    } catch { /* fall through */ }
  }
  // For plain text
  return /\d+\s*\(\s*\d+\.?\d*\s*%\s*\)/.test(input.replace(/\s+/g, ' '))
}

// Extract either the count or the percentage from a cell like "91 (89.2%)"
function extractCellValue(cell: string, mode: 'count' | 'percent'): number | null {
  if (mode === 'percent') {
    const m = cell.match(/\(\s*(\d+\.?\d*)\s*%\s*\)/)
    if (m) return parseFloat(m[1])
    // cell has no percentage — fall through to count extraction
  }
  const n = parseFloat(cell.replace(/[,،%()—–]/g, ''))
  return isNaN(n) ? null : n
}

// ─── HTML table parser (Word / Excel HTML clipboard) ─────────────────────────

export function parseHtmlTable(html: string, mode: 'count' | 'percent' = 'count'): TableData | null {
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    const table = div.querySelector('table')
    if (!table) return null

    const allRows = Array.from(table.querySelectorAll('tr'))
    if (allRows.length < 2) return null

    // Extract text from each cell, collapse whitespace
    const cells = allRows.map((tr) =>
      Array.from(tr.querySelectorAll('td, th')).map((td) =>
        (td.textContent ?? '').replace(/\s+/g, ' ').trim()
      )
    )

    // Find widest row to determine column count
    const maxCols = Math.max(...cells.map((r) => r.length))
    if (maxCols < 2) return null

    // Detect header row: first row that has mostly non-numeric cells
    let headerIdx = 0
    for (let i = 0; i < Math.min(2, cells.length); i++) {
      const numericCount = cells[i].filter((c) => /^-?[\d.,]+%?$/.test(c.replace(/[()]/g, ''))).length
      if (numericCount < cells[i].length / 2) { headerIdx = i; break }
    }

    const headerRow = cells[headerIdx]
    const dataRows = cells.slice(headerIdx + 1)
    if (dataRows.length === 0) return null

    // Clean headers: strip "(n=102)" annotations
    const cleanedHeader = headerRow.map(cleanHeaderCell)
    const headers = cleanedHeader.length >= maxCols
      ? cleanedHeader.slice(0, maxCols)
      : [...cleanedHeader, ...Array.from({ length: maxCols - cleanedHeader.length }, (_, i) => `Series ${cleanedHeader.length + i}`)]

    const rows: TableRow[] = dataRows
      .filter((cols) => cols.some((c) => c.trim()))
      .map((cols) => ({
        label: cols[0] ?? '',
        values: cols.slice(1, maxCols).map((c) => extractCellValue(c, mode)),
      }))
      // Only keep rows that have at least one numeric value (drops section headers like "Fever:")
      .filter((r) => r.values.some((v) => v !== null))

    if (rows.length === 0) return null

    return dropExcludedCols(headers.slice(0, maxCols), rows)
  } catch {
    return null
  }
}

function cleanNumber(s: string, mode: 'count' | 'percent' = 'count'): number | null {
  if (mode === 'percent') {
    const m = s.match(/\(\s*(\d+\.?\d*)\s*%\s*\)/)
    if (m) return parseFloat(m[1])
  }
  const cleaned = s
    .replace(/[,،]/g, '')      // commas in numbers
    .replace(/[()]/g, '')       // parentheses (SPSS uses these for negative)
    .replace(/[%٪]/g, '')       // percent sign
    .replace(/[—–-]+/g, '')     // dashes for missing
    .trim()
  if (!cleaned || cleaned === '.' || cleaned.toLowerCase() === 'na') return null
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function splitLine(line: string): string[] {
  const trimmed = line.trim()
  if (!trimmed) return []
  // Tab-separated (Excel/Word/SPSS export)
  if (trimmed.includes('\t')) {
    return trimmed.split('\t').map((s) => s.trim())
  }
  // Pipe-separated (some exports)
  if (trimmed.includes('|')) {
    return trimmed.split('|').map((s) => s.trim()).filter(Boolean)
  }
  // Semicolon-separated (European CSV)
  if (trimmed.includes(';') && !trimmed.includes('\t')) {
    const parts = trimmed.split(';').map((s) => s.trim())
    if (parts.length >= 2) return parts
  }
  // 2+ spaces (SPSS fixed-width output / Jamovi / JASP text export)
  return trimmed.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean)
}

function looksNumeric(s: string): boolean {
  return /^-?[\d,،.]+[%]?$/.test(s.trim().replace(/[()—–]/g, ''))
}

export function parseTableText(text: string, mode: 'count' | 'percent' = 'count'): TableData | null {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim())

  if (rawLines.length < 2) return null

  const splitLines = rawLines.map(splitLine).filter((l) => l.length > 0)
  if (splitLines.length < 2) return null

  // Find header row: first row with mostly non-numeric cells
  let headerIdx = 0
  for (let i = 0; i < Math.min(3, splitLines.length); i++) {
    const row = splitLines[i]
    const numericCount = row.filter((c) => looksNumeric(c)).length
    if (numericCount < row.length / 2) { headerIdx = i; break }
  }

  const headerRow = splitLines[headerIdx]
  const dataRows = splitLines.slice(headerIdx + 1)

  if (dataRows.length === 0) return null

  // Determine number of columns from widest data row
  const maxCols = Math.max(...dataRows.map((r) => r.length))
  const seriesCount = Math.max(1, maxCols - 1)

  // Build headers
  let headers: string[]
  if (headerRow.length >= maxCols) {
    headers = headerRow.slice(0, maxCols)
  } else {
    // Pad headers
    headers = [...headerRow]
    for (let i = headers.length; i < maxCols; i++) headers.push(`Series ${i}`)
  }
  if (headers.length < 2) headers = ['Category', ...headers]

  // Clean headers: strip "(n=102)" annotations
  headers = headers.map(cleanHeaderCell)

  // Parse rows
  const rows: TableRow[] = []
  for (const cols of dataRows) {
    if (cols.length === 0) continue
    const label = cols[0] ?? ''
    const values: (number | null)[] = []
    for (let i = 1; i < maxCols; i++) {
      values.push(cols[i] != null ? cleanNumber(cols[i], mode) : null)
    }
    // Skip rows with no numeric data (section headers like "Fever:", "Baseline:" etc.)
    if (values.every((v) => v === null)) continue
    rows.push({ label, values })
  }

  if (rows.length === 0) return null

  return dropExcludedCols(headers.slice(0, 1 + seriesCount), rows)
}

export function tableToText(data: TableData): string {
  const lines = [data.headers.join('\t')]
  for (const row of data.rows) {
    lines.push([row.label, ...row.values.map((v) => (v ?? '').toString())].join('\t'))
  }
  return lines.join('\n')
}

export function parseCsvText(text: string, mode: 'count' | 'percent' = 'count'): TableData | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return null

  // Auto-detect delimiter: comma or semicolon (European locale SPSS exports use ;)
  const firstLine = lines[0]
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ','

  const unquote = (s: string) => s.replace(/^["']|["']$/g, '').trim()
  const rows2d = lines.map((l) => l.split(delimiter).map(unquote))
  const headers = rows2d[0].map(cleanHeaderCell)
  const rows: TableRow[] = rows2d.slice(1)
    .map((cols) => ({
      label: cols[0] ?? '',
      values: cols.slice(1).map((c) => cleanNumber(c, mode)),
    }))
    .filter((r) => r.values.some((v) => v !== null))
  if (rows.length === 0) return null
  return dropExcludedCols(headers, rows)
}

// ─── Descriptive Statistics table parser ──────────────────────────────────────
// Handles SPSS/Jamovi/JASP output where ROWS = stat names, COLS = groups
// e.g. | Median | 8 (IQR 6.75-10) |  →  Box Plot row: [Min, Q1, Median, Q3, Max]

type StatType = 'median' | 'mean' | 'sd' | 'min' | 'max' | 'q1' | 'q3'

function identifyStat(label: string): StatType | null {
  const l = label.toLowerCase()
  if (/\bmedian\b/.test(l)) return 'median'
  if (/\bmean\b|\baverage\b/.test(l)) return 'mean'
  if (/\bs\.?d\.?\b|\bstd\.?\b|\bstdev\b|\bstandard.dev/.test(l)) return 'sd'
  if (/\bminimum\b|\bmin\.?\b/.test(l)) return 'min'
  if (/\bmaximum\b|\bmax\.?\b/.test(l)) return 'max'
  if (/\bq1\b|quartile.{0,3}1\b|25th/.test(l)) return 'q1'
  if (/\bq3\b|quartile.{0,3}3\b|75th/.test(l)) return 'q3'
  return null
}

// "8 (IQR 6.75-10)" or "8 [6.75, 10]" → { median, q1, q3 }
function parseMedianIQR(s: string): { median: number; q1: number; q3: number } | null {
  const med = parseFloat(s)
  if (isNaN(med)) return null
  const iqr = s.match(/[\[(]\s*(?:iqr\s*)?(\d+\.?\d*)\s*[-–,]\s*(\d+\.?\d*)\s*[\])]/i)
  return iqr
    ? { median: med, q1: parseFloat(iqr[1]), q3: parseFloat(iqr[2]) }
    : { median: med, q1: med, q3: med }
}

// "8.24 ± 2.37" or "8.24±2.37" → { mean, sd }
function parseMeanSD(s: string): { mean: number; sd: number } | null {
  const m = s.match(/(\d+\.?\d*)\s*[±+]\s*(\d+\.?\d*)/)
  return m ? { mean: parseFloat(m[1]), sd: parseFloat(m[2]) } : null
}

function simpleNum(s: string): number | null {
  const n = parseFloat(s.replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? null : n
}

export type DescStatsResult = { data: TableData; suggestedChart: 'box' | 'error_bar' }

export function parseDescriptiveStats(html: string): DescStatsResult | null {
  if (typeof document === 'undefined') return null
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    const table = div.querySelector('table')
    if (!table) return null

    // Get raw cell text (before any number extraction)
    const raw = Array.from(table.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.querySelectorAll('td, th')).map((td) =>
        (td.textContent ?? '').replace(/\s+/g, ' ').trim()
      )
    )
    if (raw.length < 2) return null

    // Build stat-row index: statType → row index
    const statIdx: Partial<Record<StatType, number>> = {}
    raw.forEach((row, i) => {
      const t = identifyStat(row[0] ?? '')
      if (t && !(t in statIdx)) statIdx[t] = i
    })

    // Need at least 2 recognisable stat rows to be confident it's a stats table
    if (Object.keys(statIdx).length < 2) return null

    // Groups = columns after the first (label) column, taken from header row
    const groups = raw[0].slice(1).map((h, i) => cleanHeaderCell(h) || `Group ${i + 1}`)
    if (groups.length === 0) return null

    const getCell = (stat: StatType, gi: number) => raw[statIdx[stat] ?? -1]?.[gi + 1] ?? ''

    const hasBox = ('median' in statIdx) || ('min' in statIdx) || ('max' in statIdx)
    const hasError = ('mean' in statIdx) && (!hasBox)

    if (hasBox) {
      const rows: TableRow[] = groups.map((label, gi) => {
        const medData = parseMedianIQR(getCell('median', gi))
        const min = simpleNum(getCell('min', gi)) ?? 0
        const max = simpleNum(getCell('max', gi)) ?? 0
        const q1 = simpleNum(getCell('q1', gi)) ?? medData?.q1 ?? 0
        const q3 = simpleNum(getCell('q3', gi)) ?? medData?.q3 ?? 0
        const median = medData?.median ?? 0
        return { label, values: [min, q1, median, q3, max] }
      })
      return { data: { headers: ['Group', 'Min', 'Q1', 'Median', 'Q3', 'Max'], rows }, suggestedChart: 'box' }
    }

    if (hasError) {
      const rows: TableRow[] = groups.map((label, gi) => {
        const ms = parseMeanSD(getCell('mean', gi))
        const sd = simpleNum(getCell('sd', gi)) ?? ms?.sd ?? 0
        return { label, values: [ms?.mean ?? 0, sd] }
      })
      return { data: { headers: ['Group', 'Mean', 'SD'], rows }, suggestedChart: 'error_bar' }
    }

    return null
  } catch { return null }
}

// ─── Mean ± SD table parser ───────────────────────────────────────────────────
// Handles: Variable | Group1 (n=X) | Group2 (n=Y) | Total | p-value
//          Row val  | 2510 ± 535   | 2338 ± 810   | ...   | 0.31
//
// Single variable row  → Error Bar (Group | Mean | SD)
// Multiple variable rows → Bar chart (Variable | Group1 | Group2 …) using means

function extractMeanSD(cell: string): { mean: number; sd: number } | null {
  const m = cell.match(/(-?\d+\.?\d*)\s*[±\+\-–]{1,2}\s*(\d+\.?\d*)/)
  return m ? { mean: parseFloat(m[1]), sd: parseFloat(m[2]) } : null
}

export function detectsMeanSD(input: string): boolean {
  return /\d+\.?\d*\s*[±]\s*\d+/.test(input)
}

export function parseMeanSDTable(html: string): DescStatsResult | null {
  if (typeof document === 'undefined') return null
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    const table = div.querySelector('table')
    if (!table) return null

    const cells = Array.from(table.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.querySelectorAll('td, th')).map((td) =>
        (td.textContent ?? '').replace(/\s+/g, ' ').trim()
      )
    )
    if (cells.length < 2) return null

    // Need at least 2 cells with ± notation to qualify
    const allCells = cells.flat()
    if (allCells.filter((c) => extractMeanSD(c)).length < 2) return null

    const headerRow = cells[0]
    // Find group column indices (exclude Total, p-value)
    const groupCols: { name: string; idx: number }[] = []
    headerRow.slice(1).forEach((h, i) => {
      const cleaned = cleanHeaderCell(h)
      if (!isExcludedCol(cleaned) && !/^\s*total\s*$/i.test(cleaned) && cleaned)
        groupCols.push({ name: cleaned, idx: i + 1 })
    })
    if (groupCols.length === 0) return null

    // Data rows: rows that have at least one Mean±SD cell
    const dataRows = cells.slice(1).filter((row) =>
      groupCols.some((g) => extractMeanSD(row[g.idx] ?? ''))
    )
    if (dataRows.length === 0) return null

    if (dataRows.length === 1) {
      // ── Single variable → Error Bar: rows = groups, values = [mean, sd] ──────
      const row = dataRows[0]
      const rows: TableRow[] = groupCols.map((g) => {
        const ms = extractMeanSD(row[g.idx] ?? '')
        return { label: g.name, values: [ms?.mean ?? 0, ms?.sd ?? 0] }
      })
      return { data: { headers: ['Group', 'Mean', 'SD'], rows }, suggestedChart: 'error_bar' }
    }

    // ── Multiple variables → Bar chart: rows = variables, cols = groups (means) ─
    const varLabels = dataRows.map((r) => r[0] || 'Variable')
    const headers = ['Variable', ...groupCols.map((g) => g.name)]
    const rows: TableRow[] = dataRows.map((row, ri) => ({
      label: varLabels[ri],
      values: groupCols.map((g) => extractMeanSD(row[g.idx] ?? '')?.mean ?? null),
    }))
    return { data: { headers, rows }, suggestedChart: 'error_bar' }
  } catch { return null }
}

// Also handle plain-text Mean±SD tables (tab/space separated)
export function parseMeanSDText(text: string): DescStatsResult | null {
  if (!detectsMeanSD(text)) return null
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  // Try to find header + data rows
  const splitLine = (l: string) =>
    l.includes('\t') ? l.split('\t').map((s) => s.trim()) : l.split(/\s{2,}/).map((s) => s.trim())

  const rows2d = lines.map(splitLine).filter((r) => r.length > 1)
  if (rows2d.length < 2) return null

  // Header row = first row without ± cells
  const headerIdx = rows2d.findIndex((r) => !r.some((c) => extractMeanSD(c)))
  if (headerIdx === -1) return null

  const headerRow = rows2d[headerIdx]
  const dataRows = rows2d.slice(headerIdx + 1).filter((r) => r.some((c) => extractMeanSD(c)))
  if (dataRows.length === 0) return null

  const groupCols: { name: string; idx: number }[] = []
  headerRow.slice(1).forEach((h, i) => {
    const cleaned = cleanHeaderCell(h)
    if (!isExcludedCol(cleaned) && !/^\s*total\s*$/i.test(cleaned) && cleaned)
      groupCols.push({ name: cleaned, idx: i + 1 })
  })
  if (groupCols.length === 0) return null

  if (dataRows.length === 1) {
    const row = dataRows[0]
    const rows: TableRow[] = groupCols.map((g) => {
      const ms = extractMeanSD(row[g.idx] ?? '')
      return { label: g.name, values: [ms?.mean ?? 0, ms?.sd ?? 0] }
    })
    return { data: { headers: ['Group', 'Mean', 'SD'], rows }, suggestedChart: 'error_bar' }
  }

  const headers = ['Variable', ...groupCols.map((g) => g.name)]
  const rows: TableRow[] = dataRows.map((row) => ({
    label: row[0] || 'Variable',
    values: groupCols.map((g) => extractMeanSD(row[g.idx] ?? '')?.mean ?? null),
  }))
  return { data: { headers, rows }, suggestedChart: 'error_bar' }
}

export type BatchTableResult = {
  data: TableData
  suggestedChart: 'bar' | 'box' | 'error_bar' | 'scatter' | 'kaplan_meier' | 'forest' | 'roc'
}

// Guess chart type from parsed TableData column structure
function guessChartType(data: TableData): BatchTableResult['suggestedChart'] {
  const hdrs = data.headers.map((h) => h.toLowerCase())
  const seriesCols = hdrs.slice(1)
  // Box: exactly 5 value columns matching min/q1/median/q3/max
  if (seriesCols.length === 5 && seriesCols.some((h) => /median/i.test(h))) return 'box'
  if (seriesCols.length === 5 && seriesCols.some((h) => /q1|quartile/i.test(h))) return 'box'
  // Error bar: exactly 2 columns mean + sd/se
  if (seriesCols.length === 2 && seriesCols.some((h) => /mean|average/i.test(h))) return 'error_bar'
  if (seriesCols.length === 2 && seriesCols.some((h) => /\bs[de]\b|std|standard/i.test(h))) return 'error_bar'
  // Kaplan-Meier: first col looks like time, values 0-1
  if (hdrs[0].includes('time') || hdrs[0].includes('month') || hdrs[0].includes('year')) {
    const allFraction = data.rows.every((r) => r.values.every((v) => v === null || (v >= 0 && v <= 1)))
    if (allFraction) return 'kaplan_meier'
  }
  // Forest: has Effect, CI Lower, CI Upper
  if (seriesCols.some((h) => /ci.?low|lower/i.test(h)) && seriesCols.some((h) => /ci.?up|upper/i.test(h))) return 'forest'
  // ROC: 2 cols, first is 1-specificity or FPR
  if (seriesCols.length === 2 && (hdrs[1].includes('specific') || hdrs[1].includes('fpr'))) return 'roc'
  return 'bar'
}

// Parse every top-level <table> found in pasted HTML (skips nested tables)
export function parseAllHtmlTables(html: string): BatchTableResult[] {
  if (typeof document === 'undefined') return []
  try {
    const div = document.createElement('div')
    div.innerHTML = html

    // Only top-level tables — "table:not(table table)" skips nested ones
    const topLevelTables = Array.from(div.querySelectorAll('table')).filter(
      (t) => !t.closest('table')?.parentElement?.closest('table')
    )

    const results: BatchTableResult[] = []
    for (const t of topLevelTables) {
      // Try descriptive stats first (SPSS summary tables)
      const ds = parseDescriptiveStats(t.outerHTML)
      if (ds) {
        results.push({ data: ds.data, suggestedChart: ds.suggestedChart })
        continue
      }
      const parsed = parseHtmlTable(t.outerHTML)
      if (parsed && parsed.rows.length >= 1) {
        results.push({ data: parsed, suggestedChart: guessChartType(parsed) })
      }
    }
    return results
  } catch { return [] }
}

export function emptyTable(cols = 3, rows = 4): TableData {
  const headers = ['Category', ...Array.from({ length: cols - 1 }, (_, i) => `Series ${i + 1}`)]
  return {
    headers,
    rows: Array.from({ length: rows }, (_, i) => ({
      label: `Group ${i + 1}`,
      values: Array(cols - 1).fill(null),
    })),
  }
}
