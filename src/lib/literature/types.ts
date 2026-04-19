export interface Article {
  id: string
  pmid?: string
  doi?: string
  title: string
  authors: string[]
  journal?: string
  year?: number
  abstract?: string
  pubmedUrl?: string
  doiUrl?: string
  europePmcUrl?: string
  sources: Array<'pubmed' | 'europepmc'>
  citedBy?: number
  openAccess?: boolean
}

export interface SearchFilters {
  query: string
  yearFrom?: number
  yearTo?: number
  openAccessOnly?: boolean
  studyType?: StudyTypeFilter
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
