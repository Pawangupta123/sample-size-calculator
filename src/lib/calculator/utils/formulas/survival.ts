export interface SurvivalInputs {
  hazardRatio: number
  eventRatePercent: number
  zAlpha: number
  zBeta: number
}

export interface SurvivalResult {
  nPerGroup: number
  events: number
  formula: string
  effectSummary: string
}

export function calcSurvival(input: SurvivalInputs): SurvivalResult {
  const { hazardRatio, eventRatePercent, zAlpha, zBeta } = input
  const logHR = Math.log(hazardRatio)
  const events = Math.ceil(Math.pow(zAlpha + zBeta, 2) / Math.pow(logHR, 2))
  const nPerGroup = Math.ceil(events / (eventRatePercent / 100) / 2)

  const formula =
    `Events needed = (Zα+Zβ)² / (lnHR)² = ${events}\n` +
    `N per group = ${events} ÷ ${(eventRatePercent / 100).toFixed(2)} ÷ 2 = ${nPerGroup}`

  return {
    nPerGroup,
    events,
    formula,
    effectSummary: `HR = ${hazardRatio}, Event rate = ${eventRatePercent}%`,
  }
}
