export interface BinaryInputs {
  p0: number
  p1: number
  zAlpha: number
  zBeta: number
}

export interface BinaryResult {
  nPerGroup: number
  formula: string
  effectSummary: string
}

export function calcBinary(input: BinaryInputs): BinaryResult {
  const { p0, p1, zAlpha, zBeta } = input
  const pBar = (p0 + p1) / 2
  const numerator = Math.pow(
    zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) +
      zBeta * Math.sqrt(p0 * (1 - p0) + p1 * (1 - p1)),
    2
  )
  const nPerGroup = Math.ceil(numerator / Math.pow(p0 - p1, 2))

  const formula =
    `N = (Zα√[2P̄(1−P̄)] + Zβ√[p₀(1−p₀)+p₁(1−p₁)])² / (p₀−p₁)²\n` +
    `= ${nPerGroup} per group`

  return {
    nPerGroup,
    formula,
    effectSummary: `p₀ = ${p0}, p₁ = ${p1}, ARR = ${Math.abs(p0 - p1).toFixed(2)}`,
  }
}
