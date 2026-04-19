import type { Article } from '@/lib/literature/types'

export type ReviewStyle = 'narrative' | 'thematic' | 'systematic'
export type WordTarget = 'short' | 'standard' | 'long' | 'extended'

export interface WordTargetMeta {
  id: WordTarget
  label: string
  range: string
  sentencesPerArticle: number
  includeSynthesis: boolean
}

export const WORD_TARGETS: ReadonlyArray<WordTargetMeta> = [
  { id: 'short', label: 'Short', range: '300–500 words', sentencesPerArticle: 1, includeSynthesis: false },
  { id: 'standard', label: 'Standard', range: '500–900 words', sentencesPerArticle: 2, includeSynthesis: false },
  { id: 'long', label: 'Long', range: '900–1500 words', sentencesPerArticle: 3, includeSynthesis: true },
  { id: 'extended', label: 'Extended', range: '1500–2500 words', sentencesPerArticle: 3, includeSynthesis: true },
]

export interface Theme {
  id: string
  name: string
  keywords: string[]
}

export interface ReviewInput {
  topic: string
  style: ReviewStyle
  wordTarget: WordTarget
  articles: Article[]
  themes: Theme[]
  authorName?: string
}

export interface ReviewSection {
  heading: string
  paragraphs: string[]
}

export interface GeneratedReview {
  title: string
  introduction: string
  sections: ReviewSection[]
  conclusion: string
  references: string[]
  wordCount: number
  style: ReviewStyle
}

export interface ManualArticleInput {
  title: string
  authors: string
  journal?: string
  year?: number
  abstract?: string
}
