'use client'

import { useRef, useState } from 'react'
import { Image as ImageIcon, RefreshCw, Sparkles, Trash2, Upload } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ChartRenderer } from '@/components/graphs/ChartRenderer'
import { ChartTypeSelector } from '@/components/graphs/ChartTypeSelector'
import { detectMultiCharts, type DetectedChart } from '@/lib/graphs/detectMultiCharts'
import { CHART_META, DEFAULT_CONFIG, SAMPLE_DATA, type ChartType } from '@/lib/graphs/types'
import { copyChartToClipboard, exportPNG, exportSVG } from '@/lib/graphs/exportChart'
import { cn } from '@/lib/utils'

const SAMPLE_TABLE = `HGS Parameter\tGroup I\tGroup II\tP-Value
Mean HGS (kg), Mean±SD\t22.07 ± 4.66\t18.18 ± 3.76\t<0.001*
Median HGS (kg)\t21.85\t17.60\t
Low HGS (<18 kg), n (%)\t6 (12.0%)\t25 (50.0%)\t<0.001*
Normal HGS (≥18 kg), n (%)\t44 (88.0%)\t25 (50.0%)\t`

type Card = DetectedChart & { id: string }

function makeCards(detected: DetectedChart[]): Card[] {
  return detected.map((d, i) => ({ ...d, id: `${i}-${crypto.randomUUID()}` }))
}

export function GraphGeneratorClient() {
  const [tableText, setTableText] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [error, setError] = useState('')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [singleType, setSingleType] = useState<ChartType>('bar')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // ── Generate ──
  const generate = () => {
    setError('')
    if (!tableText.trim()) {
      setError('Paste a table or upload an image first.')
      setCards([])
      return
    }
    const found = detectMultiCharts(tableText)
    if (found.length === 0) {
      setError('Could not detect any charts. Check that the table has at least one header row and 2+ data rows.')
      setCards([])
      return
    }
    setCards(makeCards(found))
  }

  const loadSample = () => {
    setTableText(SAMPLE_TABLE)
    setError('')
    setCards(makeCards(detectMultiCharts(SAMPLE_TABLE)))
  }

  const clearAll = () => {
    setTableText('')
    setCards([])
    setError('')
  }

  // ── Add a single chart of chosen type from currently-pasted data ──
  const addSingleChart = () => {
    if (!tableText.trim()) {
      setError('Paste table text first.')
      return
    }
    // Reuse detector, then filter by chosen type; fallback to sample data of that type.
    const detected = detectMultiCharts(tableText)
    const match = detected.find(d => d.chartType === singleType)
    const newCard: Card = match
      ? { ...match, id: crypto.randomUUID() }
      : {
          id: crypto.randomUUID(),
          chartType: singleType,
          data: SAMPLE_DATA[singleType],
          config: { ...DEFAULT_CONFIG, title: `${CHART_META[singleType].label} — sample` },
          source: 'No matching rows — using sample data',
        }
    setCards(prev => [...prev, newCard])
  }

  // ── Image upload → OCR → fill textarea ──
  const onImageFile = async (file: File) => {
    setOcrBusy(true)
    setExtractError('')
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(String(r.result).split(',')[1] ?? '')
        r.onerror = rej
        r.readAsDataURL(file)
      })
      const resp = await fetch('/api/extract-rich-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mimeType: file.type || 'image/png' }),
      })
      const json = await resp.json()
      if (!resp.ok || json.error) {
        setExtractError(json.error || `OCR failed (${resp.status})`)
        return
      }
      setTableText(json.text)
      const found = detectMultiCharts(json.text)
      setCards(makeCards(found))
      if (found.length === 0)
        setError('Image read OK but no charts detected. You can still edit the text and click Generate.')
    } catch (e) {
      setExtractError(String(e))
    } finally {
      setOcrBusy(false)
    }
  }

  // ── Card actions ──
  const removeCard = (id: string) =>
    setCards(prev => prev.filter(c => c.id !== id))

  const updateCard = (id: string, patch: Partial<Card>) =>
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)))

  const exportCard = async (id: string, fmt: 'png' | 'svg' | 'copy') => {
    const el = cardRefs.current.get(id)
    if (!el) return
    const card = cards.find(c => c.id === id)
    const name = (card?.config.title || `chart-${id.slice(0, 6)}`)
      .toLowerCase().replace(/\s+/g, '-').slice(0, 40)
    if (fmt === 'png') await exportPNG(el, name)
    else if (fmt === 'svg') exportSVG(el, name)
    else await copyChartToClipboard(el)
  }

  // ── Render ──
  return (
    <>
      <SiteHeader />

      {/* Hero / Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Graph Generator
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste one table — get every chart that fits. Detects Mean ± SD → error-bar,
                n (%) → bar / pie, Median (IQR) → box, plus line, scatter, regression and ROC.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* INPUT PANEL */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">1. Upload or paste your table</h2>
            <div className="ml-auto flex flex-wrap gap-1.5">
              <button type="button" onClick={loadSample}
                className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                Load sample table
              </button>
              <button type="button" onClick={clearAll}
                className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Trash2 className="mr-1 inline h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <textarea
              value={tableText}
              onChange={e => setTableText(e.target.value)}
              placeholder={'Paste tab- or pipe-separated values, e.g.\n\nHGS Parameter | Group I | Group II\nMean HGS (kg), Mean±SD | 22.07 ± 4.66 | 18.18 ± 3.76\nLow HGS (<18 kg), n (%) | 6 (12.0%) | 25 (50.0%)\n'}
              className="min-h-[160px] w-full resize-y rounded-xl border border-input bg-background p-3 font-mono text-[12px] leading-relaxed text-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex flex-col gap-2 md:w-44">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) onImageFile(f); e.currentTarget.value = '' }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={ocrBusy}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60">
                {ocrBusy
                  ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Reading…</>
                  : <><ImageIcon className="h-3.5 w-3.5" /> Upload image</>}
              </button>

              <button type="button" onClick={generate}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90">
                <Upload className="h-3.5 w-3.5" /> Generate all charts
              </button>

              <p className="text-center text-[10px] text-muted-foreground">
                or pick a chart type below ↓
              </p>
            </div>
          </div>

          {extractError && (
            <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-[11px] text-destructive">{extractError}</p>
          )}
          {error && !extractError && (
            <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400">{error}</p>
          )}

          {/* Single-type adder */}
          <div className="mt-3 grid gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">Add one specific chart type</p>
              <ChartTypeSelector value={singleType} onChange={setSingleType} />
            </div>
            <button type="button" onClick={addSingleChart}
              className="self-end rounded-lg border border-primary bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
              + Add {CHART_META[singleType].label}
            </button>
          </div>
        </section>

        {/* RESULTS */}
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              2. Generated charts {cards.length > 0 && <span className="text-muted-foreground">({cards.length})</span>}
            </h2>
          </div>

          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No charts yet. Paste a table above and click <strong>Generate all charts</strong>,
                or upload a table image.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {cards.map(card => (
                <ChartCard
                  key={card.id}
                  card={card}
                  refSetter={el => {
                    if (el) cardRefs.current.set(card.id, el)
                    else cardRefs.current.delete(card.id)
                  }}
                  onRemove={() => removeCard(card.id)}
                  onExport={(fmt) => exportCard(card.id, fmt)}
                  onUpdate={patch => updateCard(card.id, patch)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

// ─── Single chart card ───────────────────────────────────────────────────────

function ChartCard({
  card, refSetter, onRemove, onExport, onUpdate,
}: {
  card: Card
  refSetter: (el: HTMLDivElement | null) => void
  onRemove: () => void
  onExport: (fmt: 'png' | 'svg' | 'copy') => void
  onUpdate: (patch: Partial<Card>) => void
}) {
  const [busy, setBusy] = useState<'png' | 'svg' | 'copy' | null>(null)
  const [copied, setCopied] = useState(false)
  const [titleEdit, setTitleEdit] = useState(false)
  const meta = CHART_META[card.chartType]

  const handle = async (fmt: 'png' | 'svg' | 'copy') => {
    setBusy(fmt)
    try {
      await onExport(fmt)
      if (fmt === 'copy') { setCopied(true); setTimeout(() => setCopied(false), 1500) }
    } finally { setBusy(null) }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
        <span className="text-sm leading-none shrink-0">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          {titleEdit ? (
            <input
              autoFocus
              value={card.config.title}
              onChange={e => onUpdate({ config: { ...card.config, title: e.target.value } })}
              onBlur={() => setTitleEdit(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setTitleEdit(false) }}
              className="w-full rounded border border-input bg-background px-1.5 py-0.5 text-[12px] font-semibold focus:border-primary focus:outline-none"
            />
          ) : (
            <button type="button" onClick={() => setTitleEdit(true)}
              className="block w-full truncate text-left text-[12px] font-semibold text-foreground hover:text-primary">
              {card.config.title || meta.label}
            </button>
          )}
          <p className="truncate text-[10px] text-muted-foreground">
            {meta.label} · {card.source}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => handle('copy')} disabled={busy !== null}
            className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-bold transition-colors',
              copied ? 'border-green-500 bg-green-500 text-white' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
              busy && busy !== 'copy' && 'opacity-50')}>
            {busy === 'copy' ? <RefreshCw className="h-3 w-3 animate-spin inline" /> : copied ? '✓' : 'Copy'}
          </button>
          <button type="button" onClick={() => handle('png')} disabled={busy !== null}
            className="rounded-md border border-primary bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {busy === 'png' ? <RefreshCw className="h-3 w-3 animate-spin inline" /> : 'PNG'}
          </button>
          <button type="button" onClick={() => handle('svg')} disabled={busy !== null}
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
            {busy === 'svg' ? <RefreshCw className="h-3 w-3 animate-spin inline" /> : 'SVG'}
          </button>
          <button type="button" onClick={onRemove}
            title="Remove chart"
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Chart canvas — capped width with extra padding so labels never clip */}
      <div className="flex-1 overflow-hidden bg-muted/20 p-3">
        <div ref={refSetter}
          className="mx-auto w-full rounded-xl bg-white p-4 shadow-sm dark:bg-white">
          <ChartRenderer
            chartType={card.chartType}
            data={card.data}
            config={{
              ...card.config,
              // Force consistent sizes so cards never overflow.
              chartHeight: card.config.chartHeight && card.config.chartHeight > 0 ? card.config.chartHeight : 280,
              chartWidth: 100,
            }}
          />
        </div>
      </div>
    </div>
  )
}
