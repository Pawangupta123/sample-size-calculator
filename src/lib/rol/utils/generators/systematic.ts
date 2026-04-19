import type { Article } from '@/lib/literature/types'
import type { GeneratedReview, ReviewSection, WordTargetMeta } from '../../types'
import { articleSentence, buildIntroduction } from '../sentenceTemplates'

export function generateSystematic(
  topic: string,
  articles: Article[],
  references: string[],
  target: WordTargetMeta
): GeneratedReview {
  const total = articles.length
  const years = articles
    .map((a) => a.year)
    .filter((y): y is number => typeof y === 'number')
  const yearRange =
    years.length > 0
      ? `${Math.min(...years)}–${Math.max(...years)}`
      : 'the last 10 years'

  const backgroundParagraph =
    `${topic.trim().replace(/\.$/, '')} remains an active area of clinical investigation. ` +
    `This review synthesises ${total} peer-reviewed stud${total === 1 ? 'y' : 'ies'} ` +
    `published during ${yearRange}, identified through structured searches of PubMed and Europe PMC.`

  const searchStrategy =
    `Articles were retrieved using the SampleCalc literature search tool, which queries ` +
    `PubMed E-utilities and Europe PMC in parallel. Duplicates were removed based on DOI/PMID matching. ` +
    `Records were screened for relevance to the research question stated above.`

  const findingsLines = articles.map((article, idx) =>
    articleSentence(article, idx, {
      includeConnector: idx > 0,
      sentencesPerArticle: target.sentencesPerArticle,
    })
  )

  const findingsChunks: string[] = []
  const chunkSize = target.includeSynthesis ? 3 : 2
  for (let i = 0; i < findingsLines.length; i += chunkSize) {
    findingsChunks.push(findingsLines.slice(i, i + chunkSize).join(' '))
  }

  const synthesisParagraph =
    `Across the included studies, findings converge on several points while leaving ` +
    `meaningful questions unanswered. Variation in study design, sample sizes, and follow-up ` +
    `durations should be considered when interpreting the evidence base. The present work ` +
    `is positioned to address gaps identified in this synthesis.`

  const sections: ReviewSection[] = [
    { heading: 'Background', paragraphs: [backgroundParagraph] },
    { heading: 'Search strategy', paragraphs: [searchStrategy] },
    { heading: 'Findings', paragraphs: findingsChunks },
    { heading: 'Synthesis & research gap', paragraphs: [synthesisParagraph] },
  ]

  const text = [
    buildIntroduction(topic, total),
    ...sections.flatMap((s) => [s.heading, ...s.paragraphs]),
  ].join(' ')

  return {
    title: `Systematic Review (lite): ${topic}`,
    introduction: buildIntroduction(topic, total),
    sections,
    conclusion: synthesisParagraph,
    references,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    style: 'systematic',
  }
}
