'use client'

import { Sparkles } from 'lucide-react'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import { PRESETS } from '@/lib/calculator/constants/presets'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PresetsPanel() {
  const { state, loadState } = useCalculator()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 pb-3">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            Example studies
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Click any preset to pre-fill all fields with realistic values.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {PRESETS.map((p) => {
            const active =
              state.design === p.state.design &&
              state.outcome === p.state.outcome &&
              state.objective === p.state.objective &&
              state.alpha === p.state.alpha &&
              state.power === p.state.power
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => loadState(p.state)}
                className={cn(
                  'group flex items-start gap-3 rounded-lg border p-2.5 text-left transition-colors',
                  'hover:border-primary hover:bg-[var(--primary-muted)]',
                  active ? 'border-primary bg-[var(--primary-muted)]/50' : 'border-border bg-card'
                )}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {p.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{p.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
