export interface PrevalenceInputs {
  prevalence: number
  marginError: number
  zAlpha: number
}

export interface PrevalenceResult {
  nTotal: number
  formula: string
  effectSummary: string
}

export function calcPrevalence(input: PrevalenceInputs): PrevalenceResult {
  const { prevalence: p, marginError: e, zAlpha } = input
  const nTotal = Math.ceil((zAlpha * zAlpha * p * (1 - p)) / (e * e))

  const formula =
    `N = Z²α × P(1−P) / e²\n` +
    `= ${zAlpha.toFixed(2)}² × ${p}×${(1 - p).toFixed(2)} / ${e}²\n` +
    `= ${nTotal}`

  return {
    nTotal,
    formula,
    effectSummary: `P = ${p}, e = ±${e}`,
  }
}
