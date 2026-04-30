import type { Article } from '@/lib/literature/types'

export type StudyType =
  | 'rct'
  | 'prospective_cohort'
  | 'retrospective_cohort'
  | 'cross_sectional'
  | 'case_control'
  | 'descriptive'
  | 'diagnostic_accuracy'

export type Department =
  | 'Medicine' | 'Pediatrics' | 'Surgery' | 'Obstetrics & Gynaecology'
  | 'Orthopaedics' | 'Psychiatry' | 'Radiology' | 'Pathology'
  | 'Pharmacology' | 'Anaesthesia' | 'ENT' | 'Ophthalmology'
  | 'Community Medicine' | 'Dermatology' | 'Cardiology' | 'Pulmonology'
  | 'Nephrology' | 'Neurology' | 'Oncology' | 'Emergency Medicine'

export interface ProtocolFormData {
  title: string
  studyType: StudyType
  department: Department | string
  institution: string
  setting: string
  investigatorName: string
  guideName: string
  population: string
  condition: string
  intervention: string
  primaryOutcome: string
  secondaryOutcomes: string
  duration: string
  sampleSize: string
  inclusionCriteria: string
  exclusionCriteria: string
  additionalInfo: string
}

export interface ProtocolSection {
  heading: string
  level: 1 | 2 | 3
  content: string[]
}

export interface ProtocolDocument {
  title: string
  sections: ProtocolSection[]
  references: Article[]
  formData: ProtocolFormData
}
