'use client'

import { useState } from 'react'
import { Wand2 } from 'lucide-react'

interface PicoBuilderProps {
  onBuild: (query: string) => void
}

const FIELDS = [
  { key: 'population' as const, label: 'P — Population', placeholder: 'e.g., adults with type 2 diabetes' },
  { key: 'intervention' as const, label: 'I — Intervention', placeholder: 'e.g., metformin' },
  { key: 'comparison' as const, label: 'C — Comparison (optional)', placeholder: 'e.g., placebo or usual care' },
  { key: 'outcome' as const, label: 'O — Outcome', placeholder: 'e.g., HbA1c reduction at 6 months' },
]

type PicoFields = Record<'population' | 'intervention' | 'comparison' | 'outcome', string>

export function PicoBuilder({ onBuild }: PicoBuilderProps) {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState<PicoFields>({
    population: '',
    intervention: '',
    comparison: '',
    outcome: '',
  })

  const handleBuild = () => {
    const parts = [
      fields.population.trim() && `(${fields.population.trim()})`,
      fields.intervention.trim() && `(${fields.intervention.trim()})`,
      fields.comparison.trim() && `(${fields.comparison.trim()})`,
      fields.outcome.trim() && `(${fields.outcome.trim()})`,
    ].filter(Boolean)
    if (parts.length < 2) return
    onBuild(parts.join(' AND '))
    setOpen(false)
  }

  const canBuild = fields.population.trim() && fields.intervention.trim()

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Wand2 className="h-3 w-3" />
        {open ? 'Hide PICO builder' : 'PICO builder'}
      </button>

      {open && (
        <div className="mt-3 space-y-2.5 rounded-xl border border-dashed border-border p-3">
          <p className="text-[10px] text-muted-foreground">
            Fill P + I at minimum. Builds a structured boolean query.
          </p>
          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </label>
              <input
                type="text"
                value={fields[key]}
                onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="h-8 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleBuild}
            disabled={!canBuild}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="h-3 w-3" />
            Build query
          </button>
        </div>
      )}
    </div>
  )
}
