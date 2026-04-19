export type StudyDesign =
  | 'rct'
  | 'cohort'
  | 'casecontrol'
  | 'crosssectional'
  | 'diagnostic'
  | 'survival'

export type OutcomeType =
  | 'continuous'
  | 'binary'
  | 'ordinal'
  | 'survival'
  | 'diagnostic'

export type DiagnosticMetric = 'sensitivity' | 'specificity' | 'both' | 'auc'

export type StudyObjective =
  | 'superiority'
  | 'noninferiority'
  | 'equivalence'
  | 'prevalence'

export type Tail = '1' | '2'
export type Alpha = '0.05' | '0.01' | '0.025'
export type Power = '0.80' | '0.90' | '0.95'
export type Allocation = '1' | '2' | '3'
export type Endpoints = '1' | '2' | '3'
export type Interim = 'no' | '1' | '2'
export type ClusterUse = 'yes' | 'no'
export type ReferenceStd = 'perfect' | 'imperfect'

export interface CalculatorState {
  design: StudyDesign | null
  tail: Tail
  alloc: Allocation

  outcome: OutcomeType | null
  diagMetric: DiagnosticMetric
  objective: StudyObjective

  alpha: Alpha
  power: Power

  meanDiff?: number
  stdDev?: number
  p0?: number
  p1?: number
  hr?: number
  eventRate?: number
  prevalence?: number
  marginError?: number
  niMargin?: number

  diagSe?: number
  diagSeLo?: number
  diagSeHi?: number
  diagSp?: number
  diagSpLo?: number
  diagSpHi?: number
  diagAuc?: number
  diagAuc0?: number
  diagPrev?: number
  refStd: ReferenceStd

  dropout: number
  cluster: ClusterUse
  icc?: number
  clusterSize?: number
  numClusters?: number
  endpoints: Endpoints
  interim: Interim
}

export type StepIndex = 0 | 1 | 2 | 3 | 4
