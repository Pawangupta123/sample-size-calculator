import type { Article } from '../types'

const ENDPOINT = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search'

interface EuropePmcResult {
  id?: string
  pmid?: string
  doi?: string
  title?: string
  authorString?: string
  journalTitle?: string
  pubYear?: string
  abstractText?: string
  isOpenAccess?: 'Y' | 'N'
  citedByCount?: number
  fullTextUrlList?: {
    fullTextUrl?: Array<{ url: string; documentStyle: string }>
  }
}

interface EuropePmcResponse {
  hitCount?: number
  resultList?: {
    result?: EuropePmcResult[]
  }
}

function parseAuthors(authorString?: string): string[] {
  if (!authorString) return []
  return authorString
    .split(/,\s*/)
    .map((a) => a.trim().replace(/\.$/, ''))
    .filter(Boolean)
}

function toArticle(r: EuropePmcResult): Article {
  const pmid = r.pmid
  const doi = r.doi
  const fullText = r.fullTextUrlList?.fullTextUrl?.[0]?.url
  return {
    id: `ep-${r.id ?? pmid ?? doi}`,
    pmid,
    doi,
    title: r.title ?? 'Untitled',
    authors: parseAuthors(r.authorString),
    journal: r.journalTitle,
    year: r.pubYear ? parseInt(r.pubYear, 10) : undefined,
    abstract: r.abstractText,
    pubmedUrl: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined,
    doiUrl: doi ? `https://doi.org/${doi}` : undefined,
    europePmcUrl:
      fullText ?? (r.id ? `https://europepmc.org/article/MED/${r.id}` : undefined),
    sources: ['europepmc'],
    openAccess: r.isOpenAccess === 'Y',
    citedBy: r.citedByCount,
  }
}

export interface EuropePmcSearchArgs {
  query: string
  pageSize?: number
  signal?: AbortSignal
}

export async function searchEuropePmc({
  query,
  pageSize = 25,
  signal,
}: EuropePmcSearchArgs): Promise<{ articles: Article[]; total: number }> {
  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=${pageSize}`
  const res = await fetch(url, { signal })
  if (!res.ok) {
    throw new Error(`Europe PMC search failed (HTTP ${res.status})`)
  }
  const data = (await res.json()) as EuropePmcResponse
  const results = data.resultList?.result ?? []
  return {
    articles: results.map(toArticle),
    total: data.hitCount ?? 0,
  }
}
