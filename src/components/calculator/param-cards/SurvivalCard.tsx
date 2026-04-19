'use client'

import { Card, CardContent } from '@/components/ui/card'
import { NumberField } from '@/components/ui/number-field'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'

export function SurvivalCard() {
  const { state, update } = useCalculator()
  return (
    <Card>
      <CardContent className="p-6">
        <SectionLabel>Effect size — time-to-event</SectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <NumberField
            label="Hazard Ratio (HR)"
            tooltip="HR < 1 = treatment benefit. HR = 0.70 means 30% reduction in hazard rate."
            value={state.hr}
            onChange={(v) => update('hr', v)}
            placeholder="e.g. 0.70"
            step={0.01}
            min={0.1}
            max={5}
            hint="HR < 1 = treatment benefit"
          />
          <NumberField
            label="Expected event rate (%)"
            tooltip="% of participants expected to experience the event."
            value={state.eventRate}
            onChange={(v) => update('eventRate', v)}
            placeholder="e.g. 30"
            step={1}
            min={1}
            max={99}
            hint="% participants experiencing event"
          />
        </div>
      </CardContent>
    </Card>
  )
}
