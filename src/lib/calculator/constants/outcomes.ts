import type {
  DiagnosticMetric,
  OutcomeType,
  StudyObjective,
} from '../types/calculator.types'

export interface OutcomeOption {
  id: OutcomeType
  icon: string
  label: string
  description: string
}

export const OUTCOME_OPTIONS: OutcomeOption[] = [
  {
    id: 'continuous',
    icon: '📏',
    label: 'Continuous',
    description: 'Blood pressure, weight, HbA1c, score',
  },
  {
    id: 'binary',
    icon: '✅',
    label: 'Binary / Proportion',
    description: 'Death, cure rate, complication rate',
  },
  {
    id: 'ordinal',
    icon: '🔢',
    label: 'Ordinal / Ranked',
    description: 'Rankin Scale, Likert, staging',
  },
  {
    id: 'survival',
    icon: '⏳',
    label: 'Time-to-Event',
    description: 'Survival, relapse-free survival',
  },
]

export interface DiagnosticMetricOption {
  id: DiagnosticMetric
  icon: string
  label: string
  description: string
}

export const DIAGNOSTIC_METRIC_OPTIONS: DiagnosticMetricOption[] = [
  {
    id: 'sensitivity',
    icon: '🎯',
    label: 'Sensitivity only',
    description: 'True positive rate in diseased patients',
  },
  {
    id: 'specificity',
    icon: '🛡️',
    label: 'Specificity only',
    description: 'True negative rate in non-diseased',
  },
  {
    id: 'both',
    icon: '⚖️',
    label: 'Both Se & Sp',
    description: 'Calculate both; take the larger N (recommended)',
  },
  {
    id: 'auc',
    icon: '📈',
    label: 'AUC / ROC',
    description: 'Overall discriminative ability',
  },
]

export interface ObjectiveOption {
  id: StudyObjective
  label: string
}

export const OBJECTIVE_OPTIONS: ObjectiveOption[] = [
  { id: 'superiority', label: 'Superiority' },
  { id: 'noninferiority', label: 'Non-inferiority' },
  { id: 'equivalence', label: 'Equivalence' },
  { id: 'prevalence', label: 'Prevalence only' },
]
