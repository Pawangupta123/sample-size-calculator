import type { Article } from '@/lib/literature/types'
import { pickKeyFinding, pickMethodsContext } from './cleanAbstract'

const AUTHOR_PHRASES = [
  ({ year, author }: { year: number | undefined; author: string }) =>
    `${author} et al. (${year ?? 'n.d.'})`,
  ({ year, author }: { year: number | undefined; author: string }) =>
    `In a ${year ?? 'recent'} study, ${author} and colleagues`,
  ({ year, author }: { year: number | undefined; author: string }) =>
    `A ${year ?? 'recent'} investigation by ${author} et al.`,
  ({ year, author }: { year: number | undefined; author: string }) =>
    `${author} and colleagues (${year ?? 'n.d.'})`,
  ({ year, author }: { year: number | undefined; author: string }) =>
    `Research published by ${author} et al. (${year ?? 'n.d.'})`,
]

const VERB_PHRASES = [
  'reported that',
  'demonstrated that',
  'found that',
  'showed that',
  'concluded that',
  'observed that',
  'documented that',
]

const METHOD_PHRASES = [
  'The study',
  'This investigation',
  'The work',
  'Their analysis',
]

const CONNECTORS = [
  'Building on this,',
  'In a similar vein,',
  'Adding to the literature,',
  'Complementing these findings,',
  'In contrast,',
  'Conversely,',
  'Meanwhile,',
  'Further,',
]

function firstAuthorFamily(article: Article): string {
  const first = article.authors[0]
  if (!first) return 'The authors'
  return first.split(/\s+/)[0] ?? first
}

function pickStable<T>(list: ReadonlyArray<T>, seed: number): T {
  return list[seed % list.length]
}

function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function summarise(text: string, maxChars = 320): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxChars) return clean
  const trimmed = clean.slice(0, maxChars)
  const lastPeriod = trimmed.lastIndexOf('.')
  return (lastPeriod > 100 ? trimmed.slice(0, lastPeriod + 1) : trimmed + '…')
}

function lowercaseFirst(text: string): string {
  if (!text) return text
  return text[0].toLowerCase() + text.slice(1)
}

const RELEVANCE_PHRASES = [
  'These findings are particularly relevant when considering clinical application.',
  'This work adds to the growing evidence base on the topic.',
  'The results carry implications for both practice and further research.',
  'Such evidence is valuable for shaping study design in this area.',
  'These observations carry direct relevance for protocol planning.',
]

export function articleSentence(
  article: Article,
  index: number,
  options: { includeConnector?: boolean; sentencesPerArticle?: number } = {}
): string {
  const seed = hash(article.id) + index
  const depth = Math.max(1, Math.min(3, options.sentencesPerArticle ?? 2))
  const author = firstAuthorFamily(article)
  const phraseFn = pickStable(AUTHOR_PHRASES, seed)
  const verb = pickStable(VERB_PHRASES, seed + 1)
  const connector = options.includeConnector
    ? pickStable(CONNECTORS, seed + 2) + ' '
    : ''
  const citation = `[${index + 1}]`

  const opening = phraseFn({ year: article.year, author })
  const keyFinding = pickKeyFinding(article.abstract)
  const methods = pickMethodsContext(article.abstract)

  if (keyFinding) {
    const findingSummary = summarise(keyFinding, 320)
    let firstSentence = `${connector}${opening} ${verb} ${lowercaseFirst(findingSummary)}`
    firstSentence = firstSentence.replace(/\s+/g, ' ').replace(/\.?\s*$/, '')
    firstSentence = `${firstSentence} ${citation}.`

    if (depth <= 1) return firstSentence

    const pieces = [firstSentence]
    if (methods) {
      const methodsStem = pickStable(METHOD_PHRASES, seed + 3)
      const methodsSummary = summarise(methods, 220)
      const secondSentence =
        `${methodsStem} ${lowercaseFirst(methodsSummary)}`
          .replace(/\s+/g, ' ')
          .replace(/\.?\s*$/, '') + '.'
      pieces.push(secondSentence)
    }
    if (depth >= 3) {
      pieces.push(pickStable(RELEVANCE_PHRASES, seed + 4))
    }
    return pieces.join(' ')
  }

  const fallback = `${connector}${opening} examined aspects of this topic in ${article.journal ?? 'the literature'} ${citation}.`
  return fallback.replace(/\s+/g, ' ')
}

export function buildSynthesisParagraph(chunkIndex: number, totalChunks: number): string {
  const connectors = [
    'Taken together, the evidence across these studies points to consistent themes while also revealing areas of disagreement.',
    'Across the included studies, recurring patterns emerge alongside notable methodological differences.',
    'Comparing the above reports, one can identify both convergent findings and meaningful gaps in coverage.',
  ]
  const closers = [
    'These patterns will be revisited in the conclusion of this review.',
    'The next cluster of studies extends these observations further.',
    'This sets the stage for the remaining findings discussed below.',
  ]
  const connector = connectors[chunkIndex % connectors.length]
  const closer =
    chunkIndex === totalChunks - 1
      ? closers[0]
      : closers[1 + (chunkIndex % 2)]
  return `${connector} ${closer}`
}

export function buildIntroduction(topic: string, articleCount: number): string {
  const studyWord = articleCount === 1 ? 'study' : 'studies'
  const verb = articleCount === 1 ? 'was' : 'were'
  const summaryLine =
    articleCount === 1
      ? 'The study is summarised below with attention to its objectives, methodology, and principal findings.'
      : 'The studies are summarised below with attention to their objectives, methodology, and principal findings.'
  return [
    `The following review examines current evidence on ${topic.trim().replace(/\.$/, '')}.`,
    `A total of ${articleCount} peer-reviewed ${studyWord} ${verb} reviewed from PubMed and Europe PMC, representing a range of designs and populations relevant to the question.`,
    summaryLine,
    'Where applicable, emphasis is placed on reported findings and methodological context.',
  ].join(' ')
}

export function buildConclusion(topic: string, articleCount: number): string {
  const studyWord = articleCount === 1 ? 'study' : 'studies'
  const providesVerb = articleCount === 1 ? 'provides' : 'provide'
  const cleanTopic = topic.trim().replace(/\.$/, '')
  return [
    `Collectively, the ${articleCount} ${studyWord} reviewed ${providesVerb} meaningful context for ${cleanTopic}.`,
    'The evidence base is heterogeneous in terms of study populations, interventions, and outcome definitions, which should be considered when interpreting effect sizes and generalisability.',
    'Notable gaps include limited long-term follow-up and under-representation of certain subgroups in several reports.',
    'The present study builds on this literature by addressing residual gaps highlighted above and contributing data from the proposed setting.',
  ].join(' ')
}
