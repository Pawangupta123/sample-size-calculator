import type { DiagnosticMetric } from '../../types/calculator.types'

export interface DiagnosticSeInputs {
  sePct: number
  seLo: number
  seHi: number
  prevalence: number
  zAlpha: number
}

export interface DiagnosticSpInputs {
  spPct: number
  spLo: number
  spHi: number
  prevalence: number
  zAlpha: number
}

export interface DiagnosticAucInputs {
  auc: number
  auc0: number
  prevalence: number
  zAlpha: number
}

export interface DiagnosticSectionResult {
  nTotal: number
  nInternal: number
  lines: string[]
}

function buildCIPreview(
  label: string,
  expectedPct: number,
  lo: number,
  hi: number
): { width: string; halfWidth: string } {
  void label
  void expectedPct
  return {
    width: (hi - lo).toFixed(0),
    halfWidth: ((hi - lo) / 2).toFixed(1),
  }
}

export function calcDiagnosticSensitivity(
  input: DiagnosticSeInputs
): DiagnosticSectionResult {
  const { sePct, seLo, seHi, prevalence, zAlpha } = input
  const se = sePct / 100
  const precision = (seHi - seLo) / 2 / 100
  const nDiseased = Math.ceil(
    (zAlpha * zAlpha * se * (1 - se)) / (precision * precision)
  )
  const nTotal = Math.ceil(nDiseased / prevalence)

  const { width, halfWidth } = buildCIPreview('Se', sePct, seLo, seHi)
  const lines: string[] = [
    `SENSITIVITY — Buderer (1996)`,
    `  Expected Se = ${sePct}%`,
    `  Acceptable 95% CI: ${seLo.toFixed(0)}% – ${seHi.toFixed(0)}%  (width = ${width}%, precision = ±${halfWidth}%)`,
    '',
    `  Internally: precision = (${seHi}−${seLo}) / 2 / 100 = ${precision.toFixed(4)}`,
    `  Formula:   N_diseased = Z²α × Se×(1−Se) / precision²`,
    `           = ${zAlpha.toFixed(3)}² × ${se.toFixed(2)}×${(1 - se).toFixed(2)} / ${precision.toFixed(4)}²`,
    `           = ${nDiseased}  (diseased patients needed)`,
    `  Total N   = N_diseased ÷ prevalence = ${nDiseased} ÷ ${prevalence} = ${nTotal}`,
    '',
  ]
  return { nTotal, nInternal: nDiseased, lines }
}

export function calcDiagnosticSpecificity(
  input: DiagnosticSpInputs
): DiagnosticSectionResult {
  const { spPct, spLo, spHi, prevalence, zAlpha } = input
  const sp = spPct / 100
  const precision = (spHi - spLo) / 2 / 100
  const nNonDiseased = Math.ceil(
    (zAlpha * zAlpha * sp * (1 - sp)) / (precision * precision)
  )
  const nTotal = Math.ceil(nNonDiseased / (1 - prevalence))

  const { width, halfWidth } = buildCIPreview('Sp', spPct, spLo, spHi)
  const lines: string[] = [
    `SPECIFICITY — Buderer (1996)`,
    `  Expected Sp = ${spPct}%`,
    `  Acceptable 95% CI: ${spLo.toFixed(0)}% – ${spHi.toFixed(0)}%  (width = ${width}%, precision = ±${halfWidth}%)`,
    '',
    `  Internally: precision = (${spHi}−${spLo}) / 2 / 100 = ${precision.toFixed(4)}`,
    `  Formula:   N_nondiseased = Z²α × Sp×(1−Sp) / precision²`,
    `           = ${zAlpha.toFixed(3)}² × ${sp.toFixed(2)}×${(1 - sp).toFixed(2)} / ${precision.toFixed(4)}²`,
    `           = ${nNonDiseased}  (non-diseased patients needed)`,
    `  Total N   = N_nondiseased ÷ (1−prevalence) = ${nNonDiseased} ÷ ${(1 - prevalence).toFixed(2)} = ${nTotal}`,
    '',
  ]
  return { nTotal, nInternal: nNonDiseased, lines }
}

export function calcDiagnosticAuc(
  input: DiagnosticAucInputs
): DiagnosticSectionResult {
  const { auc, auc0, prevalence, zAlpha } = input
  const zBetaForAuc = 0.842
  const v0 = auc0 * (1 - auc0)
  const v1 = auc * (1 - auc)
  const nDiseased = Math.ceil(
    Math.pow(zAlpha * Math.sqrt(v0) + zBetaForAuc * Math.sqrt(v1), 2) /
      Math.pow(auc - auc0, 2)
  )
  const nTotal = Math.ceil(nDiseased / prevalence)

  const lines: string[] = [
    `AUC — Hanley-McNeil approximation`,
    `  Expected AUC = ${auc}  |  Null AUC (H₀) = ${auc0}`,
    `  N_diseased = (Zα√Var₀ + Zβ√Var₁)² / (AUC₁−AUC₀)² = ${nDiseased}`,
    `  Total N = ${nDiseased} ÷ ${prevalence} = ${nTotal}`,
    '',
  ]
  return { nTotal, nInternal: nDiseased, lines }
}

export function pickDominantMetric(
  metric: DiagnosticMetric,
  nSe: number,
  nSp: number
): string {
  if (metric !== 'both') return ''
  return nSe >= nSp ? 'Sensitivity' : 'Specificity'
}
