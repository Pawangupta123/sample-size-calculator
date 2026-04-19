'use client'

import { Card, CardContent } from '@/components/ui/card'
import { NumberField } from '@/components/ui/number-field'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'

export function ContinuousCard() {
  const { state, update } = useCalculator()
  return (
    <Card>
      <CardContent className="p-6">
        <SectionLabel>Effect size — continuous outcome</SectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <NumberField
            label="Expected mean difference (Δ)"
            tooltip="Minimum clinically important difference. The most critical assumption — small changes drastically alter N."
            value={state.meanDiff}
            onChange={(v) => update('meanDiff', v)}
            placeholder="e.g. 10"
            step={0.1}
            hint="In same units as outcome (mmHg, kg, points)"
          />
          <NumberField
            label="Pooled standard deviation (σ)"
            tooltip="Outcome variability. Underestimating SD is the most common cause of underpowered studies."
            value={state.stdDev}
            onChange={(v) => update('stdDev', v)}
            placeholder="e.g. 20"
            step={0.1}
            hint="From pilot data or literature"
          />
        </div>
      </CardContent>
    </Card>
  )
}
