'use client'

import { Card, CardContent } from '@/components/ui/card'
import { NumberField } from '@/components/ui/number-field'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'

export function PrevalenceCard() {
  const { state, update } = useCalculator()
  return (
    <Card>
      <CardContent className="p-6">
        <SectionLabel>Precision — prevalence study</SectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <NumberField
            label="Expected prevalence (P)"
            tooltip="Use 0.50 if unknown — gives the most conservative (largest) sample size."
            value={state.prevalence}
            onChange={(v) => update('prevalence', v)}
            placeholder="e.g. 0.25"
            step={0.01}
            min={0.01}
            max={0.99}
            hint="Use 0.50 if unknown"
          />
          <NumberField
            label="Margin of error (e)"
            tooltip="Half-width of desired 95% CI. e = 0.05 means estimate within ±5%."
            value={state.marginError}
            onChange={(v) => update('marginError', v)}
            placeholder="e.g. 0.05"
            step={0.01}
            min={0.01}
            max={0.2}
            hint="Acceptable precision (±CI half-width)"
          />
        </div>
      </CardContent>
    </Card>
  )
}
