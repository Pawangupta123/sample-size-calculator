'use client'

import { Callout } from '@/components/ui/callout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillGroup } from '@/components/ui/pill-group'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import type { Alpha, Power } from '@/lib/calculator/types/calculator.types'
import { BinaryCard } from '../param-cards/BinaryCard'
import { ContinuousCard } from '../param-cards/ContinuousCard'
import { DiagnosticCard } from '../param-cards/DiagnosticCard'
import { NiMarginCard } from '../param-cards/NiMarginCard'
import { PrevalenceCard } from '../param-cards/PrevalenceCard'
import { SurvivalCard } from '../param-cards/SurvivalCard'

const ALPHA_OPTIONS: ReadonlyArray<{ value: Alpha; label: string }> = [
  { value: '0.05', label: '0.05' },
  { value: '0.01', label: '0.01' },
  { value: '0.025', label: '0.025' },
]

const POWER_OPTIONS: ReadonlyArray<{ value: Power; label: string }> = [
  { value: '0.80', label: '80%' },
  { value: '0.90', label: '90%' },
  { value: '0.95', label: '95%' },
]

export function Step3Parameters() {
  const { state, update, result } = useCalculator()
  const isDiag = state.design === 'diagnostic'
  const isPrev = state.design === 'crosssectional' || state.objective === 'prevalence'
  const isNi = state.objective === 'noninferiority' || state.objective === 'equivalence'
  const out = state.outcome ?? 'continuous'

  return (
    <div className="space-y-4 animate-fade-in-up">
      {result && !result.ok && (
        <Callout tone="error">{result.message}</Callout>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Statistical assumptions</CardTitle>
          <CardDescription>
            Set your error rate {!isDiag && 'and desired power'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <SectionLabel>Error rates</SectionLabel>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">Significance level (α)</span>
                <PillGroup
                  value={state.alpha}
                  onChange={(v) => update('alpha', v)}
                  options={ALPHA_OPTIONS}
                  ariaLabel="Significance level"
                />
              </div>
              {!isDiag && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium">Power (1−β)</span>
                  <PillGroup
                    value={state.power}
                    onChange={(v) => update('power', v)}
                    options={POWER_OPTIONS}
                    ariaLabel="Statistical power"
                  />
                </div>
              )}
            </div>
          </div>

          {isDiag && (
            <Callout tone="info">
              For diagnostic studies, power is not applicable. α sets the CI
              level (α = 0.05 → 95% CI). Sample size comes from desired CI
              precision.
            </Callout>
          )}
        </CardContent>
      </Card>

      {isDiag && <DiagnosticCard />}
      {!isDiag && isPrev && <PrevalenceCard />}
      {!isDiag && !isPrev && isNi && <NiMarginCard />}
      {!isDiag && !isPrev && (out === 'continuous' || out === 'ordinal') && <ContinuousCard />}
      {!isDiag && !isPrev && out === 'binary' && <BinaryCard />}
      {!isDiag && !isPrev && out === 'survival' && <SurvivalCard />}
    </div>
  )
}
