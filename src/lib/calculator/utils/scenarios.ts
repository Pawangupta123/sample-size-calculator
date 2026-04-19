import type { CalculatorState, Power } from '../types/calculator.types'
import { calculate } from './calculate'
import { applyDropout, totalFromPerGroup } from './adjustments'

export interface PowerComparison {
  power: Power
  nFinal: number
  nTotal: number
}

const POWER_LEVELS: Power[] = ['0.80', '0.90', '0.95']

export function computePowerComparison(state: CalculatorState): PowerComparison[] {
  if (state.design === 'diagnostic') return []
  return POWER_LEVELS.map((p) => {
    const outcome = calculate({ ...state, power: p })
    if (!outcome.ok) return { power: p, nFinal: 0, nTotal: 0 }
    return {
      power: p,
      nFinal: outcome.result.finalN,
      nTotal: outcome.result.totalN,
    }
  })
}

export interface EffectPoint {
  effect: number
  n: number
}

export function computeEffectCurve(state: CalculatorState, points = 12): EffectPoint[] {
  if (state.design === 'diagnostic') return []
  const out = state.outcome ?? 'continuous'

  const sweep = (varyKey: keyof CalculatorState, values: number[]): EffectPoint[] => {
    return values
      .map((value) => {
        const next: CalculatorState = { ...state, [varyKey]: value } as CalculatorState
        const outcome = calculate(next)
        if (!outcome.ok) return null
        const nPerGroup = outcome.result.rawN
        const adjusted = applyDropout(nPerGroup, state.dropout)
        const total =
          outcome.result.groups === 1
            ? adjusted
            : totalFromPerGroup(adjusted, state.alloc)
        return { effect: value, n: total }
      })
      .filter((p): p is EffectPoint => p !== null)
  }

  if (state.design === 'crosssectional' || state.objective === 'prevalence') {
    const e = state.marginError ?? 0.05
    const range = Array.from({ length: points }, (_, i) => 0.02 + (0.08 * i) / (points - 1))
    return sweep('marginError', range).filter((p) => p.effect !== e || true)
  }

  if (out === 'binary') {
    const p0 = state.p0 ?? 0.3
    const p1 = state.p1 ?? 0.2
    const base = Math.min(p0, p1)
    const delta = Math.abs(p0 - p1)
    const range = Array.from({ length: points }, (_, i) => {
      const d = delta * 0.5 + (delta * i) / (points - 1)
      return +(base + d).toFixed(3)
    })
    return sweep('p1', range)
  }

  if (out === 'survival') {
    const hr = state.hr ?? 0.7
    const range = Array.from({ length: points }, (_, i) => +(0.4 + 0.55 * (i / (points - 1))).toFixed(2))
    return sweep('hr', range.filter((v) => v !== 1))
  }

  const sd = state.stdDev ?? 10
  const range = Array.from({ length: points }, (_, i) => +(sd * 0.2 + (sd * 0.8 * i) / (points - 1)).toFixed(2))
  return sweep('meanDiff', range)
}

export function effectLabel(state: CalculatorState): string {
  const out = state.outcome ?? 'continuous'
  if (state.design === 'crosssectional' || state.objective === 'prevalence')
    return 'Margin of error (e)'
  if (out === 'binary') return 'Treatment event rate (p₁)'
  if (out === 'survival') return 'Hazard ratio (HR)'
  return 'Mean difference (Δ)'
}
