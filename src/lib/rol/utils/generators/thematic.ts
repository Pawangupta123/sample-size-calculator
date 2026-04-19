import type { Article } from '@/lib/literature/types'
import type {
  GeneratedReview,
  ReviewSection,
  Theme,
  WordTargetMeta,
} from '../../types'
import { classifyByTheme } from '../classifyByTheme'
import {
  articleSentence,
  buildConclusion,
  buildIntroduction,
  buildSynthesisParagraph,
} from '../sentenceTemplates'

const THEME_LEAD_INS: ReadonlyArray<string> = [
  'Evidence on this theme is consistent across several studies.',
  'The literature on this topic spans a range of study designs.',
  'Multiple investigations have explored this question.',
  'Findings in this area reveal meaningful patterns.',
]

export function generateThematic(
  topic: string,
  articles: Article[],
  themes: Theme[],
  references: string[],
  target: WordTargetMeta
): GeneratedReview {
  const buckets = classifyByTheme(articles, themes)

  const sections: ReviewSection[] = buckets.map((bucket, themeIdx) => {
    const paragraphs: string[] = []
    const lead = THEME_LEAD_INS[themeIdx % THEME_LEAD_INS.length]
    const sentences = bucket.articles.map((article, idx) =>
      articleSentence(article, articles.indexOf(article), {
        includeConnector: idx > 0,
        sentencesPerArticle: target.sentencesPerArticle,
      })
    )
    paragraphs.push(`${lead} ${sentences.join(' ')}`)
    if (target.includeSynthesis && themeIdx < buckets.length - 1) {
      paragraphs.push(buildSynthesisParagraph(themeIdx, buckets.length))
    }
    return { heading: bucket.theme.name, paragraphs }
  })

  const intro = buildIntroduction(topic, articles.length)
  const conclusion = buildConclusion(topic, articles.length)
  const text = [
    intro,
    ...sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    conclusion,
  ].join(' ')

  return {
    title: `Review of Literature: ${topic}`,
    introduction: intro,
    sections,
    conclusion,
    references,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    style: 'thematic',
  }
}
