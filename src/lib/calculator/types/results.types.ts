export interface ResultMetric {
  label: string
  value: string
  unit?: string
}

export interface CalculationResult {
  rawN: number
  finalN: number
  totalN: number
  groups: 1 | 2
  formula: string
  assumptions: Array<[string, string]>
  metrics: ResultMetric[]
  label: string
  sublabel: string
}

export interface DiagnosticIntermediate {
  rawN: number
  formulaLines: string[]
  extras: Array<[string, string]>
}

export type CalculationError = { ok: false; message: string }
export type CalculationOk = { ok: true; result: CalculationResult }
export type CalculationOutcome = CalculationOk | CalculationError
