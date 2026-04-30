import { formatVancouver } from '@/lib/citations/utils/formatVancouver'
import type { Article } from '@/lib/literature/types'
import type { CitationStyle, GeneratedReview, ReviewInput, WordTargetMeta } from '../types'
import { WORD_TARGETS } from '../types'
import { generateNarrative } from './generators/narrative'
import { generateSystematic } from './generators/systematic'
import { generateThematic } from './generators/thematic'

function toVancouver(article: Article): string {
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

function toApa(article: Article): string {
  const authorParts = article.authors.slice(0, 6).map((name) => {
    const parts = name.trim().split(/\s+/)
    const family = parts[0] ?? name
    const initials = parts.slice(1).map((g) => `${g[0] ?? ''}.`).join(' ')
    return initials ? `${family}, ${initials}` : family
  })
  const authors = article.authors.length > 6
    ? `${authorParts.join(', ')}, … ${article.authors.at(-1) ?? ''}`
    : authorParts.join(', ')
  const year = article.year ? `(${article.year}).` : '(n.d.).'
  const journal = article.journal ? ` ${article.journal}.` : ''
  const doi = article.doi ? ` https://doi.org/${article.doi}` : ''
  return `${authors} ${year} ${article.title}.${journal}${doi}`
}

function formatReference(article: Article, index: number, style: CitationStyle): string {
  if (style === 'apa') return toApa(article)
  if (style === 'numbered') return `[${index + 1}] ${toVancouver(article)}`
  return toVancouver(article)
}

export function buildReview(input: ReviewInput): GeneratedReview {
  const citationStyle = input.citationStyle ?? 'vancouver'
  const references = input.articles.map((a, i) => formatReference(a, i, citationStyle))
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
