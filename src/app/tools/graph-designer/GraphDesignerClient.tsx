'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Settings2, X } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ChartRenderer } from '@/components/graphs/ChartRenderer'
import { ChartGallery } from '@/components/graphs/ChartGallery'
import { ChartTypeSelector } from '@/components/graphs/ChartTypeSelector'
import { CustomizePanel } from '@/components/graphs/CustomizePanel'
import { DataPanel } from '@/components/graphs/DataPanel'
import { exportPDF, exportPNG, exportSVG } from '@/lib/graphs/exportChart'
import { PALETTES } from '@/lib/graphs/colorPalettes'
import type { BatchTableResult } from '@/lib/graphs/parseTable'
import type { ChartSession, ChartType, PaletteName, TableData } from '@/lib/graphs/types'
import { CHART_FORMAT_HINT, CHART_META, DEFAULT_CONFIG, SAMPLE_DATA } from '@/lib/graphs/types'
import { cn } from '@/lib/utils'

// ChartSession is defined in @/lib/graphs/types to avoid circular imports
type ValueMode = 'count' | 'percent'

function makeSession(overrides: Partial<ChartSession> = {}): ChartSession {
  return {
    id: crypto.randomUUID(),
    chartType: 'bar',
    data: SAMPLE_DATA.bar,
    config: { ...DEFAULT_CONFIG },
    hasUserData: false,
    ...overrides,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GraphDesignerClient() {
  const [sessions, setSessions] = useState<ChartSession[]>([makeSession()])
  const [activeId, setActiveId] = useState(sessions[0].id)
  const [hasDual, setHasDual] = useState(false)
  const [valueMode, setValueMode] = useState<ValueMode>('count')
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [showFullCustomize, setShowFullCustomize] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [batchCount, setBatchCount] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(true)
  const [editorOpen, setEditorOpen] = useState(true)
  const [advising, setAdvising] = useState(false)
  const [advice, setAdvice] = useState<{
    title: string; xLabel: string; yLabel: string
    caption: string; tip: string | null; betterChart: ChartType | null
  } | null>(null)
  const [adviceError, setAdviceError] = useState('')

  const chartRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const active = sessions.find(s => s.id === activeId) ?? sessions[0]

  // ── Session helpers ──────────────────────────────────────────────────────────

  const updateActive = (patch: Partial<ChartSession>) =>
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, ...patch } : s))

  const addSession = () => {
    const s = makeSession()
    setSessions(prev => [...prev, s])
    setActiveId(s.id)
    setHasDual(false)
  }

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id)
      if (id === activeId) setActiveId(next[next.length - 1]?.id ?? '')
      return next
    })
  }

  const handleChartTypeChange = (chartType: ChartType) => {
    const data = active.hasUserData ? active.data : SAMPLE_DATA[chartType]
    updateActive({ chartType, data, hasUserData: active.hasUserData })
  }

  // ── Batch paste: multiple tables at once ────────────────────────────────────

  const handleBatchTables = (tables: BatchTableResult[]) => {
    const newSessions = tables.map((t, i) =>
      makeSession({
        data: t.data,
        chartType: t.suggestedChart,
        hasUserData: true,
        config: { ...active.config, title: `Chart ${sessions.length + i + 1}` },
      })
    )
    setSessions(prev => [...prev, ...newSessions])
    setActiveId(newSessions[0].id)
    setBatchCount(tables.length)
  }

  // ── Edit cell (click on bar) ─────────────────────────────────────────────────

  const [editCell, setEditCell] = useState<{
    rowIdx: number; colName: string; value: string; rowLabel: string; x: number; y: number
  } | null>(null)

  const handleBarClick = (rowIdx: number, colName: string, value: number, x: number, y: number) =>
    setEditCell({ rowIdx, colName, value: String(value), rowLabel: active.data.rows[rowIdx]?.label ?? '', x, y })

  const confirmEdit = () => {
    if (!editCell) return
    const num = parseFloat(editCell.value)
    const colIdx = active.data.headers.indexOf(editCell.colName) - 1
    updateActive({
      data: {
        ...active.data,
        rows: active.data.rows.map((r, i) => i !== editCell.rowIdx ? r : {
          ...r,
          label: editCell.rowLabel || r.label,
          values: colIdx >= 0 && !isNaN(num) ? r.values.map((v, j) => j === colIdx ? num : v) : r.values,
        }),
      },
      hasUserData: true,
    })
    setEditCell(null)
  }

  // ── Series rename ─────────────────────────────────────────────────────────────

  const handleSeriesRename = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return
    updateActive({
      data: { ...active.data, headers: active.data.headers.map(h => h === oldName ? newName : h) },
      config: {
        ...active.config,
        hiddenSeries: (active.config.hiddenSeries ?? []).map(s => s === oldName ? newName : s),
      },
    })
  }

  // ── Export ────────────────────────────────────────────────────────────────────

  const getRef = (id: string) => chartRefs.current.get(id) ?? null

  const doExport = async (fmt: 'png' | 'pdf' | 'svg') => {
    const el = getRef(activeId)
    if (!el) return
    const name = (active.config.title || `chart-${sessions.indexOf(active) + 1}`).toLowerCase().replace(/\s+/g, '-').slice(0, 40)
    setExporting(fmt)
    try {
      if (fmt === 'png') await exportPNG(el, name)
      else if (fmt === 'pdf') await exportPDF(el, name)
      else exportSVG(el, name)
    } finally { setExporting(null) }
  }

  const exportAll = async () => {
    setExporting('all')
    const originalId = activeId
    for (const s of sessions) {
      setActiveId(s.id)                        // switch to this chart (renders it)
      await new Promise(r => setTimeout(r, 400)) // wait for render
      const el = getRef(s.id)
      if (el) {
        const name = (s.config.title || `chart-${sessions.indexOf(s) + 1}`).toLowerCase().replace(/\s+/g, '-').slice(0, 40)
        await exportPNG(el, name)
        await new Promise(r => setTimeout(r, 400))
      }
    }
    setActiveId(originalId)                    // restore original
    setExporting(null)
  }

  // ── AI Advisor ────────────────────────────────────────────────────────────────

  const runAdvisor = async () => {
    setAdvising(true)
    setAdvice(null)
    setAdviceError('')
    try {
      const res = await fetch('/api/chart-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartType: active.chartType,
          headers: active.data.headers,
          rows: active.data.rows,
          currentTitle: active.config.title,
          currentXLabel: active.config.xLabel,
          currentYLabel: active.config.yLabel,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setAdviceError(json.error ?? 'AI advisor failed'); return }
      setAdvice(json)
      // Auto-apply title and labels immediately
      updateActive({
        config: {
          ...active.config,
          title: json.title || active.config.title,
          xLabel: json.xLabel || active.config.xLabel,
          yLabel: json.yLabel || active.config.yLabel,
        },
      })
    } catch (e) {
      setAdviceError(String(e))
    } finally {
      setAdvising(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const hint = CHART_FORMAT_HINT[active.chartType]

  return (
    <>
      <SiteHeader />
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">

        {/* ── LEFT: Chart gallery (collapsible) ── */}
        {galleryOpen ? (
          <ChartGallery
            sessions={sessions}
            activeId={activeId}
            onSelect={(id) => { setActiveId(id); setShowFullCustomize(false) }}
            onAdd={addSession}
            onDelete={deleteSession}
            onExportAll={exportAll}
            exporting={exporting === 'all'}
            onCollapse={() => setGalleryOpen(false)}
          />
        ) : (
          /* Collapsed gallery: slim icon strip */
          <div className="flex w-10 shrink-0 flex-col items-center gap-1 border-r border-border bg-background py-2">
            <button type="button" onClick={() => setGalleryOpen(true)} title="Expand gallery"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="my-1 h-px w-6 bg-border" />
            <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto w-full items-center">
              {sessions.map((s) => (
                <button key={s.id} type="button"
                  onClick={() => { setActiveId(s.id); setGalleryOpen(true) }}
                  title={CHART_META[s.chartType].label}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors',
                    s.id === activeId ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted')}>
                  {CHART_META[s.chartType].icon}
                </button>
              ))}
            </div>
            <div className="my-1 h-px w-6 bg-border" />
            <button type="button" onClick={addSession} title="New chart"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-base leading-none">+</span>
            </button>
          </div>
        )}

        {/* ── CENTER: Editor (collapsible) ── */}
        <div className={cn('flex shrink-0 flex-col border-r border-border overflow-y-auto bg-card transition-all duration-200',
          editorOpen ? 'w-90' : 'w-0 overflow-hidden border-r-0')}>

          {/* STEP 1 — Chart type */}
          <div className="border-b border-border p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
              <p className="text-xs font-bold text-foreground">Choose chart type</p>
            </div>
            <ChartTypeSelector value={active.chartType} onChange={handleChartTypeChange} />
            {hint && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                Required columns: <span className="font-mono">{hint}</span>
              </p>
            )}
          </div>

          {/* STEP 2 — Data */}
          <div className="border-b border-border p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
              <p className="text-xs font-bold text-foreground">Add your data</p>
              {!active.hasUserData && (
                <button type="button"
                  onClick={() => updateActive({ data: SAMPLE_DATA[active.chartType], hasUserData: false })}
                  className="ml-auto text-[9px] text-muted-foreground underline hover:text-primary">
                  load example
                </button>
              )}
            </div>
            <DataPanel
              data={active.data}
              onChange={(data) => updateActive({ data, hasUserData: true })}
              referenceImage={referenceImage}
              onReferenceImage={setReferenceImage}
              hasDual={hasDual}
              onHasDualChange={setHasDual}
              valueMode={valueMode}
              onValueModeChange={setValueMode}
              onBatchTables={handleBatchTables}
            />
            {batchCount > 0 && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                <p className="text-[11px] font-semibold text-primary">
                  ✓ {batchCount} charts created — see left sidebar
                </p>
              </div>
            )}
          </div>

          {/* STEP 3 — Style */}
          <div className="border-b border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
              <p className="text-xs font-bold text-foreground">Style</p>
            </div>

            <input
              value={active.config.title}
              onChange={e => updateActive({ config: { ...active.config, title: e.target.value } })}
              placeholder="Chart title…"
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
            />

            <div className="flex gap-1 flex-wrap">
              {(Object.entries(PALETTES) as [PaletteName, { name: string; colors: string[] }][]).map(([key, pal]) => (
                <button key={key} type="button" title={pal.name}
                  onClick={() => updateActive({ config: { ...active.config, palette: key, customColors: [] } })}
                  className={cn('flex gap-0.5 rounded-lg border p-1 transition-colors',
                    active.config.palette === key ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50')}>
                  {pal.colors.slice(0, 4).map(c => (
                    <div key={c} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {[
                { label: 'Labels', key: 'showDataLabels' as const },
                { label: 'Grid', key: 'showGrid' as const },
                { label: 'Legend', key: 'showLegend' as const },
              ].map(({ label, key }) => (
                <button key={key} type="button"
                  onClick={() => updateActive({ config: { ...active.config, [key]: !active.config[key] } })}
                  className={cn('flex-1 rounded-lg border py-1.5 text-[10px] font-semibold transition-colors',
                    active.config[key] ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50')}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── AI Polish button ── */}
            <button type="button" onClick={runAdvisor} disabled={advising}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-primary py-2.5 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60">
              {advising
                ? <><span className="animate-spin inline-block">⏳</span> AI analyzing…</>
                : '✨ AI Polish — auto title, labels & caption'}
            </button>

            {adviceError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-[10px] text-destructive">{adviceError}</p>
            )}

            {/* ── AI results ── */}
            {advice && !advising && (
              <div className="space-y-2 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">AI Suggestions Applied ✓</p>

                {/* Applied fields */}
                <div className="space-y-1.5">
                  {[
                    { label: 'Title', val: advice.title, key: 'title' as const },
                    { label: 'X-axis', val: advice.xLabel, key: 'xLabel' as const },
                    { label: 'Y-axis', val: advice.yLabel, key: 'yLabel' as const },
                  ].map(({ label, val, key }) => val ? (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-10 shrink-0 text-[9px] text-muted-foreground">{label}</span>
                      <span className="flex-1 truncate rounded bg-card px-2 py-0.5 text-[10px] font-medium text-foreground">{val}</span>
                    </div>
                  ) : null)}
                </div>

                {/* Tip / warning */}
                {advice.tip && (
                  <div className="flex gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5">
                    <span className="shrink-0 text-xs">⚠️</span>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">{advice.tip}</p>
                  </div>
                )}

                {/* Better chart suggestion */}
                {advice.betterChart && advice.betterChart !== active.chartType && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5">
                    <p className="text-[10px] text-primary">
                      💡 Try <strong>{CHART_META[advice.betterChart].label}</strong> for this data
                    </p>
                    <button type="button"
                      onClick={() => handleChartTypeChange(advice.betterChart!)}
                      className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90">
                      Switch
                    </button>
                  </div>
                )}

                {/* Figure caption */}
                {advice.caption && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Figure caption (copy for paper)</p>
                    <div className="relative rounded-lg border border-border bg-card px-2.5 py-2">
                      <p className="pr-12 text-[10px] leading-relaxed text-foreground">{advice.caption}</p>
                      <button type="button"
                        onClick={() => navigator.clipboard.writeText(advice.caption)}
                        className="absolute right-1.5 top-1.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground hover:text-foreground transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                <button type="button" onClick={() => setAdvice(null)}
                  className="text-[9px] text-muted-foreground hover:text-foreground">
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Advanced */}
          <div className="p-4">
            <button type="button" onClick={() => setShowFullCustomize(v => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2.5 text-[11px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
              <span className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5" />
                Advanced options
              </span>
              <span className="text-[10px]">{showFullCustomize ? '▲' : '▼'}</span>
            </button>

            {showFullCustomize && (
              <div className="mt-3 rounded-xl border border-border p-3">
                <CustomizePanel
                  config={active.config}
                  chartType={active.chartType}
                  seriesCount={active.data.headers.length - 1}
                  seriesNames={active.data.headers.slice(1)}
                  onChange={config => updateActive({ config })}
                  onSeriesRename={handleSeriesRename}
                  hasDual={hasDual}
                  valueMode={valueMode}
                  onValueModeChange={setValueMode}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-muted/20">

          {/* Editor toggle tab — left edge of preview */}
          <button type="button"
            onClick={() => setEditorOpen(v => !v)}
            title={editorOpen ? 'Hide editor' : 'Show editor'}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex h-12 w-4 items-center justify-center rounded-r-lg border border-l-0 border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground transition-colors">
            {editorOpen
              ? <ChevronLeft className="h-3 w-3" />
              : <ChevronRight className="h-3 w-3" />}
          </button>

          {/* Preview header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base leading-none shrink-0">{CHART_META[active.chartType].icon}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {active.config.title || CHART_META[active.chartType].label}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {active.data.rows.length} rows · {active.data.headers.length - 1} series
                  {sessions.length > 1 && ` · Chart ${sessions.indexOf(active) + 1}/${sessions.length}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-3">
              {(['png', 'pdf', 'svg'] as const).map(fmt => (
                <button key={fmt} type="button" onClick={() => doExport(fmt)}
                  disabled={exporting !== null}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors',
                    fmt === 'png'
                      ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                    exporting !== null && 'opacity-50'
                  )}>
                  {exporting === fmt ? <RefreshCw className="h-3 w-3 animate-spin inline" /> : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="flex flex-1 items-center justify-center overflow-auto p-6">
            <div className="w-full max-w-3xl">
              <div ref={el => { if (el) chartRefs.current.set(activeId, el); else chartRefs.current.delete(activeId) }}
                className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white">
                <ChartRenderer
                  chartType={active.chartType}
                  data={active.data}
                  config={active.config}
                  onBarClick={handleBarClick}
                />
              </div>
              <p className="mt-2 text-center text-[9px] text-muted-foreground">
                300 DPI · publication ready · click any bar to edit value
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Edit popup ── */}
      {editCell && (
        <div className="fixed z-50 w-52 rounded-xl border border-primary bg-card p-3 shadow-2xl"
          style={{ left: editCell.x, top: editCell.y - 8, transform: 'translate(-50%, -100%)' }}>
          <p className="mb-2 text-[11px] font-bold text-foreground">Edit bar</p>
          <div className="space-y-2">
            <div>
              <label className="mb-0.5 block text-[10px] text-muted-foreground">Category label</label>
              <input type="text" value={editCell.rowLabel}
                onChange={e => setEditCell(p => p ? { ...p, rowLabel: e.target.value } : null)}
                onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditCell(null) }}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-0.5 block text-[10px] text-muted-foreground">{editCell.colName} value</label>
              <input autoFocus type="number" value={editCell.value}
                onChange={e => setEditCell(p => p ? { ...p, value: e.target.value } : null)}
                onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditCell(null) }}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm font-mono focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="mt-2.5 flex gap-1.5">
            <button type="button" onClick={confirmEdit}
              className="flex-1 rounded-lg bg-primary py-1.5 text-[11px] font-semibold text-primary-foreground">Save</button>
            <button type="button" onClick={() => setEditCell(null)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
