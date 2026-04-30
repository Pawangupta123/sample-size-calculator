export interface Article {
  id: string
  pmid?: string
  doi?: string
  openAlexId?: string
  title: string
  authors: string[]
  journal?: string
  year?: number
  abstract?: string
  pubmedUrl?: string
  doiUrl?: string
  europePmcUrl?: string
  pdfUrl?: string
  sources: Array<'pubmed' | 'europepmc' | 'openalex' | 'clinicaltrials' | 'manual' | 'pdf'>
  citedBy?: number
  openAccess?: boolean
  concepts?: Array<{ name: string; score: number }>
  trialStatus?: string
}

export interface SearchFilters {
  query: string
  yearFrom?: number
  yearTo?: number
  openAccessOnly?: boolean
  studyType?: StudyTypeFilter
  meshTerms?: string[]
  journal?: string
  includeClinicalTrials?: boolean
}

export type StudyTypeFilter =
  | 'any'
  | 'rct'
  | 'meta'
  | 'review'
  | 'cohort'
  | 'casecontrol'

export interface SearchResponse {
  articles: Article[]
  total: number
  fromCache: boolean
}
