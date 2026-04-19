import type { Article } from '@/lib/literature/types'
import type { GeneratedReview, ReviewSection, WordTargetMeta } from '../../types'
import {
  articleSentence,
  buildConclusion,
  buildIntroduction,
  buildSynthesisParagraph,
} from '../sentenceTemplates'

export function generateNarrative(
  topic: string,
  articles: Article[],
  references: string[],
  target: WordTargetMeta
): GeneratedReview {
  const sortedByYear = [...articles].sort(
    (a, b) => (a.year ?? 0) - (b.year ?? 0)
  )

  const paragraphs: string[] = []
  const chunkSize = 3
  const chunks: Article[][] = []
  for (let i = 0; i < sortedByYear.length; i += chunkSize) {
    chunks.push(sortedByYear.slice(i, i + chunkSize))
  }

  chunks.forEach((chunk, chunkIndex) => {
    const lines = chunk.map((article, j) =>
      articleSentence(article, articles.indexOf(article), {
        includeConnector: j > 0,
        sentencesPerArticle: target.sentencesPerArticle,
      })
    )
    paragraphs.push(lines.join(' '))
    if (target.includeSynthesis && chunkIndex < chunks.length - 1) {
      paragraphs.push(buildSynthesisParagraph(chunkIndex, chunks.length))
    }
  })

  const sections: ReviewSection[] = [
    { heading: 'Summary of included studies', paragraphs },
  ]
  const text = [
    buildIntroduction(topic, articles.length),
    ...paragraphs,
    buildConclusion(topic, articles.length),
  ].join(' ')

  return {
    title: `Review of Literature: ${topic}`,
    introduction: buildIntroduction(topic, articles.length),
    sections,
    conclusion: buildConclusion(topic, articles.length),
    references,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    style: 'narrative',
  }
}
