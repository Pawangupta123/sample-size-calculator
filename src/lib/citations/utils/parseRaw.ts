import type { CitationMetadata } from '../types'

const YEAR_REGEX = /\b(19|20)\d{2}\b/
const VOLUME_ISSUE_REGEX = /;\s*(\d+)\s*(?:\((\d+[a-zA-Z]?)\))?\s*:?\s*([0-9eE-]+)?/
const APA_VOLUME_REGEX = /,\s*(\d+)\s*\((\d+)\)\s*,\s*([0-9-]+)/
const DOI_REGEX = /\b(10\.\d{4,9}\/\S+)\b/i
const AUTHOR_INITIALS_REGEX = /^([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)*)\s+([A-Z]{1,3})(?:,|\s|$)/

export function parseRawCitation(text: string): CitationMetadata {
  const original = text.trim()
  const yearMatch = original.match(YEAR_REGEX)
  const year = yearMatch ? parseInt(yearMatch[0], 10) : undefined

  const doiMatch = original.match(DOI_REGEX)

  const viMatch =
    original.match(VOLUME_ISSUE_REGEX) ?? original.match(APA_VOLUME_REGEX)

  const authors = extractAuthors(original)
  const title = extractTitle(original, year)
  const journal = extractJournal(original, year)

  return {
    authors,
    title,
    journal,
    journalAbbr: journal,
    year,
    volume: viMatch?.[1],
    issue: viMatch?.[2],
    pages: viMatch?.[3]?.replace(/e/gi, '-'),
    doi: doiMatch?.[1],
  }
}

function extractAuthors(text: string): Array<{ family: string; given?: string }> {
  const beforeYear = text.split(YEAR_REGEX)[0] ?? text
  const section = beforeYear.split('.')[0] ?? beforeYear

  const list = section
    .split(/,\s+(?=[A-Z])|;\s*|\s+&\s+|\s+and\s+/)
    .map((piece) => piece.trim())
    .filter(Boolean)

  const parsed = list
    .map((piece) => {
      const initialsMatch = piece.match(AUTHOR_INITIALS_REGEX)
      if (initialsMatch) {
        return { family: initialsMatch[1], given: initialsMatch[2] }
      }
      const parts = piece.split(/\s+/)
      if (parts.length === 1) return { family: parts[0] }
      return { family: parts[0], given: parts.slice(1).join(' ') }
    })
    .filter((a) => a.family && /^[A-Z]/.test(a.family))

  return parsed.length > 0 ? parsed : [{ family: 'Unknown' }]
}

function extractTitle(text: string, year?: number): string {
  const afterYear = year
    ? text.split(String(year))[1] ?? text
    : text.split('.').slice(1).join('.')
  const firstSentence = afterYear
    .replace(/^[.,:\s)]+/, '')
    .split('.')[0]
    ?.trim()
  return firstSentence || 'Untitled reference'
}

function extractJournal(text: string, year?: number): string | undefined {
  const afterYear = year ? text.split(String(year))[1] : undefined
  if (!afterYear) return undefined
  const afterTitle = afterYear.split('.').slice(1).join('.').trim()
  const journal = afterTitle.split(/[,;]/)[0]?.trim()
  if (!journal) return undefined
  return journal.replace(/[.\s]+$/, '') || undefined
}
