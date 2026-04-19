import type { CitationMetadata } from '../types'

interface PubMedAuthor {
  name?: string
  authtype?: string
}

interface PubMedArticle {
  title?: string
  authors?: PubMedAuthor[]
  source?: string
  volume?: string
  issue?: string
  pages?: string
  pubdate?: string
  elocationid?: string
  articleids?: Array<{ idtype: string; value: string }>
  uid?: string
}

interface PubMedResponse {
  result?: {
    uids?: string[]
    [key: string]: PubMedArticle | string[] | undefined
  }
  error?: string
}

const ENDPOINT =
  'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'

function parseYear(pubdate?: string): number | undefined {
  if (!pubdate) return undefined
  const match = pubdate.match(/\b(19|20)\d{2}\b/)
  return match ? parseInt(match[0], 10) : undefined
}

function extractDoi(article: PubMedArticle): string | undefined {
  const fromElocation = article.elocationid?.match(/10\.\S+/)?.[0]
  if (fromElocation) return fromElocation
  const fromIds = article.articleids?.find((i) => i.idtype === 'doi')?.value
  return fromIds
}

export async function fetchPubMed(pmid: string): Promise<CitationMetadata> {
  const clean = pmid.trim()
  const url = `${ENDPOINT}?db=pubmed&id=${encodeURIComponent(clean)}&retmode=json`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`PubMed lookup failed for PMID ${clean} (HTTP ${res.status})`)
  }
  const data = (await res.json()) as PubMedResponse
  const article = data.result?.[clean] as PubMedArticle | undefined
  if (!article || !article.title) {
    throw new Error(`PubMed returned no record for PMID ${clean}`)
  }

  const authors = (article.authors ?? [])
    .filter((a) => a.name && a.authtype !== 'CollectiveName')
    .map((a) => {
      const parts = (a.name ?? '').trim().split(/\s+/)
      const given = parts.slice(1).join(' ') || undefined
      return { family: parts[0] ?? 'Unknown', given }
    })

  return {
    authors,
    title: article.title ?? 'Untitled',
    journalAbbr: article.source,
    journal: article.source,
    year: parseYear(article.pubdate),
    volume: article.volume,
    issue: article.issue,
    pages: article.pages,
    pmid: clean,
    doi: extractDoi(article),
  }
}
