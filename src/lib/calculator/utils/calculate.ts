import type { CalculatorState } from '../types/calculator.types'
import type {
  CalculationOutcome,
  CalculationResult,
} from '../types/results.types'
import { DESIGN_LABELS } from '../constants/designs'
import {
  applyDesignEffect,
  applyDropout,
  applyEndpoints,
  applyInterim,
  designEffectValue,
  totalFromPerGroup,
} from './adjustments'
import { confidenceLevelPercent, zAlpha, zBeta } from './zValues'
import {
  calcBinary,
  calcContinuous,
  calcDiagnosticAuc,
  calcDiagnosticSensitivity,
  calcDiagnosticSpecificity,
  calcPrevalence,
  calcSurvival,
  pickDominantMetric,
} from './formulas'

function err(message: string): CalculationOutcome {
  return { ok: false, message }
}

function ok(result: CalculationResult): CalculationOutcome {
  return { ok: true, result }
}

function calcDiagnostic(state: CalculatorState): CalculationOutcome {
  const prev = state.diagPrev
  if (prev == null || prev <= 0 || prev >= 1) {
    return err(
      'Disease prevalence required. Enter 0.01–0.99 (e.g. 0.30 = 30% of enrolled patients have the disease).'
    )
  }

  const Z = zAlpha(state.alpha, '2')
  const m = state.diagMetric
  const ci = confidenceLevelPercent(state.alpha)
  const lines: string[] = []
  let nSe = 0
  let nSp = 0

  if (m === 'sensitivity' || m === 'both') {
    const { diagSe: se, diagSeLo: lo, diagSeHi: hi } = state
    if (se == null || se <= 0 || se >= 100)
      return err('Enter expected Sensitivity as a percentage (e.g. 85 for 85%).')
    if (lo == null || hi == null || hi <= lo)
      return err('Enter a valid 95% CI for Sensitivity — lower < upper (e.g. 80 to 90).')
    if (lo < 0 || hi > 100)
      return err('Sensitivity CI bounds must be between 0% and 100%.')
    const r = calcDiagnosticSensitivity({
      sePct: se, seLo: lo, seHi: hi, prevalence: prev, zAlpha: Z,
    })
    nSe = r.nTotal
    lines.push(...r.lines)
  }

  if (m === 'specificity' || m === 'both') {
    const { diagSp: sp, diagSpLo: lo, diagSpHi: hi } = state
    if (sp == null || sp <= 0 || sp >= 100)
      return err('Enter expected Specificity as a percentage (e.g. 90 for 90%).')
    if (lo == null || hi == null || hi <= lo)
      return err('Enter a valid 95% CI for Specificity — lower < upper (e.g. 85 to 95).')
    if (lo < 0 || hi > 100)
      return err('Specificity CI bounds must be between 0% and 100%.')
    const r = calcDiagnosticSpecificity({
      spPct: sp, spLo: lo, spHi: hi, prevalence: prev, zAlpha: Z,
    })
    nSp = r.nTotal
    lines.push(...r.lines)
  }

  if (m === 'auc') {
    const auc = state.diagAuc
    const auc0 = state.diagAuc0 ?? 0.5
    if (auc == null || auc <= 0.5 || auc >= 1)
      return err('Enter expected AUC as a decimal > 0.50 (e.g. 0.80).')
    if (auc <= auc0) return err('Expected AUC must be greater than null AUC.')
    const r = calcDiagnosticAuc({ auc, auc0, prevalence: prev, zAlpha: Z })
    nSe = r.nTotal
    lines.push(...r.lines)
  }

  const rawN = Math.max(nSe, nSp)
  const dominant = pickDominantMetric(m, nSe, nSp)
  if (dominant) lines.push(`→ ${dominant} requires the larger sample → N = ${rawN}`)
  lines.push(`→ Raw N before dropout adjustment = ${rawN}`)

  const finalN = applyDropout(rawN, state.dropout)
  const formula =
    lines.join('\n') +
    `\n\nDropout adjustment: ${rawN} ÷ (1−${state.dropout / 100}) = ${finalN}`

  const assumptions: Array<[string, string]> = [
    ['Study design', 'Diagnostic accuracy'],
    [
      'Accuracy metric',
      m === 'both' ? 'Se & Sp (take larger N)' : m === 'auc' ? 'AUC/ROC' : m,
    ],
    ['Disease prevalence', `${(prev * 100).toFixed(1)}%`],
  ]
  if (state.diagSe != null && m !== 'specificity' && m !== 'auc')
    assumptions.push(['Expected Se', `${state.diagSe.toFixed(0)}%`])
  if (state.diagSeLo != null && state.diagSeHi != null && m !== 'specificity' && m !== 'auc')
    assumptions.push(['Se 95% CI', `${state.diagSeLo.toFixed(0)}%–${state.diagSeHi.toFixed(0)}%`])
  if (state.diagSp != null && m !== 'sensitivity' && m !== 'auc')
    assumptions.push(['Expected Sp', `${state.diagSp.toFixed(0)}%`])
  if (state.diagSpLo != null && state.diagSpHi != null && m !== 'sensitivity' && m !== 'auc')
    assumptions.push(['Sp 95% CI', `${state.diagSpLo.toFixed(0)}%–${state.diagSpHi.toFixed(0)}%`])
  if (m === 'auc') {
    assumptions.push(['Expected AUC', String(state.diagAuc ?? '')])
    assumptions.push(['Null AUC (H₀)', String(state.diagAuc0 ?? 0.5)])
  }
  assumptions.push(['Confidence level', `${ci}%`])
  assumptions.push([
    'Reference standard',
    state.refStd === 'perfect' ? 'Gold standard' : 'Imperfect reference',
  ])
  assumptions.push(['Formula', 'Buderer (1996)'])
  assumptions.push(['Dropout rate', `${state.dropout}%`])

  return ok({
    rawN,
    finalN,
    totalN: finalN,
    groups: 1,
    formula,
    assumptions,
    label: 'Total participants required',
    sublabel:
      'Single-arm cohort — all participants receive the index test + reference standard',
    metrics: [
      { label: 'Confidence level', value: String(ci), unit: '%' },
      { label: 'Raw N (pre-dropout)', value: rawN.toLocaleString() },
      { label: 'Dropout inflation', value: `+${state.dropout}`, unit: '%' },
      { label: 'Disease prevalence', value: (prev * 100).toFixed(1), unit: '%' },
      { label: 'Study design', value: 'Single-arm' },
      { label: 'Formula', value: 'Buderer 1996' },
    ],
  })
}

function calcNonDiagnostic(state: CalculatorState): CalculationOutcome {
  const Z = zAlpha(state.alpha, state.tail)
  const Zb = zBeta(state.power)
  const obj = state.objective
  const out = state.outcome ?? 'continuous'

  let nPerGroup = 0
  let formula = ''
  let effect = ''
  let groups: 1 | 2 = 2

  if (state.design === 'crosssectional' || obj === 'prevalence') {
    const p = state.prevalence ?? 0.5
    const e = state.marginError ?? 0.05
    if (p == null || e == null)
      return err('Enter prevalence and margin of error.')
    const r = calcPrevalence({ prevalence: p, marginError: e, zAlpha: Z })
    nPerGroup = r.nTotal
    formula = r.formula
    effect = r.effectSummary
    groups = 1
  } else if (out === 'binary') {
    const { p0, p1 } = state
    if (p0 == null || p1 == null || p0 === p1)
      return err('Enter valid and different p₀ and p₁.')
    const r = calcBinary({ p0, p1, zAlpha: Z, zBeta: Zb })
    nPerGroup = r.nPerGroup
    formula = r.formula
    effect = r.effectSummary
  } else if (out === 'survival') {
    const { hr, eventRate } = state
    if (hr == null || eventRate == null)
      return err('Enter hazard ratio and event rate.')
    const r = calcSurvival({
      hazardRatio: hr, eventRatePercent: eventRate, zAlpha: Z, zBeta: Zb,
    })
    nPerGroup = r.nPerGroup
    formula = r.formula
    effect = r.effectSummary
  } else {
    const { meanDiff, stdDev } = state
    if (meanDiff == null || stdDev == null || stdDev === 0)
      return err('Enter expected mean difference (Δ) and standard deviation (σ).')
    const r = calcContinuous({ meanDiff, stdDev, zAlpha: Z, zBeta: Zb })
    nPerGroup = r.nPerGroup
    formula = r.formula
    effect = r.effectSummary
  }

  const nDrop = applyDropout(nPerGroup, state.dropout)
  const nAdj = applyInterim(
    applyEndpoints(applyDesignEffect(nDrop, state), state.endpoints),
    state.interim
  )
  const total = groups === 1 ? nAdj : totalFromPerGroup(nAdj, state.alloc)
  const deff = designEffectValue(state)

  const label = groups === 1
    ? 'Total participants required'
    : 'Per group (after all adjustments)'
  const sublabel = groups === 1
    ? `Total: ${nAdj.toLocaleString()} participants`
    : `Total across all groups: ${total.toLocaleString()} participants`

  const metrics = [
    { label: 'Statistical power', value: String(Math.round(parseFloat(state.power) * 100)), unit: '%' },
    { label: 'Alpha (α)', value: state.alpha },
    { label: 'Raw N per group', value: nPerGroup.toLocaleString() },
    { label: 'Dropout inflation', value: `+${state.dropout}`, unit: '%' },
    { label: 'Design effect', value: deff },
    { label: 'Total N', value: total.toLocaleString() },
  ]

  const dsLabel = state.design ? DESIGN_LABELS[state.design] : '—'
  const assumptions: Array<[string, string]> = [
    ['Study design', dsLabel],
    ['Outcome type', out],
    ['Objective', obj],
    ['Tails', state.tail === '2' ? 'Two-tailed' : 'One-tailed'],
    ['Allocation', groups === 1 ? 'N/A' : `1 : ${state.alloc}`],
    ['Alpha (α)', state.alpha],
    ['Power', `${Math.round(parseFloat(state.power) * 100)}%`],
    ['Effect size', effect],
    ['Dropout rate', `${state.dropout}%`],
    ['Cluster', state.cluster === 'yes' ? `Yes (DEFF=${deff})` : 'No'],
    ['Endpoints', state.endpoints],
    ['Interim', state.interim === 'no' ? 'None' : `${state.interim} planned`],
  ]

  return ok({
    rawN: nPerGroup,
    finalN: nAdj,
    totalN: total,
    groups,
    formula,
    assumptions,
    metrics,
    label,
    sublabel,
  })
}

export function calculate(state: CalculatorState): CalculationOutcome {
  if (!state.design) return err('Please select a study design.')
  if (state.design === 'diagnostic') return calcDiagnostic(state)
  return calcNonDiagnostic(state)
}
