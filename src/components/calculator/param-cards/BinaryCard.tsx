'use client'

import { Card, CardContent } from '@/components/ui/card'
import { NumberField } from '@/components/ui/number-field'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'

export function BinaryCard() {
  const { state, update } = useCalculator()
  return (
    <Card>
      <CardContent className="p-6">
        <SectionLabel>Effect size — binary outcome</SectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <NumberField
            label="Baseline event rate (p₀)"
            tooltip="Proportion of events in the control group. From registry data or published studies."
            value={state.p0}
            onChange={(v) => update('p0', v)}
            placeholder="e.g. 0.30"
            step={0.01}
            min={0.01}
            max={0.99}
            hint="Control group proportion (0–1)"
          />
          <NumberField
            label="Event rate in treatment (p₁)"
            tooltip="Anticipated proportion in intervention arm. Tip: p₁ = p₀ × (1 − RRR)."
            value={state.p1}
            onChange={(v) => update('p1', v)}
            placeholder="e.g. 0.20"
            step={0.01}
            min={0.01}
            max={0.99}
            hint="Intervention group proportion (0–1)"
          />
        </div>
      </CardContent>
    </Card>
  )
}
