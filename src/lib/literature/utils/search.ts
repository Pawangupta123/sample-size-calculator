import type { Article, SearchFilters, SearchResponse } from '../types'
import { buildEuropePmcQuery, buildPubmedQuery } from './buildQuery'
import { mergeArticles } from './mergeResults'
import { searchEuropePmc } from './searchEuropePmc'
import { searchPubmed } from './searchPubmed'

export interface SearchArgs {
  filters: SearchFilters
  signal?: AbortSignal
  pageSize?: number
}

interface SettledResult {
  articles: Article[]
  total: number
}

function settled(value: SettledResult | null): SettledResult {
  return value ?? { articles: [], total: 0 }
}

export async function searchLiterature({
  filters,
  signal,
  pageSize = 25,
}: SearchArgs): Promise<SearchResponse & { errors: string[] }> {
  const errors: string[] = []
  const pubmedQuery = buildPubmedQuery(filters)
  const europePmcQuery = buildEuropePmcQuery(filters)

  const [pubmedRes, europePmcRes] = await Promise.allSettled([
    searchPubmed({ query: pubmedQuery, pageSize, signal }),
    searchEuropePmc({ query: europePmcQuery, pageSize, signal }),
  ])

  const pubmed =
    pubmedRes.status === 'fulfilled'
      ? pubmedRes.value
      : (errors.push(`PubMed: ${pubmedRes.reason?.message ?? 'failed'}`), null)
  const europe =
    europePmcRes.status === 'fulfilled'
      ? europePmcRes.value
      : (errors.push(`Europe PMC: ${europePmcRes.reason?.message ?? 'failed'}`), null)

  const merged = mergeArticles([settled(pubmed).articles, settled(europe).articles])
  const total = Math.max(settled(pubmed).total, settled(europe).total)

  return {
    articles: merged,
    total,
    fromCache: false,
    errors,
  }
}
