import type { CalculatorState } from '../types/calculator.types'
import type { CalculationResult } from '../types/results.types'

export type CitationStyle = 'apa' | 'vancouver' | 'methods'

interface CitationInput {
  state: CalculatorState
  result: CalculationResult
}

export function generateMethodsParagraph({ state, result }: CitationInput): string {
  const design = labelDesign(state.design)
  const alpha = state.alpha
  const power = Math.round(parseFloat(state.power) * 100)
  const tail = state.tail === '2' ? 'two-sided' : 'one-sided'
  const dropout = state.dropout

  if (state.design === 'diagnostic') {
    const prev = state.diagPrev ?? 0
    const metric = describeDiagnosticMetric(state)
    return [
      `The sample size for this ${design.toLowerCase()} was calculated using the Buderer (1996) formula.`,
      metric,
      `Assuming a disease prevalence of ${(prev * 100).toFixed(1)}% at the recruitment site and a ${alpha === '0.05' ? '95%' : `${((1 - parseFloat(alpha)) * 100).toFixed(0)}%`} confidence level, the required sample size is ${result.rawN} participants.`,
      `Accounting for an estimated ${dropout}% dropout rate, the final target sample size is ${result.finalN} participants.`,
    ].join(' ')
  }

  const effect = state.design === 'crosssectional' || state.objective === 'prevalence'
    ? describePrevalenceEffect(state)
    : describeComparativeEffect(state)

  return [
    `The sample size was calculated using a ${tail} test at a significance level of α = ${alpha} and ${power}% power.`,
    effect,
    `The raw sample size required was ${result.rawN}${result.groups === 2 ? ' per group' : ''}.`,
    `After adjusting for ${dropout}% dropout${state.cluster === 'yes' ? ' and the cluster design effect' : ''}${parseInt(state.endpoints, 10) > 1 ? ', multiple primary endpoints' : ''}${state.interim !== 'no' ? ', and planned interim analyses' : ''}, the final target sample size is ${result.finalN}${result.groups === 2 ? ` per group (total ${result.totalN})` : ''}.`,
  ].join(' ')
}

export function generateCitation(style: CitationStyle, input: CitationInput): string {
  const paragraph = generateMethodsParagraph(input)
  const primary = getPrimaryReference(input.state)
  if (style === 'methods') return paragraph
  if (style === 'apa') return `${paragraph}\n\nReference: ${formatReferenceAPA(primary)}`
  return `${paragraph}\n\nReference: ${formatReferenceVancouver(primary)}`
}

interface Reference {
  authors: string
  year: number
  title: string
  journal: string
  volume?: string
  issue?: string
  pages?: string
}

function getPrimaryReference(state: CalculatorState): Reference {
  if (state.design === 'diagnostic') {
    return {
      authors: 'Buderer NMF',
      year: 1996,
      title:
        'Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity',
      journal: 'Academic Emergency Medicine',
      volume: '3',
      issue: '9',
      pages: '895–900',
    }
  }
  return {
    authors: 'Chow S-C, Shao J, Wang H, Lokhnygina Y',
    year: 2017,
    title: 'Sample Size Calculations in Clinical Research (3rd ed.)',
    journal: 'CRC Press',
  }
}

function formatReferenceAPA(r: Reference): string {
  const tail =
    r.volume && r.issue && r.pages
      ? ` ${r.journal}, ${r.volume}(${r.issue}), ${r.pages}.`
      : ` ${r.journal}.`
  return `${r.authors} (${r.year}). ${r.title}.${tail}`
}

function formatReferenceVancouver(r: Reference): string {
  const tail =
    r.volume && r.issue && r.pages
      ? ` ${r.journal}. ${r.year};${r.volume}(${r.issue}):${r.pages}.`
      : ` ${r.journal}; ${r.year}.`
  return `${r.authors}. ${r.title}.${tail}`
}

function labelDesign(design: CalculatorState['design']): string {
  switch (design) {
    case 'rct': return 'Randomised Controlled Trial'
    case 'cohort': return 'Cohort study'
    case 'casecontrol': return 'Case-control study'
    case 'crosssectional': return 'Cross-sectional study'
    case 'diagnostic': return 'Diagnostic accuracy study'
    case 'survival': return 'Survival analysis'
    default: return 'Clinical study'
  }
}

function describeDiagnosticMetric(state: CalculatorState): string {
  const m = state.diagMetric
  if (m === 'sensitivity') {
    return `Expected sensitivity was ${state.diagSe}% with an acceptable 95% CI of ${state.diagSeLo}%–${state.diagSeHi}%.`
  }
  if (m === 'specificity') {
    return `Expected specificity was ${state.diagSp}% with an acceptable 95% CI of ${state.diagSpLo}%–${state.diagSpHi}%.`
  }
  if (m === 'auc') {
    return `Expected AUC was ${state.diagAuc} compared against a null AUC of ${state.diagAuc0 ?? 0.5}.`
  }
  return `Expected sensitivity was ${state.diagSe}% (95% CI ${state.diagSeLo}%–${state.diagSeHi}%) and expected specificity was ${state.diagSp}% (95% CI ${state.diagSpLo}%–${state.diagSpHi}%).`
}

function describeComparativeEffect(state: CalculatorState): string {
  if (state.outcome === 'binary') {
    return `The baseline event rate was assumed to be ${state.p0} and the expected event rate in the intervention arm was ${state.p1}.`
  }
  if (state.outcome === 'survival') {
    return `A hazard ratio of ${state.hr} was anticipated with an expected event rate of ${state.eventRate}%.`
  }
  return `An expected mean difference of ${state.meanDiff} with a pooled standard deviation of ${state.stdDev} was assumed.`
}

function describePrevalenceEffect(state: CalculatorState): string {
  return `An expected prevalence of ${state.prevalence} with a margin of error of ±${state.marginError} was assumed.`
}
