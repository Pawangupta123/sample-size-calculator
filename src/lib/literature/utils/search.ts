import type { Article, SearchFilters, SearchResponse } from '../types'
import { buildEuropePmcQuery, buildOpenAlexQuery, buildPubmedQuery } from './buildQuery'
import { mergeArticles } from './mergeResults'
import { getCached, makeCacheKey, setCached } from './searchCache'
import { searchClinicalTrials } from './searchClinicalTrials'
import { searchEuropePmc } from './searchEuropePmc'
import { searchOpenAlex } from './searchOpenAlex'
import { searchPubmed } from './searchPubmed'

export interface SearchArgs {
  filters: SearchFilters
  signal?: AbortSignal
  pageSize?: number
  page?: number
}

function settled(value: { articles: Article[]; total: number } | null) {
  return value ?? { articles: [], total: 0 }
}

export async function searchLiterature({
  filters,
  signal,
  pageSize = 25,
  page = 1,
}: SearchArgs): Promise<SearchResponse & { errors: string[] }> {
  const key = makeCacheKey(filters, pageSize, page)
  const cached = getCached(key)
  if (cached) return cached

  const errors: string[] = []

  const basePromises: Promise<{ articles: Article[]; total: number }>[] = [
    searchPubmed({ query: buildPubmedQuery(filters), pageSize, page, signal }),
    searchEuropePmc({ query: buildEuropePmcQuery(filters), pageSize, page, signal }),
    searchOpenAlex({ query: buildOpenAlexQuery(filters), pageSize, page, signal }),
  ]
  if (filters.includeClinicalTrials) {
    basePromises.push(searchClinicalTrials({ query: filters.query, pageSize: 10, signal }))
  }

  const [pubmedRes, europePmcRes, openAlexRes, ctRes] = await Promise.allSettled(basePromises)

  const pubmed =
    pubmedRes.status === 'fulfilled'
      ? pubmedRes.value
      : (errors.push(`PubMed: ${pubmedRes.reason?.message ?? 'failed'}`), null)

  const europe =
    europePmcRes.status === 'fulfilled'
      ? europePmcRes.value
      : (errors.push(`Europe PMC: ${europePmcRes.reason?.message ?? 'failed'}`), null)

  const openAlex =
    openAlexRes.status === 'fulfilled'
      ? openAlexRes.value
      : (errors.push(`OpenAlex: ${openAlexRes.reason?.message ?? 'failed'}`), null)

  const ct = ctRes && ctRes.status === 'fulfilled' ? ctRes.value : null

  const merged = mergeArticles([
    settled(pubmed).articles,
    settled(europe).articles,
    settled(openAlex).articles,
    ...(ct ? [ct.articles] : []),
  ])
  const total = Math.max(
    settled(pubmed).total,
    settled(europe).total,
    settled(openAlex).total
  )

  const result = { articles: merged, total, fromCache: false, errors }
  setCached(key, result)
  return result
}
