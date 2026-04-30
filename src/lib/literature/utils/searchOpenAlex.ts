import type { Article } from '../types'

interface OpenAlexConcept {
  display_name: string
  level: number
  score: number
}

interface OpenAlexWork {
  id: string
  doi?: string
  title?: string
  authorships?: Array<{ author: { display_name?: string } }>
  primary_location?: { source?: { display_name?: string } }
  publication_year?: number
  abstract_inverted_index?: Record<string, number[]> | null
  open_access?: { is_oa?: boolean; oa_url?: string | null }
  cited_by_count?: number
  ids?: { pmid?: string }
  concepts?: OpenAlexConcept[]
}

interface OpenAlexResponse {
  results?: unknown[]
  meta?: { count?: number }
}

export interface OpenAlexSearchArgs {
  query: string
  pageSize?: number
  page?: number
  signal?: AbortSignal
}

const ENDPOINT = 'https://api.openalex.org/works'
const MAILTO = 'pawankumar37060@gmail.com'
const SELECT_FIELDS = [
  'id', 'doi', 'title', 'authorships', 'primary_location',
  'publication_year', 'abstract_inverted_index', 'open_access',
  'cited_by_count', 'ids', 'concepts',
].join(',')

function reconstructAbstract(idx: Record<string, number[]> | null | undefined): string | undefined {
  if (!idx) return undefined
  const arr: string[] = []
  for (const [word, positions] of Object.entries(idx)) {
    for (const pos of positions) arr[pos] = word
  }
  const text = arr.filter(Boolean).join(' ')
  return text || undefined
}

export function openAlexToArticle(raw: unknown): Article {
  const work = raw as OpenAlexWork
  const doi = work.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
  const pmid = work.ids?.pmid
    ?.replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//, '')
    .replace(/\/$/, '')

  const concepts = (work.concepts ?? [])
    .filter((c) => c.score > 0.4 && c.level >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((c) => ({ name: c.display_name, score: c.score }))

  return {
    id: `oa-${work.id.split('/').pop() ?? Date.now()}`,
    openAlexId: work.id,
    doi,
    pmid,
    title: work.title ?? 'Untitled',
    authors: (work.authorships ?? []).map((a) => a.author.display_name ?? 'Unknown'),
    journal: work.primary_location?.source?.display_name,
    year: work.publication_year,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    pubmedUrl: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined,
    doiUrl: doi ? `https://doi.org/${doi}` : undefined,
    pdfUrl: work.open_access?.oa_url ?? undefined,
    sources: ['openalex'],
    openAccess: work.open_access?.is_oa ?? false,
    citedBy: work.cited_by_count,
    concepts: concepts.length > 0 ? concepts : undefined,
  }
}

export async function searchOpenAlex({
  query,
  pageSize = 25,
  page = 1,
  signal,
}: OpenAlexSearchArgs): Promise<{ articles: Article[]; total: number }> {
  const url = new URL(ENDPOINT)
  url.searchParams.set('search', query)
  url.searchParams.set('per-page', String(pageSize))
  url.searchParams.set('page', String(page))
  url.searchParams.set('sort', 'relevance_score:desc')
  url.searchParams.set('mailto', MAILTO)
  url.searchParams.set('select', SELECT_FIELDS)

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`OpenAlex search failed (HTTP ${res.status})`)

  const data = (await res.json()) as OpenAlexResponse
  return {
    articles: (data.results ?? []).map(openAlexToArticle),
    total: data.meta?.count ?? 0,
  }
}
