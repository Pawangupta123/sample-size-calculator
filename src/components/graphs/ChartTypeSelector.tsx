'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ChartType } from '@/lib/graphs/types'
import { CHART_META } from '@/lib/graphs/types'
import { cn } from '@/lib/utils'

interface ChartTypeSelectorProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

const GROUPS: Array<{ label: string; types: ChartType[] }> = [
  { label: 'Comparison',   types: ['bar', 'stacked_bar', 'horizontal_bar', 'error_bar'] },
  { label: 'Distribution', types: ['box', 'histogram'] },
  { label: 'Trend',        types: ['line', 'area'] },
  { label: 'Correlation',  types: ['scatter'] },
  { label: 'Proportion',   types: ['pie', 'donut'] },
  { label: 'Clinical',     types: ['kaplan_meier', 'forest', 'roc'] },
]

export function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = CHART_META[value]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const select = (type: ChartType) => { onChange(type); setOpen(false) }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
          open ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
        )}
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">{meta.icon}</span>
          <span className="text-foreground">{meta.label}</span>
          <span className="text-[10px] text-muted-foreground">{meta.desc}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="px-1.5 pb-1.5 flex flex-wrap gap-1">
                {group.types.map((type) => {
                  const m = CHART_META[type]
                  const active = value === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => select(type)}
                      title={m.desc}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      )}
                    >
                      <span className="text-sm leading-none">{m.icon}</span>
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
