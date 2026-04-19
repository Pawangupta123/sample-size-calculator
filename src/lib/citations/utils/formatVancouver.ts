import type { CitationMetadata } from '../types'

const MAX_AUTHORS_LISTED = 6

function formatAuthorName(author: { family: string; given?: string }): string {
  const family = author.family.trim()
  const initials = (author.given ?? '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return initials ? `${family} ${initials}` : family
}

function formatAuthors(authors: CitationMetadata['authors']): string {
  if (authors.length === 0) return 'Unknown author'
  if (authors.length <= MAX_AUTHORS_LISTED) {
    return authors.map(formatAuthorName).join(', ')
  }
  const listed = authors.slice(0, MAX_AUTHORS_LISTED).map(formatAuthorName).join(', ')
  return `${listed}, et al`
}

function formatPages(pages?: string): string | undefined {
  if (!pages) return undefined
  return pages.replace(/\s+/g, '').replace(/–/g, '-')
}

function stripTrailingPeriod(value: string): string {
  return value.replace(/[.\s]+$/, '')
}

export function formatVancouver(metadata: CitationMetadata): string {
  const authors = formatAuthors(metadata.authors)
  const title = stripTrailingPeriod(metadata.title)
  const journal = metadata.journalAbbr ?? metadata.journal

  const parts: string[] = [`${authors}.`, `${title}.`]

  if (journal) {
    parts.push(`${stripTrailingPeriod(journal)}.`)
  }

  const tailBits: string[] = []
  if (metadata.year) tailBits.push(String(metadata.year))

  let volumeIssue = ''
  if (metadata.volume) {
    volumeIssue = `;${metadata.volume}`
    if (metadata.issue) volumeIssue += `(${metadata.issue})`
  }
  const pages = formatPages(metadata.pages)
  if (pages) volumeIssue += `:${pages}`

  if (tailBits.length > 0 || volumeIssue) {
    parts.push(`${tailBits.join(' ')}${volumeIssue}.`)
  }

  return parts.join(' ').replace(/\.\s*\./g, '.').trim()
}
