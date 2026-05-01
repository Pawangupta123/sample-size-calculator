'use client'

import { useEffect, useRef, useState } from 'react'
import { Image, Plus, Trash2, Upload } from 'lucide-react'
import type { TableData } from '@/lib/graphs/types'
import { detectsDualValues, emptyTable, parseAllHtmlTables, parseCsvText, parseDescriptiveStats, parseHtmlTable, parseTableText } from '@/lib/graphs/parseTable'
import type { BatchTableResult, DescStatsResult } from '@/lib/graphs/parseTable'
import { cn } from '@/lib/utils'

type InputTab = 'paste' | 'manual' | 'file'
type ValueMode = 'count' | 'percent'

interface DataPanelProps {
  data: TableData
  onChange: (data: TableData) => void
  referenceImage: string | null
  onReferenceImage: (url: string | null) => void
  hasDual: boolean
  onHasDualChange: (v: boolean) => void
  valueMode: ValueMode
  onBatchTables?: (tables: BatchTableResult[]) => void
  onValueModeChange: (mode: ValueMode) => void
}

export function DataPanel({ data, onChange, referenceImage, onReferenceImage, hasDual, onHasDualChange, valueMode, onValueModeChange, onBatchTables }: DataPanelProps) {
  const [tab, setTab] = useState<InputTab>('paste')
  const [pasteText, setPasteText] = useState('')
  const [rawHtml, setRawHtml] = useState<string | null>(null)
  const [parseError, setParseError] = useState('')
  const [descStats, setDescStats] = useState<DescStatsResult | null>(null)
  const [refImageB64, setRefImageB64] = useState<string | null>(null)
  const [refMime, setRefMime] = useState('image/png')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const prevModeRef = useRef(valueMode)

  // Re-parse when valueMode changes (e.g., toggled from Customize tab)
  useEffect(() => {
    if (prevModeRef.current === valueMode) return
    prevModeRef.current = valueMode
    if (rawHtml) {
      const parsed = parseHtmlTable(rawHtml, valueMode)
      if (parsed) { onChange(parsed); return }
    }
    if (pasteText) {
      const parsed = parseTableText(pasteText, valueMode) ?? parseCsvText(pasteText, valueMode)
      if (parsed) onChange(parsed)
    }
  }, [valueMode])

  // ── Paste handler ──────────────────────────────────────────────────────────

  const handleClipboardPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()

    // 1. Try HTML first (Word / Excel HTML clipboard — most reliable)
    const html = e.clipboardData.getData('text/html')
    setDescStats(null)

    if (html) {
      // Batch: multiple tables in one paste → notify parent
      if (onBatchTables) {
        const allTables = parseAllHtmlTables(html)
        if (allTables.length > 1) {
          onBatchTables(allTables)
          setPasteText(`✓ ${allTables.length} tables detected — ${allTables.length} charts created`)
          setParseError('')
          return
        }
      }

      // Try descriptive stats format first (rows = stat names, cols = groups)
      const ds = parseDescriptiveStats(html)
      if (ds) {
        setDescStats(ds)
        setRawHtml(html)
        onHasDualChange(false)
        const preview = ds.data.rows.map((r) => [r.label, ...r.values.map((v) => v ?? '')].join('\t')).join('\n')
        setPasteText([ds.data.headers.join('\t'), preview].join('\n'))
        onChange(ds.data)
        setParseError('')
        return
      }
      // Standard HTML parse
      const parsed = parseHtmlTable(html, valueMode)
      if (parsed) {
        setRawHtml(html)
        onHasDualChange(detectsDualValues(html))
        const preview = parsed.rows.map((r) => [r.label, ...r.values.map((v) => v ?? '')].join('\t')).join('\n')
        setPasteText([parsed.headers.join('\t'), preview].join('\n'))
        onChange(parsed)
        setParseError('')
        return
      }
    }

    // 2. Fall back to plain text (tab/space separated)
    const text = e.clipboardData.getData('text/plain') || e.clipboardData.getData('text')
    if (text) {
      const isDual = detectsDualValues(text)
      setRawHtml(null)
      onHasDualChange(isDual)
      setPasteText(text)
      const parsed = parseTableText(text, valueMode)
      if (parsed) {
        onChange(parsed)
        setParseError('')
      } else {
        setParseError('Could not auto-parse. Use Manual tab to enter data directly.')
      }
    }
  }

  const handleTextChange = (text: string) => {
    setPasteText(text)
    setRawHtml(null)
    onHasDualChange(detectsDualValues(text))
    if (!text.includes('\n')) return
    const parsed = parseTableText(text, valueMode)
    if (parsed) { onChange(parsed); setParseError('') }
  }

  // ── Manual table editor ────────────────────────────────────────────────────

  const setCell = (rowIdx: number, colIdx: number, val: string) => {
    const n = parseFloat(val)
    const updated = { ...data, rows: data.rows.map((r, i) =>
      i === rowIdx ? { ...r, values: r.values.map((v, j) => j === colIdx ? (isNaN(n) ? null : n) : v) } : r
    )}
    onChange(updated)
  }

  const setLabel = (rowIdx: number, val: string) => {
    onChange({ ...data, rows: data.rows.map((r, i) => i === rowIdx ? { ...r, label: val } : r) })
  }

  const setHeader = (colIdx: number, val: string) => {
    const h = [...data.headers]
    h[colIdx] = val
    onChange({ ...data, headers: h })
  }

  const addRow = () => {
    onChange({ ...data, rows: [...data.rows, { label: `Group ${data.rows.length + 1}`, values: Array(data.headers.length - 1).fill(null) }] })
  }

  const removeRow = (i: number) => {
    onChange({ ...data, rows: data.rows.filter((_, idx) => idx !== i) })
  }

  const addCol = () => {
    const n = data.headers.length
    onChange({
      ...data,
      headers: [...data.headers, `Series ${n}`],
      rows: data.rows.map((r) => ({ ...r, values: [...r.values, null] })),
    })
  }

  const removeCol = (colIdx: number) => {
    if (data.headers.length <= 2) return
    onChange({
      ...data,
      headers: data.headers.filter((_, i) => i !== colIdx),
      rows: data.rows.map((r) => ({ ...r, values: r.values.filter((_, i) => i !== colIdx - 1) })),
    })
  }

  // ── File upload ────────────────────────────────────────────────────────────

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const isDual = detectsDualValues(text)
    onHasDualChange(isDual)
    setRawHtml(null)
    setPasteText(text)
    const parsed = parseCsvText(text, valueMode) ?? parseTableText(text, valueMode)
    if (parsed) { onChange(parsed); setParseError('') }
    else setParseError('Could not parse file. Save as CSV and try again.')
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Reference image ────────────────────────────────────────────────────────

  const handleRefImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onReferenceImage(url)
    onChange(emptyTable(3, 3))
    setExtractError('')
    setRefMime(file.type || 'image/png')
    // Convert to base64 for AI extraction
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1]
      setRefImageB64(b64)
    }
    reader.readAsDataURL(file)
    if (imgRef.current) imgRef.current.value = ''
  }

  const extractFromImage = async () => {
    if (!refImageB64) return
    setExtracting(true)
    setExtractError('')
    try {
      const res = await fetch('/api/extract-image-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: refImageB64, mimeType: refMime }),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setExtractError(json.error ?? 'Extraction failed'); return }
      const text: string = json.text ?? ''
      if (!text) { setExtractError('AI returned empty response — try again'); return }
      const parsed = parseTableText(text) ?? parseCsvText(text)
      if (parsed) {
        onChange(parsed)
        setPasteText(text)
        setTab('manual')
        setExtractError('')
      } else {
        setExtractError('Could not parse AI response — check Paste tab')
        setPasteText(text)
        setTab('paste')
      }
    } catch {
      setExtractError('Network error — check connection')
    } finally {
      setExtracting(false)
    }
  }

  const TABS: { id: InputTab; label: string }[] = [
    { id: 'paste',  label: '📋 Paste' },
    { id: 'manual', label: '✏️ Manual' },
    { id: 'file',   label: '📁 CSV' },
  ]

  const inputCls = 'h-7 w-full rounded border border-input bg-card px-1.5 text-xs focus:border-primary focus:outline-none'
  const numInputCls = 'h-7 w-full rounded border border-input bg-card px-1.5 text-xs text-right focus:border-primary focus:outline-none'

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex rounded-lg border border-border bg-muted p-0.5">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors',
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Paste tab */}
      {tab === 'paste' && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">
            Select your table in Word/SPSS/Excel → <kbd className="rounded border border-border bg-muted px-1 font-mono text-[9px]">Ctrl+C</kbd> → click below → <kbd className="rounded border border-border bg-muted px-1 font-mono text-[9px]">Ctrl+V</kbd>
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => handleTextChange(e.target.value)}
            onPaste={handleClipboardPaste}
            placeholder={'Word/SPSS/Excel se table copy karo → yahan Ctrl+V\n\nOr plain text:\nGroup\tDrug A\tDrug B\nWeek 2\t45\t38\nWeek 4\t62\t55'}
            className="h-40 w-full resize-y rounded-xl border border-input bg-card p-3 font-mono text-xs focus:border-primary focus:outline-none"
            spellCheck={false}
          />
          {parseError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-[11px] font-medium text-destructive">{parseError}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Tip: Word mein table select karo → Ctrl+C → yahan Ctrl+V (mouse se paste na karo)
              </p>
            </div>
          )}
          {!parseError && pasteText && data.rows.length > 0 && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 space-y-1.5">
              {descStats ? (
                <>
                  <p className="text-[11px] font-semibold text-accent">
                    ✓ Descriptive statistics detected — {data.rows.length} group{data.rows.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Format: {data.headers.slice(1).join(' · ')}
                  </p>
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5">
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      Chart type mein switch karo →{' '}
                      {descStats.suggestedChart === 'box' ? '📦 Box Plot' : '📊 Error Bar'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Data already formatted — bas chart type change karo
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-medium text-accent">
                    ✓ {data.rows.length} rows · {data.headers.length - 1} series detected
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Headers: {data.headers.join(' · ')}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual tab */}
      {tab === 'manual' && (
        <div className="space-y-2">
          {referenceImage && (
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-2 space-y-1.5">
              <p className="text-[11px] font-semibold text-accent">
                Apka original graph — iske values dekh kar neeche table mein bharo
              </p>
              <p className="text-[10px] text-muted-foreground">
                Column header mein groups ka naam likho (jaise: Sex 1, Sex 2) aur har row mein values
              </p>
              <img src={referenceImage} alt="Reference"
                className="w-full rounded-lg border border-border object-contain" style={{ maxHeight: 180 }} />
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-1.5 text-left">
                    <input value={data.headers[0]} onChange={(e) => setHeader(0, e.target.value)}
                      className={cn(inputCls, 'font-semibold')} />
                  </th>
                  {data.headers.slice(1).map((h, ci) => (
                    <th key={ci} className="p-1.5">
                      <div className="flex items-center gap-0.5">
                        <input value={h} onChange={(e) => setHeader(ci + 1, e.target.value)}
                          className={cn(inputCls, 'font-semibold text-center')} />
                        {data.headers.length > 2 && (
                          <button type="button" onClick={() => removeCol(ci + 1)}
                            className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-1.5">
                    <button type="button" onClick={addCol}
                      className="rounded border border-dashed border-border px-1.5 py-0.5 text-[9px] text-muted-foreground hover:border-primary hover:text-primary">
                      + Col
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border last:border-none hover:bg-muted/20">
                    <td className="p-1.5">
                      <input value={row.label} onChange={(e) => setLabel(ri, e.target.value)}
                        className={inputCls} />
                    </td>
                    {row.values.map((val, ci) => (
                      <td key={ci} className="p-1.5">
                        <input
                          type="number"
                          value={val ?? ''}
                          onChange={(e) => setCell(ri, ci, e.target.value)}
                          className={numInputCls}
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="p-1.5">
                      <button type="button" onClick={() => removeRow(ri)}
                        className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addRow}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-primary">
            <Plus className="h-3 w-3" /> Add row
          </button>
        </div>
      )}

      {/* File tab */}
      {tab === 'file' && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">
            Upload a .csv file (SPSS: Export → CSV, Excel: Save As → CSV)
          </p>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <Upload className="h-4 w-4" />
            Click to upload CSV file
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          {parseError && <p className="text-[11px] text-destructive">{parseError}</p>}
        </div>
      )}

      {/* Image upload + AI extract */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Extract from image
          </p>
          {referenceImage && (
            <button type="button"
              onClick={() => { onReferenceImage(null); setRefImageB64(null); setExtractError('') }}
              className="text-[10px] text-muted-foreground hover:text-destructive">
              Remove
            </button>
          )}
        </div>

        {referenceImage ? (
          <div className="space-y-2">
            <img src={referenceImage} alt="Uploaded"
              className="w-full rounded-lg border border-border object-contain" style={{ maxHeight: 160 }} />

            <button type="button" onClick={extractFromImage} disabled={extracting || !refImageB64}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[11px] font-semibold text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-60">
              {extracting
                ? <><span className="animate-spin">⏳</span> AI extract kar raha hai…</>
                : <><span>✨</span> AI se data extract karo</>}
            </button>

            {extractError && (
              <p className="text-[10px] text-destructive">{extractError}</p>
            )}
            {!extractError && !extracting && refImageB64 && (
              <p className="text-[10px] text-muted-foreground">
                Button dabao → AI image se table data extract karega automatically
              </p>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => imgRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <Image className="h-4 w-4" />
            <span>Graph ya table ki image upload karo</span>
          </button>
        )}

        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleRefImage} />
      </div>
    </div>
  )
}
