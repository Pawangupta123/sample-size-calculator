import type { CalculatorState } from '../types/calculator.types'
import { INITIAL_STATE } from './defaults'

export interface Preset {
  id: string
  name: string
  description: string
  icon: string
  state: CalculatorState
}

export const PRESETS: ReadonlyArray<Preset> = [
  {
    id: 'hypertension-rct',
    name: 'Hypertension RCT',
    description: 'New antihypertensive vs. standard care — continuous BP outcome',
    icon: '❤️',
    state: {
      ...INITIAL_STATE,
      design: 'rct',
      outcome: 'continuous',
      objective: 'superiority',
      alpha: '0.05',
      power: '0.90',
      meanDiff: 5,
      stdDev: 12,
      dropout: 15,
    },
  },
  {
    id: 'cancer-survival',
    name: 'Cancer Survival Trial',
    description: 'Novel chemotherapy vs. standard — hazard ratio outcome',
    icon: '⏱️',
    state: {
      ...INITIAL_STATE,
      design: 'rct',
      outcome: 'survival',
      objective: 'superiority',
      alpha: '0.05',
      power: '0.80',
      hr: 0.7,
      eventRate: 40,
      dropout: 20,
    },
  },
  {
    id: 'covid-diagnostic',
    name: 'Diagnostic Test Validation',
    description: 'Rapid antigen test — Sensitivity & Specificity, 30% prevalence',
    icon: '🩺',
    state: {
      ...INITIAL_STATE,
      design: 'diagnostic',
      outcome: 'diagnostic',
      diagMetric: 'both',
      alpha: '0.05',
      diagSe: 85,
      diagSeLo: 80,
      diagSeHi: 90,
      diagSp: 92,
      diagSpLo: 88,
      diagSpHi: 96,
      diagPrev: 0.3,
      refStd: 'perfect',
      dropout: 10,
    },
  },
  {
    id: 'obesity-prevalence',
    name: 'Prevalence Survey',
    description: 'Community prevalence of obesity — cross-sectional study',
    icon: '📊',
    state: {
      ...INITIAL_STATE,
      design: 'crosssectional',
      outcome: null,
      objective: 'prevalence',
      alpha: '0.05',
      prevalence: 0.25,
      marginError: 0.04,
      dropout: 10,
    },
  },
  {
    id: 'vaccine-efficacy',
    name: 'Vaccine Efficacy Trial',
    description: 'New vaccine vs. placebo — binary outcome (infection yes/no)',
    icon: '💉',
    state: {
      ...INITIAL_STATE,
      design: 'rct',
      outcome: 'binary',
      objective: 'superiority',
      alpha: '0.025',
      power: '0.90',
      p0: 0.08,
      p1: 0.02,
      dropout: 15,
    },
  },
  {
    id: 'post-op-pain',
    name: 'Post-op Pain Reduction',
    description: 'New analgesic vs. morphine — continuous VAS score',
    icon: '💊',
    state: {
      ...INITIAL_STATE,
      design: 'rct',
      outcome: 'continuous',
      objective: 'superiority',
      alpha: '0.05',
      power: '0.80',
      meanDiff: 1.5,
      stdDev: 3.2,
      dropout: 10,
    },
  },
]
