import type { CalculatorState } from '../types/calculator.types'

export function applyDropout(n: number, dropoutPct: number): number {
  const pct = Math.max(0, Math.min(99, dropoutPct))
  return Math.ceil(n / (1 - pct / 100))
}

export function applyDesignEffect(n: number, state: CalculatorState): number {
  if (state.cluster !== 'yes') return n
  const icc = state.icc ?? 0.05
  const m = state.clusterSize ?? 30
  return Math.ceil(n * (1 + (m - 1) * icc))
}

export function applyEndpoints(n: number, endpoints: string): number {
  return parseInt(endpoints, 10) === 1 ? n : Math.ceil(n * 1.15)
}

export function applyInterim(n: number, interim: string): number {
  if (interim === 'no') return n
  if (interim === '1') return Math.ceil(n * 1.03)
  return Math.ceil(n * 1.06)
}

export function totalFromPerGroup(nPerGroup: number, allocation: string): number {
  const r = parseInt(allocation, 10)
  return r === 1 ? nPerGroup * 2 : Math.ceil(nPerGroup + nPerGroup * r)
}

export function designEffectValue(state: CalculatorState): string {
  if (state.cluster !== 'yes') return '1.00'
  const m = state.clusterSize ?? 30
  const icc = state.icc ?? 0.05
  return (1 + (m - 1) * icc).toFixed(2)
}
