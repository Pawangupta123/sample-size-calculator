'use client'

import { Callout } from '@/components/ui/callout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberField } from '@/components/ui/number-field'
import { PillGroup } from '@/components/ui/pill-group'
import { SectionLabel } from '@/components/ui/section-label'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import type {
  ClusterUse,
  Endpoints,
  Interim,
} from '@/lib/calculator/types/calculator.types'

const CLUSTER_OPTIONS: ReadonlyArray<{ value: ClusterUse; label: string }> = [
  { value: 'no', label: 'No — individual randomisation' },
  { value: 'yes', label: 'Yes — cluster randomised' },
]

const ENDPOINT_OPTIONS: ReadonlyArray<{ value: Endpoints; label: string }> = [
  { value: '1', label: '1 (recommended)' },
  { value: '2', label: '2' },
  { value: '3', label: '3+' },
]

const INTERIM_OPTIONS: ReadonlyArray<{ value: Interim; label: string }> = [
  { value: 'no', label: 'None' },
  { value: '1', label: '1 interim' },
  { value: '2', label: '2+ interims' },
]

export function Step4Attrition() {
  const { state, update, result } = useCalculator()
  const showCluster = state.cluster === 'yes'

  return (
    <div className="space-y-4 animate-fade-in-up">
      {result && !result.ok && (
        <Callout tone="error">{result.message}</Callout>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Attrition & design adjustments</CardTitle>
          <CardDescription>
            These inflate the final sample to account for real-world losses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <SectionLabel>Dropout</SectionLabel>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium">
                Expected dropout / attrition rate
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={state.dropout}
                  onChange={(e) => update('dropout', parseInt(e.target.value, 10))}
                  className="flex-1 accent-primary"
                  aria-label="Dropout rate"
                />
                <span className="min-w-[3rem] text-right text-sm font-semibold">
                  {state.dropout}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Typical range: 10–30% depending on study duration
              </p>
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <SectionLabel>Cluster design (optional)</SectionLabel>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">
                Is this a cluster randomised trial?
              </span>
              <PillGroup
                value={state.cluster}
                onChange={(v) => update('cluster', v)}
                options={CLUSTER_OPTIONS}
                ariaLabel="Cluster design"
              />
            </div>
            {showCluster && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <NumberField
                    label="ICC (ρ)"
                    tooltip="Intracluster correlation. Community trials typically 0.01–0.05."
                    value={state.icc ?? 0.05}
                    onChange={(v) => update('icc', v)}
                    placeholder="e.g. 0.05"
                    step={0.01}
                    min={0}
                    max={1}
                  />
                  <NumberField
                    label="Cluster size (m)"
                    value={state.clusterSize ?? 30}
                    onChange={(v) => update('clusterSize', v)}
                    placeholder="e.g. 30"
                    step={1}
                    min={2}
                  />
                  <NumberField
                    label="No. of clusters"
                    value={state.numClusters ?? 20}
                    onChange={(v) => update('numClusters', v)}
                    placeholder="e.g. 20"
                    step={1}
                    min={2}
                  />
                </div>
                <Callout tone="warning">
                  DEFF = 1 + (m−1)×ICC. Minimum 6 clusters per arm recommended.
                </Callout>
              </div>
            )}
          </div>

          <hr className="border-border" />

          <div>
            <SectionLabel>Multiple testing (optional)</SectionLabel>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">Number of primary endpoints</span>
                <PillGroup
                  value={state.endpoints}
                  onChange={(v) => update('endpoints', v)}
                  options={ENDPOINT_OPTIONS}
                  ariaLabel="Primary endpoints"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">Interim analyses planned?</span>
                <PillGroup
                  value={state.interim}
                  onChange={(v) => update('interim', v)}
                  options={INTERIM_OPTIONS}
                  ariaLabel="Interim analyses"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
