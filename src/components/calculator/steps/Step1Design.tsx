'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillGroup } from '@/components/ui/pill-group'
import { SectionLabel } from '@/components/ui/section-label'
import { TypeCard } from '@/components/ui/type-card'
import {
  DESIGN_OPTIONS,
  DESIGNS_WITH_ALLOCATION,
} from '@/lib/calculator/constants/designs'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import type { Allocation, StudyDesign, Tail } from '@/lib/calculator/types/calculator.types'

const TAIL_OPTIONS: ReadonlyArray<{ value: Tail; label: string }> = [
  { value: '2', label: 'Two-tailed (recommended)' },
  { value: '1', label: 'One-tailed' },
]

const ALLOC_OPTIONS: ReadonlyArray<{ value: Allocation; label: string }> = [
  { value: '1', label: '1 : 1' },
  { value: '2', label: '1 : 2' },
  { value: '3', label: '1 : 3' },
]

export function Step1Design() {
  const { state, update, patch } = useCalculator()

  const pickDesign = (design: StudyDesign) => {
    const isDiag = design === 'diagnostic'
    patch({
      design,
      outcome: isDiag ? 'diagnostic' : null,
      diagMetric: isDiag ? 'both' : state.diagMetric,
    })
  }

  const showAllocation =
    !!state.design && DESIGNS_WITH_ALLOCATION.includes(state.design)

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>What is your study design?</CardTitle>
          <CardDescription>
            Select the design that best matches your research protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DESIGN_OPTIONS.map((opt) => (
              <TypeCard
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                selected={state.design === opt.id}
                onClick={() => pickDesign(opt.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {showAllocation && (
        <Card className="animate-fade-in-up">
          <CardContent className="p-6">
            <SectionLabel>Test direction</SectionLabel>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">Number of tails</span>
                <PillGroup
                  value={state.tail}
                  onChange={(v) => update('tail', v)}
                  options={TAIL_OPTIONS}
                  ariaLabel="Number of tails"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">Allocation ratio</span>
                <PillGroup
                  value={state.alloc}
                  onChange={(v) => update('alloc', v)}
                  options={ALLOC_OPTIONS}
                  ariaLabel="Allocation ratio"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
