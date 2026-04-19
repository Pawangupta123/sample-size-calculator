import type { CalculatorState } from '../types/calculator.types'

export const INITIAL_STATE: CalculatorState = {
  design: null,
  tail: '2',
  alloc: '1',
  outcome: null,
  diagMetric: 'both',
  objective: 'superiority',
  alpha: '0.05',
  power: '0.90',
  refStd: 'perfect',
  dropout: 15,
  cluster: 'no',
  endpoints: '1',
  interim: 'no',
}

export const STEP_LABELS: ReadonlyArray<{ num: number; label: string }> = [
  { num: 1, label: 'Design' },
  { num: 2, label: 'Outcome' },
  { num: 3, label: 'Parameters' },
  { num: 4, label: 'Attrition' },
  { num: 5, label: 'Results' },
]

export const FREE_USAGE_LIMIT = 2
export const USAGE_STORAGE_KEY = 'emr_ssc_usage'
export const STATE_STORAGE_KEY = 'emr_ssc_state'
