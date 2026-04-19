'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberField } from '@/components/ui/number-field'
import { PillGroup } from '@/components/ui/pill-group'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import type { ReferenceStd } from '@/lib/calculator/types/calculator.types'

const REF_OPTIONS: ReadonlyArray<{ value: ReferenceStd; label: string }> = [
  { value: 'perfect', label: 'Gold standard (perfect)' },
  { value: 'imperfect', label: 'Imperfect reference' },
]

interface CiRangeProps {
  loValue?: number
  hiValue?: number
  onLoChange: (v: number | undefined) => void
  onHiChange: (v: number | undefined) => void
}

function CiRange({ loValue, hiValue, onLoChange, onHiChange }: CiRangeProps) {
  return (
    <div className="flex items-end gap-2">
      <NumberField
        label="CI lower"
        value={loValue}
        onChange={onLoChange}
        placeholder="e.g. 80"
        step={1}
        min={0}
        max={99}
        suffix="%"
        className="flex-1"
      />
      <NumberField
        label="CI upper"
        value={hiValue}
        onChange={onHiChange}
        placeholder="e.g. 90"
        step={1}
        min={1}
        max={100}
        suffix="%"
        className="flex-1"
      />
    </div>
  )
}

export function DiagnosticCard() {
  const { state, update } = useCalculator()
  const m = state.diagMetric
  const showSe = m === 'sensitivity' || m === 'both'
  const showSp = m === 'specificity' || m === 'both'
  const showAuc = m === 'auc'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnostic accuracy parameters</CardTitle>
        <CardDescription>
          Buderer (1996) formula — sample size from CI precision around Se/Sp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSe && (
          <div>
            <SectionLabel>Sensitivity (Se)</SectionLabel>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NumberField
                label="Expected Sensitivity (Se)"
                tooltip="Anticipated true positive rate from prior literature or pilot study."
                value={state.diagSe}
                onChange={(v) => update('diagSe', v)}
                placeholder="e.g. 85"
                step={1}
                min={1}
                max={99}
                suffix="%"
                hint="e.g. 85 = 85%"
              />
              <CiRange
                loValue={state.diagSeLo}
                hiValue={state.diagSeHi}
                onLoChange={(v) => update('diagSeLo', v)}
                onHiChange={(v) => update('diagSeHi', v)}
              />
            </div>
          </div>
        )}

        {showSp && (
          <div>
            <SectionLabel>Specificity (Sp)</SectionLabel>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NumberField
                label="Expected Specificity (Sp)"
                tooltip="Anticipated true negative rate from prior literature."
                value={state.diagSp}
                onChange={(v) => update('diagSp', v)}
                placeholder="e.g. 90"
                step={1}
                min={1}
                max={99}
                suffix="%"
                hint="e.g. 90 = 90%"
              />
              <CiRange
                loValue={state.diagSpLo}
                hiValue={state.diagSpHi}
                onLoChange={(v) => update('diagSpLo', v)}
                onHiChange={(v) => update('diagSpHi', v)}
              />
            </div>
          </div>
        )}

        {showAuc && (
          <div>
            <SectionLabel>AUC / ROC</SectionLabel>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NumberField
                label="Expected AUC"
                tooltip="0.70–0.80 acceptable. 0.80–0.90 excellent. 0.50 = random."
                value={state.diagAuc}
                onChange={(v) => update('diagAuc', v)}
                placeholder="e.g. 0.80"
                step={0.01}
                min={0.51}
                max={0.99}
                hint="From prior studies or pilot data"
              />
              <NumberField
                label="Null AUC (H₀)"
                tooltip="Usually 0.50 (no better than random chance)."
                value={state.diagAuc0 ?? 0.5}
                onChange={(v) => update('diagAuc0', v)}
                placeholder="0.50"
                step={0.01}
                min={0.5}
                max={0.9}
                hint="Usually 0.50 (= random chance)"
              />
            </div>
          </div>
        )}

        <hr className="border-border" />

        <div>
          <SectionLabel>Disease prevalence at recruitment site</SectionLabel>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberField
              label="Expected disease prevalence (P)"
              tooltip="Proportion WITH disease among ALL patients you will enrol. Use site prevalence, not general population."
              value={state.diagPrev}
              onChange={(v) => update('diagPrev', v)}
              placeholder="e.g. 0.30"
              step={0.01}
              min={0.01}
              max={0.99}
              hint="e.g. 0.30 = 30% of enrolled patients have disease"
            />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">Reference standard</span>
              <PillGroup
                value={state.refStd}
                onChange={(v) => update('refStd', v)}
                options={REF_OPTIONS}
                ariaLabel="Reference standard"
              />
              <p className="text-xs text-muted-foreground">
                Imperfect reference underestimates Se/Sp → inflate N accordingly
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
