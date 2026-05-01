'use client'

import { ChevronLeft, Download, Plus, Trash2 } from 'lucide-react'
import { getPaletteColors } from '@/lib/graphs/colorPalettes'
import { CHART_META } from '@/lib/graphs/types'
import type { ChartSession, ChartType } from '@/lib/graphs/types'
import { cn } from '@/lib/utils'

const CATEGORY_DOT: Partial<Record<ChartType, string>> = {
  bar: '#6366f1', stacked_bar: '#6366f1', horizontal_bar: '#6366f1',
  histogram: '#6366f1', error_bar: '#6366f1',
  line: '#10b981', area: '#10b981', kaplan_meier: '#10b981',
  scatter: '#f59e0b', roc: '#f59e0b',
  pie: '#f43f5e', donut: '#f43f5e',
  box: '#8b5cf6', forest: '#8b5cf6',
}

interface Props {
  sessions: ChartSession[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  onExportAll: () => void
  exporting: boolean
  onCollapse: () => void
}

export function ChartGallery({ sessions, activeId, onSelect, onAdd, onDelete, onExportAll, exporting, onCollapse }: Props) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div>
          <p className="text-[11px] font-bold text-foreground">My Charts</p>
          <p className="text-[9px] text-muted-foreground">{sessions.length} chart{sessions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onCollapse} title="Hide gallery"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onAdd} title="New chart"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Chart list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((s, idx) => {
          const meta = CHART_META[s.chartType]
          const swatches = getPaletteColors(s.config.palette, s.config.customColors ?? [], 3)
          const isActive = s.id === activeId
          const dot = CATEGORY_DOT[s.chartType] ?? '#94a3b8'
          const title = s.config.title || s.data.headers.slice(1).join(', ') || 'Untitled'
          const dims = `${s.data.rows.length} rows · ${s.data.headers.length - 1} col`

          return (
            <div key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                'group relative flex cursor-pointer items-stretch gap-0 rounded-xl border transition-all overflow-hidden',
                isActive
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-transparent bg-muted/30 hover:border-border hover:bg-muted/60'
              )}>

              {/* Category color strip */}
              <div className="w-1 shrink-0 rounded-l-xl" style={{ backgroundColor: dot }} />

              <div className="flex flex-1 flex-col gap-1 px-2.5 py-2 min-w-0">
                {/* Chart type row */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm leading-none shrink-0">{meta.icon}</span>
                    <span className={cn('text-[10px] font-semibold truncate', isActive ? 'text-primary' : 'text-muted-foreground')}>
                      {meta.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground shrink-0">#{idx + 1}</span>
                </div>

                {/* Title */}
                <p className="truncate text-[11px] font-medium text-foreground leading-tight">{title}</p>

                {/* Dims + swatches */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">{dims}</span>
                  <div className="flex gap-0.5">
                    {swatches.map((c, i) => (
                      <div key={i} className="h-2 w-2 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Delete (hover) */}
              {sessions.length > 1 && (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                  className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-md bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex shadow-sm">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Export all */}
      {sessions.length > 1 && (
        <div className="border-t border-border p-2.5">
          <button type="button" onClick={onExportAll} disabled={exporting}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-semibold text-primary-foreground transition-opacity disabled:opacity-60 hover:bg-primary/90">
            <Download className="h-3 w-3" />
            {exporting ? 'Exporting…' : `Export all ${sessions.length}`}
          </button>
          <p className="mt-1 text-center text-[9px] text-muted-foreground">PNG · 300 DPI each</p>
        </div>
      )}
    </aside>
  )
}
