import type { StudyDesign } from '../types/calculator.types'

export interface DesignOption {
  id: StudyDesign
  icon: string
  label: string
  description: string
}

export const DESIGN_OPTIONS: DesignOption[] = [
  {
    id: 'rct',
    icon: '⚖️',
    label: 'RCT / Controlled Trial',
    description: 'Randomised comparison of two or more groups',
  },
  {
    id: 'cohort',
    icon: '📈',
    label: 'Cohort Study',
    description: 'Follow exposed vs. unexposed groups over time',
  },
  {
    id: 'casecontrol',
    icon: '🔍',
    label: 'Case-Control',
    description: 'Compare cases vs. matched controls',
  },
  {
    id: 'crosssectional',
    icon: '📊',
    label: 'Cross-sectional',
    description: 'Single time-point prevalence study',
  },
  {
    id: 'diagnostic',
    icon: '🩺',
    label: 'Diagnostic Accuracy',
    description: 'Sensitivity, specificity, AUC of a test',
  },
  {
    id: 'survival',
    icon: '⏱️',
    label: 'Survival / Time-to-Event',
    description: 'Time to death, relapse, or event',
  },
]

export const DESIGN_LABELS: Record<StudyDesign, string> = {
  rct: 'RCT',
  cohort: 'Cohort',
  casecontrol: 'Case-control',
  crosssectional: 'Cross-sectional',
  diagnostic: 'Diagnostic accuracy',
  survival: 'Survival',
}

export const DESIGNS_WITH_ALLOCATION: StudyDesign[] = ['rct', 'cohort']
