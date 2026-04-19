import type { Article } from '../types'

const ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'

interface EsearchResponse {
  esearchresult?: {
    idlist?: string[]
    count?: string
  }
}

interface PubMedAuthor {
  name?: string
  authtype?: string
}

interface PubMedSummary {
  uid?: string
  title?: string
  authors?: PubMedAuthor[]
  source?: string
  volume?: string
  issue?: string
  pages?: string
  pubdate?: string
  elocationid?: string
  articleids?: Array<{ idtype: string; value: string }>
}

interface EsummaryResponse {
  result?: {
    uids?: string[]
    [key: string]: PubMedSummary | string[] | undefined
  }
}

function parseYear(pubdate?: string): number | undefined {
  if (!pubdate) return undefined
  const match = pubdate.match(/\b(19|20)\d{2}\b/)
  return match ? parseInt(match[0], 10) : undefined
}

function extractDoi(article: PubMedSummary): string | undefined {
  const fromElocation = article.elocationid?.match(/10\.\S+/)?.[0]
  if (fromElocation) return fromElocation
  return article.articleids?.find((i) => i.idtype === 'doi')?.value
}

function toArticle(pmid: string, summary: PubMedSummary): Article {
  const authors = (summary.authors ?? [])
    .filter((a) => a.name && a.authtype !== 'CollectiveName')
    .map((a) => a.name ?? '')

  const doi = extractDoi(summary)
  return {
    id: `pm-${pmid}`,
    pmid,
    doi,
    title: summary.title ?? 'Untitled',
    authors,
    journal: summary.source,
    year: parseYear(summary.pubdate),
    pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    doiUrl: doi ? `https://doi.org/${doi}` : undefined,
    sources: ['pubmed'],
  }
}

export interface PubmedSearchArgs {
  query: string
  pageSize?: number
  signal?: AbortSignal
}

export async function searchPubmed({
  query,
  pageSize = 25,
  signal,
}: PubmedSearchArgs): Promise<{ articles: Article[]; total: number }> {
  const searchUrl = `${ESEARCH}?db=pubmed&term=${encodeURIComponent(query)}&retmax=${pageSize}&retmode=json&sort=relevance`
  const searchRes = await fetch(searchUrl, { signal })
  if (!searchRes.ok) {
    throw new Error(`PubMed search failed (HTTP ${searchRes.status})`)
  }
  const searchData = (await searchRes.json()) as EsearchResponse
  const pmids = searchData.esearchresult?.idlist ?? []
  const total = parseInt(searchData.esearchresult?.count ?? '0', 10)
  if (pmids.length === 0) return { articles: [], total: 0 }

  const summaryUrl = `${ESUMMARY}?db=pubmed&id=${pmids.join(',')}&retmode=json`
  const summaryRes = await fetch(summaryUrl, { signal })
  if (!summaryRes.ok) {
    throw new Error(`PubMed summary failed (HTTP ${summaryRes.status})`)
  }
  const summaryData = (await summaryRes.json()) as EsummaryResponse
  const result = summaryData.result
  if (!result) return { articles: [], total }

  const articles = pmids
    .map((pmid) => {
      const summary = result[pmid] as PubMedSummary | undefined
      return summary ? toArticle(pmid, summary) : null
    })
    .filter((a): a is Article => a !== null)

  return { articles, total }
}
