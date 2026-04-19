'use client'

import { Card, CardContent } from '@/components/ui/card'
import { NumberField } from '@/components/ui/number-field'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'

export function NiMarginCard() {
  const { state, update } = useCalculator()
  return (
    <Card>
      <CardContent className="p-6">
        <SectionLabel>Non-inferiority / Equivalence margin</SectionLabel>
        <NumberField
          label="Non-inferiority margin (δ)"
          tooltip="Largest difference still clinically acceptable. Must be pre-registered. Smaller δ = larger N."
          value={state.niMargin}
          onChange={(v) => update('niMargin', v)}
          placeholder="e.g. 0.10"
          step={0.01}
          hint="Maximum allowable inferiority vs reference"
        />
      </CardContent>
    </Card>
  )
}
