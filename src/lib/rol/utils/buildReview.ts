import { formatVancouver } from '@/lib/citations/utils/formatVancouver'
import type { Article } from '@/lib/literature/types'
import type { GeneratedReview, ReviewInput, WordTargetMeta } from '../types'
import { WORD_TARGETS } from '../types'
import { generateNarrative } from './generators/narrative'
import { generateSystematic } from './generators/systematic'
import { generateThematic } from './generators/thematic'

function articleToVancouver(article: Article): string {
  return formatVancouver({
    authors: article.authors.map((name) => {
      const parts = name.trim().split(/\s+/)
      return { family: parts[0] ?? name, given: parts.slice(1).join(' ') || undefined }
    }),
    title: article.title,
    journal: article.journal,
    journalAbbr: article.journal,
    year: article.year,
    doi: article.doi,
    pmid: article.pmid,
  })
}

export function buildReview(input: ReviewInput): GeneratedReview {
  const references = input.articles.map(articleToVancouver)
  const { topic, style, articles, themes, wordTarget } = input
  const target: WordTargetMeta =
    WORD_TARGETS.find((t) => t.id === wordTarget) ?? WORD_TARGETS[1]

  if (style === 'thematic') {
    return generateThematic(topic, articles, themes, references, target)
  }
  if (style === 'systematic') {
    return generateSystematic(topic, articles, references, target)
  }
  return generateNarrative(topic, articles, references, target)
}
