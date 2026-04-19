export interface ContinuousInputs {
  meanDiff: number
  stdDev: number
  zAlpha: number
  zBeta: number
}

export interface ContinuousResult {
  nPerGroup: number
  formula: string
  effectSummary: string
  cohensD: number
}

export function calcContinuous(input: ContinuousInputs): ContinuousResult {
  const { meanDiff, stdDev, zAlpha, zBeta } = input
  const d = meanDiff / stdDev
  const nPerGroup = Math.ceil(2 * Math.pow((zAlpha + zBeta) / d, 2))
  const formula =
    `N = 2 × [(Zα + Zβ) / (Δ/σ)]²\n` +
    `= 2 × [(${zAlpha.toFixed(2)} + ${zBeta.toFixed(2)}) / (${meanDiff}/${stdDev})]²\n` +
    `= 2 × [${((zAlpha + zBeta) / d).toFixed(3)}]²\n` +
    `= ${nPerGroup} per group`
  return {
    nPerGroup,
    formula,
    effectSummary: `Δ = ${meanDiff}, σ = ${stdDev}, Cohen's d = ${d.toFixed(2)}`,
    cohensD: d,
  }
}
