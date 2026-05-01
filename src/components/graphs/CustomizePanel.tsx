'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PALETTES } from '@/lib/graphs/colorPalettes'
import type { ChartConfig, ChartType, PaletteName } from '@/lib/graphs/types'
import { cn } from '@/lib/utils'

interface CustomizePanelProps {
  config: ChartConfig
  chartType: ChartType
  seriesCount: number
  seriesNames: string[]
  onChange: (config: ChartConfig) => void
  onSeriesRename: (oldName: string, newName: string) => void
  hasDual: boolean
  valueMode: 'count' | 'percent'
  onValueModeChange: (mode: 'count' | 'percent') => void
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-none">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2.5 text-left">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="space-y-3 pb-4">{children}</div>}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-xs text-foreground">{label}</span>
      <div className={cn('relative h-5 w-9 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-muted')}
        onClick={() => onChange(!checked)}>
        <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
      </div>
    </label>
  )
}

const inputCls = 'h-8 w-full rounded-lg border border-input bg-card px-2.5 text-xs focus:border-primary focus:outline-none'
const smallInputCls = 'h-7 w-full rounded-lg border border-input bg-card px-2 text-xs focus:border-primary focus:outline-none'

export function CustomizePanel({ config, chartType, seriesCount, seriesNames, onChange, onSeriesRename, hasDual, valueMode, onValueModeChange }: CustomizePanelProps) {
  const set = <K extends keyof ChartConfig>(key: K, val: ChartConfig[K]) =>
    onChange({ ...config, [key]: val })

  const setCustomColor = (i: number, color: string) => {
    const cc = [...config.customColors]
    while (cc.length <= i) cc.push(PALETTES[config.palette].colors[cc.length] ?? '#666')
    cc[i] = color
    set('customColors', cc)
  }

  const seriesColors = Array.from({ length: Math.max(seriesCount, 1) }, (_, i) =>
    config.customColors[i] ?? PALETTES[config.palette].colors[i % PALETTES[config.palette].colors.length]
  )

  const showBarOpts = ['bar', 'stacked_bar', 'horizontal_bar', 'histogram', 'error_bar', 'box'].includes(chartType)
  const isBoxPlot = chartType === 'box'
  const showLineOpts = ['line', 'area'].includes(chartType)
  const showPieOpts = ['pie', 'donut'].includes(chartType)
  const showForestOpts = chartType === 'forest'

  return (
    <div className="space-y-0">

      {/* Count / Percentage toggle */}
      {hasDual && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="mb-2 text-[11px] font-semibold text-foreground">
            Table mein count aur % dono hain — chart mein kya dikhana hai?
          </p>
          <div className="flex gap-2">
            {(['count', 'percent'] as const).map((m) => (
              <button key={m} type="button" onClick={() => onValueModeChange(m)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-[11px] font-semibold transition-colors',
                  valueMode === m
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground'
                )}>
                {m === 'count' ? '# Count (91, 88…)' : '% Percentage (89.2%, 84.6%…)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      <Section title="🎨 Colors">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Palette</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(PALETTES) as [PaletteName, typeof PALETTES[PaletteName]][]).map(([key, pal]) => (
              <button key={key} type="button" onClick={() => onChange({ ...config, palette: key, customColors: [] })}
                title={pal.name}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors',
                  config.palette === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                )}>
                <div className="flex gap-0.5">
                  {pal.colors.slice(0, 4).map((c) => (
                    <div key={c} className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[9px] text-muted-foreground">{pal.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Colors &amp; Visibility
          </p>
          <div className="space-y-1.5">
            {seriesColors.map((color, i) => {
              const name = seriesNames[i] ?? `Series ${i + 1}`
              const hidden = (config.hiddenSeries ?? []).includes(name)
              const toggleHidden = () => {
                const next = hidden
                  ? (config.hiddenSeries ?? []).filter((s) => s !== name)
                  : [...(config.hiddenSeries ?? []), name]
                set('hiddenSeries', next)
              }
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <label className="relative h-6 w-6 shrink-0 cursor-pointer rounded-md border-2 border-border" style={{ backgroundColor: hidden ? '#e5e7eb' : color }}>
                    <input type="color" value={color} onChange={(e) => setCustomColor(i, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                  </label>
                  <input
                    value={name}
                    onChange={(e) => onSeriesRename(name, e.target.value)}
                    className={cn(
                      'min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs focus:border-border focus:bg-muted focus:outline-none',
                      hidden ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}
                  />
                  <button type="button" onClick={toggleHidden}
                    className={cn('shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold transition-colors',
                      hidden ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
                    {hidden ? 'Show' : 'Hide'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Text */}
      <Section title="🔤 Text & Labels">
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Chart title</label>
            <input className={inputCls} value={config.title} placeholder="Chart title"
              onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Subtitle</label>
            <input className={inputCls} value={config.subtitle} placeholder="Subtitle (optional)"
              onChange={(e) => set('subtitle', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-muted-foreground">X-axis label</label>
              <input className={smallInputCls} value={config.xLabel} placeholder="X label"
                onChange={(e) => set('xLabel', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-muted-foreground">Y-axis label</label>
              <input className={smallInputCls} value={config.yLabel} placeholder="Y label"
                onChange={(e) => set('yLabel', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Font size: {config.fontSize}px</label>
            <input type="range" min={10} max={18} value={config.fontSize}
              onChange={(e) => set('fontSize', parseInt(e.target.value))}
              className="w-full accent-primary" />
          </div>
        </div>
        <Toggle checked={config.showDataLabels} onChange={(v) => set('showDataLabels', v)} label="Show data labels" />
      </Section>

      {/* Axes */}
      <Section title="📐 Axes">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Y min</label>
            <input className={smallInputCls} type="number" value={config.yMin} placeholder="auto"
              onChange={(e) => set('yMin', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Y max</label>
            <input className={smallInputCls} type="number" value={config.yMax} placeholder="auto"
              onChange={(e) => set('yMax', e.target.value)} />
          </div>
        </div>
        <Toggle checked={config.showGrid} onChange={(v) => set('showGrid', v)} label="Show grid lines" />
      </Section>

      {/* Legend */}
      <Section title="📋 Legend" defaultOpen={false}>
        <Toggle checked={config.showLegend} onChange={(v) => set('showLegend', v)} label="Show legend" />
        {config.showLegend && (
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Position</label>
            <div className="flex gap-1.5">
              {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
                <button key={pos} type="button" onClick={() => set('legendPosition', pos)}
                  className={cn('flex-1 rounded-lg border py-1 text-[10px] font-medium capitalize transition-colors',
                    config.legendPosition === pos ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/40')}>
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Chart-specific */}
      {showBarOpts && (
        <Section title={isBoxPlot ? '📦 Box Options' : '📊 Bar Options'} defaultOpen={false}>
          {!isBoxPlot && (
            <>
              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">Orientation</label>
                <div className="flex gap-1.5">
                  {[['vertical', 'Vertical'], ['horizontal', 'Horizontal']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set('barOrientation', v as 'vertical' | 'horizontal')}
                      className={cn('flex-1 rounded-lg border py-1.5 text-[11px] font-medium transition-colors',
                        config.barOrientation === v ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/40')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle checked={config.barGrouped} onChange={(v) => set('barGrouped', v)} label="Grouped (vs stacked)" />
            </>
          )}
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">
              {isBoxPlot ? 'Box width' : 'Bar width'}: {config.barSize === 0 ? 'Auto' : `${config.barSize}px`}
            </label>
            <input type="range" min={0} max={isBoxPlot ? 120 : 80} step={4} value={config.barSize}
              onChange={(e) => set('barSize', parseInt(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
              <span>Auto</span><span>Narrow</span><span>Wide</span>
            </div>
          </div>
        </Section>
      )}

      {chartType === 'histogram' && (
        <Section title="📊 Histogram Options" defaultOpen={true}>
          <Toggle checked={config.showDensityCurve ?? false} onChange={(v) => set('showDensityCurve', v)} label="Show density curve" />
        </Section>
      )}

      {showLineOpts && (
        <Section title="📈 Line Options" defaultOpen={false}>
          <Toggle checked={config.smooth} onChange={(v) => set('smooth', v)} label="Smooth curves" />
          <Toggle checked={config.showDots} onChange={(v) => set('showDots', v)} label="Show data points" />
        </Section>
      )}

      {showForestOpts && (
        <Section title="🌲 Forest Plot Options" defaultOpen={false}>
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Effect measure label</label>
            <select value={config.forestEffectLabel} onChange={(e) => set('forestEffectLabel', e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-card px-2 text-xs focus:border-primary focus:outline-none">
              {['OR', 'RR', 'HR', 'MD', 'SMD', 'WMD'].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Null hypothesis line</label>
            <input type="number" step={0.1} value={config.forestNull}
              onChange={(e) => set('forestNull', parseFloat(e.target.value) || 1)}
              className={smallInputCls} />
            <p className="mt-1 text-[9px] text-muted-foreground">Use 1 for OR/RR/HR, 0 for MD/SMD</p>
          </div>
        </Section>
      )}
    </div>
  )
}
