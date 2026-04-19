'use client'

import { Callout } from '@/components/ui/callout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillGroup } from '@/components/ui/pill-group'
import { SectionLabel } from '@/components/ui/section-label'
import { TypeCard } from '@/components/ui/type-card'
import {
  DIAGNOSTIC_METRIC_OPTIONS,
  OBJECTIVE_OPTIONS,
  OUTCOME_OPTIONS,
} from '@/lib/calculator/constants/outcomes'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'

export function Step2Outcome() {
  const { state, update } = useCalculator()
  const isDiag = state.design === 'diagnostic'

  if (isDiag) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic accuracy study</CardTitle>
            <CardDescription>
              Which accuracy measure is your primary endpoint?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DIAGNOSTIC_METRIC_OPTIONS.map((opt) => (
                <TypeCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.description}
                  selected={state.diagMetric === opt.id}
                  onClick={() => update('diagMetric', opt.id)}
                />
              ))}
            </div>
            <Callout tone="info">
              Diagnostic studies are <strong>single-arm</strong>. All participants
              receive both index test and reference standard. Sample size is
              driven by CI precision around Se/Sp and site disease prevalence.
            </Callout>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>What is your primary outcome?</CardTitle>
          <CardDescription>
            Choose the measurement scale of your main endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {OUTCOME_OPTIONS.map((opt) => (
              <TypeCard
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                selected={state.outcome === opt.id}
                onClick={() => update('outcome', opt.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <SectionLabel>Study objective</SectionLabel>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium">What are you trying to show?</span>
            <PillGroup
              value={state.objective}
              onChange={(v) => update('objective', v)}
              options={OBJECTIVE_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
              ariaLabel="Study objective"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
