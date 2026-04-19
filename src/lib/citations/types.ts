export type SourceType = 'doi' | 'pmid' | 'url' | 'raw' | 'unknown'

export interface CitationMetadata {
  authors: Array<{ family: string; given?: string }>
  title: string
  journal?: string
  journalAbbr?: string
  year?: number
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  pmid?: string
}

export interface ConvertedCitation {
  id: string
  input: string
  sourceType: SourceType
  metadata: CitationMetadata | null
  vancouver: string
  status: 'pending' | 'success' | 'error' | 'warning'
  message?: string
}
