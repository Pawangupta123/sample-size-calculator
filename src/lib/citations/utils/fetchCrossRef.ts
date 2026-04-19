import type { CitationMetadata } from '../types'

interface CrossRefAuthor {
  given?: string
  family?: string
  name?: string
}

interface CrossRefMessage {
  title?: string[]
  author?: CrossRefAuthor[]
  'container-title'?: string[]
  'short-container-title'?: string[]
  volume?: string
  issue?: string
  page?: string
  DOI?: string
  'published-print'?: { 'date-parts': number[][] }
  'published-online'?: { 'date-parts': number[][] }
  issued?: { 'date-parts': number[][] }
}

interface CrossRefResponse {
  message?: CrossRefMessage
  status?: string
}

const ENDPOINT = 'https://api.crossref.org/works/'

export async function fetchCrossRef(doi: string): Promise<CitationMetadata> {
  const clean = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
  const res = await fetch(`${ENDPOINT}${encodeURIComponent(clean)}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`CrossRef lookup failed for DOI ${clean} (HTTP ${res.status})`)
  }
  const data = (await res.json()) as CrossRefResponse
  const msg = data.message
  if (!msg) throw new Error('Empty response from CrossRef')

  const year =
    msg['published-print']?.['date-parts']?.[0]?.[0] ??
    msg['published-online']?.['date-parts']?.[0]?.[0] ??
    msg.issued?.['date-parts']?.[0]?.[0]

  const authors = (msg.author ?? []).map((a) => {
    if (a.family) return { family: a.family, given: a.given }
    if (a.name) {
      const parts = a.name.split(' ')
      return { family: parts[parts.length - 1] ?? a.name, given: parts.slice(0, -1).join(' ') }
    }
    return { family: 'Unknown' }
  })

  return {
    authors,
    title: msg.title?.[0] ?? 'Untitled',
    journal: msg['container-title']?.[0],
    journalAbbr: msg['short-container-title']?.[0] ?? msg['container-title']?.[0],
    year,
    volume: msg.volume,
    issue: msg.issue,
    pages: msg.page,
    doi: msg.DOI ?? clean,
  }
}
